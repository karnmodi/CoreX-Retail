// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7dIuB6BtlKCGZp2mRcnWAf5cCB8Cc1oc",
  authDomain: "corex-retail.firebaseapp.com",
  projectId: "corex-retail",
  storageBucket: "corex-retail.firebasestorage.app",
  messagingSenderId: "830046181945",
  appId: "1:830046181945:web:c6b5b39cd8c5a47da3cbe8",
  measurementId: "G-XTB8S632Y3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
export const auth = getAuth(app);
export const db = getFirestore(app)
