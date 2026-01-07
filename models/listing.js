const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review =  require("./reviews.js");
const { ref } = require("joi");

const listingSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    description: String,
    image:{
        url:String,
        filename:String, 
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner : {
        type: Schema.Types.ObjectId,
        ref :"User",
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    category:{
        type: String,
        enum:["Rooms","Cities","Mountains","Castles","Pools","Camping","Farms","Arctic","Domes","Boats"],
        default : "Cities",
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;