const Listing=require("../models/listing");
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

    if (!listing) 
    {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs",{listing});

    // // Default coordinates (Delhi) in case geocoding fails
    // let coords = { lat: 28.6139, lng: 77.2090 };

    // try{
    //     // Use both location and country for better accuracy
    //     const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', 
    //         {
    //         params: 
    //         {
    //             address: `${listing.location}, ${listing.country}`,
    //             key: process.env.GOOGLE_API_KEY
    //         }
    //     });

    //     if (geoRes.data.results.length > 0) 
    //     {
    //         coords = geoRes.data.results[0].geometry.location;
    //     } 
    //     else 
    //     {
    //         console.warn("Geocoding returned no results for:", listing.location, listing.country);
    //     }
    // } 
    // catch (err) 
    // {
    //     console.error("Geocoding failed:", err);
    // }

    // // Render EJS with listing, Google API key, and coordinates
    // res.render("listings/show.ejs", 
    // { 
    //     listing, 
    //     googleKey: process.env.GOOGLE_API_KEY,
    //     coords
    // });
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

module.exports.destroyListing = async(req, res) => 
 {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted:", deletedListing);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
 };