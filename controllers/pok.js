var express = require('express');
var pok = express.Router();

//Flow control
var async = require('async');

//modul path utk concenate path
var path = require('path');

//Utk upload file
var formidable = require('formidable');

//Zip
var Unrar = require('unrar');

//modul fs utk rw file
var fs = require('fs');

//XML to JSON
var parseString = require('xml2js').parseString;

//Mongo db
var mongodb = require('mongodb');
var url = 'mongodb://127.0.0.1:27017/simamov_2017';

pok.get('/', function(req, res){

	async.auto({

			connect_db : function(callback){

				var MongoClient = mongodb.MongoClient;

				MongoClient.connect(url, function(err, db){

					if(err){

						console.log('Unable to connect to server');

						callback(err, null)

						return;

					} 

					callback(null, db);
				})

			},

			get_detail_belanja: ['connect_db', function(result, callback){

				result.connect_db.collection('pok_detailBelanja').find().sort({nmr:1}).toArray(function(err, result){

					if(err){

						callback(err, null)

						return;

					}

					callback(null, result);

				})

			}],

			get_akun: ['connect_db', function(result, callback){

				result.connect_db.collection('pok_akun').find().sort({_id:1}).toArray(function(err, result){

					if(err){

						callback(err, null)

						return;

					}

					callback(null, result);

				})

			}],

			get_komponen: ['connect_db', function(result, callback){

				result.connect_db.collection('pok_komponen').find().sort({_id:1}).toArray(function(err, result){

					if(err){

						callback(err, null)

						return;

					}

					callback(null, result);

				})

			}],

			get_output: ['connect_db', function(result, callback){

				result.connect_db.collection('pok_output').find().sort({_id:1}).toArray(function(err, result){

					if(err){

						callback(err, null)

						return;

					}

					callback(null, result);

				})

			}],

			get_kegiatan: ['connect_db', function(result, callback){

				result.connect_db.collection('pok_kegiatan').find().sort({_id:1}).toArray(function(err, result){

					if(err){

						callback(err, null)

						return;

					}

					callback(null, result);

				})

			}],

			get_program: ['connect_db', function(result, callback){

				result.connect_db.collection('pok_program').find().sort({_id:1}).toArray(function(err, result){

					if(err){

						callback(err, null)

						return;

					}

					callback(null, result);

				})

			}]

		}, function(err, result){

		// console.log(result.get_detail_belanja)

		res.render('pok', {layout: false, data: result});

	})

});

pok.post('/upload_pok', function(req, res){

	async.auto({

		save_file: function(callback){

			var form = new formidable.IncomingForm();

			form.parse(req, function(err, fields, file){
				if(err)
					res.send('File tidak didukung');
					return;
			})

			form.on('fileBegin', function (name, file){
		        file.path = __dirname+'/../uploaded/pok/'+file.name;
		        var archive = new Unrar(file.path);
		        archive.list(function(err, entries){

		        	if(err){

		        		console.log('File tidak didukung');
		        		callback(err, null);
		        		return;

		        	}

		        	var MongoClient = mongodb.MongoClient;

					MongoClient.connect(url, function(err, db){

						if(err){

							console.log('Unable to connect to server');

							return;

						} else{

							var program = [];
							var kegiatan = [];

							for (var i = 0; i < entries.length; i++) {
							    var name = entries[i].name;
							    var type = entries[i].type;
							    if (type !== 'File') {
							        continue;
							    }

							    if(/d_kmpnen/.test(name)){
								    try {
							  			var komponen = ''

							    		var stream = archive.stream(name);
							  			stream.on('data', function(buffer){
										  komponen += buffer.toString();
										});

										stream.on('end', function(buffer){
											parseString(komponen, function (err, result) {
											    result.VFPData.c_kmpnen.forEach(function(value, key){										    	
											        var komponen = {};
											        komponen._id = value['kdkmpnen'][0];
											        komponen.prog = value['kdprogram'][0];
											        komponen.keg = value['kdgiat'][0];
											        komponen.output = value['kdoutput'][0];
											        komponen.uraian = value['urkmpnen'][0];

											    	db.collection('pok_komponen').update({_id:komponen._id}, komponen, { upsert : true });

											    })
											});
										});
								    } catch (e) {
								        throw e;
								    }
							    } else if(/d_item/.test(name)){
								    try {
							  			var item = ''

							    		var stream = archive.stream(name);
							  			stream.on('data', function(buffer){
										  item += buffer.toString();
										});

										stream.on('end', function(buffer){
											parseString(item, function (err, result) {
											    result.VFPData.c_item.forEach(function(value, key){										    	
											        var detailBelanja = {};
											        detailBelanja._id = value['kdakun'][0]+'.'+value['noitem'][0];
											        detailBelanja.nmr = parseInt(value['noitem'][0]);
											        detailBelanja.prog = value['kdprogram'][0];
											        detailBelanja.keg = value['kdgiat'][0];
											        detailBelanja.output = value['kdoutput'][0];
											        detailBelanja.komp = value['kdkmpnen'][0];
											        detailBelanja.akun = value['kdakun'][0];
											        detailBelanja.uraian = value['nmitem'][0].replace(/^\s*/, '');
											        detailBelanja.vol = value['volkeg'][0];
											        detailBelanja.sat = value['satkeg'][0];
											        detailBelanja.harga_satuan = value['hargasat'][0];
											        detailBelanja.jumlah = value['jumlah'][0];

											    	db.collection('pok_detailBelanja').update({_id:detailBelanja._id}, detailBelanja, { upsert : true });

											    })
											});
										});
								    } catch (e) {
								        throw e;
								    }
							    } else if(/d_akun/.test(name)){
								    try {
							  			var akun = ''

							    		var stream = archive.stream(name);
							  			stream.on('data', function(buffer){
										  akun += buffer.toString();
										});

										stream.on('end', function(buffer){
											parseString(akun, function (err, result) {
											    result.VFPData.c_akun.forEach(function(value, key){										    	
											        var newAkun = {};
											        newAkun._id = value['kdkmpnen'][0]+'.'+value['kdakun'][0];
											        newAkun.kdakun = value['kdakun'][0];
											        newAkun.prog = value['kdprogram'][0];
											        newAkun.keg = value['kdgiat'][0];
											        newAkun.output = value['kdoutput'][0];
											        newAkun.komp = value['kdkmpnen'][0];

											        db.collection('pok_akun').findOne({_id:newAkun._id}, {_id : 0, uraian: 1}, function(err, result){

											        	if(result){

											        		db.collection('pok_akun').update({_id:newAkun._id}, {$set: newAkun});

											        	} else{

											        		 newAkun.uraian = "(blm ada)";
											        		 db.collection('pok_akun').update({_id:newAkun._id}, newAkun, { upsert : true });

											        	}

											        });

											    })
											});
										});
								    } catch (e) {
								        throw e;
								    }
							    } else if(/d_output/.test(name)){
								    try {
							  			var output = ''

							    		var stream = archive.stream(name);
							  			stream.on('data', function(buffer){
										  output += buffer.toString();
										});

										stream.on('end', function(buffer){
											parseString(output, function (err, result) {
											    result.VFPData.c_output.forEach(function(value, key){										    	
											        var newOutput = {};
											        newOutput._id = value['kdoutput'][0];
											        newOutput.prog = value['kdprogram'][0];
											        newOutput.keg = value['kdgiat'][0];

											        if(!(kegiatan.indexOf(newOutput.keg) > -1)){

											        	kegiatan.push(value['kdgiat'][0]);
											        	db.collection('pok_kegiatan').findOne({_id:value['kdgiat'][0]}, function(err, result){

											        		if(!result){

											        			db.collection('pok_kegiatan').update({_id: value['kdgiat'][0]}, {_id:value['kdgiat'][0], prog: value['kdprogram'][0], uraian: "(blm ada)"}, { upsert : true });

											        		}

											        	})

											        	if(!(program.indexOf(value['kdprogram'][0]) > -1)){

												        	program.push(value['kdprogram'][0]);
												        	db.collection('pok_program').findOne({_id : value['kdprogram'][0]}, function(err, result){

												        		if(!result){

												        			db.collection('pok_program').update({_id: value['kdprogram'][0]}, {_id : value['kdprogram'][0], uraian: "(blm ada)"}, { upsert : true });

												        		}

												        	})
												        	

												        }
											        	

											        }

											        db.collection('pok_output').findOne({_id:newOutput._id}, {_id : 0, uraian: 1}, function(err, result){

											        	if(result){

											        		db.collection('pok_output').update({_id:newOutput._id}, {$set: newOutput});

											        	} else{

											        		 newOutput.uraian = "(blm ada)";
											        		 db.collection('pok_output').update({_id:newOutput._id}, newOutput, { upsert : true });

											        	}

											        });

											    })
											});
										});
								    } catch (e) {
								        throw e;
								    }
							    }
							}

						}

					})

					callback(null, 'ok');

				})
		    });

		}

	}, function(err, result){

		if (err) {
			res.send("File tidak didukung.");
			return;
		}

		res.send('Sukses');

	})

});

pok.post('/edit', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){

		if(err){

			console.log('Unable to connect to server');

			return;

		}

		var field = req.body.field;
		var value = req.body.value;
		db.collection(req.body.col).update({_id:req.body._id}, {$set: {[field]:value}});

		res.end('Ok')
	})

})

module.exports = pok;