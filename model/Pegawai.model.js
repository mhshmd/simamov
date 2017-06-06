var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PegawaiSchema = new Schema({
    "nama" : String,
    "nip" : String,
    "jabatan" : [String],
    "gol" : String,
    "sppd_surat" : Number,
    "sppd_ttdSuratT" : Number,
    "sppd_st_index" : Number
}, { collection: 'pegawai' });

PegawaiSchema.methods.isExist = function(cb) {
  return this.model('Pegawai').findOne({ _id: this._id }, cb);
};

PegawaiSchema.statics.getAll = function(cb) {
  return this.model('Pegawai').find({}, null, {sort: {nama:1}}, cb);
};

module.exports = mongoose.model('Pegawai', PegawaiSchema);