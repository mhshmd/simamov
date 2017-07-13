var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DetailBelanjaSchema = new Schema({
    'kdprogram': String,
    'kdgiat': String,
    'kdoutput': String,
    'kdsoutput': String,
    'kdkmpnen': String,
    'kdskmpnen': String,
    'kdakun': String,
    'noitem': Number,
    'nmitem': String,
    'volkeg': String,
    'satkeg': String,
    'hargasat': Number,
    'jumlah': Number,
    timestamp: Number,
    active: {
        default: true,
        type: Boolean
    },
    old: [],
    realisasi: [{
        'timestamp': Number,
        'jumlah': Number,
        'penerima_nama': String,
        'penerima_id': String,
        'spm_no': String,
        'bukti_no': String,
        'tgl': String,
        'tgl_timestamp': Number,
        'ket': String,
        'pengentry': String
    }]
}, { collection: 'pok_detailBelanja', strict: false });

DetailBelanjaSchema.methods.isExist = function(cb) {
    return this.model('DetailBelanja').findOne({ 'kdprogram': this.kdprogram, 'kdgiat': this.kdgiat, 'kdoutput': this.kdoutput, 
        'kdsoutput': this.kdsoutput, 'kdkmpnen': this.kdkmpnen, 'kdskmpnen': this.kdskmpnen, 'kdakun': this.kdakun, 'noitem': this.noitem }, cb);
};

DetailBelanjaSchema.statics.getAll = function(cb) {
    return this.model('DetailBelanja').find({}, null, {sort: {nmr:1}}, cb);
};

module.exports = mongoose.model('DetailBelanja', DetailBelanjaSchema);

