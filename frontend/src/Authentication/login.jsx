import { signInWithPopup ,signInWithEmailAndPassword } from "firebase/auth";
import { auth , provider } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Eye , EyeOff} from 'lucide-react'
import { FaGoogle } from "react-icons/fa";
import { doc, setDoc ,getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ErrorLog } from "../services/errorlog";
import { serverTimestamp } from "firebase/firestore";

const LoginGoogle = () => {


    const [mail , setMail]= useState('');
    const [pas , setPas]= useState('');
    const [showpas, setShowpas] = useState(false);


    

    const navigate=useNavigate();
    const handlelogin1= async (e)=>{//with email and password
        e.preventDefault();

        try{
            const UserCred = await signInWithEmailAndPassword(auth , mail, pas);
            const user = UserCred.user;
            await user.reload();
            if(user.emailVerified){
                alert("User Logged In");
                
                navigate("/home");
            }
            else{
                alert("Please verify the email sent");
            }
        }

        catch(err){
          await ErrorLog({
                    message:err.message,
                    location:'Nested Component , login.jsx - handlelogin1',
                    stack:err.stack,
             })
            alert("Login  failed:" + err.message)
            console.log(err);
        }

    }



    const handleLogin2 = async () =>{ //google 
          

        try{
        const result = await signInWithPopup(auth , provider);
        const user = result.user;
        await user.reload();
        
        console.log("user logged in:",user);
          const userRef= doc(db ,"User" , user.uid);
          const snap = await getDoc(userRef);

          if(!snap.exists()){
            await setDoc(userRef,{
              name:result.user.displayName,
              email:result.user.email,
              photourl:result.user.photoURL,
              isOnline:true,
              uid:user.uid,
              createdAt: serverTimestamp(),
            })

          }

        alert("User logged In");

        navigate("/home");
        }

        catch(err){
          alert("Error , please try again later")
          await ErrorLog({
                    message:err.message,
                    location:' login.jsx - handlelogin2',
                    stack:err.stack,
            })
            console.log(err);
        }
    }





    
  return (
    <>
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  <form
    onSubmit={handlelogin1}
    className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4"
  >
    <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

    <input
      type="email"
      placeholder="Email"
      value={mail}
      onChange={(e) => setMail(e.target.value)}
      className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    
    <div className="relative w-100">
    <input
      type={showpas === true ? "text" : "password" }
      placeholder="Password"
      value={pas}
      onChange={(e) => setPas(e.target.value)}
      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

  <span
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
    onClick={() => setShowpas(!showpas)}
  >
     { showpas ? <EyeOff size={20}/>
     : <Eye size={20} />}

</span>
    </div>

    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
    >
      Login with Email
    </button>

    <button
      onClick={handleLogin2}
      type="button"
      className="flex items-center gap-2 justify-center bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
    >
      <FaGoogle size={18} />
      Sign in with Google
    </button>

    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-2 sm:gap-0">
  <span
    className="cursor-pointer text-red-700 hover:text-red-600 transition"
    onClick={() => navigate("/forgetpassword")}
  >
    Forgot Password
  </span>

 

  <span
    className="cursor-pointer text-blue-800 hover:text-blue-700 transition"
    onClick={() => navigate("/register")}
  >
    Create Account
  </span>
</div>


  </form>
</div>
    </>

  )
}



export default LoginGoogle;
