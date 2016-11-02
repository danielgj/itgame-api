module.exports = function() {

    var config = {};
    
    config.base_api_url = '/api/v1';
    config.jwtPassword = 'Unisys01';
    config.jwtTokenExpiresIn = 60*8;
    config.jwtrefreshExpiresIn = 120;
    config.db_url = 'mongodb://dbuser:Unisys01@ds139327.mlab.com:39327/itgame_db';
    
    return config;
    
}