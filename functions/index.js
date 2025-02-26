// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK with your service account
admin.initializeApp();

// Cloud Function to delete a user from Firebase Auth
exports.deleteAuthUser = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  
  try {
    const uid = data.uid;
    
    if (!uid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with a valid uid.'
      );
    }
    
    await admin.auth().deleteUser(uid);
    
    return { success: true, message: 'User successfully deleted from Auth' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error deleting user: ' + error.message
    );
  }
});