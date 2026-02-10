const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-Local-mongoose");

const userSchema=new Schema({
    email:
    {
        type:String,
        required:true
    },
    wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing"
    }
  ]

});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);

//passport-local-mongoose will add username and password