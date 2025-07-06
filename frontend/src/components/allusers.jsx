import { db } from "../firebase"
import { collection,getDocs  } from "firebase/firestore"

import { useState, useEffect } from "react"
import { ErrorLog } from "../services/errorlog";


const AllUsers =  () => {


    const [users,setUsers]=useState([]);

    useEffect(()=>{

        const fetchUsers = async ()=>{
        try{
            
            const snapshot = await getDocs(collection(db,"User"));
            const all = snapshot.docs.map((doc)=>({
                id:doc.id,
                ...doc.data()
            }))
            setUsers(all);
        }catch(err){

           await ErrorLog({
                message:err.message,
                location:' allusers.jsx - AllUsers-useEffect',
                stack:err.stack,
            })
            console.log(err);
        }
    }
    fetchUsers();
    },[])

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
  <div className="max-w-7xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
      All Registered Users
    </h1>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition duration-300 p-6 flex flex-col items-start"
        >
          <div className="flex items-center gap-4 mb-4">
            {/* Optional avatar placeholder */}
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {user.name || "Unnamed User"}
              </p>
              <p className="text-sm text-gray-500">{user.email || "No email provided"}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-auto">
            Joined:{" "}
            {user.createdAt?.toDate?.().toLocaleString() || "No info available"}
          </p>
        </div>
      ))}
    </div>
  </div>
</div>

  )
}

export default AllUsers;
