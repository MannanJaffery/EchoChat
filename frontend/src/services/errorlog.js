import { db  } from "../firebase";
import { addDoc , collection , serverTimestamp, Timestamp } from "firebase/firestore";

export const ErrorLog = async ({ message, location, userId = null, stack = "" }) => {
  try {
    await addDoc(collection(db, "ErrorLogs"), {
      message,
      location,
      stack,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.log(`Error in LOG-ERROR component: ${err.message}`);
  }
};
