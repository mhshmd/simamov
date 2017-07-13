var express = require('express');
var sppd = express.Router();

//Flow control
var async = require('async');

//modul path utk concenate path
var path = require('path');

//modul fs utk rw file
var fs = require('fs');

//modul utk dynamic docx & convert to pdf
var Docxtemplater = require('docxtemplater');
var JSZip = require('jszip');

//PDF Merge
var PDFMerge = require('pdf-merge');
var pdftkPath = 'C:\\Program Files (x86)\\PDFtk Server\\bin\\pdftk.exe';

//Docx to Pdf
var msopdf = require('node-msoffice-pdf');

var Komponen = require(__dirname+"/../model/Komponen.model");

var Prov = require(__dirname+"/../model/Prov.model");
var Kab = require(__dirname+"/../model/Kab.model");
var Setting = require(__dirname+"/../model/Setting.model");
var SettingSPPD = require(__dirname+"/../model/SettingSPPD.model");

var _ = require("underscore");

//Socket.io
sppd.connections;

sppd.io;

sppd.socket = function(io, connections){
	sppd.connections = connections;

	sppd.io = io;

	io.sockets.on('connection', function (client) {
		client.on('komponen_list', function (q, cb){
	    	Komponen.find({"urkmpnen": new RegExp(q, "i"), 'active': true}, 'kdkmpnen urkmpnen', function(err, custs){
	    		cb(custs);
	    	})
	    })
		client.on('prov_list', function (q, cb){
	    	Prov.find({"nama": new RegExp(q, "i")}, 'nama', function(err, prov){
	    		cb(prov);
	    	})
	    })
		client.on('kab_list', function (q, cb){
	    	Kab.find({"nama": new RegExp(q, "i")}, 'nama', function(err, kab){
	    		cb(kab);
	    	})
	    })
		client.on('add_ttd_st', function (new_ttd, cb){
	    	SettingSPPD.findOne({}, function(err, setting){
	    		if(!setting){
	    			var new_setting = new SettingSPPD({ttd_st: [new_ttd]});
	    			new_setting.save(function(err, res){
	    				cb('sukses');
	    			});
	    		} else {
	    			SettingSPPD.update({}, {$push: {"ttd_st": new_ttd}}, {new: true}, function(err, result){
	    				cb('sukses');
	    			})
	    		}
	    		
	    	})
	    })
		client.on('add_ttd_leg', function (new_ttd, cb){
	    	SettingSPPD.findOne({}, function(err, setting){
	    		if(!setting){
	    			var new_setting = new SettingSPPD({ttd_leg: [new_ttd]});
	    			new_setting.save(function(err, res){
	    				cb('sukses');
	    			});
	    		} else {
	    			SettingSPPD.update({}, {$push: {"ttd_leg": new_ttd}}, {new: true}, function(err, result){
	    				cb('sukses');
	    			})
	    		}
	    		
	    	})
	    })
		client.on('set_ppk', function (new_ppk, cb){
	    	SettingSPPD.findOne({}, function(err, setting){
	    		if(!setting){
	    			var new_setting = new SettingSPPD({ppk: new_ppk});
	    			new_setting.save(function(err, res){
	    				cb('sukses');
	    			});
	    		} else {
	    			SettingSPPD.update({}, {$set: {ppk: new_ppk}}, {new: true}, function(err, result){
	    				cb('sukses');
	    			})
	    		}
	    		
	    	})
	    })
		client.on('set_bend', function (new_bend, cb){
	    	SettingSPPD.findOne({}, function(err, setting){
	    		if(!setting){
	    			var new_setting = new SettingSPPD({bendahara: new_bend});
	    			new_setting.save(function(err, res){
	    				cb('sukses');
	    			});
	    		} else {
	    			SettingSPPD.update({}, {$set: {bendahara: new_bend}}, {new: true}, function(err, result){
	    				cb('sukses');
	    			})
	    		}
	    		
	    	})
	    })
		client.on('set_default_ttd_st', function (nip, cb){
	    	SettingSPPD.update({}, {ttd_st_default: nip}, function(err, status){
	    		cb('sukses');
	    	})
	    })
		client.on('set_default_ttd_leg', function (nip, cb){
	    	SettingSPPD.update({}, {ttd_leg_default: nip}, function(err, status){
	    		cb('sukses');
	    	})
	    })
		client.on('ttd_st_remove', function (nip, cb){
	    	SettingSPPD.update({}, {$pull: {ttd_st: nip}}, function(err, status){
	    		cb('sukses');
	    	})
	    })
		client.on('ttd_leg_remove', function (nip, cb){
	    	SettingSPPD.update({}, {$pull: {ttd_leg: nip}}, function(err, status){
	    		cb('sukses');
	    	})
	    })
		client.on('surat_tugas', function (data, cb){
			// console.log(data)
			var sppd_template = fs.readFileSync(__dirname+"/../template/surat_tugas.docx","binary");













	    	cb('sukses');
	    })
	})

};

sppd.get('/surat_tugas', function(req, res){
	SettingSPPD.findOne({}).populate('ttd_st ttd_leg bendahara ppk').exec(function(err, result){
		res.render('sppd/surat_tugas', {layout: false,  setting: result});
		
	})	
});

sppd.get('/pengaturan', function(req, res){
	SettingSPPD.findOne({}).populate('ttd_st ttd_leg bendahara ppk').exec(function(err, result){
		res.render('sppd/pengaturan', {layout: false, setting: result});
	})	
});

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = sppd;