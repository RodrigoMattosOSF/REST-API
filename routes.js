'use strict';

const express = require('express');
const Course  = require("./models").Course;
const User    = require("./models").User;

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

class Routes {
    constructor() {
        this.commonRouter = express.Router();
        this.openRouter   = express.Router();
        this.prefix       = 'api';
    }

    open() {
        const that = this;

        this.commonRouter.post('/' + that.prefix + '/users', function(req, res) {
            let user = new User(req.body);
            user.save(function(err, user){
                if(err) return next(err);
                res.header('Location', '/' + that.prefix + '/users/' + user.id)
                res.status(201);
                res.json();
            });
        });

        return this.openRouter;
    }

    common() {
        const that = this;

        this.commonRouter.param("cId", function(req,res,next,id){
            Course.findOne({
                _id  : id,
                user : {
                    _id : req.user._id
                }
            }, function(err, course){
                if(err) return next(err);
                if(!course) {
                    err = new Error("Not Found");
                    err.status = 403;
                    return next(err);
                }
                req.course = course;
                return next();
            });
        });

        this.commonRouter.get('/' + that.prefix + '/users', function(req, res) {
            res.status(200);
            res.json(req.user);
        });

        this.commonRouter.get('/' + that.prefix + '/courses', function(req, res, next) {
            Course.find().populate('user', ['firstName', 'lastName']).exec(
                (err, result) => {
                    if (err) return next(err);
                    
                    if (!result)
                        return next();

                    res.status(200);
                    res.json(result);
                }
            );            
        });

        this.commonRouter.get('/' + that.prefix + '/courses/:id', function(req, res, next) {
            const { id }   = req.params;
            const courseID = (id.match(/^[a-zA-Z0-9]*$/g) || []).join('');

            Course.findById(courseID).populate('user', ['firstName', 'lastName']).exec(
                (err, result) => {
                    if (err) return next(err);
                    
                    if (!result)
                        return next();

                    res.status(200);
                    res.json(result);
                }
            );            
        });
        
        this.commonRouter.post('/' + that.prefix + '/courses', function(req, res, next) {
            let data   = {
                ...req.body,
                user : req.user._id
            };

            let course = new Course(data);

            course.save(function(err, course){
                if(err) return next(err);
                res.header('Location', '/' + that.prefix + '/courses/' + course.id)
                res.status(201);
                res.json();
            });
        });

        this.commonRouter.put('/' + that.prefix + '/courses/:cId', function(req, res) {
            req.course.updateOne(req.body, (err, course) => {
                if(err) return next(err);
                
                res.status(204);
                res.json();
            });
        });

        this.commonRouter.delete('/' + that.prefix + '/courses/:cId', function(req, res) {
            req.course.remove((err, course) => {
                if(err) return next(err);
                
                res.status(204);
                res.json();
            });
        });

        return this.commonRouter;
    }

    handleError(err, req, res, next) {
        if (enableGlobalErrorLogging) {
            console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
          }
        
          res.status(err.status || 500).json({
            message: err.message,
            error: {},
          });
    }

    notFound(req, res, next) {
        res.status(404).json({
            message: 'Route Not Found',
        });
    }
}

module.exports = new Routes();