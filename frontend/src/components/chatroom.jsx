import { useEffect, useState } from "react";
import { auth } from "../firebase"; 
import { listenToMessages, sendMessage } from "../utils/messages"; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useRef } from "react";
import { uploadtocloud } from "../utils/handleimages";





const ChatRoom = () => {
  const [msgs, setMsgs] = useState([]);
  const [newmsg, setNewmsg] = useState("");
  const [imageurl, setImageurl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const reference_msg = useRef(null);
  const fileref = useRef(null);

  useEffect(() => {
    const unsubscribe = listenToMessages(setMsgs);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    reference_msg.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handlesend = async () => {
    if (isUploading) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "User", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (!userData || (!newmsg.trim() && !imageurl)) return;

    await sendMessage(newmsg, userData, imageurl);
    setNewmsg("");
    setImageurl(null);
    if (fileref.current) fileref.current.value = null;
  };

  const handleimageupload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const url = await uploadtocloud(file);
        if (url) setImageurl(url);
      } catch (err) {
        console.error("Image upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white text-lg font-semibold shadow-md">
        🔵 Public Chat Room
      </div>

      {/* Messages */}
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
                }`}
                ref={reference_msg}
              >
                <p className="text-sm font-semibold text-blue-700 mb-1">
                  {msg.userName}
                </p>

                {/* ✅ Show image if present */}
                {msg.imagerul && (
                  <img
                    src={msg.imagerul}
                    alt="sent"
                    className="max-w-xs rounded-md mb-2"
                  />
                )}

                {msg.text && (
                  <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="p-4 bg-white shadow-inner flex flex-col gap-2">
        {isUploading && (
          <p className="text-sm text-blue-500">Uploading image...</p>
        )}

        {imageurl && (
          <img
            src={imageurl}
            alt="preview"
            className="max-w-xs rounded-md mb-2"
          />
        )}

        <div className="flex gap-2 items-center">
          {/* Upload button */}
          <input
            type="file"
            accept="image/*"
            ref={fileref}
            onChange={handleimageupload}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileref.current.click()}
            className="text-xl px-2"
          >
            📷
          </button>

          {/* Message input */}
          <input
            type="text"
            placeholder="Type a message..."
            value={newmsg}
            onChange={(e) => setNewmsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlesend();
            }}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Send button */}
          <button
            onClick={handlesend}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatRoom;  





