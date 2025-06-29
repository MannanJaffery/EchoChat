
import { sendMessage , listenToMessages } from "../utils/messages";
import { auth } from "../firebase";
import { useEffect, useState } from "react";


import { db } from "../firebase";
import { getDoc, collection, doc } from "firebase/firestore";



const ChatRoom = () => {

    const [msgs,setMsgs] = useState([]);
    const [newmsg,Setnewmsg] = useState('');
        useEffect(()=>{
            const unsubscribe =listenToMessages(setMsgs);
            return ()=>{unsubscribe};
        },[])


        const handlesend = async ()=>{
            const user = auth.currentUser;
    
            const userRef = doc(db, "User" , user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if(!userData || !newmsg.trim()) return;

            await sendMessage(newmsg , userData);
            Setnewmsg("");
        }

  return (
    <>
  <div className="min-h-screen flex flex-col bg-gray-100">
  
    <div className="p-4 bg-blue-600 text-white text-lg font-semibold shadow-md">
      🔵 Public Chat Room
    </div>

    
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
   
      <div className="bg-white p-3 rounded-md shadow-sm">
        {msgs.map((msg) => (
            <div key={msg.id} className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm font-semibold text-blue-700">{msg.userName}</p>
                <p>{msg.text}</p>
            </div>
        ))}

      </div>
    
    </div>

  
    <div className="p-4 bg-white shadow-inner flex gap-2">

      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={(e)=> Setnewmsg(e.target.value)}
      />



      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      onClick={handlesend}>
        Send
      </button>
    </div>
  </div>
</>

  )
}

export default ChatRoom;
