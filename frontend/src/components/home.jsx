import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import { ErrorLog } from "../services/errorlog";
import { useNavigate } from "react-router-dom";
import { useState , useEffect } from "react";
import { db } from "../firebase";
import { collection , query , where , getDocs , deleteDoc  } from "firebase/firestore";
import { getDoc ,doc} from "firebase/firestore";

import { send_dm , listentodm, listenToAllIncomingMessages } from "../utils/messages";
import { useRef } from "react";
import { uploadtocloud } from "../utils/handleimages";

import EmojiPicker from "emoji-picker-react";
import { get_Id } from "../utils/messages";


const Home = () => {
    const navigate = useNavigate();
    const [searchterm , setSearchterm] = useState('');
    const [filteredusers , setFilteredUsers] = useState([]);

    const [dmText, setDmText] = useState("");
    const [dmMessages, setDmMessages] = useState([]);

    const [user1, setUser1] = useState('');
    const [user2, setUser2] = useState('');
    const reference= useRef(null);

    const [msgedusers , setMsgdusers] = useState([]);
    const [current , setCurrent] = useState('');


    const [imageurl,setImageurl]=useState(null);
    const filereference = useRef();
    const [isUploading, setIsUploading] = useState(false);

    const user2ref= useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [isMobileViewChatOpen, setIsMobileViewChatOpen] = useState(false);



    const handledelete = async (msgId) => {
  try {

    console.log("user1 in delete",user1);
        console.log("user2 in delete",user2);
  console.log("msgId:", msgId);
  

    const chatid = get_Id(user1.uid, user2.uid);
    console.log("chatId:", chatid);
    await deleteDoc(doc(db, "chats", chatid, "messages", msgId));
    console.log("Message deleted");
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};

    const handleimageupload = async (e)=>{
      const file = e.target.files[0];
      if(file){
        try{
          setIsUploading(true);
          const url =await uploadtocloud(file);
          

          if(url){
          setImageurl(url);
          console.log(imageurl);
          }
          
        }catch(err){
          await ErrorLog({
                    message:err.message,
                    location:'Nested Component , login.jsx - handlelogin1',
                    stack:err.stack,
             })

             console.log(err);
        }finally{
          setIsUploading(false);
        }
      }
    }



useEffect(() => {

  user2ref.current = user2;
  console.log("user 2 in effect",user2ref)
}, [user2]);

    


  useEffect(() => {
  const currentUser = auth.currentUser;
  console.log("currnet" , currentUser)
  if (currentUser) {
    setCurrent(currentUser);
    console.log("user2ref",user2ref)
    listenToAllIncomingMessages(currentUser, setMsgdusers, user2ref);
  }
}, []);



  useEffect(()=>{

    if(user2 && !msgedusers.some(user => user.id === user2.id)){
      setMsgdusers(prev=>[...prev,user2])
    }

  },[user2])  
    

  useEffect(() => {
  if (user1 && user2) {
    const unsubscribe = listentodm(user1, user2, setDmMessages);
    return () => unsubscribe();
  }
}, [user1, user2]);


useEffect(()=>{

reference.current?.scrollIntoView({ behavior: "smooth" });
},[dmMessages])


    const fetchcurrentuser = async ()=>{

      try{

        if(current){

          const userdocref = doc(db , "User" , current.uid);
          const userdocsnap = await getDoc(userdocref);

          if(userdocsnap.exists()){
            setUser1({id:userdocsnap.id,...userdocsnap.data()});
          }

        }

      }catch(err){
        ErrorLog({
          message:err.message,
          location:'Home.jsx - fetchcurrentuser',
          stack:err.stack,
        });

        console.log(err);
      }

    }

    useEffect(()=>{
          const storedUsers = localStorage.getItem(`msgedusers_${current.uid}`);
      if (storedUsers) {
        setMsgdusers(JSON.parse(storedUsers));
      }


        const lastChatUser = localStorage.getItem(`lastChatUser_${current.uid}`);

        if (lastChatUser) {
          setUser2(JSON.parse(lastChatUser));
        }
      fetchcurrentuser();

    },[current])





    useEffect(()=>{

      const fetchusers = async ()=>{
        if(searchterm.trim() === ""){
          setFilteredUsers([]);
          return;
        }

        const usersRef = collection(db ,"User" );

        const q = query(
          usersRef,
          where("name" , ">=" , searchterm),
          where("name","<=",searchterm + "\uf8ff")//largest unicode
          
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc=>({
          id:doc.id,
          ...doc.data()
        }))



        setFilteredUsers(results);
      }
      fetchusers();

    },[searchterm]);



    const handleSignOut = async ()=>{
        try{

        signOut(auth);
        alert("User Signed Out");
    }catch(err){
        await ErrorLog({
              message:err.message,
              location:' home.jsx - handleSignOut',
              stack:err.stack,
      })

      console.log(err);
  }
        console.log(err);
    }


useEffect(() => {
  if (current) {
    localStorage.setItem(`msgedusers_${current.uid}`, JSON.stringify(msgedusers));
  }
}, [msgedusers]);


  return (
<div className="h-screen w-full flex bg-[#f0f2f5]">
  {/* Sidebar */}
  <div className={`w-full max-w-sm bg-white border-r border-gray-300 flex flex-col shadow-lg 
    ${isMobileViewChatOpen ? "hidden" : "block"} md:block`}>
    
    {/* Header */}
    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
      <h1 className="text-xl font-bold text-[#0b57d0]">💬 Echo Chat</h1>
      <div className="space-x-2">
        <button onClick={() => navigate("/chatroom")} className="bg-[#0b57d0] hover:bg-[#0a47b2] text-white px-3 py-1 rounded-md text-sm transition">Chatroom</button>
        <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition">Sign Out</button>
        
      </div>
    </div>

    {/* Search Bar */}
    <div className="p-3 border-b border-gray-200 bg-white sticky top-12 z-10">
      <input
        type="text"
        placeholder="🔍 Search users..."
        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition"
        onChange={(e) => setSearchterm(e.target.value)}
      />
    </div>

    {/* User List */}
    <div className="flex-1 overflow-y-auto bg-white ">
      {/* Search Results */}
      <div className="divide-y">
        {filteredusers.length > 0 ? (
          filteredusers
            .filter(user => user.id !== user1.id)
            .map(user => (
              <div key={user.id} className="px-4 py-3 hover:bg-[#f7f9fc] flex justify-between items-center cursor-pointer transition">
                <span className="font-medium text-gray-800 truncate">{user.name}</span>
                <span
                  className="text-sm text-[#0b57d0] hover:underline font-semibold"
                  onClick={() => {
                    setMsgdusers(prev => {
                      if (!prev.some(u => u.id === user.id)) return [...prev, user];
                      return prev;
                    });
                    setUser2(user);
                    setIsMobileViewChatOpen(true);
                    if (current) {
                      localStorage.setItem(`lastChatUser_${current.uid}`, JSON.stringify(user));
                    }
                  }}
                >
                  Message
                </span>
              </div>
            ))
        ) : searchterm.trim() === "" ? (
          <>
          {/* <div className="p-4 text-gray-400 text-sm">Start typing to search... */}
          <span className = "text-blue-600 cursor-pointer p-4" onClick={()=>navigate('/allusers')}>Check All Registered Users Usernames</span>

          {/* </div> */}
          </>
        ) : (
          <div className="p-4 text-gray-400 text-sm">No users found</div>
        )}
      </div>

      {/* Recently Messaged */}
      <div className="border-t border-gray-200 mt-2 overflow-hidden">
        <h2 className="text-xs font-semibold text-gray-500 px-4 pt-2 pb-1">Recently Messaged</h2>
        {msgedusers.length > 0 ? (
          msgedusers.map(user => (
            <div key={user.uid} onClick={() => {
              setUser2(user);
              setIsMobileViewChatOpen(true);
            }} className="flex items-center px-4 py-3 hover:bg-[#f7f9fc] cursor-pointer transition">
              <img src={user.photourl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt="profile" className="w-10 h-10 object-cover rounded-full border shadow-sm mr-3" />
              <div><span className="text-gray-800 font-medium truncate">{user.name}</span></div>
            </div>
          ))
        ) : (
          <p className="px-4 text-sm text-gray-400 py-3">No recent messages</p>
        )}
      </div>
    </div>
  </div>

  {/* Main Chat Area */}
  <div className={`flex-1 h-full flex flex-col bg-[#e5ddd5] ${isMobileViewChatOpen ? "block" : "hidden"} md:flex`}>
    
    {/* Chat Header */}
    <div className="px-4 py-3 bg-white shadow flex justify-between items-center border-b border-gray-300">
      {user2 && (
        <button onClick={() => setIsMobileViewChatOpen(false)} className="md:hidden text-blue-600 font-medium">← Back</button>
      )}
      <span className="font-semibold text-gray-800">
        {user2 ? `Chat with ${user2.name}` : "Select a user to start chat"}
      </span>
      <span className="text-sm text-gray-600">{user1?.name || "Anonymous"}</span>
    </div>

    {/* Messages Scrollable Container */}
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
      {dmMessages.map((msg) => {
        const isCurrentUser = msg.userId === user1.uid;
        return (
          <div key={msg.uid} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className="relative group w-fit max-w-[70%]">
              <div className={`relative p-3 rounded-xl shadow-sm transition ${isCurrentUser ? "bg-[#dcf8c6]" : "bg-white"}`} ref={reference}>
                <p className="text-sm font-semibold text-gray-600 mb-1">{msg.userName}</p>
                {msg.imageurl && <img src={msg.imageurl} alt="Sent" className="max-w-xs rounded-md mb-2" />}
                {msg.text && <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">{msg.text}</p>}
              </div>
              {isCurrentUser && (
                <button onClick={() => handledelete(msg.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Uploading Preview / Image */}
    {isUploading && (<p className="text-blue-700 mb-2 px-6">Uploading the image...</p>)}
    {imageurl && (
      <div className="px-6 pb-2">
        <img src={imageurl} alt="preview" className="max-w-xs rounded-md" />
      </div>
    )}

    {/* Message Input Sticky */}
    {user2 && (
      <div className="sticky bottom-0 bg-white border-t flex items-center gap-3 px-4 py-3 z-10">
        <input type="file" accept="image/*" style={{ display: "none" }} ref={filereference} onChange={handleimageupload} />
        <button onClick={() => filereference.current.click()}>📷</button>
        <input
          type="text"
          value={dmText}
          onChange={(e) => setDmText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send_dm(dmText, user1, user2, imageurl);
              setDmText("");
              setImageurl(null);
            }
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition"
          placeholder="Type a message..."
        />
        {/* Emoji Picker */}
        <div className="relative">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-xl">😊</button>
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-50">
              <EmojiPicker onEmojiClick={(emojiData) => {
                setDmText(prev => prev + emojiData.emoji);
              }} />
            </div>
          )}
        </div>
        <button onClick={() => {
          send_dm(dmText, user1, user2, imageurl);
          setDmText("");
          setImageurl(null);
        }} className="bg-[#0b57d0] hover:bg-[#0a47b2] text-white px-5 py-2 rounded-full transition">Send</button>
      </div>
    )}
  </div>
</div>

  )
}

export default Home;
