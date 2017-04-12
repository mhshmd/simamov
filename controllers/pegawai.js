var express = require('express');
var pegawai = express.Router();

//Flow control
var async = require('async');

//Mongo db
var mongodb = require('mongodb');

var url = 'mongodb://127.0.0.1:27017/simamov_2017';

pegawai.get('/', function(req, res){
	var MongoClient = mongodb.MongoClient;

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server');
			return;
		}
		db.collection('pegawai').find({}).sort({nama:1}).toArray(function(err, pegawai){
			res.render('pegawai/pegawai', {layout: false, peg: pegawai});
		})
	})
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

module.exports = pegawai;