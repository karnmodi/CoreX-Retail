
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const { prepareSalesRecord, validateSalesRecord } = require('../../models/salesSchema');

// Initialize Firebase with the service account
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Get Firestore instance
const db = admin.firestore();

// Main function to process the import
async function importSalesData(filePath) {
    try {
        console.log(`Starting import from ${filePath}`);

        const csvData = fs.readFileSync(filePath, 'utf8');

        const records = await new Promise((resolve, reject) => {
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

        console.log(`Found ${records.length} records to import`);

        if (records.length > 0) {
            console.log("Column names in CSV:", Object.keys(records[0]));
        }

        // Prepare records for import
        const validRecords = [];
        const invalidRecords = [];

        for (const [index, record] of records.entries()) {
            try {
                let dateKey = null;
                let dateValue = null;

                for (const key of Object.keys(record)) {
                    if (key.endsWith('datetime')) {
                        dateKey = key;
                        dateValue = record[key];
                        break;
                    }
                }               

                let isDateValid = false;
                const dateMatch = dateValue.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)/);
                if (dateMatch) {
                    const [_, month, day, year, hour, minute] = dateMatch;
                    const date = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day),
                        parseInt(hour),
                        parseInt(minute)
                    );

                    // Validate the date is a real date
                    if (!isNaN(date.getTime())) {
                        // Format keys in the required format
                        const paddedMonth = String(parseInt(month)).padStart(2, '0');
                        const paddedDay = String(parseInt(day)).padStart(2, '0');
                        const paddedHour = String(parseInt(hour)).padStart(2, '0');
                        const paddedMinute = String(parseInt(minute)).padStart(2, '0');

                        // Set both datetime and saleDateTime for compatibility
                        record.datetime = date;
                        record.saleDateTime = date;

                        // Set the required key fields directly
                        record.dateKey = `${year}-${paddedMonth}-${paddedDay}`;
                        record.hourKey = `${year}-${paddedMonth}-${paddedDay}-${paddedHour}`;
                        record.minuteKey = `${year}-${paddedMonth}-${paddedDay}-${paddedHour}-${paddedMinute}`;

                        isDateValid = true;
                    } else {
                        console.warn(`Invalid date created from pattern match: "${dateValue}"`);
                    }
                } else {
                    console.warn(`Failed to match date pattern for: "${dateValue}"`);
                }

                // If we couldn't parse a valid date, skip this record
                if (!isDateValid) {
                    invalidRecords.push({
                        record,
                        errors: [`Could not parse valid datetime from value: "${dateValue}"`]
                    });
                    continue;
                }

                // For product_id
                if (!record.productId) {
                    for (const key of Object.keys(record)) {
                        if (key.endsWith('product_id')) {
                            record.productId = record[key];
                            break;
                        }
                    }
                }

                // For product_name
                if (!record.productName) {
                    for (const key of Object.keys(record)) {
                        if (key.endsWith('product_name')) {
                            record.productName = record[key];
                            break;
                        }
                    }
                }

                // For unit_price
                if (!record.unitPrice) {
                    for (const key of Object.keys(record)) {
                        if (key.endsWith('unit_price')) {
                            record.unitPrice = parseFloat(record[key]);
                            break;
                        }
                    }
                }

                // For store_location
                if (!record.storeLocation) {
                    for (const key of Object.keys(record)) {
                        if (key.endsWith('store_location')) {
                            record.storeLocation = record[key];
                            break;
                        }
                    }
                }

                // Prepare and validate the record
                const preparedRecord = prepareSalesRecord(record);

                // Double-check the time keys are still present
                if (!preparedRecord.dateKey || !preparedRecord.hourKey || !preparedRecord.minuteKey) {
                    console.warn(`Time keys were lost during record preparation for record ${index}`);
                    preparedRecord.dateKey = record.dateKey;
                    preparedRecord.hourKey = record.hourKey;
                    preparedRecord.minuteKey = record.minuteKey;
                }

                const validation = validateSalesRecord(preparedRecord);

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

        console.log(`Prepared ${validRecords.length} valid records`);
        console.log(`Found ${invalidRecords.length} invalid records`);

        if (invalidRecords.length > 0) {
            fs.writeFileSync(
                path.join(__dirname, 'invalid_records.json'),
                JSON.stringify(invalidRecords, null, 2)
            );
            console.log('Invalid records saved to invalid_records.json');
        }

        if (validRecords.length === 0) {
            console.log('No valid records to import. Exiting.');
            return;
        }

        // Confirm before proceeding
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question(`Ready to import ${validRecords.length} records. Continue? (y/n) `, async (answer) => {
            if (answer.toLowerCase() === 'y') {
                await importValidRecords(validRecords);
                console.log('Import complete!');
            } else {
                console.log('Import cancelled.');
            }
            readline.close();
        });
    } catch (error) {
        console.error('Import failed:', error);
    }
}

async function importValidRecords(records) {
    const batchSize = 500; 
    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        batches.push(batch);
    }

    console.log(`Splitting import into ${batches.length} batches`);

    for (const [batchIndex, recordBatch] of batches.entries()) {
        console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

        const writeBatch = db.batch();

        for (const record of recordBatch) {
            const docRef = db.collection('sales').doc();
            record.id = docRef.id;
            writeBatch.set(docRef, record);
        }

        await writeBatch.commit();
        console.log(`Batch ${batchIndex + 1} committed successfully!`);

        // Update aggregations for each record
        console.log(`Updating aggregations for batch ${batchIndex + 1}`);
        for (const record of recordBatch) {
            await updateMinuteAggregation(record);
        }
    }
}

async function updateMinuteAggregation(saleData) {
    try {
        // Get the relevant keys
        const { minuteKey, hourKey, dateKey } = saleData;

        if (!minuteKey || !hourKey || !dateKey) {
            console.error("Missing time keys for aggregation");
            return;
        }

        // Update minute aggregation
        await updateAggregation("sales_by_minute", minuteKey, saleData);

        // Update hour aggregation
        await updateAggregation("sales_by_hour", hourKey, saleData);

        // Update date aggregation
        await updateAggregation("sales_by_date", dateKey, saleData);
    } catch (error) {
        console.error("Error updating minute aggregation:", error);
    }
}

// Generic function to update an aggregation document (copied from salesController.js)
async function updateAggregation(collection, docId, saleData) {
    const docRef = db.collection(collection).doc(docId);

    // Try to update the existing document
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            if (doc.exists) {
                // Update existing aggregation
                const currentData = doc.data();

                transaction.update(docRef, {
                    totalAmount: admin.firestore.FieldValue.increment(saleData.totalAmount || 0),
                    totalQuantity: admin.firestore.FieldValue.increment(saleData.quantity || 0),
                    transactionCount: admin.firestore.FieldValue.increment(1),
                    sales: admin.firestore.FieldValue.arrayUnion({
                        id: saleData.id,
                        productId: saleData.productId,
                        productName: saleData.productName,
                        quantity: saleData.quantity,
                        unitPrice: saleData.unitPrice,
                        totalAmount: saleData.totalAmount,
                        storeLocation: saleData.storeLocation,
                        saleDateTime: saleData.saleDateTime
                    }),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new aggregation document
                transaction.set(docRef, {
                    totalAmount: saleData.totalAmount || 0,
                    totalQuantity: saleData.quantity || 0,
                    transactionCount: 1,
                    sales: [{
                        id: saleData.id,
                        productId: saleData.productId,
                        productName: saleData.productName,
                        quantity: saleData.quantity,
                        unitPrice: saleData.unitPrice,
                        totalAmount: saleData.totalAmount,
                        storeLocation: saleData.storeLocation,
                        saleDateTime: saleData.saleDateTime
                    }],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });
    } catch (error) {
        console.error(`Error updating ${collection} aggregation:`, error);
        throw error;
    }
}

const filePath = process.argv[2];

if (!filePath) {
    console.error('Please provide a path to the CSV file');
    console.log('Usage: node importSalesData.js <path-to-csv-file>');
    process.exit(1);
}

// Start the import process
importSalesData(filePath);