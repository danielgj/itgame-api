var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var skillSchema = {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false
    }
};

var schema = new mongoose.Schema(skillSchema, {timestamps: true});

schema.index({ name: 'name' });

module.exports = schema;
module.exports.skillSchema = skillSchema;
