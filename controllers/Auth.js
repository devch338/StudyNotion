const User=require("../models/User")
const otpGenerator=require("otp-generator")
const Profile=require("../models/Profile")

const OTP=require("../models/Newotp")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
require("dotenv").config()

const mailSender=require("../utils/mailSender")
const {passwordUpdated}=require("../mail/passwordUpdate")




//otp send
exports.sendOTP=async(req,res)=>{

    try{

        const{email}=req.body

        // check if user already is existed 

        const checkUserPresent=await User.findOne({email})

        // if existed 

        if(checkUserPresent){
            return res.status(401).json({
                seccess:false,
                message:"user already existed"
            })
        }

        // generate OTP
        var otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });
         console.log("otp is generated",otp)

         // check unique otp or not 

         const result= await OTP.findOne({otp:otp})

          console.log("Result is Generate OTP Func");
	      console.log("OTP", otp);
		  console.log("Result", result);

         while(result){
             otp=otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });

               /// result= await OTP.findOne({otp:otp})
         }

     

         // result me unique opt aa chuka hai
         const otpPayload={email,otp}
         
         //now entry into databse for otp

         const otpBody=await OTP.create(otpPayload)
         console.log("OTP Body",otpBody)

          res.status(200).json({
            success:true,
            message:"opt sent succesfullt",
            otp
         })

    }
    catch(error){

        console.log(error)
        return res.status(500).json({
            success:false,
            message:"otp doesnot sent catch error"
        })

    }

}

//signup function

exports.signUp=async(req,res)=>{

    try{
 //data fetch from req body
 const{firstName,
    lastName,
    email,
    password,
    confirmPassword,
    accountType,
    conatactNumber,
    otp}=req.body

// validate karo 
if(!firstName||!lastName||!email||!password||!confirmPassword||!otp){
    return res.status(400).json({
        success:false,
        message:"all files re required"
    })
}

// 2 password match same or not
if(password!==confirmPassword){
    return res.status(400).json({
        success:flase,
        message:"both password doesnot match try again"
    })
}

//check user already existed or not 

const existedUser=await User.findOne({email})
if(existedUser){
    return res.status(400).json({
        success:false,
        message:"user alreday existed"
    })
}

// find most recent otp
const recentOtp=await OTP.find({email})//.sort({createdAt:-1}).limit(1);
console.log("ye raha recent otp",recentOtp)

//validate otp

if(recentOtp.length===0){
    //otp not found
    return res.status(400).json({
        success:false,
        message:"otp is not found"
    })
}
else if(otp!==recentOtp[0].otp){
    return res.status(400).json({
        success:false,
        message:"otp is invalid"
    })

}
console.log("otp validate hogaya hai")

//hash password
const hashedPassword=await bcrypt.hash(password,10)

console.log("hashed password ---->>",hashedPassword)

//entry in db

const profiledetails= await Profile.create({
    gender:null,
    dateOfBirth:null,
    about:null,
    contactNumber:null
})

const user=await User.create({
    firstName,
    lastName,
    password:hashedPassword,
    email,
    conatactNumber,
    accountType,
    additionalDetails:profiledetails._id,
    image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
})
console.log("uset ki details___>>>",user)

   return res.status(200).json({
    success:true,
    message:"user created successfully",
    user
   })
    }

    catch(error){

        console.log(error)
        return res.status(500).json({
            success:false,
            message:"user cant register please try again"
        })

    }

}

exports.login=async(req,res)=>{
    try{
        
        const{email,password}=req.body

        if(!email||!password){
            return res.status(400).json({
                success:false,
                message:"please fill all the details carefully"
              
            })
        }

        const user=await User.findOne({email}).populate("additionalDetails")

        if(!user){
            return res.status(401).json({
                success:false,
                message:"user not found plese create your account first"
            })
        }
   
        //generate jwt token and matched the password
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token= jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            });
            //req.user=payload
            user.token=token
            user.password=undefined
           
        
        // create cookie
         const options={ 
            expires:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true
        }
        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:"login and cokkie created successfully"
        })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"password doesnot match"
            })
        }

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"login failure please try again"
        })
    } 
}

//change password 
exports.changePassword=async(req,res)=>{

    console.log("ye hai use rid ",req.user.id)
    try{

        const userId=req.user.id
        console.log("ye hai userId--[>>",userId)

        const{oldpassword,newpassword}=req.body

        const userDetails=await User.findById(userId)

        const oldpassmatchdb=await bcrypt.compare(oldpassword,userDetails.password)

        if(!oldpassmatchdb){
            return res.status(400).json({
                success:false,
                message:"old password is not true"
            })
        }
        const encrptedpasswors= await bcrypt.hash(newpassword,10)

        const updatedUserDetails=await User.findByIdAndUpdate({_id:userId},{password:encrptedpasswors},{new:true});

        /// send the email for updation of password 

       
   try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        // console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
      

      return res.status(200).json({
        success:true,
        message:"your password is updated"
      })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"error in updating the password",
            error:error.message
        })

    }
}


