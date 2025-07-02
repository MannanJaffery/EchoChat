import { ErrorLog } from "../services/errorlog";



export const uploadtocloud = async (file)=>{

    
    try{
        const formdata= new FormData();
        formdata.append("file" , file);
        formdata.append("upload_preset" , `${import.meta.env.VITE_CLOUDINARY_PRESET_NAME}`);


        const response = await fetch(
             `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,{
                method:"POST",
                body:formdata
            }
        );
        const data = await response.json();
        if(data.secure_url){
            return data.secure_url;
        }
        else{
            console.log("ERROR GETTING THE IMAGE URL TO CLOUDINARY");
            return null;
        }
    }catch(err){

        await ErrorLog({
                    message:err.message,
                    location:'utils / handleimage.js --- uploadtocloud function',
                    stack:err.stack,
             })
             return null;
    }
}