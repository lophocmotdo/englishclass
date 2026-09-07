import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0964947234",
  appId: "1:205837844764:web:66b57b52b65298a8bf7ad9",
  apiKey: "AIzaSyCh_QF_7jC7k31_F3Bs0W-1dv9EBXzYf_I",
  authDomain: "gen-lang-client-0964947234.firebaseapp.com",
  storageBucket: "gen-lang-client-0964947234.firebasestorage.app",
  messagingSenderId: "205837844764",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// Use the specific databaseId from config
export const db = getFirestore(app, "ai-studio-qunllchdy-47eec248-47e0-43b1-ac94-84c11363346a");
