import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "firebase/auth";
import { apiRequest, queryClient } from "./queryClient";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTNNBtBUKBq7nzkahMwMyf5tbzT47Y_E8",
  authDomain: "pass-dc86f.firebaseapp.com",
  projectId: "pass-dc86f",
  storageBucket: "pass-dc86f.firebasestorage.app",
  messagingSenderId: "786796771288",
  appId: "1:786796771288:web:8aee76fe958c23f57a64ad",
  measurementId: "G-83VFZ6EMHG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Send user info to our backend to create/update user in our database
    const response = await apiRequest("POST", "/api/verify-oauth", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    
    // Invalidate the user query to refresh user data
    queryClient.invalidateQueries({queryKey: ["/api/user"]});
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

// Sign out
export async function signOut() {
  try {
    await auth.signOut();
    await apiRequest("POST", "/api/logout");
    queryClient.setQueryData(["/api/user"], null);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
}

// Handle the redirect result after OAuth login
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      // Send user info to our backend to create/update user in our database
      await apiRequest("POST", "/api/verify-oauth", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      });
      
      // Invalidate the user query to refresh user data
      queryClient.invalidateQueries({queryKey: ["/api/user"]});
      
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result", error);
    throw error;
  }
}

// This function can be used to initialize auth state listener in App.tsx
export function initAuthStateListener(callback: (user: any) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}