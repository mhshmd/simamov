var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CustomEntitySchema = new Schema({
    "type" : String,
    "nama" : String
}, { collection: 'custom_entity', strict: false});

CustomEntitySchema.methods.isExist = function(cb) {
  return this.model('CustomEntity').findOne({ _id: this._id }, cb);
};

CustomEntitySchema.statics.getAll = function(cb) {
  return this.model('CustomEntity').find({}, null, {sort: {nama:1}}, cb);
};

module.exports = mongoose.model('CustomEntity', CustomEntitySchema);