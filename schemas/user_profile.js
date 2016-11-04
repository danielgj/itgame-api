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
      required: true
    },
    points: {
      type: Number,
      required: true,
      default: 0
    },
    avatar: {
      type: String,
      required: true
    }
};

var schema = new mongoose.Schema(userProfileSchema, {timestamps: true});

schema.index({ name: 'username' });

module.exports = schema;
module.exports.userProfileSchema = userProfileSchema;
