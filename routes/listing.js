const express =  require("express");
const router =  express.Router();
const wrapAsync =require("../utlis/wrapasync.js");
const {isLoggedIn,isOwner,validateListing} =  require("../middleware.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const listingController = require("../controllers/listings.js");


router.get("/new",isLoggedIn,listingController.renderNewForm);
router.get("/booking-success/:id",listingController.bookSuccessPage);
router.get("/myBookings", isLoggedIn, wrapAsync(listingController.myBookings));




router.route("/:id/book")
    .get(isLoggedIn,listingController.renderBookForm)
    .post(wrapAsync(listingController.bookListing))
    .delete(isLoggedIn,wrapAsync(listingController.cancelBooking));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

 router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing))
 


router.route("/")
    .get( wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing))

module.exports =  router;