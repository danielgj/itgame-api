module.exports = function() {

    var config = {};
    
    config.base_api_url = '/api/v1';
    config.jwtPassword = 'your_jwt_password';
    config.jwtTokenExpiresIn = 60*8;
    config.jwtrefreshExpiresIn = 120;
    config.db_url = 'your_mongodb_url';
    
    return config;
    
}