import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import { ErrorLog } from "../services/errorlog";

const Home = () => {

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
    
    </>
  )
}

export default Home;
