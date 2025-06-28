import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc  ,setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ErrorLog } from "../services/errorlog";


const Register = () => {
  const navigate= useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [checkverified , setCheckVerified] = useState(false);



  const handleRegister = async (e)=>{
    e.preventDefault();
    try{
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
    
      setCheckVerified(true);
      alert("Email Verification Sent , Kindly check spam");
      
      try{
        await setDoc(doc(db,"User" ,user.uid ),{
          name,
          email,
          isOnline:true,
          photourl:`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
        })

      }catch(err){
        await ErrorLog({
          message:err.message,
          location:'Nested Component , register.jsx - HandleRegister',
          stack:err.stack,
        })
        console.log(err + "in nested try-catch");
      }
    }
    catch(err){
        if(err.code==='auth/email-already-in-use'){
            alert("This email is alreadt in use , Login");
        }
        else{
          await ErrorLog({
          message:err.message,
          location:'register.jsx - HandleRegister',
          stack:err.stack,
        })
        }
        navigate("/login");
        console.log(err);
    }
  }



  useEffect(()=>{
    if(!checkverified){
        return;
    }

    
    const interval = setInterval(async()=>{
        const user = auth.currentUser;
        if(user){
            await user.reload();
            if(user.emailVerified){
                clearInterval(interval);
                alert("Email Verified , redirecting ...");
                navigate("/home");
            }
        }
    },3000);
    return ()=>clearInterval(interval);

  },[checkverified])

  return (
    <>
<div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border border-gray-300 p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Sign Up
        </button>

            <span className="p-4 flex justify-center cursor-pointer text-blue-800 hover:text-blue-700"
            onClick={()=>{navigate("/login")}}>Already have an account , Login</span>
      </form>
    </div>

    </>
  )
}

export default Register;

