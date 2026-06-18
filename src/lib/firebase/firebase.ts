// src/firebase/firebase.ts
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCsQ39r6-yYumBsxLpirIcjJUwzIpBkdBo",
  authDomain: "service-provider-umi.firebaseapp.com",
  projectId: "service-provider-umi",
  storageBucket: "service-provider-umi.firebasestorage.app",
  messagingSenderId: "102179953373",
  appId: "1:102179953373:web:91f95932433488a1211934",
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);