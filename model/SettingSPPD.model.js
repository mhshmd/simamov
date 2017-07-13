var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SettingSPPDSchema = new Schema({
    ttd_st: [{
    	type: String, 
    	ref: 'Pegawai'
    }],
    ttd_st_default: String,
    ttd_leg: [{
    	type: String, 
    	ref: 'Pegawai'
    }],
    ttd_leg_default: String,
    ppk: {
    	type: String, 
    	ref: 'Pegawai'
    },
    bendahara: {
    	type: String, 
    	ref: 'Pegawai'
    }
}, { collection: 'setting_sppd', strict: false });

module.exports = mongoose.model('SettingSPPD', SettingSPPDSchema);