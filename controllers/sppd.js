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

//Mongo db
var mongodb = require('mongodb');
var url = 'mongodb://127.0.0.1:27017/simamov_2017';

//PDF Merge
var PDFMerge = require('pdf-merge');
var pdftkPath = 'C:\\Program Files (x86)\\PDFtk Server\\bin\\pdftk.exe';

//Docx to Pdf
var msopdf = require('node-msoffice-pdf');
// var sppdPerhitungan = fs.readFileSync(__dirname+"/../template/sppd_perhitungan.docx","binary");

//Angular advanced docx parser
var expressions= require('angular-expressions');
expressions.filters.format_uang = function(input) {
    // This condition should be used to make sure that if your input is undefined, your output will be undefined as well and will not throw an error
    if(!input) return input;
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
expressions.filters.transportasi_riil = function(input) {
    // This condition should be used to make sure that if your input is undefined, your output will be undefined as well and will not throw an error
    if(!input) return input;

     return "Transport Lokal";
}
var angularParser = function(tag) {
    return {
        get: tag === '.' ? function(s){ return s;} : expressions.compile(tag)
    };
}

function forceInt(x){
    if(!x) x = '0';
    return parseInt(x.replace(/\D/g, ""));
}

// sppd.get('/region', function(req, res){

// 	async.auto({

// 		connectDB: function(callback){

// 			var MongoClient = mongodb.MongoClient;

// 			MongoClient.connect(url, function(err, db){

// 				if(err){

// 					console.log('Unable to connect to server');

// 					return;

// 				} else{

// 					callback(null, db);

// 				}

// 			})

// 		},

// 		getAllRegion: ['connectDB', function(result, callback){

// 			result.connectDB.collection('wilayah').find({}).sort({nama:1}).toArray(function(err, wilayah){

// 				if(err){

// 					console.error(err);

// 					return;

// 				}

// 				callback(null, wilayah);

// 				wilayah.forEach(function(prov, key){
// 					prov.regencies.forEach(function(kab, key){

// 						kab.provinsi = prov.name;

// 						// console.log(result.connectDB);

// 						result.connectDB.collection('kabupaten').insert(kab);

// 					})
// 				})

// 			});

// 		}],

// 	}, function(err, result){

// 		res.send("ok");

// 		console.log()

// 	})

// })

sppd.get('/surat_tugas', function(req, res){

	async.auto({

		connectDB: function(callback){

			var MongoClient = mongodb.MongoClient;

			MongoClient.connect(url, function(err, db){

				if(err){

					console.log('Unable to connect to server');

					return;

				} else{

					callback(null, db);

				}

			})

		},

		getSPPDSettings: ['connectDB', function(result, callback){

			result.connectDB.collection('pengaturan').findOne({'type': 'sppd'}, function(err, result){

				if(err){

					console.error(err);

					return;

				}

				callback(null, result);

			});

		}],

		getPenandaTanganST: ['connectDB', 'getSPPDSettings', function(result, callback){

			var sppd_ttdSuratT = result.getSPPDSettings.ttd_surat_tugas.map(function(a) {return a.nip;});

			result.connectDB.collection('pegawai').find({'nip':{ $in : sppd_ttdSuratT }}).sort({nama:1}).toArray(function(err, result){

				if(err){

					console.error(err);

					return;

				}

				callback(null, result);

			})
		}],

		getPenandaTanganLegal: ['connectDB', 'getSPPDSettings', function(result, callback){

			var sppd_ttdLegal = result.getSPPDSettings.ttd_legalitas.map(function(a) {return a.nip;});

			result.connectDB.collection('pegawai').find({'nip':{ $in : sppd_ttdLegal }}).sort({nama:1}).toArray(function(err, result){
				
				if(err){
					
					console.error(err);

					return;

				}

				callback(null, result);

			})

		}]

	}, function(err, result){

		if(err){

			res.sendStatus(500);

			return;

		}

		res.render('sppd/surat_tugas', {layout: false, topic: "Surat Tugas", ttdST: result.getPenandaTanganST, 
			ttdL: result.getPenandaTanganLegal, ppk: result.getSPPDSettings.ppk, 
			last_nomor: result.getSPPDSettings.last_nomor+1, st: result.getSPPDSettings.ttd_st_default, 
			l: result.getSPPDSettings.ttd_l_default});
		
		result.connectDB.close();

	})

});

sppd.post('/surat_tugas', function(req, res){
	var sppdTemplate = fs.readFileSync(__dirname+"/../template/sppd.docx","binary");

	var last_nomor = parseInt(req.body.nomor.match(/^\d{1,5}/));

	var nama = req.body.nama_lengkap.split('#');

	async.auto({

		connectDB: function(callback){

			var MongoClient = mongodb.MongoClient;

			MongoClient.connect(url, function(err, db){

				if(err){

					console.log('Unable to connect to server');

					return;

				} else{

					callback(null, db);

				}

			})

		},

		getPegawai: ['connectDB', function(result, callback){

			console.log(">>>>>>>>", nama);

			result.connectDB.collection('pegawai').find({nama : {$in: nama}},{jabatan:1, gol: 1, nip: 1, sppd_surat:1, _id:0}).sort({nama:1}).toArray(function(err, result){

				if(err){

					console.error(err);

					return;

				}

				callback(null, result);

			});

		}],

		generateSuratDocx: ['connectDB', 'getPegawai', function(result, callback){

				var dt = new Date();

				var lokasi_ = req.body.kab+', '+req.body.prov;

				if(!(req.body.kab && req.body.prov)){
					lokasi_ = req.body.kab+req.body.prov;
				}

				var atas_nama_ketua_stis = "";

				if(req.body.ttd_surat_tugas_jabatan !== "Ketua STIS"){
					atas_nama_ketua_stis = "A.n. Ketua Sekolah Tinggi Ilmu Statistik";
				} else{
					req.body.ttd_surat_tugas_jabatan = "Ketua Sekolah Tinggi Ilmu Statistik";
				}

				var pdfNames = [];
				var outputDocx = [];

				var data = {
				    tahun_ini: dt.getFullYear(),
				    type: "surat tugas",
				    tugas: req.body.tugas,
				    lokasi: lokasi_,
				    prov : req.body.prov,
				    tgl_berangkat: req.body.tgl_berangkat,
				    tgl_kembali: req.body.tgl_kembali,
				    jumlah_hari: req.body.jumlah_hari,
				    jenis_ang: req.body.jenis_ang,
				    ttd_surat_tugas: req.body.ttd_surat_tugas,
				    ttd_legalitas: req.body.ttd_legalitas,
				    tgl_ttd_st: req.body.tgl_ttd_st,
				    tgl_ttd_ppk: req.body.tgl_ttd_ppk,
				    output: req.body.output,
				    atas_nama_ketua_stis: atas_nama_ketua_stis,
				    ttd_surat_tugas_jabatan: req.body.ttd_surat_tugas_jabatan,
				    ttd_surat_tugas_nip: req.body.ttd_surat_tugas_nip,
				    ppk_nip: req.body.ppk_nip,
				    ppk_nama: req.body.ppk_nama,
				    kode_output: req.body.kode_output,
				    ttd_legalitas_jabatan: req.body.ttd_legalitas_jabatan,
				    ttd_legalitas_nip: req.body.ttd_legalitas_nip
				};

				result.getPegawai.forEach(function(value,key){

					var zip = new JSZip(sppdTemplate);
					var doc = new Docxtemplater().loadZip(zip);

					data._id = last_nomor+key;
				    data.nomor_surat= last_nomor+key;
				    data.nama_lengkap= nama[key];
				    data.jabatan= value.jabatan[value.sppd_surat];
				    data.gol= value.gol;
				    data.nip= value.nip;

					result.connectDB.collection('sppd').save(data);

					result.connectDB.collection('pengaturan').update({type:'sppd'}, {$set:{last_nomor: data._id}});

					doc.setData(data);

					doc.render();

					var buf = doc.getZip()
					             .generate({type:"nodebuffer"});

					outputDocx[key] = __dirname+"/../template/output/sppd/"+data.nomor_surat+"-SPD-STIS-"+data.tahun_ini+"-"+data.nama_lengkap+".docx";

					fs.writeFileSync(outputDocx[key],buf);

					pdfNames[key] = __dirname+"/../template/output/sppd/"+data.nomor_surat+"-SPD-STIS-"+data.tahun_ini+"-"+data.nama_lengkap+".pdf";

				});

				callback(null, {pdfNames: pdfNames, outputDocx: outputDocx});
							
				result.connectDB.close();

			}

		],

		docx_to_pdf: ['generateSuratDocx', function(result, callback){

			msopdf(null, function(error, office) {
				result.generateSuratDocx.outputDocx.forEach(function(value, key){
					office.word({input: value, output: result.generateSuratDocx.pdfNames[key]}, function(error, pdf) {
				      if (error) {
				        	res.send("Error");
				       } else { 
				       		fs.unlink(result.generateSuratDocx.outputDocx[key]);
				       }
				   });
				});

				office.close(null, function(error) { 
			       if (error) { 
			           console.log("Woops", error);
			       } else {

				       	if(result.generateSuratDocx.pdfNames.length == 1){

				       		res.send({last_nomor: last_nomor+result.generateSuratDocx.pdfNames.length, result: '/result/'
				       			+result.generateSuratDocx.pdfNames[0].match(/(?=sppd).*/)[0]});

				       		return;

				       	}

				       	console.log(">>>>>>>>>>>>>>>>>", result);

						var pdfMerge = new PDFMerge(result.generateSuratDocx.pdfNames, pdftkPath);

						pdfMerge.asBuffer().merge(function(error, buffer) {
						  	fs.writeFileSync(__dirname+"/../template/output/sppd/"+"/merged.pdf", buffer);

							res.send({last_nomor: last_nomor+result.generateSuratDocx.pdfNames.length, 
								result: "/result/sppd/merged.pdf"});

						});

			       	}
			   });
			});

		}]

	}, function(err, result){

		if(err){

			res.sendStatus(500);

			return;

		}

		// res.send({last_nomor: last_nomor+result.pdfNames.length, result: "/result/sppd/merged.pdf"});

	});
	
});

sppd.post('/surat_tugas_biasa', function(req, res){
	var sppd_biasa_template = fs.readFileSync(__dirname+"/../template/sppd_biasa.docx","binary");

	var last_nomor = parseInt(req.body.nomor.match(/\d{1,5}$/));

	var anggota = req.body.anggota.split('#').map(function(a) {return {nama: a};});

	var lembar2 = req.body.anggota.split('#').map(function(a) {return {nama: a};});

	lembar2.push({nama: "Supir"});

	lembar2.push({nama: "Supir"});

	console.log(lembar2);

	async.auto({

		connectDB: function(callback){

			var MongoClient = mongodb.MongoClient;

			MongoClient.connect(url, function(err, db){

				if(err){

					console.log('Unable to connect to server');

					return;

				} else{

					callback(null, db);

				}

			})

		},

		getPegawai: ['connectDB', function(result, callback){

			result.connectDB.collection('pegawai').findOne({nama : req.body.nama_lengkap},{jabatan:1, gol: 1, nip: 1, sppd_surat:1, _id:0}, function(err, result){

				if(err){

					console.error(err);

					return;

				}

				callback(null, result);

			});

		}],

		generateSuratDocx: ['connectDB', 'getPegawai', function(result, callback){

				var dt = new Date();

				var atas_nama_ketua_stis = "";

				if(req.body.ttd_surat_tugas_jabatan !== "Ketua STIS"){
					atas_nama_ketua_stis = "A.n. Ketua Sekolah Tinggi Ilmu Statistik";
				} else{
					req.body.ttd_surat_tugas_jabatan = "Ketua Sekolah Tinggi Ilmu Statistik";
				}

				var pdfNames = "";
				var outputDocx = "";

				var data = {
				    tahun_ini: dt.getFullYear(),
				    type: "surat tugas biasa",
				    tugas: req.body.tugas,
				    lokasi: req.body.lokasi,
				    waktu_pelaksanaan: req.body.waktu_pelaksanaan,
				    ttd_surat_tugas: req.body.ttd_surat_tugas,
				    ttd_legalitas: req.body.ttd_legalitas,
				    tgl_ttd_st: req.body.tgl_ttd_st,
				    output: req.body.output,
				    atas_nama_ketua_stis: atas_nama_ketua_stis,
				    ttd_surat_tugas_jabatan: req.body.ttd_surat_tugas_jabatan,
				    ttd_surat_tugas_nip: req.body.ttd_surat_tugas_nip,
				    ttd_legalitas_jabatan: req.body.ttd_legalitas_jabatan,
				    ttd_legalitas_nip: req.body.ttd_legalitas_nip
				};

				var zip = new JSZip(sppd_biasa_template);
				var doc = new Docxtemplater().loadZip(zip);

				data._id = last_nomor;
			    data.nomor= last_nomor;
			    data.nama_lengkap= req.body.nama_lengkap;
			    data.jabatan= result.getPegawai.jabatan[result.getPegawai.sppd_surat];
			    data.gol= result.getPegawai.gol;
			    data.nip= result.getPegawai.nip;
			    data.anggota= anggota;
			    data.lembar2= lembar2;

				result.connectDB.collection('sppd').save(data);

				result.connectDB.collection('pengaturan').update({type:'sppd'}, {$set:{last_nomor: data._id}});

				doc.setData(data);

				doc.render();

				var buf = doc.getZip()
				             .generate({type:"nodebuffer"});

				outputDocx = __dirname+"/../template/output/sppd_biasa/02722."+data.nomor+"-"+data.nama_lengkap+".docx";

				fs.writeFileSync(outputDocx,buf);

				pdfNames = __dirname+"/../template/output/sppd_biasa/02722."+data.nomor+"-"+data.nama_lengkap+".pdf";
				callback(null, {pdfNames: pdfNames, outputDocx: outputDocx});
							
				result.connectDB.close();

			}

		],

		docx_to_pdf: ['generateSuratDocx', function(result, callback){
			msopdf(null, function(error, office) {
				office.word({input: result.generateSuratDocx.outputDocx, output: result.generateSuratDocx.pdfNames}, function(error, pdf) {
			      if (error) {
			        	res.send("Error");
			       } else { 
			       		fs.unlink(result.generateSuratDocx.outputDocx);
			       }
			   });

				office.close(null, function(error) { 
			       if (error) { 
			           console.log("Woops", error);
			       } else {

				       	res.send({last_nomor: last_nomor+result.generateSuratDocx.pdfNames.length, result: '/result/'
				       			+result.generateSuratDocx.pdfNames.match(/(?=sppd).*/)[0]});

			       	}
			   });
			});

		}]

	}, function(err, result){

		if(err){

			res.sendStatus(500);

			return;

		}

		// res.send({last_nomor: last_nomor+result.pdfNames.length, result: "/result/sppd/merged.pdf"});

	});
	
});

sppd.get('/surat_tugas_biasa', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = db.collection('pengaturan');

			collection.find({'type': 'sppd'}).toArray(function(err, setting){
				if(err){
					console.error(err);
					return;
				}

				var sppd_ttdSuratT = setting[0].ttd_surat_tugas.map(function(a) {return a.nip;});

				var sppd_ttdLegal = setting[0].ttd_legalitas.map(function(a) {return a.nip;});

				var collection = db.collection('pegawai');

				collection.find({'nip':{ $in : sppd_ttdSuratT }}).sort({nama:1}).toArray(function(err, result1){
					if(err){
						console.error(err);
						return;
					}

					collection.find({'nip':{ $in : sppd_ttdLegal }}).toArray(function(err, result2){
						if(err){
							console.error(err);
							return;
						} 

						res.render('sppd/surat_tugas_biasa', {layout: false, ttdST: result1, ttdL: result2, last_nomor: setting[0].last_nomor+1, st: setting[0].ttd_st_default, 
			l: setting[0].ttd_l_default});

						db.close();
					})

				})

			})
		}
	});
});

sppd.get('/perhitungan', function(req, res){
	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{
			var sppd = db.collection('sppd');

			sppd.find({type: {$ne: "surat tugas biasa"}}).toArray(function(err, result){
				if(err){
					console.error(err);
					return;
				}
				db.collection('pengaturan').findOne({type:'sppd'},function(err, result2){
					if(err){
						console.error(err);
						return;
					}

					res.render('sppd/perhitungan', {layout: false, surat: result, bendahara: result2.bendahara});
				});
			});
		}		
	});
});

sppd.post('/perhitungan', function(req, res){
	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			db.collection('sppd').findOne({_id : parseInt(req.body.nomor)}, function(err, result){
					if(err){
						console.error(err);
						return;
					}

					result.t_dari_t4_asal = req.body.t_dari_t4_asal;
					result.t_dari_t4_tujuan = req.body.t_dari_t4_tujuan;
					result.total_terbilang = req.body.total_terbilang;

					result.jumlah_menginap = req.body.jumlah_menginap;
					result.biaya_inap = req.body.biaya_inap;
					result.totalb_inap = req.body.totalb_inap;
					result.total_riil = req.body.total_riil;
					result.tgl_hari_ini = req.body.tgl_hari_ini;
					result.bendahara_nama = req.body.bendahara_nama;
					result.bend_nip = req.body.bend_nip;

					result.harga_tiket = parseInt(req.body.harga_tiket.replace(/\D/g, ""))
					result.harian_hari = req.body.harian_hari;
					result.harian_biaya = req.body.harian_biaya;
					result.harian_total = req.body.harian_total;
					result.hotel_hari = req.body.hotel_hari;
					result.hotel_biaya = req.body.hotel_biaya;
					result.hotel_total = req.body.hotel_total;

					result.total_rincian = req.body.total_rincian;
					result.total_rincian_terbilang = req.body.total_rincian_terbilang;

					result.tabel_perincian = [];

					var nomor = 2;
					if(forceInt(req.body.harga_tiket) > 0){
						result.tabel_perincian.push({
							"no":nomor,
							"pb": "Tiket "+result.jenis_ang,
							detail: "",
							"jumlah": req.body.harga_tiket
						})

						nomor += 1;
					}

					result.tabel_perincian.push({
						"no":nomor,
						"pb": "Uang harian",
						"detail": req.body.harian_hari+" hari @ Rp "+req.body.harian_biaya,
						"jumlah": req.body.harian_total
					})

					nomor += 1;	

					if(req.body.hotel_total > 0){			

						result.tabel_perincian.push({
							"no":nomor,
							"pb": "Hotel",
							"detail": req.body.hotel_hari+" hari @ Rp. "+req.body.hotel_biaya,
							"jumlah": req.body.hotel_total
						})

						nomor += 1;	

					}				

					result.tabel_perincian.push({
						"no":nomor,
						"pb": "Biaya pengeluaran riil",
						"detail": "",
						"jumlah": req.body.total_riil
					})

					result.tabel_riil = []; 

					var no = 1;
					if(result.prov == "DKI Jakarta"){
						result.tabel_riil.push({
							"no":no,
							"label":"Transport Lokal",
							"jumlah": req.body.t_dari_t4_asal
						})

						no += 1;
					} else{

						result.tabel_riil.push({
							"no":no,
							"label":"Transport Lokal dari tempat asal",
							"jumlah": req.body.t_dari_t4_asal
						});

						no += 1;

						result.tabel_riil.push({
							"no":no,
							"label":"Transport Lokal ke tempat tujuan",
							"jumlah": req.body.t_dari_t4_tujuan
						});

						no += 1;

					}

					if(req.body.totalb_inap > 0){
						result.tabel_riil.push({
							"no":no,
							"label":"B. Penginapan "+req.body.jumlah_menginap+" hari @ "+req.body.biaya_inap+" × 30%",
							"jumlah": req.body.totalb_inap
						})
					}

					
					var sppdPerhitungan = fs.readFileSync(__dirname+"/../template/sppd_perhitungan.docx","binary");

					var zip = new JSZip(sppdPerhitungan);
					var doc = new Docxtemplater().loadZip(zip).setOptions({parser:angularParser});

					doc.setData(result);

					doc.render();

				    result.type = "perhitungan";

					db.collection('sppd').save(result);

					var buf = doc.getZip()
					             .generate({type:"nodebuffer"});

					outputDocx = __dirname+"/../template/output/perhitungan/"+result.nomor_surat+"-Perhitungan-SPD-STIS-"+result.tahun_ini+"-"+result.nama_lengkap+".docx";

					fs.writeFileSync(outputDocx,buf);

					msopdf(null, function(error, office) {
						var pdfNames = __dirname+"/../template/output/perhitungan/"+result.nomor_surat+"-Perhitungan-SPD-STIS-"+result.tahun_ini+"-"+result.nama_lengkap+".pdf";
						office.word({input: outputDocx, output: pdfNames}, function(error, pdf) {
					      if (error) {
					        	res.send("Error");
					       } else { 
					       		fs.unlink(outputDocx);
					       }
					    });
						office.close(null, function(error) { 
					       if (error) { 
					           console.log("Woops", error);
					       } else {
								res.send({result: "/result/perhitungan/"+result.nomor_surat+"-Perhitungan-SPD-STIS-"+result.tahun_ini+"-"+result.nama_lengkap+".pdf"});

								db.collection('sppd').update({_id : result.nomor_surat}, {$set : {done : 1}})
									
								db.close();
					       }
					   });
					});

			})
		}
	});
});

sppd.post('/perhitungan/load', function(req, res){
	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{
			var sppd = db.collection('sppd');

			sppd.findOne({_id : parseInt(req.body.nomor)}, function(err, result){
				if(err){
					console.error(err);
					return;
				}

				db.collection('wilayah').findOne({_id : 'Dki Jakarta'}, function(err, result2){
					if(err){
						console.error(err);
						return;
					}

					result.biaya_inap = "170000";

					res.send(result);
					db.close();
				});
			});
		}		
	});
});

sppd.post('/perhitungan/biaya/:jenis', function(req, res){
	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{
			db.collection('wilayah').findOne({label : req.body.label}, function(err, result){
				if(err){
					console.error(err);
					return;
				}

				res.send(result);
				db.close();
			});
		}		
	});
});

sppd.get('/pengaturan', function(req, res){
	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = db.collection('pengaturan');

			collection.find({'type': 'sppd'}).toArray(function(err, result){
				if(err){
					console.error(err);
						return;
				}

				var sppd_ttdSuratT = result[0].ttd_surat_tugas.map(function(a) {return a.nip;});

				var sppd_ttdLegal = result[0].ttd_legalitas.map(function(a) {return a.nip;});

				var collection = db.collection('pegawai');

				collection.find({'nip':{ $in : sppd_ttdSuratT }}).sort({nama:1}).toArray(function(err, result1){
					if(err){
						console.error(err);
						return;
					}

					collection.find({'nip':{ $in : sppd_ttdLegal }}).toArray(function(err, result2){
						if(err){
							console.error(err);
						} else if(result.length){

							res.render('sppd/pengaturan', {layout: false, ttdST: result1, ttdL: result2, 
								ppk: result[0].ppk, bendahara: result[0].bendahara,
								st: result[0].ttd_st_default, l: result[0].ttd_l_default});
							db.close();
						}
					})

				})

			})
		}
	});
});

sppd.get('/pengaturan/ajax', function(req, res){
	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			if(req.query.tabId == 'tiketPesawatTab'){

				db.collection('kabupaten').find({"tiket_jkt_b": {$exists: true}}).sort({label:1}).toArray(function(err1, result5){
					if(err1){
						console.error(err1);
						return;
					} 
					res.render('sppd/pengaturan/tiket', {layout: false, kota: result5});
					db.close();
				})

			} else if(req.query.tabId == 'jabPegTab'){

				db.collection('pegawai').find({$where: "this.jabatan.length > 1"}).sort({nama:1}).toArray(function(err, result3){
					if(err){
						console.error(err1);
						return;
					} 
					res.render('sppd/pengaturan/jabpegawai', {layout: false, pegawai: result3});
					db.close();
				})

			} else if(req.query.tabId == 'biaya2Tab'){

				db.collection('wilayah').find({}).sort({label:1}).toArray(function(err1, result4){
					if(err1){
						console.error(err1);
						return;
					} 
					res.render('sppd/pengaturan/biaya2', {layout: false, provinsi: result4});
					db.close();
				})

			}
		}
	});
});

sppd.post('/pengaturan/:add', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = db.collection('pegawai');

			if(req.params.add == 'st'){
				collection.update({'nama': req.body.nama}, {$set: {sppd_st_index: 0}}, function(err, result){
					if(err){
						console.error(err);
							return;
					}

					res.end('ok')
				});
			} else if(req.params.add == 'l'){
				collection.update({'nama': req.body.nama}, {$set: {sppd_l_index: 0}}, function(err, result){
					if(err){
						console.error(err);
							return;
					}

					res.end('ok')
				});
			}

			console.log(req.params.add);

			collection.findOne({'nama': req.body.nama}, function(err, result){
				if(err || !result){
					console.error(err);
					return;
				}

				
				MongoClient.connect(url, function(err, db){
					if(err){
						console.log('Unable to connect to server');
						return;
					}

					var collection = db.collection('pengaturan');

					if(req.params.add == 'st'){
						collection.update({'type': 'sppd'}, {$push : {"ttd_surat_tugas": {"nip" : result.nip}}}, function(err1, result2){
							if(err){
								console.error(err1);
								return;
							}
							res.end('sukses');
						});
					} else if (req.params.add == 'l'){
						collection.update({'type': 'sppd'}, {$push : {"ttd_legalitas": {"nip" : result.nip}}}, function(err1, result2){
							if(err){
								console.error(err1);
								return;
							}
							res.end('sukses');
						});

					} else if (req.params.add == 'ppk'){
						collection.update({'type': 'sppd'}, {$set: {ppk: {"nip" : result.nip, "nama" : result.nama}}}, function(err1, result2){
							if(err){
								console.error(err1);
								return;
							}
							res.end('sukses');
						});
					} else if (req.params.add == 'bendahara'){
						collection.update({'type': 'sppd'}, {$set: {bendahara: {"nip" : result.nip, "nama" : result.nama}}}, function(err1, result2){
							if(err){
								console.error(err1);
								return;
							}
							res.end('sukses');
						});
					}
					
				})



			});
		}

		db.close();
	})
});

sppd.post('/pengaturan/biaya/:jenis', function(req, res){
			 	console.log('>>>>>>>>>>>>>>>>>>>>>>>');

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
			return;
		} else{
			 if(req.params.jenis == "tiket_jkt_b" ||req.params.jenis == "tiket_jkt_e"){
				var jenis = req.params.jenis;
				var value = req.body.price;
				db.collection('kabupaten').update({"name": req.body.name}, {$set:{[jenis]:value}}, function(err, result){
					if(err){
						console.error(err);
						return;
					} 
					res.end('sukses');
				})		
			} else if(req.params.jenis != "tiket_jkt"){
				var jenis = req.params.jenis;
				var value = req.body.price;
				db.collection('wilayah').update({"name": req.body.name}, {$set:{[jenis]:value}}, function(err, result){
					if(err){
						console.error(err);
						return;
					} 
					res.end('sukses');
				})	
			} else if(req.params.jenis == "tiket_jkt"){
				db.collection('kabupaten').update({"label": req.body.label}, {$set:{"tiket_jkt_b" : req.body.harga_b, "tiket_jkt_e" : req.body.harga_e}}, function(err, result){
					if(err){
						console.error(err);
						return;
					} 
					res.end('sukses');
				})	
			}			
		}
	});
});

sppd.post('/pengaturan/index/:jenis', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = db.collection('pegawai');

			if(req.params.jenis == 'ttdST'){
				collection.update({"nip": req.body.nip},{$set: {'sppd_st_index': req.body.index}}), function(err, result){
					if(err){
						console.error(err);
						return;
					}
				}
			} else if(req.params.jenis == 'ttdL'){
				collection.update({"nip": req.body.nip},{$set: {'sppd_l_index': req.body.index}}), function(err, result){
					if(err){
						console.error(err);
						return;
					}
				}
			} else if(req.params.jenis == 'sppd_surat'){
				collection.update({"nip": req.body.nip},{$set: {'sppd_surat': req.body.index}}), function(err, result){
					if(err){
						console.error(err);
						return;
					}
				}
			}
		}
		db.close();
	});	

	res.end('ok');
})

sppd.post('/pengaturan/:action/:jenis', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = db.collection('pengaturan');

			if(req.params.action == 'del'){

				if(req.params.jenis == 'ttdST'){
					collection.update({"type": 'sppd'},{$pull: {'ttd_surat_tugas': {nip: req.body.nip}}}), function(err, result){
						if(err){
							console.error(err);
							return;
						}
					}
				} else if(req.params.jenis == 'ttdL'){
					collection.update({"type": 'sppd'},{$pull: {'ttd_legalitas': {nip: req.body.nip}}}), function(err, result){
						if(err){
							console.error(err);
							return;
						}
					}
				}

			} else if(req.params.action == 'default'){

				if(req.params.jenis == 'ttdST'){
					collection.update({"type": 'sppd'},{$set: {'ttd_st_default': {nip: req.body.nip}}}), function(err, result){
						if(err){
							console.error(err);
							return;
						}
					}
				} else if(req.params.jenis == 'ttdL'){
					collection.update({"type": 'sppd'},{$set: {'ttd_l_default': {nip: req.body.nip}}}), function(err, result){
						if(err){
							console.error(err);
							return;
						}
					}
				}

			}

		}
		db.close();
	});	

	res.end('ok');
})

sppd.post('/pengaturan/index/:jenis', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = db.collection('pegawai');

			if(req.params.jenis == 'ttdST'){
				collection.update({"nip": req.body.nip},{$set: {'sppd_st_index': req.body.index}}), function(err, result){
					if(err){
						console.error(err);
						return;
					}
				}
			} else if(req.params.jenis == 'ttdL'){
				collection.update({"nip": req.body.nip},{$set: {'sppd_l_index': req.body.index}}), function(err, result){
					if(err){
						console.error(err);
						return;
					}
				}
			} else if(req.params.jenis == 'sppd_surat'){
				collection.update({"nip": req.body.nip},{$set: {'sppd_surat': req.body.index}}), function(err, result){
					if(err){
						console.error(err);
						return;
					}
				}
			}
		}
		db.close();
	});	

	res.end('ok');
})

sppd.post('/ajax/nama_lengkap', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = db.collection('pegawai');

			collection.find({"nama": {$regex: req.body.phrase, $options:"i"}},{nama:1, _id:0}).sort({nama:1}).toArray(function(err, result){
				if(err){
					console.error(err);
				} else if(result.length){
					res.send(result);
				} else{
					res.send('kosong');
				}

				db.close();
			})
		}
	});
});

sppd.get('/ajax/:coll', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{

			var collection = null;

			if(req.params.coll == "pegawai"){
				collection = db.collection('pegawai');

				collection.find({"nama": {$regex: req.query.query, $options:"i"}},{nama:1, _id:0}).limit(5).sort({nama:1}).toArray(function(err, result){
					if(err){
						console.error(err);
					} else if(result.length){
						res.send(JSON.stringify(result));
					} else{
						res.send('kosong');
					}
				})
			} else if(req.params.coll == "pok_komponen"){
				collection = db.collection('pok_komponen');

				collection.find({"uraian": {$regex: req.query.query, $options:"i"}},{uraian:1, _id:1}).limit(5).toArray(function(err, result){
					if(err){
						console.error(err);
					} else if(result.length){
						res.send(JSON.stringify(result));
					} else{
						res.send('kosong');
					}
				})
			} else if(req.params.coll == "provinsi"){
				collection = db.collection('wilayah');

				collection.find({"label": {$regex: req.query.query, $options:"i"}},{label:1, _id:0}).limit(5).toArray(function(err, result){
					if(err){
						console.error(err);
					} else if(result.length){
						res.send(JSON.stringify(result));
					} else{
						res.send('kosong');
					}
				})
			} else if(req.params.coll == "kabupaten"){
				collection = db.collection('kabupaten');

				collection.find({"label": {$regex: req.query.query, $options:"i"}}, {'label':1, _id:0}).limit(15).toArray(function(err, result){
					if(err){
						console.error(err);
					} else if(result.length){
						res.send(JSON.stringify(result));
					} else{
						res.send('kosong');
					}
					console.log(result)
				})
				
			}
			db.close();
		}
	});
});

module.exports = sppd;