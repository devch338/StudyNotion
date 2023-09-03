const express=require("express");
const router=express.Router();

const{createCategory,showAllCategory}=require("../controllers/Category")
const{createCourse,getFullCourseDetails}=require("../controllers/Course")

const{auth,isAdmin,isInstructor,isStudent}=require("../middleware/auth")
const {createSection, updateSection}=require("../controllers/Section")
const{ createSubsection }=require("../controllers/Subsection")
const{ createRating }=require("../controllers/RatingAndReview")

router.post("/category",auth,isAdmin,createCategory)
router.get("/getallcategory",auth,isAdmin,showAllCategory)

router.post("/createcourse",auth ,isInstructor ,createCourse)
router.post("/createsection",auth,isInstructor,createSection)
router.post("/updatesection",auth,isInstructor,updateSection)
router.post("/getfullcourse",auth,getFullCourseDetails)

router.post("/createsubsection",auth,isInstructor,createSubsection)
router.post("/createrating",auth,isStudent,createRating)


module.exports=router