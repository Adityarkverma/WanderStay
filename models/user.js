const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const pLM = require("passport-local-mongoose");

const userSchema = new Schema({
    email : {
        type: String,
        required : true
    },    
});

userSchema.plugin(pLM);

module.exports = mongoose.model("User",userSchema);