// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsQ39r6-yYumBsxLpirIcjJUwzIpBkdBo",
  authDomain: "service-provider-umi.firebaseapp.com",
  projectId: "service-provider-umi",
  storageBucket: "service-provider-umi.firebasestorage.app",
  messagingSenderId: "102179953373",
  appId: "1:102179953373:web:91f95932433488a1211934"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
let messaging: any = null;
try {
  messaging = getMessaging(firebaseApp);
} catch (error) {
  console.error("Error initializing Firebase Messaging:", error);
}
export { messaging };
