import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAxfVuld0AM1XOYgaQ6Lcev1E_CCFIppdk",
  authDomain: "civicai-app-af2ee.firebaseapp.com",
  projectId: "civicai-app-af2ee",
  storageBucket: "civicai-app-af2ee.firebasestorage.app",
  messagingSenderId: "389516359382",
  appId: "1:389516359382:web:32526a94de1aeb0aa3fb77",
  measurementId: "G-KFZETQ19ZW"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)