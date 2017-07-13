var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KabSchema = new Schema({
    "_id" : String,
    "id_kab": String,
    "nama" : String,
    "id_propinsi": { type: String, ref: 'Prov' }
}, { collection: 'kab'});

KabSchema.methods.isExist = function(cb) {
  return this.model('Kab').findOne({ _id: this._id }, cb);
};

KabSchema.statics.getAll = function(cb) {
  return this.model('Kab').find({}, null, {sort: {nama:1}}, cb);
};

module.exports = mongoose.model('Kab', KabSchema);