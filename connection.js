'use strict';

const mongoose = require('mongoose');

function exec() {
    mongoose.connect("mongodb://localhost:27017/fsjstd-restapi");
    var db = mongoose.connection;

    db.on("error", function(err){
        console.error("connection error:", err);
    });
    
    db.once("open", function(){
        console.log("db connection successful");        
    });
    
}

module.exports.exec = exec;