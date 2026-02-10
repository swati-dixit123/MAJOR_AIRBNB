const express=require('express');
const router= express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema}  =require("../schema.js");
const Listing = require("../models/listing");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listings.js");
//const { index } = require('../controllers/listings.js');

const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage});


router
.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.createListing));

  //new route
router.get("/new", isLoggedIn,listingController.renderNewForm);

// 🔍 SEARCH ROUTE (ADD HERE)
router.get("/search", wrapAsync(listingController.searchListings));

// 📌 MY LISTINGS (author only)
router.get("/mine", isLoggedIn, wrapAsync(listingController.myListings));


// Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing));


router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOwner,
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing));

module.exports=router;