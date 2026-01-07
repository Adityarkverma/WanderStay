const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const bookingSchema = new Schema({
    listingId: { 
        type: Schema.Types.ObjectId, 
        ref: "Listing" 
    },
    userId: { 
        type: Schema.Types.ObjectId,
         ref: "User" 
    },
    checkIn: Date,
    checkOut: Date,
    guests: Number,
    totalPrice: Number,
});

module.exports = mongoose.model("Booking", bookingSchema);
