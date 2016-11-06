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
    
    var userProfileRouter = express.Router();

    userProfileRouter.use(bodyparser.json());
    userProfileRouter.use(bodyparser.urlencoded({ extended: false }));
    
    userProfileRouter.route('/')
    
    
    ////
    // Create User Profile
    ////
    .post(jwtM({secret: config.jwtPassword}), 
        busboy({
           limits: {
             fields: 10, // max 10 non-multipart fields
             parts: 10, // max 10 multipart fields
             fileSize: 8 * 1000 * 1000 // files can be at most 8MB each
           }
        }),
        form({
           userId: {
             required: true
           },
           skills: {
             required: true
           },
           bio: {
             required: true
           },
           jiraUser: {
             required: true
           },
           gitlabUser: {
             required: true
           },
           jenkinsUser: {
             required: true
           },
           avatarImage: {
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
             console.log(req.form.error);
             return res.status(400).send('Se ha producido un error en la subida');
           }
        
            
            var bodyReq = req.body;
            var userR = req.user;
            if (!userR || userR.role!='player') {
                return res.status(401).send(messages.unauthorized_error);
            } else {

                
                //Move image to avatars folder
                var avatarFile = req.form.data.avatarImage;
                
                var filesDirPath = '/public/avatars/';
                var destName = req.form.data.userId + ".png";

                //Creo directorio si no existe
                try {
                    fs.statSync("." + filesDirPath);
                } catch(e) {
                    fs.mkdirSync("." + filesDirPath);
                }

                    
                fs.rename(avatarFile.filename, "." + filesDirPath + '/' + destName, function(err2,data2) {
                    if(err2) {
                        return res.status(500).send('Se ha producido un error en la subida');
                    } else {
                
                        var profileToCreate = {
                              "userId": req.form.data.userId,
                              "bio": req.form.data.bio,
                              "jiraUser": req.form.data.jiraUser,
                              "gitlabUser": req.form.data.gitlabUser,
                              "avatar": destName,
                              "points": 50, //50 puntos sólo por registrarte
                              "skills": req.form.data.skills.split(",")
                        }
                        
                        return wagner.invoke(function(UserProfile) {
                            return UserProfile.create(profileToCreate, function(err,data) {
                                if(err) {
                                    console.log(err);
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
    
    /*
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
    */
    
    ////
    // Get All Player User Profiles
    .get(jwtM({secret: config.jwtPassword}), function(req, res, next) {
        
        return wagner.invoke(function(UserProfile) {
            return UserProfile.find({}, function(err,data) {
                if(err) {
                    return res.status(500).json({ msg: 'Internal Server Error' });
                } else {
                    var parsedProfiles = [];
                    var total = data.length;
                    data.forEach(function(profile) {
                        var points = profile.points;
                        total -=1;
                        wagner.invoke(function(Level) {
                            Level.findOne({ "begin": { $lte: points}, "end": { $gte: points}}).
                            exec(function(err2,data2) {                                
                                var parsedProfile = {
                                    _id: profile._id,
                                    userId: profile.userId,
                                    bio: profile.bio,
                                    jiraUser: profile.jiraUser,
                                    gitlabUser: profile.gitlabUser,
                                    avatar: profile.avatar,
                                    points: profile.points,
                                    skills: profile.skills,
                                    level: data2,
                                    createdAt: profile.createdAt,
                                    updatedAt: profile.updatedAt
                                }
                                parsedProfiles.push(parsedProfile);
                                if(total==0) {
                                    return res.status(200).json(parsedProfiles);   
                                }
                            });                        
                        });
                    });                    
                }                
            });
        });    
        
    })

    userProfileRouter.route('/:userId')    
    
    //
    // Get profile by its User ID
    //
    .get(jwtM({secret: config.jwtPassword}), wagner.invoke(function(UserProfile) {
        
        return function(req,res) {
            
                
                return UserProfile.findOne({userId: req.params.userId}).
                    populate('skills').
                    exec(function(err,data) {
                        if(err) {
                            return res.status(500).json({ msg: 'Internal Server Error' });
                        } else {
                            
                            if(data!=null) {
                                
                                var points = data.points;
                                wagner.invoke(function(Level) {
                                    Level.findOne({ "begin": { $lte: points}, "end": { $gte: points}}).
                                    exec(function(err2,data2) {                                
                                        var parsedProfile = {
                                            _id: data._id,
                                            userId: data.userId,
                                            bio: data.bio,
                                            jiraUser: data.jiraUser,
                                            gitlabUser: data.gitlabUser,
                                            avatar: data.avatar,
                                            points: data.points,
                                            skills: data.skills,
                                            level: data2,
                                            completion: Math.floor(data.points*100/data2.end),
                                            createdAt: data.createdAt,
                                            updatedAt: data.updatedAt
                                        }

                                        return res.status(200).json(parsedProfile);   

                                    });                        
                                });
                            } else {                            
                                return res.status(200).json({});
                            }
                        }                
                    });

                
        };

    }))
    

    
    //
    // Update profile by its User ID
    //
    .put(jwtM({secret: config.jwtPassword}), wagner.invoke(function(UserProfile) {
        
        return function(req,res) {            
                
            return UserProfile.update({userId: req.params.userId}, req.body, {}, function(err,data) {
              if(err) {
                    return res.status(500).json({ msg: 'Internal Server Error' });
              } else {
                    
                  //read updated object
                   return UserProfile.findOne({userId: req.params.userId}).
                    populate('skills').
                    exec(function(err,data) {
                        if(err) {
                            return res.status(500).json({ msg: 'Internal Server Error' });
                        } else {
                            
                            if(data!=null) {
                                
                                var points = data.points;
                                wagner.invoke(function(Level) {
                                    Level.findOne({ "begin": { $lte: points}, "end": { $gte: points}}).
                                    exec(function(err2,data2) {                                
                                        var parsedProfile = {
                                            _id: data._id,
                                            userId: data.userId,
                                            bio: data.bio,
                                            jiraUser: data.jiraUser,
                                            gitlabUser: data.gitlabUser,
                                            avatar: data.avatar,
                                            points: data.points,
                                            skills: data.skills,
                                            level: data2,
                                            completion: Math.floor(data.points*100/data2.end),
                                            createdAt: data.createdAt,
                                            updatedAt: data.updatedAt
                                        }

                                        return res.status(201).json(parsedProfile);   

                                    });                        
                                });
                            } else {                            
                                return res.status(404).json({});
                            }
                        }                
                    });
                  
              }                
            });
            
        };

    }));
    
    
    return userProfileRouter;
    
}

