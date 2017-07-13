var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProvSchema = new Schema({
    "_id" : String,
    "nama" : String
}, { collection: 'prov'});

ProvSchema.methods.isExist = function(cb) {
  return this.model('Prov').findOne({ _id: this._id }, cb);
};

ProvSchema.statics.getAll = function(cb) {
  return this.model('Prov').find({}, null, {sort: {nama:1}}, cb);
};

module.exports = mongoose.model('Prov', ProvSchema);