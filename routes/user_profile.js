var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
var jwtM = require('express-jwt');
var nFunctions = require('../auxiliar');

module.exports = function(wagner, config, messages) {
    
    var userProfileRouter = express.Router();

    userProfileRouter.use(bodyparser.json());
    userProfileRouter.use(bodyparser.urlencoded({ extended: false }));
    
    userProfileRouter.route('/')
    
    
    ////
    // Create User Profile
    ////
    .post(jwtM({secret: config.jwtPassword}), function(req, res, next) {
        
           return wagner.invoke(function(User) {

                var bodyReq = req.body;     

                if(!bodyReq || !_.has(bodyReq,'userId')) {
                  return res.status(400).send({ msg: messages.bad_request_msg });
                } else {

                    return wagner.invoke(function(UserProfile) {
                            return UserProfile.create(bodyReq, function(err,data) {
                                if(err) {
                                    return res.status(500).json({ msg: 'Internal Server Error' });
                                } else {
                                    return res.status(201).json(data);
                                }                
                            });
                        });    
                }
              });
    })

    userProfileRouter.route('/:userId')    
    
    .get(jwtM({secret: config.jwtPassword}), wagner.invoke(function(UserProfile) {
        
        return function(req,res) {
            
                
                return UserProfile.findOne({userId: req.params.userId}).
                    populate('skills').
                    populate('avatar').
                    exec(function(err,data) {
                        if(err) {
                            return res.status(500).json({ msg: 'Internal Server Error' });
                        } else {
                            return res.status(200).json(data!=null ? data : {});
                        }                
                    });

                
        };

    }));
    
    return userProfileRouter;
    
}

