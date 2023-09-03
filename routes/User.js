const express=require("express");
const router=express.Router();

const{sendOTP,signUp,login,changePassword}=require("../controllers/Auth")
const{resetPassword,resetPasswordToken}=require("../controllers/ResetPassword")

const {auth} = require("../middleware/auth");

router.post("/sendotp",sendOTP);

router.post("/signup",signUp);
router.post("/login",login)
router.post("/changepassword",auth,changePassword)
router.post("/resettoken",resetPasswordToken)
router.post("/resetpassword",resetPassword)

module.exports=router;