var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AkunSchema = new Schema({
    _id: String,
    prog: String,
    keg: String,
    output: String,
    komp: String,
    skomp: String,
    kdakun: String,
    uraian: String,
    jumlah: Number,
    timestamp: String
}, { collection: 'pok_akun' });

AkunSchema.methods.isExist = function(cb) {
  return this.model('Akun').findOne({ _id: this._id }, cb);
};

AkunSchema.statics.getAll = function(cb) {
  return this.model('Akun').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Akun', AkunSchema);