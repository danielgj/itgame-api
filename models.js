var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner, config) {

  mongoose.Promise = global.Promise;
  mongoose.connect(config.db_url);

  var User =
      mongoose.model('User', require('./schemas/user'), 'users');
  var UserProfile =
      mongoose.model('UserProfile', require('./schemas/user_profile'), 'user_profile');
  var Skill =
      mongoose.model('Skill', require('./schemas/skill'), 'skills');
  var Level =
      mongoose.model('Level', require('./schemas/level'), 'levels');
  
  var models = {
    User: User,
    UserProfile: UserProfile,
    Skill: Skill,
    Level: Level
  };


  // To ensure DRY-ness, register factories in a loop
  _.each(models, function(value, key) {
    wagner.factory(key, function() {
      return value;
    });
  });

  return models;
};
