import { useEffect, useState } from "react";
import { auth } from "../firebase"; 
import { listenToMessages, sendMessage } from "../utils/messages"; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useRef } from "react";





const ChatRoom = () => {

    const [msgs,setMsgs] = useState([]);
    const [newmsg,Setnewmsg] = useState('');


    const reference_msg = useRef(null);


        useEffect(()=>{
            const unsubscribe =listenToMessages(setMsgs);
            return ()=>{unsubscribe};
        },[])



        useEffect(()=>{
            reference_msg.current?.scrollIntoView({ behavior: "smooth" });

        },[msgs])

  
        const user = auth.currentUser;
        const handlesend = async ()=>{
            
    
            const userRef = doc(db, "User" , user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if(!userData || !newmsg.trim()) return;

            await sendMessage(newmsg , userData);
            Setnewmsg("");
        }


  return (

    <>

    
<div className="h-screen flex flex-col bg-gray-100">

  {/* Header */}
  <div className="p-4 bg-blue-600 text-white text-lg font-semibold shadow-md">
    🔵 Public Chat Room
  </div>

  {/* Scrollable messages area */}
  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
    {msgs.map((msg) => {
      const isCurrentUser = msg.userId === auth.currentUser?.uid;

      return (

        <div
          key={msg.id}
          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`p-3 rounded-md shadow-sm mb-2 w-fit max-w-[70%] ${
              isCurrentUser ? "bg-green-200" : "bg-white"
            }`
          }
          ref={reference_msg}
          >
            <p className="text-sm font-semibold text-blue-700 mb-1">
              {msg.userName}
            </p>
            <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
              {msg.text}
            </p>
          </div>
        </div>
      );
    })}
  </div>

  <div className="p-4 bg-white shadow-inner flex gap-2">
    <input
      type="text"
      placeholder="Type a message..."
      value={newmsg}
      onChange={(e) => Setnewmsg(e.target.value)}
      className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      onKeyDown={(e) => {
    if (e.key === "Enter") {
      handlesend();
    }
  }}
    />
    <button
      onClick={handlesend}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
    >
      Send
    </button>
  </div>
</div>

</>
  )
}
export default ChatRoom;  





