// Firebase Client Configuration — Live Project Credentials (smart-resume-ranker-2)
const firebaseConfig = {
  apiKey: "AIzaSyBFLJni7Xz1ng43CN-nq1yBY8UesNL_oUI",
  authDomain: "smart-resume-ranker-2.firebaseapp.com",
  projectId: "smart-resume-ranker-2",
  storageBucket: "smart-resume-ranker-2.firebasestorage.app",
  messagingSenderId: "241181148402",
  appId: "1:241181148402:web:2d06f06e61a8e858087c6b",
  measurementId: "G-X1T3Y9G9PE"
};

let firebaseApp = null;
let firebaseAuth = null;
let googleProvider = null;
let isFirebaseInitialized = false;

function initFirebaseClient() {
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseAuth = firebase.auth();
      googleProvider = new firebase.auth.GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      isFirebaseInitialized = true;
      console.log('[Firebase Client] Initialized successfully for project:', firebaseConfig.projectId);
    } catch (err) {
      console.warn('[Firebase Client] Initialization warning:', err.message);
    }
  }
}

// Auto-load Firebase compat SDK if not present in HTML head
if (typeof firebase === 'undefined') {
  const appScript = document.createElement('script');
  appScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
  appScript.onload = () => {
    const authScript = document.createElement('script');
    authScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
    authScript.onload = () => {
      initFirebaseClient();
    };
    document.head.appendChild(authScript);
  };
  document.head.appendChild(appScript);
} else {
  initFirebaseClient();
}

window.firebaseConfig = firebaseConfig;
window.isFirebaseClientReady = () => isFirebaseInitialized;
window.getFirebaseAuth = () => firebaseAuth;
window.getGoogleProvider = () => googleProvider;
