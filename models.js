'use strict';

const mongoose = require("mongoose");
const bcrypt   = require('bcryptjs');

mongoose.set('useCreateIndex', true);

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName    : String,
    lastName     : String,
    emailAddress : {
        type      : String,
        unique    : true,
        validator : value => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value),
        required  : [true, 'User email must be provided']
    },
    password     : {
        type     : String,
        required : [true, 'User password must be provided']
    }
});

UserSchema.pre("save", function(next){
	this.password = bcrypt.hashSync(this.password, 10);
	next();
});

var User = mongoose.model("User", UserSchema);

var CourseSchema = new Schema({
    user            : {
        type     : mongoose.Schema.Types.ObjectId,
        ref      : User,
        required : [true, 'Course user must be provided']
    },
    title           : { 
        type     : String,
        required : [true, 'Course title must be provided'],
        validate : [value => value.length > 3, 'Invalid course title']
    },
    description     : { 
        type     : String,
        required : [true, 'Course description must be provided'],
        validate : [value => value.length > 3, 'Invalid course description']
    },
    estimatedTime   : String,    
    materialsNeeded : String,
});

var Course = mongoose.model("Course", CourseSchema);

module.exports.User = User;
module.exports.Course = Course;