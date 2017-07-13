var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubOutputSchema = new Schema({
    'kdprogram': String,
    'kdgiat': String,
    'kdoutput': String,
    'kdsoutput': String,
    'ursoutput': String,
    jumlah: Number,
    timestamp: Number,
    active: {
        default: true,
        type: Boolean
    },
    old: []
}, { collection: 'pok_sub_output' });

SubOutputSchema.methods.isExist = function(cb) {
    return this.model('SubOutput').findOne({ 'kdprogram': this.kdprogram, 'kdgiat': this.kdgiat, 'kdoutput': this.kdoutput, 
        'kdsoutput': this.kdsoutput }, cb);
};

SubOutputSchema.statics.getAll = function(cb) {
  return this.model('SubOutput').find({}, null, {sort: {soutput:1}}, cb);
};

module.exports = mongoose.model('SubOutput', SubOutputSchema);