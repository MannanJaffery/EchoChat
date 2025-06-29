import { db } from "../firebase";
import { collection , addDoc , onSnapshot , orderBy , query , serverTimestamp } from "firebase/firestore";

const messagesref= collection(db , "messages");



export const sendMessage = async (text , user)=>{
    if(!text.trim()) return;

    await addDoc(messagesref, {
        text,
        createdAt:serverTimestamp(),
        userId:user.uid,
        userName: user.name||"Annanomoyus",
    })
}


export const listenToMessages = (callback) => {
  const q = query(messagesref, orderBy("createdAt"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(msgs);
  });

};

