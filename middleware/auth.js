const jwt=require("jsonwebtoken")
const User=require("../models/User")
require("dotenv").config()

exports.auth=async(req,res,next)=>{
    try{
        // extract token
        const token=req.cookies.token||req.body.token||req.header("Authorisation").replace("Bearer","")
        // if token missing then
       /// const {token}=req.body
        if(!token){
            return res.stauts(401).json({
                success:flase,
                message:"token is missing"
            })
        }

        //verify the token
        try{
            const decode= jwt.verify(token,process.env.JWT_SECRET)
            console.log(decode)
            req.user=decode
        }
        catch(error){
            return res.status(401).json({
                success:false,
                message:"token is invalid"
            })
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"something wrong in token"
        })
    }
}

//Is student
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student"
            })
        }
        next();

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User  role cannot be verified please try again"
        })
    }
}

exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for admin"
            })
        }
        next();

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User  role cannot be verified please try again"
        })
    }
}
exports.isInstructor = async (req,res,next) => {
    try {

        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor"
            })
        }

        next();
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be varified, please try again"
        })
    }
}