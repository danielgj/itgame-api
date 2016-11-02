var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');

module.exports = function(wagner, config, messages) {
    
    var mdRouter = express.Router();

    mdRouter.use(bodyparser.json());
    mdRouter.use(bodyparser.urlencoded({ extended: false }));
    
    
    mdRouter.get('/', function(req, res, next) {        
      res.render('index', { title: 'My IT Team Game REST API' });
    });
    
    return mdRouter;
    
}