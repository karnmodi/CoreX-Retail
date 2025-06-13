const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const { prepareSalesItem, validateSalesItem } = require('../../models/salesSchema');
const readline = require('readline');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise wrapper for readline question
function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}

// Main function to process the import
async function importSalesData(filePath) {
    try {
        console.log(`Starting import process from ${filePath}`);
        console.log('1. Parsing CSV file...');

        // Read and parse CSV file
        const records = await parseCSVFile(filePath);

        console.log(`Found ${records.length} records in CSV file`);

        // Log column names to identify any issues
        if (records.length > 0) {
            console.log("Column names in CSV:", Object.keys(records[0]));
        }

        // Prepare records for import
        console.log('2. Preparing and validating records...');
        const { validRecords, invalidRecords } = await prepareRecords(records);

        console.log(`Prepared ${validRecords.length} valid records`);
        console.log(`Found ${invalidRecords.length} invalid records`);

        // Save invalid records for review
        if (invalidRecords.length > 0) {
            const invalidPath = path.join(__dirname, 'invalid_records.json');
            fs.writeFileSync(
                invalidPath,
                JSON.stringify(invalidRecords, null, 2)
            );
            console.log(`Invalid records saved to ${invalidPath}`);
        }

        if (validRecords.length === 0) {
            console.log('No valid records to import. Exiting.');
            rl.close();
            return;
        }

        // Confirm before proceeding with upload
        const uploadAnswer = await askQuestion(`Ready to upload ${validRecords.length} records to Firestore. Continue? (y/n) `);

        if (uploadAnswer.toLowerCase() !== 'y') {
            console.log('Import cancelled.');
            rl.close();
            return;
        }

        // Upload data to Firestore
        console.log('3. Uploading records to Firestore...');
        const uploadedRecords = await uploadToFirestore(validRecords);

        console.log(`Successfully uploaded ${uploadedRecords.length} records to Firestore!`);

        // Ask if user wants to run aggregation
        const aggregateAnswer = await askQuestion('Do you want to run aggregation functions now? (y/n) ');

        if (aggregateAnswer.toLowerCase() === 'y') {
            console.log('4. Running aggregation functions...');
            await runAggregations(uploadedRecords);
            console.log('Aggregation complete!');
        } else {
            console.log('Aggregation skipped. You can run it later using the separate aggregation script.');
        }

        console.log('Import process complete!');
        rl.close();

    } catch (error) {
        console.error('Import failed:', error);
        rl.close();
    }
}

// Function to parse CSV file
function parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        // Read CSV file
        const csvData = fs.readFileSync(filePath, 'utf8');

        // Parse CSV data
        parse(csvData, {
            columns: true,
            trim: true,
            skip_empty_lines: true,
            cast: true,
            bom: true
        }, (err, records) => {
            if (err) reject(err);
            else resolve(records);
        });
    });
}

// Function to prepare and validate records
async function prepareRecords(records) {
    const validRecords = [];
    const invalidRecords = [];

    for (const [index, record] of records.entries()) {
        try {
            // Process the datetime field
            const processedRecord = processDateFields(record, index);

            if (!processedRecord.isValid) {
                invalidRecords.push({
                    record,
                    errors: [processedRecord.error]
                });
                continue;
            }

            // Process other fields
            const standardizedRecord = standardizeFieldNames(processedRecord.record);

            // Prepare and validate the record
            const preparedRecord = prepareSalesItem(standardizedRecord);

            // Make sure time keys are preserved
            preserveTimeKeys(preparedRecord, standardizedRecord);

            // Double-check totalAmount calculation
            ensureTotalAmount(preparedRecord);

            // Validate the record
            const validation = validateSalesItem(preparedRecord);

            if (validation.valid) {
                // Generate transaction ID if missing
                if (!preparedRecord.transactionId) {
                    preparedRecord.transactionId = `TRX-IMPORT-${Date.now()}-${index}`;
                }
                validRecords.push(preparedRecord);
            } else {
                invalidRecords.push({
                    record,
                    errors: validation.errors
                });
            }
        } catch (error) {
            console.error(`Error processing record at index ${index}:`, error);
            invalidRecords.push({
                record,
                errors: [error.message]
            });
        }
    }

    return { validRecords, invalidRecords };
}

// Function to process date fields
function processDateFields(record, index) {
    // Find the datetime field
    let dateKey = null;
    let dateValue = null;

    for (const key of Object.keys(record)) {
        if (key.toLowerCase().endsWith('datetime') || key.toLowerCase().endsWith('date_time')) {
            dateKey = key;
            dateValue = record[key];
            break;
        }
    }

    if (!dateKey || !dateValue) {
        return {
            isValid: false,
            error: 'No datetime field found',
            record
        };
    }

    // Parse the date from the format: MM/DD/YYYY HH:MM
    const dateMatch = dateValue.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)/);
    if (!dateMatch) {
        return {
            isValid: false,
            error: `Failed to match date pattern for: "${dateValue}"`,
            record
        };
    }

    const [_, month, day, year, hour, minute] = dateMatch;
    const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
    );

    // Validate the date is a real date
    if (isNaN(date.getTime())) {
        return {
            isValid: false,
            error: `Invalid date created from pattern match: "${dateValue}"`,
            record
        };
    }

    // Format keys in the required format
    const paddedMonth = String(parseInt(month)).padStart(2, '0');
    const paddedDay = String(parseInt(day)).padStart(2, '0');
    const paddedHour = String(parseInt(hour)).padStart(2, '0');
    const paddedMinute = String(parseInt(minute)).padStart(2, '0');

    // Set datetime fields
    record.datetime = date;
    record.saleDateTime = date;  // Using consistent field naming
    record.dateKey = `${year}-${paddedMonth}-${paddedDay}`;
    record.hourKey = `${year}-${paddedMonth}-${paddedDay}-${paddedHour}`;
    record.minuteKey = `${year}-${paddedMonth}-${paddedDay}-${paddedHour}-${paddedMinute}`;

    return {
        isValid: true,
        record
    };
}

// Function to standardize field names
function standardizeFieldNames(record) {
    // Create a new record with standardized field names
    const standardized = { ...record };

    // Map various column formats to standard field names
    const fieldMappings = [
        { suffix: 'product_id', standard: 'productId' },
        { suffix: 'product_name', standard: 'productName' },
        { suffix: 'unit_price', standard: 'unitPrice', process: val => parseFloat(val) },
        { suffix: 'quantity', standard: 'quantity', process: val => parseInt(val) },
        { suffix: 'store_location', standard: 'storeLocation' },
        { suffix: 'total_amount', standard: 'totalAmount', process: val => parseFloat(val) },
        { suffix: 'payment_method', standard: 'paymentMethod' }
    ];

    for (const mapping of fieldMappings) {
        if (!standardized[mapping.standard]) {
            for (const key of Object.keys(standardized)) {
                const keyLower = key.toLowerCase();
                if (keyLower.endsWith(mapping.suffix) || keyLower === mapping.suffix) {
                    let value = standardized[key];
                    if (mapping.process) {
                        value = mapping.process(value);
                    }
                    standardized[mapping.standard] = value;
                    break;
                }
            }
        }
    }

    return standardized;
}

// Make sure time keys are preserved
function preserveTimeKeys(preparedRecord, originalRecord) {
    // Double-check the time keys are still present
    if (!preparedRecord.dateKey || !preparedRecord.hourKey || !preparedRecord.minuteKey) {
        preparedRecord.dateKey = originalRecord.dateKey;
        preparedRecord.hourKey = originalRecord.hourKey;
        preparedRecord.minuteKey = originalRecord.minuteKey;
    }
}

// Ensure totalAmount is calculated
function ensureTotalAmount(record) {
    if ((!record.totalAmount || record.totalAmount === 0) && record.unitPrice && record.quantity) {
        record.totalAmount = parseFloat((record.unitPrice * record.quantity).toFixed(2));
    }
}

// Function to upload records to Firestore in parallel batches
async function uploadToFirestore(records) {
    const batchSize = 500; // Firestore batch size limit is 500
    const batches = [];
    const uploadedRecords = [];

    // Split records into batches
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        batches.push(batch);
    }

    console.log(`Splitting upload into ${batches.length} batches`);

    // Create a promise for each batch to allow parallel execution
    const batchPromises = batches.map(async (recordBatch, batchIndex) => {
        try {
            console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

            const writeBatch = db.batch();
            const batchRecords = [];

            for (const record of recordBatch) {
                const docRef = db.collection('sales').doc();
                record.id = docRef.id;
                writeBatch.set(docRef, record);
                batchRecords.push({ ...record }); // Clone to avoid reference issues
            }

            await writeBatch.commit();
            console.log(`Batch ${batchIndex + 1} committed successfully!`);

            return batchRecords;
        } catch (error) {
            console.error(`Error processing batch ${batchIndex + 1}:`, error);
            throw error;
        }
    });

    // Wait for all batches to complete
    const results = await Promise.all(batchPromises);

    // Flatten the results array
    results.forEach(batchRecords => {
        uploadedRecords.push(...batchRecords);
    });

    return uploadedRecords;
}

// Function to run aggregations in bulk
async function runAggregations(records) {
    console.log(`Starting aggregation for ${records.length} records`);

    // Group records by minute, hour, and date keys
    const minuteGroups = {};
    const hourGroups = {};
    const dateGroups = {};

    for (const record of records) {
        // Skip records without required keys
        if (!record.minuteKey || !record.hourKey || !record.dateKey) {
            console.warn(`Skipping aggregation for record ${record.id}: Missing time keys`);
            continue;
        }

        // Group by minute
        if (!minuteGroups[record.minuteKey]) {
            minuteGroups[record.minuteKey] = [];
        }
        minuteGroups[record.minuteKey].push(record);

        // Group by hour
        if (!hourGroups[record.hourKey]) {
            hourGroups[record.hourKey] = [];
        }
        hourGroups[record.hourKey].push(record);

        // Group by date
        if (!dateGroups[record.dateKey]) {
            dateGroups[record.dateKey] = [];
        }
        dateGroups[record.dateKey].push(record);
    }

    // Process aggregation by groups
    console.log(`Aggregating data by minute (${Object.keys(minuteGroups).length} groups)...`);
    await processAggregationGroups("sales_by_minute", minuteGroups);

    console.log(`Aggregating data by hour (${Object.keys(hourGroups).length} groups)...`);
    await processAggregationGroups("sales_by_hour", hourGroups);

    console.log(`Aggregating data by date (${Object.keys(dateGroups).length} groups)...`);
    await processAggregationGroups("sales_by_date", dateGroups);
}

// Process aggregation groups in batches
async function processAggregationGroups(collection, groups) {
    const keys = Object.keys(groups);
    const batchSize = 10;

    for (let i = 0; i < keys.length; i += batchSize) {
        const batchKeys = keys.slice(i, i + batchSize);
        const promises = batchKeys.map(key => updateBulkAggregation(collection, key, groups[key]));

        await Promise.all(promises);
        console.log(`Processed ${Math.min(i + batchSize, keys.length)}/${keys.length} ${collection} aggregations`);
    }
}

// Update aggregation for a group of records with the same key
async function updateBulkAggregation(collection, docId, records) {
    const docRef = db.collection(collection).doc(docId);

    try {
        return await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            // Calculate aggregate values
            let totalAmount = 0;
            let totalQuantity = 0;
            const salesArray = [];

            for (const record of records) {
                // Ensure record has totalAmount calculated
                if ((!record.totalAmount || record.totalAmount === 0) && record.unitPrice && record.quantity) {
                    record.totalAmount = parseFloat((record.unitPrice * record.quantity).toFixed(2));
                }

                totalAmount += (record.totalAmount || 0);
                totalQuantity += (record.quantity || 0);

                salesArray.push({
                    id: record.id,
                    productId: record.productId,
                    productName: record.productName,
                    quantity: record.quantity,
                    unitPrice: record.unitPrice,
                    totalAmount: record.totalAmount,
                    storeLocation: record.storeLocation,
                    saleDateTime: record.saleDateTime
                });
            }

            if (doc.exists) {
                // Update existing aggregation
                const currentData = doc.data();

                transaction.update(docRef, {
                    totalAmount: admin.firestore.FieldValue.increment(totalAmount),
                    totalQuantity: admin.firestore.FieldValue.increment(totalQuantity),
                    transactionCount: admin.firestore.FieldValue.increment(records.length),
                    sales: admin.firestore.FieldValue.arrayUnion(...salesArray),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new aggregation document
                transaction.set(docRef, {
                    totalAmount: totalAmount,
                    totalQuantity: totalQuantity,
                    transactionCount: records.length,
                    sales: salesArray,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });
    } catch (error) {
        console.error(`Error updating ${collection} aggregation for ${docId}:`, error);
        throw error;
    }
}

// Get command line arguments
const filePath = process.argv[2];

if (!filePath) {
    console.error('Please provide a path to the CSV file');
    console.log('Usage: node importSalesData.js <path-to-csv-file>');
    process.exit(1);
}

// Start the import process
importSalesData(filePath);