var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KomponenSchema = new Schema({
    _id: String,
    prog: String,
    keg: String,
    output: String,
    soutput: String,
    uraian: String,
    jumlah: Number,
    timestamp: String
}, { collection: 'pok_komponen' });

KomponenSchema.methods.isExist = function(cb) {
  return this.model('Komponen').findOne({ _id: this._id }, cb);
};

KomponenSchema.statics.getAll = function(cb) {
  return this.model('Komponen').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Komponen', KomponenSchema);