const admin = require("firebase-admin");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

// Load service account credentials directly
const serviceAccount = require(path.resolve(__dirname, "../serviceAccountKey.json"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Enhanced Excel date parser
function parseExcelDate(value) {
  if (!value) return null;

  // If it's already a Date object
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return value;
  }

  // Excel serial number (numeric)
  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + value * 86400000);
  }

  // Handle 'yyyy-MM-dd hh:mm:ss' style strings by converting to ISO
  if (typeof value === 'string' && value.includes(' ')) {
    const fixed = value.replace(' ', 'T') + 'Z';
    const parsed = new Date(fixed);
    if (!isNaN(parsed)) return parsed;
  }

  // Standard date string fallback
  const parsed = new Date(value);
  if (!isNaN(parsed)) return parsed;

  return null;
}

async function importInventory() {
  const filePath = path.resolve(__dirname, "Apple_Inventory_Catalog.xlsx");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Excel file not found:", filePath);
    return;
  }

  // Load Excel workbook
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const inventoryRef = db.collection("inventory");
  const batch = db.batch();

  data.forEach((item, index) => {
    const docRef = inventoryRef.doc(); // Auto-ID

    const parsedCreatedAt = parseExcelDate(item.createdAt);
    const parsedUpdatedAt = parseExcelDate(item.updatedAt);
    const parsedDateAdded = parseExcelDate(item.dateAdded);
    const parsedExpirationDate = parseExcelDate(item.expirationDate);

    console.log(`\\n🧾 Row ${index + 1}:`, {
      rawCreatedAt: item.createdAt,
      parsedCreatedAt,
    });

    batch.set(docRef, {
      ...item,
      dimensions: typeof item.dimensions === "string"
        ? JSON.parse(item.dimensions.replace(/'/g, '\"'))
        : item.dimensions,
      createdAt: parsedCreatedAt,
      updatedAt: parsedUpdatedAt,
      dateAdded: parsedDateAdded,
      expirationDate: parsedExpirationDate,
    });
  });

  await batch.commit();
  console.log(`\\n✅ Successfully imported ${data.length} items into Firestore.`);
}

importInventory().catch(console.error);