import { signOut } from "firebase/auth";
import { auth } from "../firebase";


const Home = () => {

    const handleSignOut = async ()=>{
        try{

        signOut(auth);
        alert("User Signed Out");
    }catch(err){
        console.log(err);
    }
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
