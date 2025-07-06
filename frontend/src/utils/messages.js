import { db } from "../firebase";
import { collection , addDoc , onSnapshot , orderBy , query , serverTimestamp , doc ,setDoc , updateDoc} from "firebase/firestore";
import { collectionGroup } from "firebase/firestore";

const messagesref= collection(db , "messages");

export const sendMessage = async (text , user, imagerul = null)=>{
    if(!text.trim()&&!imagerul) return;

    await addDoc(messagesref, {
        text,
        createdAt:serverTimestamp(),
        userId:user.uid,
        userName: user.name||"Annonomoyus",
        imagerul,
        read:false,
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










//for dm only




export const getMessagedUsers = async (currentUserId) => {
  const subColRef = collection(db, "User", currentUserId, "messagedUsers");

  const snapshot = await getDocs(subColRef);

  const messagedUsers = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return messagedUsers;
};




export const markMessagesAsRead = async (currentUID, selectedUserUID) => {
  const userRef = doc(db, "User", currentUID, "messagedUsers", selectedUserUID);

  await updateDoc(userRef, {
    unread: false
  });
};




export const send_dm =async (text , sender , receiver , imageurl = null)=>{
if(!text.trim()&&!imageurl) return;
const chatId = get_Id(sender.uid.trim(),receiver.uid.trim());
const msgrefdm = collection(db , "chats" , chatId , "messages");
await addDoc(msgrefdm , {
  text,
  createdAt:serverTimestamp(),
  userId:sender.uid,
  receiverId:receiver.uid,
  userName:sender.name,
  imageurl,
})
const lastmessage = text || "[image]";
}



export const listenToAllIncomingMessages = (currentUser, callback ) => {
  const chatsRef = collectionGroup(db, "messages"); // listen to all messages
  const q = query(chatsRef, orderBy("createdAt"));

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data();

      // Only act on new messages sent TO currentUser
      if (change.type === "added" && data.receiverId === currentUser.uid) {
        const senderId = data.userId;

        callback((prev) => {
          const alreadyExists = prev.some((u) => u.uid === senderId);
          if (!alreadyExists) {
            return [
              ...prev,
              {
                uid: senderId,
                name: data.userName || "Unknown",
                lastmessage: data.text || "[image]",
                timestamp: Date.now(),
               

              },
            ];
          }
          return prev;
        });
      }
    });
  });
};



export const listentodm = (user1, user2, callback ) => {//callback2 to append the enew users to reciver if not already in this 

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




