const firebase = require("firebase-admin");

const predictedSalesSchema = {
    dateKey: {
        type: "string", // YYYY-MM-DD
        required: true,
        default: ""
    },
    hourKey: {
        type: "string", // YYYY-MM-DD-HH
        required: true,
        default: ""
    },
    cumulativeSales: {
        type: "number",
        required: true,
        default: 0
    },
    predictedSales: {
        type: "number",
        required: true,
        default: 0
    },
    actualSalesEndOfDay: {
        type: "number",
        required: false,
        default: null 
    },
    accuracy: {
        type: "number", // (1 - |actual - predicted| / actual) * 100
        required: false,
        default: null
    },
    createdAt: {
        type: "timestamp",
        required: true,
        default: () => firebase.firestore.FieldValue.serverTimestamp()
    },
    updatedAt: {
        type: "timestamp",
        required: true,
        default: () => firebase.firestore.FieldValue.serverTimestamp()
    }
};

function createPredictionDoc(data) {
    const doc = {};
    for (const [key, field] of Object.entries(predictedSalesSchema)) {
        doc[key] = data[key] ?? (typeof field.default === "function" ? field.default() : field.default);
    }
    return doc;
}

module.exports = { predictedSalesSchema, createPredictionDoc };
