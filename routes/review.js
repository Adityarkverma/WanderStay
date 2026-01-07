const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync =require("../utlis/wrapasync.js");


const Listing =require("../models/listing");
const Review =require("../models/reviews.js");
const {validateReview ,  isLoggedIn,isReviewAuthor} = require("../middleware.js")

const reviewController = require("../controllers/review.js");


router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

//Reviews -  Delete Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor , wrapAsync(reviewController.destroyReview))

module.exports = router;