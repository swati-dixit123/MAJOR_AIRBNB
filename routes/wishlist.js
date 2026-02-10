const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// ADD / REMOVE wishlist
router.post("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  const index = user.wishlist.indexOf(id);

  if (index === -1) 
  {
    user.wishlist.push(id); // add
  } 
  else 
  {
    user.wishlist.splice(index, 1); // remove
  }

  await user.save();
  res.redirect(req.get("Referrer") || "/listings");

});

// VIEW wishlist
router.get("/", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("wishlist/index", { wishlist: user.wishlist });
});

module.exports = router;
