var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubKompSchema = new Schema({
    _id: String,
    prog: String,
    keg: String,
    output: String,
    komp: String,
    skomp: String,
    uraian: String
}, { collection: 'pok_sub_komponen' });

SubKompSchema.methods.isExist = function(cb) {
  return this.model('SubKomponen').findOne({ _id: this._id }, cb);
};

SubKompSchema.statics.getAll = function(cb) {
  return this.model('SubKomponen').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('SubKomponen', SubKompSchema);