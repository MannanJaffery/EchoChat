import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authprovider";


const ProtectedRoute = ({children}) => {

  const {user , loading} = useAuth();
if (loading) {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#f0f2f5]">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
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
