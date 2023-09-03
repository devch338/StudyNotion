const Profile=require("../models/Profile")
const User=require("../models/User")

exports.updateProfile=async(req,res)=>{
    console.log("hello")
    try{

        // data fetch from body
        const{dateOfBirth="",about="",contactNumber,gender}=req.body
        console.log(req)
        // user id 
        console.log("hello mitr")
        const{id}=req.user
        console.log("ye hai id---->>>",id)

        if(!contactNumber||!id||!gender){
            return res.status(400).json({
                success:false,
                message:"all fields are neccasry"
            })

        }
        // for extract profile id we to find from user schema 
        const userDeatails=await User.findById(id)

          // fetch profile id from it 
        const profileId=userDeatails.additionalDetails

        // get the deatils from it 
        const profiledetails=await Profile.findById(profileId)

        // update one by one
        profiledetails.dateOfBirth=dateOfBirth,
        profiledetails.gender=gender,
        profiledetails.about=about,
        profiledetails.contactNumber=contactNumber

        await profiledetails.save();

        return res.status(200).json({
            success:true,
            message:"profile updated succesfully",
            profiledetails
        })
    }
    catch(error){

        return res.status(500).json({
            success:false,
            message:"profile updation failed error",
            
        })
    }
}

//delete account 

exports.deleteAccount=async(req,res)=>{
    try{ 
   
         const id=req.user.id
         const userDeatils=await User.findById(id)
         if(!userDeatils){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
         }
         // delete profile
         await Profile.findByIdAndDelete({_id:userDeatils.additionalDetails})
         // delete the user from db
         await User.findByIdAndDelete({_id:id})
         // TODO how to delete from enrolled course 

         return res.status(200).json({
            success:true,
            messsage:"user deleted succesfully"
         })
        
        }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"profile deletion failed error",
            
        })
    }
}

// get user deatails

exports.getUserDeatils=async(req,res)=>{
    
    try{
        const id=req.user.id

        const userDetails=await User.findById(id).populate("additionalDetails").exec();
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User not found",
              });
        }

        return res.status(200).json({
            success:true,
            message:"user data fetched succssfully",
            userDetails
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"get user failed error",
            
        })
    }
}