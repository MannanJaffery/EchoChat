import { db } from "../firebase";
import { collection , addDoc , onSnapshot , orderBy , query , serverTimestamp } from "firebase/firestore";

const messagesref= collection(db , "messages");

export const sendMessage = async (text , user)=>{
    if(!text.trim()) return;

    await addDoc(messagesref, {
        text,
        createdAt:serverTimestamp(),
        userId:user.uid,
        userName: user.name||"Annonomoyus",
        imageurl:null,
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


export const get_Id = (u1_id,u2_id)=>{

  return [u1_id,u2_id].sort().join("_");

}


export const send_dm =async (text , sender , receiver)=>{

if(!text.trim()) return;



const chatId = get_Id(sender.uid.trim(),receiver.uid.trim());

const msgrefdm = collection(db , "chats" , chatId , "messages");


await addDoc(msgrefdm , {
  text,
  createdAt:serverTimestamp(),
  userId:sender.uid,
  userName:sender.name,
  imageurl:null,
})


}


export const listentodm = (user1, user2, callback) => {
  const chatId = get_Id(user1.uid, user2.uid);

  const msgrefdm = collection(db, "chats", chatId, "messages");
  const q2 = query(msgrefdm, orderBy("createdAt"));

  return onSnapshot(q2, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(msgs); 
  });
};

