var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner, config) {

  mongoose.Promise = global.Promise;
  mongoose.connect(config.db_url);

  var User =
      mongoose.model('User', require('./schemas/user'), 'users');
  var Avatar =
      mongoose.model('Avatar', require('./schemas/avatar'), 'avatars');
  
  var models = {
    User: User,
    Avatar: Avatar
  };


  // To ensure DRY-ness, register factories in a loop
  _.each(models, function(value, key) {
    wagner.factory(key, function() {
      return value;
    });
  });

  return models;
};
