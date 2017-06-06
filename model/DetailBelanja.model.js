var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DetailBelanjaSchema = new Schema({
    _id: String,
    nmr: Number,
    prog: String,
    keg: String,
    output: String,
    komp: String,
    skomp: String,
    akun: String,
    uraian: {
    	type: String,
    	required: true
    },
    vol: Number,
    sat: String,
    harga_satuan: Number,
    jumlah: {
        type: Number,
        set: v => parseInt(x.replace(/\D/g, ""))
    },
    timestamp: String
}, { collection: 'pok_detailBelanja' });

DetailBelanjaSchema.methods.isExist = function(cb) {
  return this.model('DetailBelanja').findOne({ _id: this._id }, cb);
};

DetailBelanjaSchema.statics.getAll = function(cb) {
  return this.model('DetailBelanja').find({}, null, {sort: {nmr:1}}, cb);
};

module.exports = mongoose.model('DetailBelanja', DetailBelanjaSchema);