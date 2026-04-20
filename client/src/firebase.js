import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // ✅ import GoogleAuthProvider

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfFQm4qqSUUpwhMCVSvwWun-DKk085Rqk",
  authDomain: "ai-career-advisor-82f34.firebaseapp.com",
  projectId: "ai-career-advisor-82f34",
  storageBucket: "ai-career-advisor-82f34.firebasestorage.app",
  messagingSenderId: "261425297748",
  appId: "1:261425297748:web:2dfed2fc7003f2e458f0c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth instance to use everywhere
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ now this works
