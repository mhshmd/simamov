var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var KegiatanSchema = new Schema({
    'kdprogram': String,
    'kdgiat': String,
    uraian: String,
    jumlah: Number,
    timestamp: Number,
    active: {
        default: true,
        type: Boolean
    },
    old: []
}, { collection: 'pok_kegiatan' });

KegiatanSchema.methods.isExist = function(cb) {
    return this.model('Kegiatan').findOne({ 'kdprogram': this.kdprogram, 'kdgiat': this.kdgiat }, cb);
};

KegiatanSchema.statics.getAll = function(cb) {
  return this.model('Kegiatan').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Kegiatan', KegiatanSchema);