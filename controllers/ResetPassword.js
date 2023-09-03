const User=require("../models/User")
const mailSender=require("../utils/mailSender")
const bcrypt=require("bcrypt")
const crypto=require("crypto")

exports.resetPasswordToken=async(req,res)=>{
    try{
  
        const email=req.body.email
        const user=await User.findOne({email:email})
        if(!user){
            return res.status().json({
                success:false,
                message:"your email is not registered with us"
            })
        }
        const token=crypto.randomBytes(20).toString("hex");

        // update user with token and expires times

        const updatedDetails=await User.findOneAndUpdate({email:email},
            {token:token,
               resetPasswordExpires:Date.now()+5*60*100},
                {new:true})


            const url=`http://localhost:3000/update-password/${token}`

            //send the mail 

            await mailSender(email,"password resetlink",`password reset ${url}`)

            return res.json({
                success:true,
                message:"email sent successfully check your email",
                updatedDetails

            })

    }
    catch(error){
       console.log("error during reset password token ",error)
       res.status(500).json({
        success:false,
        message:"password token  not be reset",
        error:error.message
       })
    }
}

exports.resetPassword=async(req,res)=>{
    
    try{
        const{password,confirmPassword,token}=req.body

        if(password!==confirmPassword){
             return res.json({
                success:false,
                message:"password is not matched"
             })
        }
        // get user details from db using token

        const userDetails=await User.findOne({token:token})
        // if not entry invaid token

        if(!userDetails){
            return res.json({
                success:false,
                message:"token is invalid"
            })
        }
        // token time check for url
     //   if(userDetails.resetPasswordExpires<Date.now()){
       //     return res.json({
         //       success:false,
           //     message:"time is exipres for url"
       //     })
       // }
        /// hasehd the new password
        const hashedPassword= await  bcrypt.hash(password,10)
        // update passord in db 

        await   User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
            )

            return res.status(200).json({
                success:true,
                message:"password reset successfull"
            })

    }
    catch(error){
        console.log("error during reset password ",error)
        res.status(500).json({
         success:false,
         message:"password not be reset"
        })

    }
}