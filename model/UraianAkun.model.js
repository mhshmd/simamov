var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UraianAkunSchema = new Schema({
    _id: String,
    uraian: String
}, { collection: 'pok_uraian_akun' });

UraianAkunSchema.methods.isExist = function(cb) {
    return this.model('UraianAkun').findOne({ '_id': this._id }, cb);
};

UraianAkunSchema.statics.getAll = function(cb) {
  return this.model('UraianAkun').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('UraianAkun', UraianAkunSchema);