var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
var jwtM = require('express-jwt');
var busboy = require('connect-busboy');
var form = require('reformed');
var fs = require('fs');
var nFunctions = require('../auxiliar');

module.exports = function(wagner, config, messages) {
    
    var skillRouter = express.Router();

    skillRouter.use(bodyparser.json());
    skillRouter.use(bodyparser.urlencoded({ extended: false }));
    
    skillRouter.route('/')
    
    
    ////
    // Create Skill
    ////
    /*
    .post(jwtM({secret: config.jwtPassword}), 
        busboy({
           limits: {
             fields: 3, // max 10 non-multipart fields
             parts: 1, // max 10 multipart fields
             fileSize: 8 * 1000 * 1000 // files can be at most 8MB each
           }
        }),
        form({
           name: {
             required: true
           },
           description: {
             required: true
           },
           image: {
             filename: true, // use temporary file
             required: true,
             maxSize: {
               size: 1 * 1024 * 1024, // 1MB
               error: 'Big image file size too large (must be 1MB or less)'
             }
           }
        }),
        function(err, req, res, next) {
           if (!err || (err && err.key))
             next(); // no error or validation-related error
           else
             next(err); // parser or other critical error
        },
        function(req, res, next) {
        
           if (req.form.error) {
             return res.status(400).send('Se ha producido un error en la subida');
           }
        
            var bodyReq = req.body;
            var userR = req.user;
            if (!userR || userR.role!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {

                //Move image to avatars folder
                var imageFile = req.form.data.image;
                var filesDirPath = '/public/skills/';

                //Creo directorio si no existe
                try {
                    fs.statSync("." + filesDirPath);
                } catch(e) {
                    fs.mkdirSync("." + filesDirPath);
                }

                    
                fs.rename(imageFile.filename, "." + filesDirPath + '/' + imageFile.filename, function(err2,data2) {
                    if(err2) {
                        return res.status(500).send('Se ha producido un error en la subida');
                    } else {
                
                        return wagner.invoke(function(Skill) {
                            return Skill.create({'name': req.form.data.name, 'description': req.form.data.description, 'image': avatarFile.filename}, function(err,data) {
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
    */
    .post(jwtM({secret: config.jwtPassword}),function(req,res) {
        
        var userR = req.user.role;
            if (userR!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {

              
                var bodyReq = req.body;     

                if(!bodyReq || !_.has(bodyReq,'name') || !_.has(bodyReq,'description')) {
                  return res.status(400).send({ msg: messages.bad_request_msg });
                } else {

                    return wagner.invoke(function(Skill) {
                            return Skill.create({'name': bodyReq.name, 'description': bodyReq.description}, function(err,data) {
                                if(err) {
                                    return res.status(500).json({ msg: 'Internal Server Error' });
                                } else {
                                    return res.status(201).json(data);
                                }                
                            });
                        });    
                }
              
                
            }
    })

    ////
    // Get Skills
    ////
    .get(jwtM({secret: config.jwtPassword}),function(req, res) {
        
        return wagner.invoke(function(Skill) {
            Skill.
            find().
            exec(nFunctions.handleOne.bind(null, 'skills', res));                
                        
        });                        
    });
    
    skillRouter.route('/:id')    
    
    .put(jwtM({secret: config.jwtPassword}), wagner.invoke(function(Skill) {
        
        return function(req,res) {
            
            var userR = req.user.role;
            if (userR!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {
                
                return Skill.update({_id: req.params.id}, req.body, {}, function(err,data) {
                    if(err) {
                        return res.status(500).json({ msg: 'Internal Server Error' });
                    } else {
                        return res.status(201).json(data);
                    }                
                });

            }

        };

    }))
    
    .delete(jwtM({secret: config.jwtPassword}), wagner.invoke(function(Skill) {
        
        return function(req,res) {
            
            var userR = req.user.role;
            if (userR!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {
                
                return Skill.remove({_id: req.params.id}, function(err,data) {
                    if(err) {
                        return res.status(500).json({ msg: 'Internal Server Error' });
                    } else {
                        return res.status(201).json(data);
                    }                
                });

            }

        };

    }));
    
    return skillRouter;
    
}

