var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OutputSchema = new Schema({
    _id: String,
    prog: String,
    keg: String,
    uraian: String,
    jumlah: Number,
    timestamp: String
}, { collection: 'pok_output' });

OutputSchema.methods.isExist = function(cb) {
  return this.model('Output').findOne({ _id: this._id }, cb);
};

OutputSchema.statics.getAll = function(cb) {
  return this.model('Output').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Output', OutputSchema);