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

// Temporary placeholder Firebase configuration
// This will be replaced with actual values when we have the Firebase credentials
const firebaseConfig = {
  apiKey: "PLACEHOLDER-API-KEY",
  authDomain: "placeholder-project.firebaseapp.com",
  projectId: "placeholder-project",
  storageBucket: "placeholder-project.appspot.com",
  appId: "placeholder-app-id",
};

// Create placeholder auth object
let authInstance: any;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
} catch (error) {
  console.warn("Firebase initialization skipped due to missing credentials");
  // Create mock auth object for testing
  authInstance = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => callback(null),
    signOut: async () => Promise.resolve(),
  };
}

export const auth = authInstance;
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