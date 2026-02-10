const Listing=require("../models/listing");
const User = require("../models/user");
const axios = require('axios');

module.exports.index = async(req, res) =>  {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

module.exports.renderNewForm=(req, res) => 
{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  let currUserWithWishlist = null;

  if (req.user) {
    currUserWithWishlist = await User.findById(req.user._id);
  }

  res.render("listings/show.ejs", {
    listing,
    currUser: currUserWithWishlist
  });
};
  module.exports.createListing=async (req, res) => {
      let url=req.file.path;
      let filename=req.file.filename;
      console.log(url,"...",filename);
      const newListing = new Listing(req.body.listing);
      console.log(req.user);
      newListing.owner = req.user._id;
      newListing.image={url,filename};
      await newListing.save();
      req.flash("success","New Listing Created!") //key value pair
      res.redirect("/listings");
    };

module.exports.editListing=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) 
    {
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
        //throw new ExpressError(404, "Listing not found");
    }
    let originalUrl=listing.image.url;
    originalUrl=originalUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing ,originalUrl});
  };

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  // 🟢 1. Update all normal text fields (price, title, etc.)
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
  
  if(typeof req.file!=="undefined")

  {
  let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save();
  }

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    req.flash("error", "Please enter something to search");
    return res.redirect("/listings");
  }

  const listings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } }
    ]
  });

  if (listings.length === 0) {
    req.flash("error", "No listings found");
    return res.redirect("/listings");
  }

  res.render("listings/index", {allListings: listings });
};

module.exports.myListings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });

  if (listings.length === 0) {
    req.flash("error", "You have not added any listings yet");
    return res.redirect("/listings");
  }

  res.render("listings/index", { allListings: listings });
};



module.exports.destroyListing = async(req, res) => 
 {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted:", deletedListing);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
 };

