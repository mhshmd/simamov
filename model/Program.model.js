var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProgramSchema = new Schema({
    'kdprogram': String,
    uraian: String,
    jumlah: Number,
    timestamp: Number,
    active: {
        default: true,
        type: Boolean
    },
    old: []
}, { collection: 'pok_program' });

ProgramSchema.methods.isExist = function(cb) {
    return this.model('Program').findOne({ 'kdprogram': this.kdprogram }, cb);
};

ProgramSchema.statics.getAll = function(cb) {
  return this.model('Program').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Program', ProgramSchema);