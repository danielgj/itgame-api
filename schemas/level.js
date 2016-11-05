var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var levelSchema = {
    name: {
      type: String,
      required: true
    },
    begin: {
      type: Number,
      required: true
    },
    end: {
      type: Number,
      required: true
    }
    /*
    ,
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    }
    */
};

var schema = new mongoose.Schema(levelSchema, {timestamps: true});

schema.index({ name: 'name' });

module.exports = schema;
module.exports.levelSchema = levelSchema;
