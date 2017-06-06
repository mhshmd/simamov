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

var DetailBelanja = require(__dirname+"/../model/DetailBelanja.model");
var Akun = require(__dirname+"/../model/Akun.model");
var Komponen = require(__dirname+"/../model/Komponen.model");
var SubKomponen = require(__dirname+"/../model/SubKomponen.model");
var Output = require(__dirname+"/../model/Output.model");
var SubOutput = require(__dirname+"/../model/SubOutput.model");
var Kegiatan = require(__dirname+"/../model/Kegiatan.model");
var Program = require(__dirname+"/../model/Program.model");


var POK = require(__dirname+"/../library/POK");

pok.get('/', function(req, res){
	DetailBelanja.find();	
	res.render('pok/pok', {layout: false});
})

pok.get('/utama', function(req, res){
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
			res.render('pok/utama', {layout: false, data: result});
	})
});

//Tab unggah POK, saat User klik Unggah
pok.post('/unggah_pok', function(req, res){
	//Tahapan simpan POK
	async.auto({
		//Konek DB dulu
		connect_db: function(callback){
			var MongoClient = mongodb.MongoClient;

			MongoClient.connect(url, function(err, db){
				if(err){
					//Cetak gagal konek db jika tdk bisa
					console.log('Unable to connect to server');
					callback(err, null)
					return;
				} 
				callback(null, db);
			})
		},
		save_file: ['connect_db', function(db, callback){
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

		        	var POK = new POK(entries)
		        	var program = [];

					var kegiatan = [];

					var program_xml;

					var kegiatan_xml;

					var output_xml;

					var sub_output_xml;

					var komponen_xml;

					var sub_komponen_xml;

					var akun_xml;

					var detailb_xml;	

					var current_timestamp = Math.round(new Date().getTime()/1000);

					for (var i = 0; i < entries.length; i++) {
					    var name = entries[i].name;

					    var type = entries[i].type;

					    if (type !== 'File') {
					        continue;
					    }
					    if(/d_item/.test(name)){
					    	detailb_xml = name;

					    } else if(/d_akun/.test(name)){
					    	akun_xml = name;

					    } else if(/d_kmpnen/.test(name)){
					    	komponen_xml = name;

					    } else if(/d_skmpnen/.test(name)){
					    	sub_komponen_xml = name;

					    } else if(/d_soutput/.test(name)){
					    	sub_output_xml = name;

					    } else if(/d_output/.test(name)){
					    	output_xml = name;

					    }
					}
					async.waterfall([
						function(detail_parent_callback){
							try {
								//xml string init
					  			var detailb = '';

					  			//ubah ke stream>buffer>string XML
					    		var stream = archive.stream(detailb_xml);

					  			stream.on('data', function(buffer_d){
								  detailb += buffer_d.toString();

								});
								//xml to json & update to db
								stream.on('end', function(buffer_e){
									parseString(detailb, function (err, result) {
										//Daftar tasks : Inisialisasi
									    var tasks = [];

									    //Iterasi setiap Item
										result.VFPData.c_item.forEach(function(value, key){
											//tambahkan ke tasks
											tasks.push(
													function(detail_child_callback){	
														var detailBelanja = new DetailBelanja({
															_id: value['kdkmpnen'][0]+"."+value['kdskmpnen'][0].replace(/\s/g, '')+'.'+value['kdakun'][0]+'.'+value['noitem'][0],
														    nmr: value['noitem'][0],
														    prog: value['kdprogram'][0],
														    keg: value['kdgiat'][0],
														    output: value['kdoutput'][0],
														    komp: value['kdkmpnen'][0],
														    skomp: value['kdkmpnen'][0]+"."+value['kdskmpnen'][0].replace(/\s/g, ''),
														    akun: value['kdkmpnen'][0]+"."+value['kdskmpnen'][0].replace(/\s/g, '')+'.'+value['kdakun'][0],
														    uraian: value['nmitem'][0].replace(/^\s*/, ''),
														    vol: value['volkeg'][0],
														    sat: value['satkeg'][0],
														    harga_satuan: value['hargasat'][0],
														    jumlah: value['jumlah'][0]
														});

												        //save to db
												        //cek jika sdh ada
												        detailBelanja.isExist(function(err, result) {
														  	if( err )
																console.log('Error detailBelanja isExist');
															else{
																if( result ){												        		
													        		var old = {};

												        			for( var i in detailBelanja ){
												        				if( result[i] ){
													        				if( result[i] == detailBelanja[i] ){
													        					// delete detailBelanja[i];

													        				} else{
													        					old[i] = result[i];
													        					result[i] = detailBelanja[i];

													        				}											        					
												        				}
												        			}
												        			if( JSON.stringify(old) != '{}' ){
												        				old.timestamp = result.timestamp;

												        				result.timestamp = current_timestamp;

												        				db.connect_db.collection( 'old_pok_detailBelanja' ).update( { _id: detailBelanja._id }, { $push: { history: old } }, { upsert: true }, function( err, obj ){

												        					db.connect_db.collection( 'pok_detailBelanja' ).save(result, function( err, obj ){
																	    		if (err) {
																	    			console.log(err);
																    				return;
																	    		}
																	    		//end function with callback
																	    		detail_child_callback(null, obj);
																	    	});
												        				});
												        			} else{
												        				detail_child_callback(null, "None change");
												        			}
													        	} else{
													        		//jika blm ada	
													        		detailBelanja.timestamp = current_timestamp;

													        		DetailBelanja.create( detailBelanja, function( err, result ){
																		if( err )
																			res.send( 'Error man....' );
																		else
																			detail_child_callback(null, result);
																	} )
													        	}
															}
														});
													}
											)	
									    });
									    //setelah dipush, dijalankan satu2
									    async.parallel(tasks, function(err, detailb_result){
									    	if(err){
									    		console.log(err);
									    		return;
									    	}
									    	detail_parent_callback(err, detailb_result);
									    	console.log("Detail belanja finished");
									    })
									});
								});
						    } catch (e) {
						        throw e;
						    }
						},
						function(detail_parent_callback, akun_parent_callback){
							try {
								//xml string init
					  			var akun = ''

					  			//ubah ke stream>buffer>string XML
					    		var stream = archive.stream(akun_xml);

					  			stream.on('data', function(buffer){
								  akun += buffer.toString();

								});
								//xml to json & update to db
								stream.on('end', function(buffer){
									parseString(akun, function (err, result) {
										//Daftar tasks : Inisialisasi
									    var tasks = [];

									    //Iterasi setiap Item
										result.VFPData.c_akun.forEach(function(value, key){
											//tambahkan ke tasks
											tasks.push(
												function(akun_child_callback){									    	
											        var newAkun = {};

											        newAkun._id = value['kdkmpnen'][0]+"."+value['kdskmpnen'][0].replace(/\s/g, '')+'.'+value['kdakun'][0];

											        newAkun.kdakun = value['kdakun'][0];

											        newAkun.prog = value['kdprogram'][0];

											        newAkun.keg = value['kdgiat'][0];

											        newAkun.output = value['kdoutput'][0];

											        newAkun.komp = value['kdkmpnen'][0];

											        newAkun.skomp = value['kdkmpnen'][0]+"."+value['kdskmpnen'][0].replace(/\s/g, '');

											        //save to db
											        //cek jika sdh ada
											        db.connect_db.collection('pok_akun').findOne({_id:newAkun._id}, function(err, result){
											        	//jk sdh ada
											        	if(result){
													    	var old = {};

										        			for( var i in newAkun ){
										        				if( result[i] ){
											        				if( result[i] != newAkun[i] ){
											        					old[i] = result[i];

											        					result[i] = newAkun[i];

											        				}											        					
										        				}
										        			}
										        			if( JSON.stringify(old) != '{}' ){
										        				old.timestamp = result.timestamp;

										        				result.timestamp = current_timestamp;

										        				db.connect_db.collection( 'old_pok_akun' ).update( { _id: newAkun._id }, { $push: { history: old } }, { upsert: true }, function( err, obj ){
										        					db.connect_db.collection( 'pok_akun' ).save(result, function( err, obj ){
															    		if (err) {
															    			console.log(err);
														    				return;
															    		}
															    		//end function with callback
															    		akun_child_callback(null, obj);
															    	});
										        				});
										        			} else{
										        				akun_child_callback(null, "None change");
										        			}
											        	} else{
											        		//jika blm ada
											        		 newAkun.uraian = "(blm ada)";
											        		 newAkun.timestamp = current_timestamp;

											        		 db.connect_db.collection('pok_akun').update({_id:newAkun._id}, newAkun, { upsert : true }, function( err, obj ){
													    		if (err) {
													    			console.log(err);
												    				return;
													    		}
													    		//end function with callback
													    		akun_child_callback(null, obj);
													    	});
											        	}
											        });
												}
											)	

									    });
									    //setelah dipush, dijalankan satu2
									    async.parallel(tasks, function(err, akun_result){
									    	if(err){
									    		console.log(err);
									    		return;
									    	}
									    	db.connect_db.collection('pok_detailBelanja').aggregate([{$group:{_id: "$akun", total: {$sum: "$jumlah"}}}], function(err, jumlah_detailb){
									    		var tasks_jumlah = [];

												jumlah_detailb.forEach(function(value, key){
													tasks_jumlah.push(function(callback){
												        db.connect_db.collection('pok_akun').update({_id: value._id},{$set:{"jumlah": value.total}}, function( err, obj ){
												        	if (err) {
												    			console.log(err);
											    				return;
												    		}
												    		callback(null, "Ok")
												        });
													})
											    })
												async.parallel(tasks_jumlah, function(err, result){
													if(err){
											    		console.log(err);
											    		return;
											    	}
											        akun_parent_callback(err, akun_result);
									    			console.log("Akun finished");
												})

									        })

									    })
									});
								});
						    } catch (e) {
						        throw e;
						    }

						},

						function(akun_parent_callback, sub_komponen_parent_callback){
							try {
								//xml string init
					  			var sub_komponen = ''

					  			//ubah ke stream>buffer>string XML
					    		var stream = archive.stream(sub_komponen_xml);

					  			stream.on('data', function(buffer){
								  sub_komponen += buffer.toString();
								});
								//xml to json & update to db
								stream.on('end', function(buffer){
									parseString(sub_komponen, function (err, result) {
										//Daftar tasks : Inisialisasi
									    var tasks = [];

									    //Iterasi setiap Item
										result.VFPData.c_skmpnen.forEach(function(value, key){
											//tambahkan ke tasks
											tasks.push(
												function(sub_komponen_child_callback){									    	
											        var skomponen = {};

											        skomponen._id = value['kdkmpnen'][0]+"."+value['kdskmpnen'][0].replace(/\s/g, '');

											        skomponen.prog = value['kdprogram'][0];

											        skomponen.keg = value['kdgiat'][0];

											        skomponen.output = value['kdoutput'][0];

											        skomponen.komp = value['kdkmpnen'][0];

											        skomponen.skomp = value['kdskmpnen'][0].replace(/\s/g, '');

											        skomponen.uraian = value['urskmpnen'][0];

											        //save to db
											    	db.connect_db.collection('pok_sub_komponen').update({_id:skomponen._id}, skomponen, { upsert : true }, function( err, obj ){
											    		if (err) {
											    			console.log(err);
										    				return;
											    		}
											    		//end function with callback
											    		sub_komponen_child_callback(null, obj);
											    	});
												}
											)	

									    });
									    //setelah dipush, dijalankan satu2
									    async.parallel(tasks, function(err, sub_komponen_result){
									    	if(err){
									    		console.log(err);
									    		return;
									    	}
									    	db.connect_db.collection('pok_akun').aggregate([{$group:{_id: "$skomp", total: {$sum: "$jumlah"}}}], function(err, jumlah_akun){
									    		var tasks_jumlah = [];

												jumlah_akun.forEach(function(value, key){
													tasks_jumlah.push(function(callback){
												        db.connect_db.collection('pok_sub_komponen').update({_id: value._id},{$set: {"jumlah": value.total}}, function( err, obj ){
												        	if (err) {
												    			console.log(err);
											    				return;
												    		}
												    		callback(null, "Ok")
												        });
													})
											    })
												async.parallel(tasks_jumlah, function(err, result){
													if(err){
											    		console.log(err);
											    		return;
											    	}
											        sub_komponen_parent_callback(err, sub_komponen_result)
									    			console.log("Sub komponen finished");
												})
									        })
									    })
									});
								});
						    } catch (e) {
						        throw e;
						    }
						},

						function(akun_parent_callback, komponen_parent_callback){
							try {
								//xml string init
					  			var komponen = ''

					  			//ubah ke stream>buffer>string XML
					    		var stream = archive.stream(komponen_xml);

					  			stream.on('data', function(buffer){
								  komponen += buffer.toString();
								});
								//xml to json & update to db
								stream.on('end', function(buffer){
									parseString(komponen, function (err, result) {
										//Daftar tasks : Inisialisasi
									    var tasks = [];

									    //Iterasi setiap Item
										result.VFPData.c_kmpnen.forEach(function(value, key){
											//tambahkan ke tasks
											tasks.push(
												function(komponen_child_callback){									    	
											        var komponen = {};

											        komponen._id = value['kdkmpnen'][0];

											        komponen.prog = value['kdprogram'][0];

											        komponen.keg = value['kdgiat'][0];

											        komponen.output = value['kdoutput'][0];

											        komponen.soutput = value['kdoutput'][0]+"."+value['kdsoutput'][0];

											        komponen.uraian = value['urkmpnen'][0];

											        //save to db
											    	db.connect_db.collection('pok_komponen').update({_id:komponen._id}, komponen, { upsert : true }, function( err, obj ){
											    		if (err) {
											    			console.log(err);
										    				return;
											    		}
											    		//end function with callback
											    		komponen_child_callback(null, obj);
											    	});
												}
											)	

									    });
									    //setelah dipush, dijalankan satu2
									    async.parallel(tasks, function(err, komponen_result){
									    	if(err){
									    		console.log(err);
									    		return;
									    	}
									    	db.connect_db.collection('pok_akun').aggregate([{$group:{_id: "$komp", total: {$sum: "$jumlah"}}}], function(err, jumlah_akun){
									    		var tasks_jumlah = [];

												jumlah_akun.forEach(function(value, key){
													tasks_jumlah.push(function(callback){
												        db.connect_db.collection('pok_komponen').update({_id: value._id},{$set: {"jumlah": value.total}}, function( err, obj ){
												        	if (err) {
												    			console.log(err);
											    				return;
												    		}
												    		callback(null, "Ok")
												        });
													})
											    })
												async.parallel(tasks_jumlah, function(err, result){
													if(err){
											    		console.log(err);
											    		return;
											    	}
											        komponen_parent_callback(err, komponen_result);
									    			console.log("Komponen finished");
												})
									        })
									    })
									});
								});
						    } catch (e) {
						        throw e;
						    }
						},
						function(komponen_parent_callback, sub_output_parent_callback){
							try {
								//xml string init
					  			var sub_output = ''

					  			//ubah ke stream>buffer>string XML
					    		var stream = archive.stream(sub_output_xml);

					  			stream.on('data', function(buffer){
								  sub_output += buffer.toString();

								});
								//xml to json & update to db
								stream.on('end', function(buffer){
									parseString(sub_output, function (err, result) {
										//Daftar tasks : Inisialisasi
									    var tasks = [];

									    //Iterasi setiap Item
										result.VFPData.c_soutput.forEach(function(value, key){
											//tambahkan ke tasks
											tasks.push(
												function(sub_output_child_callback){									    	
											        var s_output = {};

											        s_output._id = value['kdoutput'][0]+"."+value['kdsoutput'][0];

											        s_output.prog = value['kdprogram'][0];

											        s_output.keg = value['kdgiat'][0];

											        s_output.output = value['kdoutput'][0];

											        s_output.soutput = value['kdsoutput'][0];

											        s_output.uraian = value['ursoutput'][0];

											        //save to db
											        //cek jika sdh ada
											        db.connect_db.collection('pok_sub_output').update({_id:s_output._id}, {$set: s_output}, { upsert : true }, function( err, obj ){
											    		if (err) {
											    			console.log(err);
										    				return;
											    		}
											    		//end function with callback
											    		sub_output_child_callback(null, obj);
											    	});
												}
											)	
									    });
									    //setelah dipush, dijalankan satu2
									    async.parallel(tasks, function(err, sub_output_result){
									    	if(err){
									    		console.log(err);
									    		return;
									    	}
									    	db.connect_db.collection('pok_komponen').aggregate([{$group:{_id: "$soutput", total: {$sum: "$jumlah"}}}], function(err, jumlah_komp){
									    		var tasks_jumlah = [];

												jumlah_komp.forEach(function(value, key){
													tasks_jumlah.push(function(callback){
												        db.connect_db.collection('pok_sub_output').update({_id: value._id},{$set: {"jumlah": value.total}}, function( err, obj ){
												        	if (err) {
												    			console.log(err);
											    				return;
												    		}
												    		callback(null, "Ok")
												        });
													})
											    })
												async.parallel(tasks_jumlah, function(err, result){
													if(err){
											    		console.log(err);
											    		return;
											    	}
											        sub_output_parent_callback(err, sub_output_result);
									    			console.log("Sub output finished");
												})
									        })
									    })
									});
								});
						    } catch (e) {
						        throw e;
						    }
						},
						function(komponen_parent_callback, output_parent_callback){
							try {
								//xml string init
					  			var output = ''

					  			//ubah ke stream>buffer>string XML
					    		var stream = archive.stream(output_xml);

					  			stream.on('data', function(buffer){
								  output += buffer.toString();

								});
								//xml to json & update to db
								stream.on('end', function(buffer){
									parseString(output, function (err, result) {
										//Daftar tasks : Inisialisasi
									    var tasks = [];

									    //Iterasi setiap Item
										result.VFPData.c_output.forEach(function(value, key){
											//tambahkan ke tasks
											tasks.push(
												function(output_child_callback){									    	
											        var newOutput = {};

											        newOutput._id = value['kdoutput'][0];

											        newOutput.prog = value['kdprogram'][0];

											        newOutput.keg = value['kdgiat'][0];

											        //Program & Kegiatan
											        function containsObject(id, list){
														var i;

														for (var i = 0; i < list.length; i++) {
															if(list[i].id == id){
																return true;
															}
														}
														return false;
													}
											        if(!containsObject(value['kdgiat'][0], kegiatan)){
											        	kegiatan.push({id: value['kdgiat'][0], prog: value['kdprogram'][0]});
											        	if(!containsObject(value['kdprogram'][0], program)){
												        	program.push({id: value['kdprogram'][0]});
												        }
											        }
											        //save to db
											        //cek jika sdh ada
											    	db.connect_db.collection('pok_output').findOne({_id:newOutput._id}, function(err, result){
											        	if(result){
													    	var old = {};

										        			for( var i in newOutput ){
										        				if( result[i] ){
											        				if( result[i] != newOutput[i] ){
											        					old[i] = result[i];

											        					result[i] = newOutput[i];

											        				}											        					
										        				}
										        			}
										        			if( JSON.stringify(old) != '{}' ){
										        				old.timestamp = result.timestamp;

										        				result.timestamp = current_timestamp;

										        				db.connect_db.collection( 'old_pok_output' ).update( { _id: newOutput._id }, { $push: { history: old } }, { upsert: true }, function( err, obj ){
										        					db.connect_db.collection( 'pok_output' ).save(result, function( err, obj ){
															    		if (err) {
															    			console.log(err);
														    				return;
															    		}
															    		//end function with callback
															    		output_child_callback(null, obj);
															    	});
										        				});
										        			} else{
										        				output_child_callback(null, "None change");
										        			}
											        	} else{
											        		 newOutput.uraian = "(blm ada)";

										        			 newOutput.timestamp = current_timestamp;

											        		 db.connect_db.collection('pok_output').update({_id:newOutput._id}, newOutput, { upsert : true }, function( err, obj ){
													    		if (err) {
													    			console.log(err);
												    				return;
													    		}
													    		//end function with callback
													    		output_child_callback(null, obj);
													    	});
											        	}
											        });
												}
											)	
									    });
									    //setelah dipush, dijalankan satu2
									    async.parallel(tasks, function(err, output_result){
									    	if(err){
									    		console.log(err);
									    		return;
									    	}
									    	db.connect_db.collection('pok_komponen').aggregate([{$group:{_id: "$output", total: {$sum: "$jumlah"}}}], function(err, jumlah_komp){
									    		var tasks_jumlah = [];

												jumlah_komp.forEach(function(value, key){
													tasks_jumlah.push(function(callback){
												        db.connect_db.collection('pok_output').update({_id: value._id},{$set: {"jumlah": value.total}}, function( err, obj ){
												        	if (err) {
												    			console.log(err);
											    				return;
												    		}
												    		callback(null, "Ok")
												        });
													})
											    })
												async.parallel(tasks_jumlah, function(err, result){
													if(err){
											    		console.log(err);
											    		return;
											    	}
											        output_parent_callback(err, output_result);
									    			console.log("Output finished");
												})
									        })
									    })
									});
								});
						    } catch (e) {
						        throw e;
						    }
						},
						function(output_parent_callback, kegiatan_parent_callback){
							//Daftar tasks : Inisialisasi
						    var tasks = [];

						    //Iterasi setiap Item
							kegiatan.forEach(function(value, key){
								//tambahkan ke tasks
								tasks.push(
									function(kegiatan_child_callback){
								        //save to db
								        db.connect_db.collection('pok_kegiatan').findOne({_id:value.id}, function(err, result){
							        		if(!result){
							        			db.connect_db.collection('pok_kegiatan').update({_id: value.id}, {_id:value.id, prog: value.prog, uraian: "(blm ada)"}, { upsert : true }, function( err, obj ){
										    		if (err) {
										    			console.log(err);
									    				return;
										    		}
										    		//end function with callback
										    		kegiatan_child_callback(null, obj);
										    	});
							        		} else{
							        			kegiatan_child_callback(null, "Not changed");
							        		}
							        	})
									}
								)	
						    });
						    //setelah dipush, dijalankan satu2
						    async.parallel(tasks, function(err, kegiatan_result){
						    	if(err){
						    		console.log(err);
						    		return;
						    	}
						    	db.connect_db.collection('pok_output').aggregate([{$group:{_id: "$keg", total: {$sum: "$jumlah"}}}], function(err, jumlah_output){
						    		var tasks_jumlah = [];

									jumlah_output.forEach(function(value, key){
										tasks_jumlah.push(function(callback){
									        db.connect_db.collection('pok_kegiatan').update({_id: value._id},{$set: {"jumlah": value.total}}, function( err, obj ){
									        	if (err) {
									    			console.log(err);
								    				return;
									    		}
									    		callback(null, "Ok")
									        });
										})
								    })
									async.parallel(tasks_jumlah, function(err, result){
										if(err){
								    		console.log(err);
								    		return;
								    	}
								        kegiatan_parent_callback(err, kegiatan_result);
									    console.log("Kegiatan finished");
									})
						        })
						    })
						},
						function(kegiatan_parent_callback, program_parent_callback){
							//Daftar tasks : Inisialisasi
						    var tasks = [];

						    //Iterasi setiap Item
							program.forEach(function(value, key){
								//tambahkan ke tasks
								tasks.push(
									function(program_child_callback){
								        //save to db
								        db.connect_db.collection('pok_program').findOne({_id:value.id}, function(err, result){
							        		if(!result){
							        			db.connect_db.collection('pok_program').update({_id: value.id}, {_id:value.id, uraian: "(blm ada)"}, { upsert : true }, function( err, obj ){
										    		if (err) {
										    			console.log(err);
									    				return;
										    		}
										    		//end function with callback
										    		program_child_callback(null, obj);
										    	});
							        		} else{
							        			program_child_callback(null, "Not changed");
							        		}
							        	})
									}
								)	
						    });
						    //setelah dipush, dijalankan satu2
						    async.parallel(tasks, function(err, program_result){
						    	if(err){
						    		console.log(err);
						    		return;
						    	}
						    	db.connect_db.collection('pok_kegiatan').aggregate([{$group:{_id: "$prog", total: {$sum: "$jumlah"}}}], function(err, jumlah_keg){
						    		var tasks_jumlah = [];

									jumlah_keg.forEach(function(value, key){
										tasks_jumlah.push(function(callback){
									        db.connect_db.collection('pok_program').update({_id: value._id},{$set: {"jumlah": value.total}}, function( err, obj ){
									        	if (err) {
									    			console.log(err);
								    				return;
									    		}
									    		callback(null, "Ok")
									        });
										})
								    })
									async.parallel(tasks_jumlah, function(err, result){
										if(err){
								    		console.log(err);
								    		return;
								    	}
								        program_parent_callback(err, program_result);
									    console.log("Program finished");
									})
						        })
						    })
						}
					], function(err, pok_uploaded){
						console.log("finish upload")
					});
					callback(err, 'ok');
				})
		    });
		}]
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