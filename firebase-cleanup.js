// Firebase cleanup script to remove 'cover' field from all albums
// Run this in Firebase Console (Functions tab) or in your app with admin privileges

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, deleteField } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeCoverFields() {
  try {
    // Remove from events
    const eventsRef = collection(db, 'events');
    const eventsDocs = await getDocs(eventsRef);
    for (const doc of eventsDocs.docs) {
      await updateDoc(doc.ref, {
        cover: deleteField()
      });
      console.log(`Deleted cover from event: ${doc.id}`);
    }

    // Remove from outdoor
    const outdoorRef = collection(db, 'outdoor');
    const outdoorDocs = await getDocs(outdoorRef);
    for (const doc of outdoorDocs.docs) {
      await updateDoc(doc.ref, {
        cover: deleteField()
      });
      console.log(`Deleted cover from outdoor: ${doc.id}`);
    }

    console.log('✓ All cover fields removed');
  } catch (error) {
    console.error('Error removing cover fields:', error);
  }
}

// Call the function
removeCoverFields();
