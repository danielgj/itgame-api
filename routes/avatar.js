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
    
    var avatarRouter = express.Router();

    avatarRouter.use(bodyparser.json());
    avatarRouter.use(bodyparser.urlencoded({ extended: false }));
    
    avatarRouter.route('/')
    
    
    ////
    // Create Avatar
    ////
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
                var avatarFile = req.form.data.image;
                var filesDirPath = '/public/avatars/';

                //Creo directorio si no existe
                try {
                    fs.statSync("." + filesDirPath);
                } catch(e) {
                    fs.mkdirSync("." + filesDirPath);
                }

                    
                fs.rename(avatarFile.filename, "." + filesDirPath + '/' + avatarFile.filename, function(err2,data2) {
                    if(err2) {
                        return res.status(500).send('Se ha producido un error en la subida');
                    } else {
                
                        return wagner.invoke(function(Avatar) {
                            return Avatar.create({'name': req.form.data.name, 'image': avatarFile.filename}, function(err,data) {
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
    // Get Avatars
    ////
    .get(jwtM({secret: config.jwtPassword}),function(req, res) {
        
        return wagner.invoke(function(Avatar) {
            Avatar.
            find().
            exec(nFunctions.handleOne.bind(null, 'avatars', res));                
                        
        });                        
    });
    
    avatarRouter.route('/:id')    
    
    .delete(jwtM({secret: config.jwtPassword}), wagner.invoke(function(Avatar) {
        
        return function(req,res) {
            
            var userR = req.user.role;
            if (userR!='admin') {
                return res.status(401).send(messages.unauthorized_error);
            } else {
                
                return Avatar.remove({_id: req.params.id}, function(err,data) {
                    if(err) {
                        return res.status(500).json({ msg: 'Internal Server Error' });
                    } else {
                        return res.status(201).json(data);
                    }                
                });

            }

        };

    }));
    
    return avatarRouter;
    
}

