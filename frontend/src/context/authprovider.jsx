import { createContext , useContext , useState , useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext= createContext();


export const AuthProvider = ({children}) => {
  const [user , setUser] = useState(null);
  const [loading , setLoading] = useState(true);

  useEffect(()=>{
    
    const unsubscribe = onAuthStateChanged(auth , async (currentuser)=>{
        if(currentuser){
            await currentuser.reload();
            setUser(currentuser);
        }
        else{
            setUser(null);
        }
        setLoading(false);
    })
    return ()=> unsubscribe();

  },[])

  return (
    <AuthContext.Provider value={{user,loading}}>
        {children}
    </AuthContext.Provider>

  )
}
export const useAuth = ()=>useContext(AuthContext);

