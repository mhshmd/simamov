var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PegawaiSchema = new Schema({
	"_id": String,
    "nama" : String,
    "nip" : String,
    "jabatan" : String,
    "gol" : String,
    "kode_dosen" : String
}, { collection: 'pegawai' });

PegawaiSchema.methods.isExist = function(cb) {
  return this.model('Pegawai').findOne({ _id: this._id }, cb);
};

PegawaiSchema.statics.getAll = function(cb) {
  return this.model('Pegawai').find({}, null, {sort: {nama:1}}, cb);
};

module.exports = mongoose.model('Pegawai', PegawaiSchema);