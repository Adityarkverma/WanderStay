const Listing = require("../models/listing");
const ExpressError = require("../utlis/ExpressError");
const Booking = require("../models/booking");


module.exports.index = async (req,res)=>{
    let category = req.query.category;
    let country = req.query.country;
    let allListings;
    if(country){
        allListings = await Listing.find({
            country: { $regex: country, $options: "i" }
        });
        if (allListings.length === 0) {
            throw new ExpressError(404,`No Listing found for ${country}!`); 
        }
    }
    else if(category){
        allListings = await Listing.find({category:category});
    }else{
        allListings= await Listing.find({})
    }
    res.render("./listings/index.ejs",{allListings})
};

module.exports.renderNewForm = (req,res)=>{
    res.render("./listings/new.ejs")
};

module.exports.renderBookForm = async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("./listings/book.ejs",{listing});
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate : {path : "author",}}).populate("owner");
    if(!listing){
        req.flash("error","Requested Listing does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});
};

module.exports.createListing = async(req,res)=>{
    let coords =  await forwardGeocode(req.body.listing.location);
    console.log(coords);

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry ={
        type : "Point",
        coordinates: [coords.lng,coords.lat]
    };
    let saved = await newListing.save();
    console.log(saved);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

module.exports.bookListing = async(req,res)=>{
    let listingId = req.params.id;
    const {  checkIn, checkOut, guests } = req.body;
    console.log(listingId);
    if (checkOut <= checkIn) {
        throw new ExpressError(400, "Check-out date must be after check-in date");
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const listing = await Listing.findById(listingId);
    const days = 
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 3600 * 24);
    const totalPrice = listing.price *days;
    const booking = new Booking({
        listingId,
        userId: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice
    });

    const conflict = await Booking.findOne({
        listingId: listingId,
        $or: [
            {
                checkIn: { $lt: checkOutDate },
                checkOut: { $gt: checkInDate }
            }
        ]
    });

    if (conflict) {
        throw new ExpressError(500,`Date Conflict Arises as Bookings are already full for these dates!`);
    }

    await booking.save();

    res.redirect(`/listings/booking-success/${booking._id}`);
}

module.exports.bookSuccessPage = async(req,res)=>{
    let {id} = req.params;
    const booking = await Booking.findById(id).populate("listingId");
    if(!booking){
        req.flash("error","No such Booking!");
    }
    res.render("./listings/bookSuccess.ejs",{booking});
}

module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    
    await Booking.findByIdAndDelete(id);
    const bookings = await Booking.find({ userId: req.user._id }).populate("listingId");;
    req.flash("success", "Booking Cancelled Successfully.");
    res.render("./listings/myBookings.ejs",{bookings});
};


module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ userId: req.user._id })
        .populate("listingId");  // Populate listing details

    res.render("./listings/myBookings.ejs", { bookings });
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let orignalImgUrl = listing.image.url;
    orignalImgUrl = orignalImgUrl.replace("/upload",'/upload/w_250');
    res.render("./listings/edit.ejs",{listing,orignalImgUrl});
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }


    req.flash("success"," Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted!");
    res.redirect("/listings");
}


// Forward geocoding
async function forwardGeocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.length === 0) {
    throw new Error("No results found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}
