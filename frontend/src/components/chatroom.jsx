import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";
import { listenToMessages, sendMessage } from "../utils/messages";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";
import { uploadtocloud } from "../utils/handleimages";
import { useNavigate } from "react-router-dom";

const ChatRoom = () => {
  const [msgs, setMsgs] = useState([]);
  const [newmsg, setNewmsg] = useState("");
  const [imageurl, setImageurl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const reference_msg = useRef(null);
  const fileref = useRef(null);
  const navigate = useNavigate();

  // Listen for messages
  useEffect(() => {
    const unsubscribe = listenToMessages(setMsgs);
    return () => unsubscribe();
  }, []);

  // Scroll to latest message
  useEffect(() => {
    reference_msg.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Send a message
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

  // Delete message
  const handleDelete = async (msgId) => {
    try {
      await deleteDoc(doc(db, "messages", msgId));
      console.log("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Upload image
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
      <div className="p-4 bg-blue-600 text-white text-lg font-semibold shadow-md flex justify-between">
        <div>🔵 Public Chat Room</div>
        <span className="cursor-pointer hover:text-blue-100 " onClick={()=>navigate('/')}>Back</span>
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
              <div className="relative group w-fit max-w-[70%]" ref={reference_msg}>
                <div
                  className={`p-3 rounded-md shadow-sm mb-2 ${
                    isCurrentUser ? "bg-green-200" : "bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold text-blue-700 mb-1">
                    {msg.userName}
                  </p>

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

                {/* Delete button (for current user only) */}
                {isCurrentUser && (
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="absolute top-2 right-2 hidden group-hover:block text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
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

        <div className="flex gap-2 items-center relative">
          {/* Upload image */}
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

          {/* Emoji picker toggle */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-xl"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-50">
                <EmojiPicker
                  onEmojiClick={(emojiData) =>
                    setNewmsg((prev) => prev + emojiData.emoji)
                  }
                />
              </div>
            )}
          </div>

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
