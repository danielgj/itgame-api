var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userProfileSchema = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    level: {
      type: Number,
      required: true,
      default: 0
    },
    points: {
      type: Number,
      required: true,
      default: 0
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Avatar',
      required: true
    },
    skills: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        }]
    },
    bio: {
      type: String,
      required: false
    },
    jiraUser: {
      type: String,
      required: false
    },
    gitlabUser: {
      type: String,
      required: false
    },
    jenkinsUser: {
      type: String,
      required: false
    }
};

var schema = new mongoose.Schema(userProfileSchema, {timestamps: true});

schema.index({ name: 'userId' });

module.exports = schema;
module.exports.userProfileSchema = userProfileSchema;
