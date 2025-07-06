import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authprovider";


const ProtectedRoute = ({children}) => {

  const {user , loading} = useAuth();
  if(loading){
    return <p>Loading...</p>
  }  

 const ProviderLogin = user?.providerData?.[0]?.providerId!=="password";
 const emailVerified = user?.emailVerified;


 //? symbol just to be safe from errors

 if(user &&(ProviderLogin||emailVerified)){
    return children;
 }

 return <Navigate to="/login" />
}

export default ProtectedRoute;
