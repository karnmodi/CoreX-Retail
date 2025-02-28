// import-data.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
    credential: cert(serviceAccount)
  });
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

const db = getFirestore();

// Import shifts collection with auto-generated IDs
async function importShifts() {
  try {
    const shiftsFilePath = join(__dirname, 'shifts_collection.json');
    const shiftsData = JSON.parse(readFileSync(shiftsFilePath, 'utf8'));
    
    console.log('Shifts data loaded successfully');
    
    // Log the structure to help debug
    console.log('Shifts data structure:', 
      Array.isArray(shiftsData) ? 'Array with ' + shiftsData.length + ' items' : 
      typeof shiftsData === 'object' ? 'Single object' : typeof shiftsData);
    
    if (Array.isArray(shiftsData)) {
      // Process each document with auto-generated IDs
      const batch = db.batch();
      const createdIds = [];
      
      for (const doc of shiftsData) {
        const docData = { ...doc }; // Clone to avoid modifying original
        
        // Let Firebase generate the ID by using add() method
        const docRef = db.collection('shifts').doc();
        const newId = docRef.id; // This gets the auto-generated ID
        createdIds.push(newId);
        
        // Remove id field if it exists to avoid duplication in Firestore
        if (docData.id) delete docData.id;
        
        batch.set(docRef, docData);
      }
      
      await batch.commit();
      console.log(`Imported ${shiftsData.length} documents to shifts collection with auto-generated IDs`);
      console.log('Generated IDs:', createdIds);
    } else {
      // If it's a single document
      const docRef = await db.collection('shifts').add(shiftsData);
      console.log(`Imported single shifts document with auto-generated ID: ${docRef.id}`);
    }
  } catch (error) {
    console.error('Error importing shifts:', error);
  }
}

// Import roster settings collection
async function importRosterSettings() {
  try {
    const rosterFilePath = join(__dirname, 'roster_settings.json');
    const rosterData = JSON.parse(readFileSync(rosterFilePath, 'utf8'));
    
    console.log('Roster settings data loaded successfully');
    
    // Log the structure to help debug
    console.log('Roster data structure:', 
      Array.isArray(rosterData) ? 'Array with ' + rosterData.length + ' items' : 
      typeof rosterData === 'object' ? 'Single object' : typeof rosterData);
    
    if (Array.isArray(rosterData)) {
      // If it's an array of documents
      const batch = db.batch();
      
      for (const doc of rosterData) {
        const docData = { ...doc }; // Clone to avoid modifying original
        
        // Use doc.id if available, otherwise let Firebase generate one
        let docRef;
        if (docData.id) {
          docRef = db.collection('roster_settings').doc(docData.id);
          delete docData.id; // Remove id field to avoid duplication
        } else {
          docRef = db.collection('roster_settings').doc();
        }
        
        batch.set(docRef, docData);
        console.log(`Added roster setting document with ID: ${docRef.id}`);
      }
      
      await batch.commit();
      console.log(`Imported ${rosterData.length} documents to roster_settings collection`);
    } else {
      // If it's a single document
      const docRef = await db.collection('roster_settings').add(rosterData);
      console.log(`Imported single roster_settings document with auto-generated ID: ${docRef.id}`);
    }
  } catch (error) {
    console.error('Error importing roster settings:', error);
  }
}

// Run the import
(async () => {
  try {
    console.log('Starting import...');
    await importShifts();
    await importRosterSettings();
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
  }
})();