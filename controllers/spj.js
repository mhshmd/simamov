var express = require('express');
var spj = express.Router();

//Flow control
var async = require('async');

//modul fs utk rw file
var fs = require('fs');

//modul formidable utk parse POST file
var formidable = require('formidable');

var csv = require('csvtojson')

// Require library 
var xl = require('excel4node');

const XlsxPopulate = require('xlsx-populate');

//Xlsx to Pdf
var msopdf = require('node-msoffice-pdf');

//Xlsx to Pdf
var msopdf = require('node-msoffice-pdf');

var Pegawai = require(__dirname+"/../model/Pegawai.model");

var CustomEntity = require(__dirname+"/../model/CustomEntity.model");

//Short syntax tool
var _ = require("underscore");

//Socket.io
spj.connections;

spj.io;

spj.socket = function(io, connections){

	spj.connections = connections;

	spj.io = io;

	io.sockets.on('connection', function (client) {
		client.on('init', function (_id, cb) {
		})
	})

}

spj.get('/honor', function(req, res){
	res.render('spj/honor', {layout: false});
});

spj.post('/honor', function(req, res){
	var form = new formidable.IncomingForm();
	var csv_name, file_path, tgl_buat_surat, data = [];

	var file_name = Math.round(new Date().getTime()/1000)+' Honor';

	var periode = '';
	var total_terima = 0;

	async.series([
			function(cb){
				form.parse(req, function(err, fields, file){
					if(err){
						errorHandler(req.session.username, 'Form parse Error. Mohon hubungi admin.');
						return;
					}
					tgl_buat_surat = fields.tgl_buat_surat;
					csv_name = fields.csv_name;
					cb(null, 'File parsed')
				});

				form.on('fileBegin', function (name, file){
					file.path = __dirname+'/../uploaded/csv/'+file.name;
					file_path = file.path;
				})
			},
			function(cb){
				function pushObj(item){
					item.jml_sks = +item.jml_sks;
					item.rate = +item.rate;
					item.bruto = +item.bruto;
					item.pph = +item.pph;
					item.diterima = +item.diterima;
					data.push(item);
					total_terima += item.bruto;
				}

				csv({
					headers: ['unit', 'nmr', 'nama', 'gol', 'jml_sks', 'rate', 'bruto', 'pph', 'diterima']
				})
				.fromFile(file_path)
				.on('json',(item)=>{
					+item.diterima > 0 && pushObj(item);
					if(/^Periode/.test(item.unit)) periode = item.unit;
				})
				.on('done',(error)=>{
					var period_elem = periode.match(/(\d{1,2})\s(\w*)\s(\d{4}).*\,\s(\d{1,2})/);
					periode = period_elem[1] +' - '+ period_elem[4] +' '+ period_elem[2].toUpperCase() +' '+ period_elem[3];
				    cb(null, 'end')
				})
			},
			function(cb){
				// var honor = new HonorDosen(data, cb, res);
				cb(null, 'end');				
			}
		], function(err, final){
			// Load an existing workbook
			XlsxPopulate.fromFileAsync("./template/HonorTemplate.xlsx")
		    .then(workbook => {
		    	var row = 11;
		    	var nmr = 1;
		    	var sum_pos = 11;
		    	_.each(data, function(item, index, list){
		    		var r = workbook.sheet(0).range('A'+row+':J'+row);
		    		if(row  == 32 || row == 61 || (row > 89 && (row % 29 == 3))){
		    			r.value([['',
			    			'Jumlah dipindahkan', 
			    			'', 
			    			'', 
			    			'', 
			    			'', 
			    			'', 
			    			'',
			    			'',
			    			''
			    		]]);
			    		workbook.sheet(0).cell('F'+row).formula('SUM(F'+sum_pos+':F'+(row-1)+')');
			    		workbook.sheet(0).cell('G'+row).formula('SUM(G'+sum_pos+':G'+(row-1)+')');
			    		workbook.sheet(0).cell('H'+row).formula('SUM(H'+sum_pos+':H'+(row-1)+')');
		    			row++;
			    		r = workbook.sheet(0).range('A'+row+':J'+row);
		    			r.value([['',
			    			'Jumlah pindahan', 
			    			'', 
			    			'', 
			    			'', 
			    			'', 
			    			'', 
			    			'',
			    			'',
			    			''
			    		]]);
			    		workbook.sheet(0).cell('F'+row).formula('F'+(row-1));
			    		workbook.sheet(0).cell('G'+row).formula('G'+(row-1));
			    		workbook.sheet(0).cell('H'+row).formula('H'+(row-1));
			    		sum_pos = row;
		    			row++;
		    			r = workbook.sheet(0).range('A'+row+':J'+row);
		    		}
		    		var value = [nmr,
		    			data[index]['nama'], 
		    			data[index]['gol'], 
		    			data[index]['jml_sks'], 
		    			data[index]['rate'], 
		    			data[index]['bruto'], 
		    			data[index]['pph'], 
		    			data[index]['diterima']
		    		];
		    		if(nmr % 2 == 0){
		    			value.push('')
		    			value.push('  '+nmr+'. …..')
		    		} else {
		    			value.push('  '+nmr+'. …..')
		    			value.push('')
		    		}
		    		r.value([value]);
		    		row++;
		    		nmr++;
		    	})
		    	var r = workbook.sheet(0).range('A'+row+':J'+row);
		    	r.value([['',
	    			'JUMLAH', 
	    			'', 
	    			'', 
	    			'', 
	    			'', 
	    			'', 
	    			'',
	    			'',
	    			''
	    		]]);
	    		workbook.sheet(0).cell('F'+row).formula('SUM(F'+sum_pos+':F'+(row-1)+')');
	    		workbook.sheet(0).cell('G'+row).formula('SUM(G'+sum_pos+':G'+(row-1)+')');
	    		workbook.sheet(0).cell('H'+row).formula('SUM(H'+sum_pos+':H'+(row-1)+')');
	    		workbook.sheet(0).cell('I'+row).value(terbilang(total_terima));
	    		var jumlahcells = workbook.sheet(0).range('B'+row+':E'+row);
	    		jumlahcells.merged(true).style('horizontalAlignment', 'center');
	    		r.style({'verticalAlignment': 'center', 'numberFormat': '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)', 'fontSize': 9});
	    		var terb = workbook.sheet(0).range('I'+row+':J'+row);
	    		terb.merged(true).style('wrapText', true);
	    		workbook.sheet(0).row(row).height(78);
	    		var active_rows = workbook.sheet(0).range('A11'+':H'+row);
	    		active_rows.style('border', true)
	    		var ttd_cols1 = workbook.sheet(0).range('I11'+':I'+(row));
	    		ttd_cols1.style({'leftBorder': true, 'rightBorder': false, 'bottomBorder': true, 'topBorder': true})
	    		var ttd_cols2 = workbook.sheet(0).range('J11'+':J'+(row));
	    		ttd_cols2.style({'leftBorder': false, 'rightBorder': true, 'bottomBorder': true, 'topBorder': true})

		    	var r = workbook.sheet(0).range('B'+(row+2)+':H'+(row+8));
		    	r.value([
		    		['Lunas pada tanggal',,'Setuju dibayar',,,,'Jakarta, '+tgl_buat_surat],
		    		['Bendahara Pengeluaran STIS',,'Pejabat Pembuat Komitmen',,,,'Pembuat Daftar,'],
		    		[,,,,,,],
		    		[,,,,,,],
		    		[,,,,,,],
		    		['(ARY WAHYUNI, SST)',,'(INDRA,SSi.)',,,,'(SOFYAN AYATULLOH, SST)'],
		    		['NIP. 198301022200701007',,'NIP. 196103181986011001',,,,'NIP. 197208221994121001'],
		    		]);
		    	r.style('fontSize', 11)

		    	workbook.definedName("periode").value(periode)	        
		        return workbook.toFileAsync('./temp_file/'+file_name+'.xlsx');
		    }).then(data => {
		    	msopdf(null, function(error, office) {
					var input = './temp_file/'+file_name+'.xlsx';//__dirname + '/../temp_file/'+file_name+'.xlsx';
					var output = './template/output/'+file_name+'.pdf';//__dirname + '/../temp_file/'+file_name+'.pdf';

					office.excel({'input': input, 'output': output}, function(error, pdf) {
				    	if (err) {
					        console.error(err);
					    }
					    //hapus xlsx setelah terconvert
				    	fs.unlink(input);
					})

					office.close(null, function(error) {
						// res.download(output);
						res.send(file_name+'.pdf');
						// res.on('finish', function() {
							//hapus pdf setelah didownload
							// fs.unlink(output);
						// });
					})
					
				})

	            // Set the output file name.
	            // res.attachment(file_name+".xlsx");
	            
	            // Send the workbook. 
	            // res.send(data);
	        })





			// res.send('ok');
		}
	)
});

spj.get('/transport', function(req, res){
	res.render('spj/transport', {layout: false});
});

spj.post('/transport', function(req, res){
	var form = new formidable.IncomingForm();
	var csv_name, file_path, tgl_buat_surat, data = [];

	var file_name = Math.round(new Date().getTime()/1000)+' Transport';

	var periode = '';
	var total_terima = 0;

	async.series([
			function(cb){
				form.parse(req, function(err, fields, file){
					if(err){
						errorHandler(req.session.username, 'Form parse Error. Mohon hubungi admin.');
						return;
					}
					tgl_buat_surat = fields.tgl_buat_surat;
					csv_name = fields.csv_name;
					cb(null, 'File parsed')
				});

				form.on('fileBegin', function (name, file){
					file.path = __dirname+'/../uploaded/csv/'+file.name;
					file_path = file.path;
				})
			},
			function(cb){
				function pushObj(item){
					item.jumlah = +item.jumlah;
					data.push(item);
				}

				csv({
					headers: ['unit', 'nmr', 'nama', 'gol', 'jumlah']
				})
				.fromFile(file_path)
				.on('json',(item)=>{
					(+item.jumlah > 0 && item.unit != 'STIS') && pushObj(item);
					if(/^Periode/.test(item.unit)) periode = item.unit;
				})
				.on('done',(error)=>{
					var period_elem = periode.match(/(\d{1,2})\s(\w*)\s(\d{4}).*\,\s(\d{1,2})/);
					periode = period_elem[1] +' - '+ period_elem[4] +' '+ period_elem[2].toUpperCase() +' '+ period_elem[3];
				    cb(null, 'end')
				})
			},
			function(cb){
				// var honor = new HonorDosen(data, cb, res);
				cb(null, 'end');				
			}
		], function(err, final){
			// Load an existing workbook
			XlsxPopulate.fromFileAsync("./template/TransportTemplate.xlsx")
		    .then(workbook => {
		    	var row = 12;
		    	var nmr = 1;
		    	var sum_pos = 12;
		    	_.each(data, function(item, index, list){
		    		var r = workbook.sheet(0).range('A'+row+':H'+row);
		    		if(row  == 33 || row == 61 || (row > 89 && (row % 29 == 3))){
		    			r.value([['',
			    			'Jumlah dipindahkan', 
			    			'', 
			    			'', 
			    			'', 
			    			'',
			    			'', 
			    			''
			    		]]);
			    		workbook.sheet(0).cell('E'+row).formula('SUM(E'+sum_pos+':E'+(row-1)+')');
			    		workbook.sheet(0).cell('F'+row).formula('SUM(F'+sum_pos+':F'+(row-1)+')');
			    		workbook.sheet(0).cell('B'+row).style('horizontalAlignment', 'center');
			    		workbook.sheet(0).row(row).height(24);
		    			row++;
			    		r = workbook.sheet(0).range('A'+row+':H'+row);
		    			r.value([['',
			    			'Jumlah pindahan', 
			    			'', 
			    			'', 
			    			'', 
			    			'',
			    			'', 
			    			''
			    		]]);
			    		workbook.sheet(0).cell('E'+row).formula('E'+(row-1));
			    		workbook.sheet(0).cell('F'+row).formula('F'+(row-1));
			    		workbook.sheet(0).cell('B'+row).style('horizontalAlignment', 'center');
			    		sum_pos = row;
			    		workbook.sheet(0).row(row).height(24);
		    			row++;
		    			r = workbook.sheet(0).range('A'+row+':H'+row);
		    		}
		    		var value = [nmr,
		    			data[index]['nama'], 
		    			data[index]['gol'], 
		    			data[index]['jumlah'], 
		    			150000,
		    			''
		    		];
			    	total_terima += (data[index]['jumlah'] * 150000);
		    		if(nmr % 2 == 0){
		    			value.push('')
		    			value.push('  '+nmr+'. …..')
		    		} else {
		    			value.push('  '+nmr+'. …..')
		    			value.push('')
		    		}
		    		r.value([value]);
		    		workbook.sheet(0).cell('F'+row).formula('D'+row+'*E'+row);
		    		workbook.sheet(0).cell('A'+row).style('horizontalAlignment', 'center')
		    		workbook.sheet(0).cell('C'+row).style('horizontalAlignment', 'center')
		    		workbook.sheet(0).cell('D'+row).style('horizontalAlignment', 'center')
			    	workbook.sheet(0).row(row).height(24);
		    		row++;
		    		nmr++;
		    	})
		    	var r = workbook.sheet(0).range('A'+row+':H'+row);
		    	r.value([['',
	    			'JUMLAH', 
	    			'', 
	    			'', 
	    			'', 
	    			'', 
	    			''
	    		]]);
	    		workbook.sheet(0).cell('D'+row).formula('SUM(D'+sum_pos+':D'+(row-1)+')').style('horizontalAlignment', 'center');
	    		workbook.sheet(0).cell('E'+row).formula('SUM(E'+sum_pos+':E'+(row-1)+')');
	    		workbook.sheet(0).cell('F'+row).formula('SUM(F'+sum_pos+':F'+(row-1)+')');
	    		workbook.sheet(0).cell('G'+row).value(terbilang(total_terima));
	    		var jumlahcells = workbook.sheet(0).range('B'+row+':C'+row);
	    		jumlahcells.merged(true).style('horizontalAlignment', 'center');
	    		// r.style({'verticalAlignment': 'center', 'fontSize': 9});
	    		var terb = workbook.sheet(0).range('G'+row+':H'+row);
	    		terb.merged(true).style('wrapText', true);
	    		workbook.sheet(0).row(row).height(40.50);
	    		var active_rows = workbook.sheet(0).range('A12'+':H'+row);
	    		active_rows.style({'border': true, 'fontSize': 9, 'verticalAlignment': 'center'})
	    		var ttd_cols1 = workbook.sheet(0).range('G12'+':G'+(row));
	    		ttd_cols1.style({'leftBorder': true, 'rightBorder': false, 'bottomBorder': true, 'topBorder': true, 'fontSize': 9, 'verticalAlignment': 'center'})
	    		var ttd_cols2 = workbook.sheet(0).range('H12'+':H'+(row));
	    		ttd_cols2.style({'leftBorder': false, 'rightBorder': true, 'bottomBorder': true, 'topBorder': true, 'fontSize': 9, 'verticalAlignment': 'center'})


	    		var format_uang = workbook.sheet(0).range('E12'+':F'+(row+1));
	    		format_uang.style('numberFormat', '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)')

		    	var r = workbook.sheet(0).range('B'+(row+2)+':F'+(row+8));
		    	r.value([
		    		['Lunas pada tanggal','Setuju dibayar',,,'Jakarta, '+tgl_buat_surat],
		    		['Bendahara Pengeluaran STIS','Pejabat Pembuat Komitmen',,,'Pembuat Daftar,'],
		    		[,,,,],
		    		[,,,,],
		    		[,,,,],
		    		['(ARY WAHYUNI, SST)','(INDRA,SSi.)',,,'(SOFYAN AYATULLOH, SST)'],
		    		['NIP. 198301022200701007','NIP. 196103181986011001',,,'NIP. 197208221994121001'],
		    		]);
		    	r.style('fontSize', 11);

		    	workbook.sheet(0).range('C'+(row+2)+':E'+(row+2)).merged(true);
		    	workbook.sheet(0).range('C'+(row+3)+':E'+(row+3)).merged(true);
		    	workbook.sheet(0).range('C'+(row+7)+':E'+(row+7)).merged(true);
		    	workbook.sheet(0).range('C'+(row+8)+':E'+(row+8)).merged(true);

		    	workbook.sheet(0).range('C'+(row+2)+':C'+(row+8)).style('horizontalAlignment', 'center');


		    	workbook.definedName("periode").value(periode)	        
		        return workbook.toFileAsync('./temp_file/'+file_name+'.xlsx');
		    }).then(data => {
		    	msopdf(null, function(error, office) {
					var input = './temp_file/'+file_name+'.xlsx';//__dirname + '/../temp_file/'+file_name+'.xlsx';
					var output = './template/output/'+file_name+'.pdf';//__dirname + '/../temp_file/'+file_name+'.pdf';

					office.excel({'input': input, 'output': output}, function(error, pdf) {
				    	if (err) {
					        console.error(err);
					    }
					    //hapus xlsx setelah terconvert
				    	fs.unlink(input);
					})

					office.close(null, function(error) {
						// res.download(input);
						res.send(file_name+'.pdf');
						res.on('finish', function() {
							// hapus pdf setelah didownload
							// fs.unlink(output);
						});
					})
					
				})

	            // Set the output file name.
	            // res.attachment(file_name+".xlsx");
	            
	            // Send the workbook. 
	            // res.send(data);
	        })





			// res.send('ok');
		}
	)
});

function terbilang(bilangan) {
  bilangan    = String(bilangan);
  var angka   = new Array('0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0');
  var kata    = new Array('','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan');
  var tingkat = new Array('','Ribu','Juta','Milyar','Triliun');

  var panjang_bilangan = bilangan.length;

  /* pengujian panjang bilangan */
  if (panjang_bilangan > 15) {
    kaLimat = "Diluar Batas";
    return kaLimat;
  }

  /* mengambil angka-angka yang ada dalam bilangan, dimasukkan ke dalam array */
  for (i = 1; i <= panjang_bilangan; i++) {
    angka[i] = bilangan.substr(-(i),1);
  }

  i = 1;
  j = 0;
  kaLimat = "";


  /* mulai proses iterasi terhadap array angka */
  while (i <= panjang_bilangan) {

    subkaLimat = "";
    kata1 = "";
    kata2 = "";
    kata3 = "";

    /* untuk Ratusan */
    if (angka[i+2] != "0") {
      if (angka[i+2] == "1") {
        kata1 = "Seratus";
      } else {
        kata1 = kata[angka[i+2]] + " Ratus";
      }
    }

    /* untuk Puluhan atau Belasan */
    if (angka[i+1] != "0") {
      if (angka[i+1] == "1") {
        if (angka[i] == "0") {
          kata2 = "Sepuluh";
        } else if (angka[i] == "1") {
          kata2 = "Sebelas";
        } else {
          kata2 = kata[angka[i]] + " Belas";
        }
      } else {
        kata2 = kata[angka[i+1]] + " Puluh";
      }
    }

    /* untuk Satuan */
    if (angka[i] != "0") {
      if (angka[i+1] != "1") {
        kata3 = kata[angka[i]];
      }
    }

    /* pengujian angka apakah tidak nol semua, lalu ditambahkan tingkat */
    if ((angka[i] != "0") || (angka[i+1] != "0") || (angka[i+2] != "0")) {
      subkaLimat = kata1+" "+kata2+" "+kata3+" "+tingkat[j]+" ";
    }

    /* gabungkan variabe sub kaLimat (untuk Satu blok 3 angka) ke variabel kaLimat */
    kaLimat = subkaLimat + kaLimat;
    i = i + 3;
    j = j + 1;

  }

  /* mengganti Satu Ribu jadi Seribu jika diperlukan */
  if ((angka[5] == "0") && (angka[6] == "0")) {
    kaLimat = kaLimat.replace("Satu Ribu","Seribu");
  }
  kaLimat = kaLimat.replace(/\s+/g, " ") + "Rupiah";

  // kaLimat = kaLimat.replace(/\s+Rupiah$/, " Rupiah")

  return kaLimat.replace(/^\s/g, "");
}

function errorHandler(username, message){
	if(_.isString(username)) pok.connections[username].emit('messages', message)
		else username.emit('messages', message)
}

function sendNotification(username, message){
	if(_.isString(username)) pok.connections[username].emit('messages', message)
		else username.emit('messages', message)
}

module.exports = spj;

// var honor_wb = new xl.Workbook({
// 				defaultFont: {
// 			        size: 9
// 			    }
// 			});
			 
// 			// Add Worksheets to the workbook 
// 			var ws = honor_wb.addWorksheet('Honor', {
// 				'pageSetup': {
// 					'orientation': 'landscape',
// 					'paperSize': 'LETTER_PAPER'
// 				}
// 			});
			 
// 			// Create a reusable style 
// 			var kop = honor_wb.createStyle({
// 			    font: {
// 			        size: 11
// 			    }, 
// 			    alignment: {
// 			        wrapText: true,
// 			        horizontal: 'left',
// 			        vertical: 'center'
// 			    }
// 			    // border: {
// 			    // 	left: {
// 			    // 		style: 'thin'
// 			    // 	},
// 			    // 	right: {
// 			    // 		style: 'thin'
// 			    // 	},
// 			    // 	top: {
// 			    // 		style: 'thin'
// 			    // 	},
// 			    // 	bottom: {
// 			    // 		style: 'thin'
// 			    // 	},
// 			    // }
// 			});

// 			//width
// 			ws.column(1).setWidth(5);
// 			ws.column(2).setWidth(28);
// 			ws.column(3).setWidth(4);
// 			ws.column(4).setWidth(10);
// 			ws.column(5).setWidth(14);
// 			ws.column(6).setWidth(15);
// 			ws.column(7).setWidth(15);
// 			ws.column(8).setWidth(15);
// 			ws.column(9).setWidth(16);
// 			ws.column(10).setWidth(17);

// 			//kop
// 			ws.cell(1,2).string('DAFTAR').style(kop);
// 			ws.cell(1,3, 1, 10, true).string('HONORARIUM DOSEN DAN ASISTEN DOSEN SEKOLAH TINGGI ILMU STATISTIK SEMESTER GENAP TAHUN 2016/2017 (STIS)').style(kop);
// 			// ws.cell(4,2).string('uraian').style(kop);
// 			// ws.cell(4,3).string('vol').style(kop);
// 			// ws.cell(4,4).string('sat').style(kop);
// 			// ws.cell(4,5).string('hargasat').style(kop);
// 			// ws.cell(4,6).string('jumlah').style(kop);
// 			// ws.cell(4,7).string('PENGELUARAN').style(kop);
// 			// ws.cell(4,8, 5, 8, true).string('REALISASI BULAN LALU').style(kop);
// 			// ws.cell(4, 9, 4, 10, true).string('REALISASI S/D BULAN INI').style(kop);
// 			// ws.cell(5,9).string('(Rp)').style(kop);
// 			// ws.cell(5,10).string('%').style(kop);
// 			// ws.cell(4,11, 5, 11, true).string('SISA DANA (RP)').style(kop);

// 			var file_name = Math.round(new Date().getTime()/1000)+' Honor';

// 			honor_wb.write(file_name+'.xlsx', res)