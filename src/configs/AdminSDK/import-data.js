import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your service account key (relative to this script)
const serviceAccountPath = join(__dirname, 'corex-retails-firebase-adminsdk.json');

// Initialize Firebase
try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'corex-retails.firebasestorage.app'

  // Replace with your Firebase Storage bucket name
  });
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

const db = getFirestore();
const storage = getStorage().bucket();

// Function to upload an image to Firebase Storage and return the download URL
async function uploadImage(imagePath) {
  try {
    const fileName = imagePath.split('/').pop();
    const file = storage.file(fileName);

    await storage.upload(imagePath, {
      destination: fileName,
      public: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    const downloadURL = `https://storage.googleapis.com/${storage.name}/${fileName}`;
    console.log(`Uploaded ${fileName} to ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Import stock data from CSV
async function importStock() {
  const stockFilePath = join(__dirname, 'Book1.csv');
  const stockData = [];

  try {
    const data = readFileSync(stockFilePath, 'utf8').split('\n').slice(1);
    for (const line of data) {
      const [Photos, Name, Product, Description, Price] = line.split(',');

      if (Photos && Name && Product && Description && Price) {
        // Split the Photos column to get multiple image paths
        const photoPaths = Photos.trim().split('|');
        const photoURLs = [];

        // Upload each photo and get its download URL
        for (const path of photoPaths) {
          const imagePath = join(__dirname, path.trim());
          const photoURL = await uploadImage(imagePath);
          if (photoURL) photoURLs.push(photoURL);
        }

        // Clean up the Price field by removing '£' and converting to a float
        const cleanedPrice = parseFloat(Price.replace('£', '').trim());

        if (photoURLs.length > 0) {
          stockData.push({
            Photos: photoURLs,  // Save array of URLs
            Name: Name.trim(),
            Product: parseInt(Product.trim(), 10),
            Description: Description.trim(),
            Price: cleanedPrice,
          });
        }
      }
    }

    console.log(`Loaded ${stockData.length} items from CSV.`);

    const batch = db.batch();
    const createdIds = [];

    stockData.forEach((doc) => {
      const docRef = db.collection('Inventory').doc(); // Auto-generate ID
      batch.set(docRef, doc);
      createdIds.push(docRef.id);
    });

    await batch.commit();
    console.log(`Imported ${stockData.length} documents to 'stock' collection.`);
    console.log('Generated IDs:', createdIds);
  } catch (error) {
    console.error('Error importing stock data:', error);
  }
}

// Run the import
(async () => {
  try {
    console.log('Starting import...');
    await importStock();
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
  }
})();
