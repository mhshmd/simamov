var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProgramSchema = new Schema({
    _id: String,
    uraian: String,
    jumlah: Number,
    timestamp: String
}, { collection: 'pok_program' });

ProgramSchema.methods.isExist = function(cb) {
  return this.model('Program').findOne({ _id: this._id }, cb);
};

ProgramSchema.statics.getAll = function(cb) {
  return this.model('Program').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Program', ProgramSchema);