import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import { ErrorLog } from "../services/errorlog";
import { useNavigate } from "react-router-dom";

const Home = () => {



    const navigate = useNavigate();
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
    
  return (
    <>

    <h1>Home Page</h1>
    <button onClick={handleSignOut}>
        SignOut
    </button>

    <button onClick={()=>navigate("/chatroom") }>Go to Chatroom</button>
    
    </>
  )
}

export default Home;
