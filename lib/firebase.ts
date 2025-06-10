import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface GlobalHighScore {
  score: number;
  timestamp: number;
  date: string;
}

export const updateGlobalHighScore = async (score: number): Promise<boolean> => {
  try {
    const highScoreRef = doc(db, 'game', 'globalHighScore');
    const currentDoc = await getDoc(highScoreRef);

    if (!currentDoc.exists() || currentDoc.data().score < score) {
      const newRecord: GlobalHighScore = {
        score,
        timestamp: Date.now(),
        date: new Date().toISOString(),
      };

      await setDoc(highScoreRef, newRecord);
      return true; // New record set
    }

    return false; // No new record
  } catch (error) {
    console.error('Error updating global high score:', error);
    return false;
  }
};

export const subscribeToGlobalHighScore = (callback: (highScore: GlobalHighScore | null) => void) => {
  const highScoreRef = doc(db, 'game', 'globalHighScore');

  return onSnapshot(
    highScoreRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data() as GlobalHighScore);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to global high score:', error);
      callback(null);
    },
  );
};
