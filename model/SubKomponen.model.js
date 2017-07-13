var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubKompSchema = new Schema({
    'kdprogram': String,
    'kdgiat': String,
    'kdoutput': String,
    'kdsoutput': String,
    'kdkmpnen': String,
    'kdskmpnen': String,
    'urskmpnen': String,
    jumlah: Number,
    timestamp: Number,
    active: {
        default: true,
        type: Boolean
    },
    old: []
}, { collection: 'pok_sub_komponen' });

SubKompSchema.methods.isExist = function(cb) {
    return this.model('SubKomponen').findOne({ 'kdprogram': this.kdprogram, 'kdgiat': this.kdgiat, 'kdoutput': this.kdoutput, 
        'kdsoutput': this.kdsoutput, 'kdkmpnen': this.kdkmpnen, 'kdskmpnen': this.kdskmpnen }, cb);
};

SubKompSchema.statics.getAll = function(cb) {
  return this.model('SubKomponen').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('SubKomponen', SubKompSchema);