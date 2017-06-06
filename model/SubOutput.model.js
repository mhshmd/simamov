var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubOutputSchema = new Schema({
    _id: String,
    prog: String,
    keg: String,
    output: String,
    soutput: String,
    uraian: String,
    jumlah: Number,
    timestamp: String
}, { collection: 'pok_sub_output' });

SubOutputSchema.methods.isExist = function(cb) {
  return this.model('SubOutput').findOne({ _id: this._id }, cb);
};

SubOutputSchema.statics.getAll = function(cb) {
  return this.model('SubOutput').find({}, null, {sort: {soutput:1}}, cb);
};

module.exports = mongoose.model('SubOutput', SubOutputSchema);