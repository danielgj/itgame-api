var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');
var _ = require('underscore');

module.exports = function(wagner, config, messages) {
    
    var jiraWHRouter = express.Router();

    jiraWHRouter.use(bodyparser.json());
    jiraWHRouter.use(bodyparser.urlencoded({ extended: false }));
    
    jiraWHRouter.route('/')
    
    .post(function(req,res) {
        
        console.log(req.body);
        
        return res.status(200).json(req.body);
        
    });
    
    return jiraWHRouter;
    
}