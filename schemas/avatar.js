var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var avatarSchema = {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false
    }
};

var schema = new mongoose.Schema(avatarSchema, {timestamps: true});

schema.index({ name: 'name' });

module.exports = schema;
module.exports.avatarSchema = avatarSchema;
