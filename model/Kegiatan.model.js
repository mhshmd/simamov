var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KegiatanSchema = new Schema({
    _id: String,
    prog: String,
    uraian: String,
    jumlah: Number,
    timestamp: String
}, { collection: 'pok_kegiatan' });

KegiatanSchema.methods.isExist = function(cb) {
  return this.model('Kegiatan').findOne({ _id: this._id }, cb);
};

KegiatanSchema.statics.getAll = function(cb) {
  return this.model('Kegiatan').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Kegiatan', KegiatanSchema);