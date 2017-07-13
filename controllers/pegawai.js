var express = require('express');
var pegawai = express.Router();

//Flow control
var async = require('async');

var Pegawai = require(__dirname+"/../model/Pegawai.model");

var CustomEntity = require(__dirname+"/../model/CustomEntity.model");

//Short syntax tool
var _ = require("underscore");

//modul sql utk koneksi db mysql sipadu
var mysql = require('mysql');
var sipadu_db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'sipadu_db'
});

sipadu_db.connect();

//Socket.io
pegawai.connections;

pegawai.io;

pegawai.socket = function(io, connections){
	pegawai.connections = connections;

	pegawai.io = io;

	io.sockets.on('connection', function (client) {
		client.on('pegawai_init', function (tab) {
			if(tab == 'stis'){
				var kode_dosen = ['init'];
				Pegawai.find().sort('nama').exec(function(err, pegs){
					var nomor = 1;
					_.each(pegs, function(peg, i, list){
						if(peg.kode_dosen) kode_dosen.push(peg.kode_dosen);
					});
					var query = 'SELECT * ' +
								'FROM dosen ' +
								'WHERE unit = ? AND kode_dosen NOT IN (?) ORDER BY nama';
					sipadu_db.query(query, ['STIS', kode_dosen], function (err, dosens, fields) {
							if (err){
							  	console.log(err)
							  	return;
							}
							_.each(dosens, function(dos, i, list){
								var row = [
									nomor,
									dos.nama,
									dos.kode_dosen,
									dos.pangkat || '-',
									dos.gol_pajak || '-',
									'<button type="button" class="link-sipadu"><i class="icon-link"></i></button>'
									+' <button type="button" class="riwayat-pgw"><i class="icon-list"></i></button>',
									dos.kode_dosen
								]
								nomor++;
								client.emit('pegawai_init_response', {'row': row, unit: 'pegawai_stis'});
								if(i == dosens.length - 1) client.emit('pegawai_init_finish', 'pegawai_stis');
							});
							_.each(pegs, function(peg, i, list){
								var row = [
									nomor,
									peg.nama,
									peg._id,
									peg.jabatan,
									peg.gol,
									'<button type="button" class="hapus-pgw"><i class="icon-close"></i></button>'
									+' <button type="button" class="riwayat-pgw"><i class="icon-list"></i></button>',
									peg.kode_dosen || 'none'
								]
								nomor++;
								client.emit('pegawai_init_response', {'row': row, unit: 'pegawai_stis'});
								if(i == pegs.length - 1) client.emit('pegawai_init_finish', 'pegawai_stis');
							});
					})

				});
			} else if(tab == 'bps'){
				var query = 'SELECT * ' +
							'FROM dosen ' +
							'WHERE unit = ? AND kode_dosen NOT IN (?)';
				CustomEntity.find({type: 'Penerima', unit: 'BPS'}).sort('nama').exec(function(err, bpspeg){
					var kode_dosen = ['init'];
					_.each(bpspeg, function(peg, i, list){
						if(peg.kode_dosen) kode_dosen.push(peg.kode_dosen);
						var row = [
							i+1,
							peg.nama,
							peg._id,
							peg.jabatan || '-',
							peg.gol || '-',
							peg.ket || '-',
							'<button type="button" class="hapus-pgw"><i class="icon-close"></i></button>'
							+' <button type="button" class="riwayat-pgw"><i class="icon-list"></i></button>',
							peg.kode_dosen || 'none'
						]
						client.emit('pegawai_init_response', {'row': row, unit: 'pegawai_bps'});
						if(i == custs.length - 1) client.emit('pegawai_init_finish', 'pegawai_bps');
					});
					console.log(kode_dosen)
					sipadu_db.query(query, ['BPS', kode_dosen], function (err, dosens, fields) {
						if (err){
						  	console.log(err)
						  	return;
						}
						_.each(dosens, function(dos, i, list){
							var row = [
								i+1,
								dos.nama,
								dos.kode_dosen,
								dos.pangkat,
								dos.gol_pajak,
								'<button type="button" class="link-sipadu"><i class="icon-link"></i></button>'
								+' <button type="button" class="riwayat-pgw"><i class="icon-list"></i></button>',
								dos.kode_dosen || 'none'
							]
							client.emit('pegawai_init_response', {'row': row, unit: 'pegawai_bps'});
							if(i == dosens.length - 1) client.emit('pegawai_init_finish', 'pegawai_bps');
						});
					})
				});
				
			} else {
				CustomEntity.find({type: 'Penerima', unit: { $exists: false }}).sort('nama').exec(function(err, custs){
					_.each(custs, function(cust, i, list){
						var ket = '-';
						if(cust.unit) ket = 'Dosen '+(cust.unit||'Luar');
						var row = [
							i+1,
							cust.nama,
							cust._id,
							cust.jabatan || '-',
							cust.gol || '-',
							ket,
							'<button type="button" class="hapus-pgw"><i class="icon-close"></i></button>'
							+' <button type="button" class="riwayat-pgw"><i class="icon-list"></i></button>',
							cust.kode_dosen || 'none'
						]
						client.emit('pegawai_init_response', {'row': row, unit: 'non_stis_bps'});
						if(i == custs.length - 1) client.emit('pegawai_init_finish', 'non_stis_bps');
					});
				});
			}
			
		});

		client.on('jab_list', function (data, cb) {
			Pegawai.find().distinct('jabatan', function(error, jabs) {
				cb(jabs);
			})
		})

		client.on('gol_list', function (data, cb) {
			Pegawai.find().distinct('gol', function(error, gols) {
				cb(gols);
			})
		})

		client.on('edit_pegawai', function (data, cb) {
			Pegawai.update({_id: data._id}, {[data.field]: data.value}, function(err, status) {
				if (err) {
	    			cb('gagal');
	    			return
	    		}
				cb('sukses');
			})
		})

		client.on('hapus_pegawai', function (_id, cb) {
			Pegawai.remove({'_id': _id}, function(err, status) {
				if (err) {
	    			cb('gagal');
	    			return
	    		}

	    		if(!status.result.n){
	    			CustomEntity.remove({ type: 'Penerima' , $or: [{'_id': _id}, {'kode_dosen': _id}]}, function(err, status) {
	    				cb('sukses');
	    			})
	    		} else {
	    			cb('sukses');
	    		}				
			}) 
		})
	})

}

pegawai.get('/', function(req, res){
	res.render('pegawai/pegawai', {layout: false});
});

pegawai.post('/ajax/edit', function(req, res){

	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
		} else{
			var jenis = req.body.jenis;

			var value = req.body.new_value;

			if(jenis == "jabatan"){
				console.log(value);
				value = value.replace(/(,\s*|\s*,)/g, ",");
				console.log(value);
				value = value.split(',');
			}
			db.collection('pegawai').update({"nip": req.body.nip}, {$set:{[jenis]:value}}, function(err, result){
				if(err){
					console.error(err);
					return;
				} 
				res.end('sukses');
			})
			
			db.close();
		}
	});
});

function errorHandler(username, message){
	if(_.isString(username)) pok.connections[username].emit('messages', message)
		else username.emit('messages', message)
}

function sendNotification(username, message){
	if(_.isString(username)) pok.connections[username].emit('messages', message)
		else username.emit('messages', message)
}

module.exports = pegawai;