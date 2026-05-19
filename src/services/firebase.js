import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "pocketcontrol-ced5a.firebaseapp.com",
  projectId: "pocketcontrol-ced5a",
  storageBucket: "pocketcontrol-ced5a.firebasestorage.app",
  messagingSenderId: "391701006113",
  appId: "1:391701006113:web:9c20454dd145598087a060",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
