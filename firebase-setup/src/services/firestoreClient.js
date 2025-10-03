import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generic Firestore operations
 */

/**
 * Get a single document by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document data with id
 */
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Convert Firestore timestamps to JavaScript Date objects
      const convertedData = convertTimestamps(data);
      return { data: { id: docSnap.id, ...convertedData }, error: null };
    } else {
      return { data: null, error: new Error('Document not found') };
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return { data: null, error };
  }
}

/**
 * Get all documents for a user
 * @param {string} collectionName - Name of the collection
 * @param {string} userId - User ID
 * @param {string} orderByField - Field to order by (default: 'createdAt')
 * @param {string} orderDirection - Order direction (default: 'desc')
 * @returns {Promise<Object>} Array of documents
 */
export async function getUserDocuments(collectionName, userId, orderByField = 'createdAt', orderDirection = 'desc') {
  try {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection)
    );
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertTimestamps(data);
      documents.push({ id: doc.id, ...convertedData });
    });
    
    return { data: documents, error: null };
  } catch (error) {
    console.error('Error getting user documents:', error);
    return { data: null, error };
  }
}

/**
 * Create a new document
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Document data
 * @returns {Promise<Object>} Created document with id
 */
export async function createDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data();
    const convertedData = convertTimestamps(docData);
    return { data: { id: docSnap.id, ...convertedData }, error: null };
  } catch (error) {
    console.error('Error creating document:', error);
    return { data: null, error };
  }
}

/**
 * Update a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated document with id
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data();
    const convertedData = convertTimestamps(docData);
    return { data: { id: docSnap.id, ...convertedData }, error: null };
  } catch (error) {
    console.error('Error updating document:', error);
    return { data: null, error };
  }
}

/**
 * Delete a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Success status
 */
export async function deleteDocument(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { error: null };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { error };
  }
}

/**
 * Convert Firestore Timestamps to JavaScript Date objects
 * @param {Object} data - Document data
 * @returns {Object} Data with converted timestamps
 */
function convertTimestamps(data) {
  const converted = { ...data };
  
  for (const key in converted) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (typeof converted[key] === 'object' && converted[key] !== null) {
      // Recursively convert nested objects
      converted[key] = convertTimestamps(converted[key]);
    }
  }
  
  return converted;
}

/**
 * Query documents with custom filters
 * @param {string} collectionName - Name of the collection
 * @param {Array} filters - Array of filter objects [{field, operator, value}]
 * @param {string} orderByField - Field to order by
 * @param {string} orderDirection - Order direction
 * @returns {Promise<Object>} Array of documents
 */
export async function queryDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'asc') {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    const constraints = [];
    filters.forEach(filter => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });
    
    // Apply ordering
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertTimestamps(data);
      documents.push({ id: doc.id, ...convertedData });
    });
    
    return { data: documents, error: null };
  } catch (error) {
    console.error('Error querying documents:', error);
    return { data: null, error };
  }
}