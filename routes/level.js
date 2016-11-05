var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
var jwtM = require('express-jwt');
var nFunctions = require('../auxiliar');

module.exports = function(wagner, config, messages) {
    
    var levelRouter = express.Router();

    levelRouter.use(bodyparser.json());
    levelRouter.use(bodyparser.urlencoded({ extended: false }));
    
    levelRouter.route('/')
    
    
    
    .post(jwtM({secret: config.jwtPassword}),function(req,res) {
        
        var userR = req.user.role;
            if (userR!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {

              return wagner.invoke(function(Level) {

                var bodyReq = req.body;     

                if(!bodyReq || !_.has(bodyReq,'name') || !_.has(bodyReq,'begin') || !_.has(bodyReq,'end')) {
                  return res.status(400).send({ msg: messages.bad_request_msg });
                } else {

                    return wagner.invoke(function(Level) {
                            return Level.create({'name': bodyReq.name, 'begin': bodyReq.begin, 'end': bodyReq.end}, function(err,data) {
                                if(err) {
                                    return res.status(500).json({ msg: 'Internal Server Error' });
                                } else {
                                    return res.status(201).json(data);
                                }                
                            });
                        });    
                }
              });
                
            }
    })

    ////
    // Get Skills
    ////
    .get(jwtM({secret: config.jwtPassword}),function(req, res) {
        
        return wagner.invoke(function(Level) {
            Level.
            find().
            exec(nFunctions.handleOne.bind(null, 'levels', res));                
                        
        });                        
    });
    
    levelRouter.route('/:id')    
    
    .put(jwtM({secret: config.jwtPassword}), wagner.invoke(function(Level) {
        
        return function(req,res) {
            
            var userR = req.user.role;
            if (userR!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {
                
                return Level.update({_id: req.params.id}, req.body, {}, function(err,data) {
                    if(err) {
                        return res.status(500).json({ msg: 'Internal Server Error' });
                    } else {
                        return res.status(201).json(data);
                    }                
                });

            }

        };

    }))
    
    .delete(jwtM({secret: config.jwtPassword}), wagner.invoke(function(Level) {
        
        return function(req,res) {
            
            var userR = req.user.role;
            if (userR!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {
                
                return Level.remove({_id: req.params.id}, function(err,data) {
                    if(err) {
                        return res.status(500).json({ msg: 'Internal Server Error' });
                    } else {
                        return res.status(201).json(data);
                    }                
                });

            }

        };

    }));
    
    return levelRouter;
    
}

