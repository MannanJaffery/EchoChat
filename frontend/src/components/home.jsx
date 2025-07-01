import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import { ErrorLog } from "../services/errorlog";
import { useNavigate } from "react-router-dom";
import { useState , useEffect } from "react";
import { db } from "../firebase";
import { collection , query , where , getDocs } from "firebase/firestore";
import { getDoc ,doc} from "firebase/firestore";

import { send_dm , listentodm } from "../utils/messages";
import { useRef } from "react";



const Home = () => {

    const navigate = useNavigate();
    const [searchterm , setSearchterm] = useState('');
    const [filteredusers , setFilteredUsers] = useState([]);

    const [dmText, setDmText] = useState("");
    const [dmMessages, setDmMessages] = useState([]);

    const current = auth?.currentUser;


    const [user1, setUser1] = useState('');
    const [user2, setUser2] = useState('');
    const reference= useRef(null);


    const [msgedusers , setMsgdusers] = useState([]);

  

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
          const storedUsers = localStorage.getItem("msgedusers");
      if (storedUsers) {
        setMsgdusers(JSON.parse(storedUsers));
      }


        const lastChatUser = localStorage.getItem("lastChatUser");
        if (lastChatUser) {
          setUser2(JSON.parse(lastChatUser));
        }
      fetchcurrentuser();

    },[])



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
  localStorage.setItem("msgedusers", JSON.stringify(msgedusers));
}, [msgedusers]);

    


  return (
<div className="min-h-screen bg-gray-100 flex">
  {/* user section */}
  <div className="w-full max-w-sm bg-gray-100 p-6">
    <div className="w-full flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-blue-600">💬 Echo Chat</h1>
      <div className="space-x-2">
        <button
          onClick={() => navigate("/chatroom")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Chatroom
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>

    {/* Search input */}
    <input
      type="text"
      placeholder="Search users..."
      className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
      onChange={(e) => setSearchterm(e.target.value)}
    />

    {/* Users list */}
    <div className="w-full bg-white rounded-md shadow divide-y max-h-[300px] overflow-y-auto">
      {filteredusers.length > 0 ? (
        filteredusers.filter(user=>user.id!==user1.id).map((user) => (
          <div
            key={user.id}
            className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
          >
            <span className="font-medium text-gray-800">{user.name}</span>
            <span
                className="text-sm text-blue-500"
                onClick={() => {

                  setMsgdusers(prev => {
                    
                    if (!prev.some(u => u.id === user.id)) {
                      return [...prev, user];
                    }
                    return prev; 
                  });


                  setUser2(user);
                  localStorage.setItem("lastChatUser", JSON.stringify(user));
                }}
              >
              Message
            </span>
          </div>
        ))
      ) : searchterm.trim() === "" ? (
        <div className="p-4 text-gray-400">Start typing to search...</div>
      ) : (
        <div className="p-4 text-gray-400">No users found</div>
      )}


      {msgedusers &&
  msgedusers.map((user) => (
    <div key={user.id}>
      <p>{user.name}</p>
    </div>
  ))
}
    </div>
  </div>

  {/* right side for DM chat */}
<div className="flex-1 h-screen flex flex-col bg-gray-100">
  {/* Header */}
  <div className="p-4 bg-blue-600 text-white text-lg font-semibold shadow-md">
    {user2 ? `Chat with ${user2.name}` : "Direct Messages"}
  </div>

  {/* Scrollable messages area */}
  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
    {dmMessages.map((msg) => {
      const isCurrentUser = msg.userId === user1.uid;
      return (
        <div
          key={msg.id}
          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`p-3 rounded-md shadow-sm w-fit max-w-[70%] ${
              isCurrentUser ? "bg-green-200" : "bg-white"
            }`}
            ref={reference}
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

  {/* Message input */}
  {user2 && (
    <div className="p-4 bg-white shadow-inner flex gap-2">
      <input
        type="text"
        value={dmText}
        onChange={(e) => setDmText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            send_dm(dmText, user1, user2);
            setDmText("");
          }
        }}
        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type a message..."
      />
      <button
        onClick={() => {
          send_dm(dmText, user1, user2);
          setDmText("");
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  )}
</div>

</div>


  )

}

export default Home;
