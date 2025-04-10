const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase with the service account
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Get Firestore instance
const db = admin.firestore();

// Function to run aggregations on existing sales data
async function runAggregations() {
    try {
        console.log('Starting aggregation process for existing sales data...');
        
        // Get all sales records from Firestore
        const salesSnapshot = await db.collection('sales').get();
        
        if (salesSnapshot.empty) {
            console.log('No sales records found in the database.');
            return;
        }
        
        console.log(`Found ${salesSnapshot.size} sales records to aggregate.`);
        
        // Process in batches to avoid memory issues
        const batchSize = 500;
        const totalRecords = salesSnapshot.size;
        let processedCount = 0;
        
        // Convert snapshot to array of records
        const salesRecords = [];
        salesSnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id; // Ensure ID is included
            salesRecords.push(data);
        });
        
        // Process in batches
        for (let i = 0; i < salesRecords.length; i += batchSize) {
            const batch = salesRecords.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(salesRecords.length/batchSize)}`);
            
            // Process each record in the batch
            for (const record of batch) {
                // Check if record has required time keys
                if (!record.dateKey || !record.hourKey || !record.minuteKey) {
                    console.warn(`Record ${record.id} missing time keys. Generating them now...`);
                    
                    // Get date from record
                    let saleDate;
                    if (record.saleDateTime && record.saleDateTime.toDate) {
                        // Firestore timestamp
                        saleDate = record.saleDateTime.toDate();
                    } else if (record.saleDateTime instanceof Date) {
                        // JavaScript Date
                        saleDate = record.saleDateTime;
                    } else if (record.datetime && record.datetime.toDate) {
                        // Alternate field name
                        saleDate = record.datetime.toDate();
                    } else if (record.datetime instanceof Date) {
                        saleDate = record.datetime;
                    } else {
                        console.error(`Cannot determine date for record ${record.id}. Skipping.`);
                        continue;
                    }
                    
                    // Generate time keys
                    const year = saleDate.getFullYear();
                    const paddedMonth = String(saleDate.getMonth() + 1).padStart(2, '0');
                    const paddedDay = String(saleDate.getDate()).padStart(2, '0');
                    const paddedHour = String(saleDate.getHours()).padStart(2, '0');
                    const paddedMinute = String(saleDate.getMinutes()).padStart(2, '0');
                    
                    record.dateKey = `${year}-${paddedMonth}-${paddedDay}`;
                    record.hourKey = `${year}-${paddedMonth}-${paddedDay}-${paddedHour}`;
                    record.minuteKey = `${year}-${paddedMonth}-${paddedDay}-${paddedHour}-${paddedMinute}`;
                    
                    // Update the record in Firestore with the new keys
                    await db.collection('sales').doc(record.id).update({
                        dateKey: record.dateKey,
                        hourKey: record.hourKey,
                        minuteKey: record.minuteKey
                    });
                }
                
                // Run aggregation for this record
                await updateMinuteAggregation(record);
                
                processedCount++;
                if (processedCount % 100 === 0 || processedCount === totalRecords) {
                    console.log(`Processed ${processedCount}/${totalRecords} records`);
                }
            }
        }
        
        console.log('Aggregation process completed successfully!');
        
    } catch (error) {
        console.error('Error running aggregations:', error);
    } finally {
        // Exit the process
        process.exit();
    }
}

async function updateMinuteAggregation(saleData) {
    try {
        // Get the relevant keys
        const { minuteKey, hourKey, dateKey } = saleData;

        if (!minuteKey || !hourKey || !dateKey) {
            console.error("Missing time keys for aggregation for record:", saleData.id);
            return;
        }

        // Update minute aggregation
        await updateAggregation("sales_by_minute", minuteKey, saleData);

        // Update hour aggregation
        await updateAggregation("sales_by_hour", hourKey, saleData);

        // Update date aggregation
        await updateAggregation("sales_by_date", dateKey, saleData);
    } catch (error) {
        console.error("Error updating aggregations for record:", saleData.id, error);
    }
}

// Generic function to update an aggregation document
async function updateAggregation(collection, docId, saleData) {
    const docRef = db.collection(collection).doc(docId);

    // Try to update the existing document
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            if (doc.exists) {
                // Check if this sale is already in the aggregation
                const currentData = doc.data();
                const alreadyIncluded = currentData.sales && 
                    currentData.sales.some(sale => sale.id === saleData.id);
                
                if (alreadyIncluded) {
                    console.log(`Sale ${saleData.id} already included in ${collection}/${docId}. Skipping.`);
                    return;
                }
                
                // Update existing aggregation
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
        console.error(`Error updating ${collection} aggregation for document ${docId}:`, error);
        throw error;
    }
}

// Start the aggregation process
runAggregations();