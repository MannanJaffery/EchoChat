import {BrowserRouter as Router , Routes , Route} from "react-router-dom";
import LoginGoogle from "./Authentication/login";
import Register from "./Authentication/register";
import { AuthProvider } from "./context/authprovider";

import Home from "./components/home";
import ProtectedRoute from "./components/protectedroute";
import ForgetPassword from "./Authentication/forgetpassword";
import ChatRoom from "./components/chatroom";
function App() {
  return (

    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element = {<LoginGoogle />}></Route>
        <Route path="/register" element = {<Register />}></Route>
        <Route path="/forgetpassword" element = {<ForgetPassword />}></Route>
        <Route path="/home" element = {<ProtectedRoute>
          <Home />
          </ProtectedRoute>}>
        </Route>

        <Route path="/chatroom" element = {<ProtectedRoute>
          <ChatRoom />
          </ProtectedRoute>}>
        </Route>


      </Routes>
    </Router>
    </AuthProvider>
    
  );
}

export default App;
