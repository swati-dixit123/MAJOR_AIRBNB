const express=require('express');
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReviews, isLoggedIn, isReviewOwner}=require("../middleware.js");

const ReviewController=require("../controllers/reviews.js");


//reviews
//post route

router.post("/", 
  isLoggedIn,
  validateReviews,
  wrapAsync(ReviewController.createReview));

//delete review route

router.delete("/:reviewId", 
  isLoggedIn,
  isReviewOwner,
  wrapAsync(ReviewController.destroyReview));

module.exports=router;