const express=require("express")
const router=express.Router();

const{updateProfile,getUserDeatils,deleteAccount}=require("../controllers/Profile")
const{auth}=require("../middleware/auth")

router.post("/test",auth)
router.put("/updateprofile",auth,updateProfile)
router.get("/getdetails",auth,getUserDeatils)
router.delete("/delete",auth,deleteAccount)
module.exports=router;