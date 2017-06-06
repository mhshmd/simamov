var DetailBelanja = require(__dirname+"/../model/DetailBelanja.model");
var Akun = require(__dirname+"/../model/Akun.model");
var Komponen = require(__dirname+"/../model/Komponen.model");
var SubKomponen = require(__dirname+"/../model/SubKomponen.model");
var Output = require(__dirname+"/../model/Output.model");
var SubOutput = require(__dirname+"/../model/SubOutput.model");
var Kegiatan = require(__dirname+"/../model/Kegiatan.model");
var Program = require(__dirname+"/../model/Program.model");

//Flow control
var async = require('async');

var POK = function (){
	async.parallel({
			get_detail_belanja: function(callback){
				DetailBelanja.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			},
			get_akun: function(callback){
				Akun.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			},
			get_sub_komponen: function(callback){
				SubKomponen.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			},
			get_komponen: function(callback){
				Komponen.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			},
			get_sub_output: function(callback){
				SubOutput.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			},
			get_output: function(callback){
				Output.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			},
			get_kegiatan: function(callback){
				Kegiatan.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			},
			get_program: function(callback){
				Program.getAll(function(err, result) {
				  	if(err){
						callback(err, null)
						return;
					}
					callback(null, result);
				});
			}
		},
		function(err, result){
			this.data = result;
	});
}

POK.prototype.unggah = function(fileEntries){

}

POK.prototype.getAll = function(things){

	return Program.getAll();

}

module.exports = POK;