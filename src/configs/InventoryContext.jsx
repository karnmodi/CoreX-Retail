import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

async function fetchProducts() {
  const productsCollection = collection(db, 'Inventory');
  const productsSnapshot = await getDocs(productsCollection);
  const products = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return products;
}

export default fetchProducts;
