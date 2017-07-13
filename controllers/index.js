//====== MODUL ======//
//load framework express
var express = require('express');

//buat router khusus index/home
var index = express.Router();

var Setting = require(__dirname+"/../model/Setting.model");

index.get('/', function(req, res){
	res.render('blank', {display_name: req.session.username});
});

index.get('/home', function(req, res){
	Setting.findOne({type:'pok'}, function(err, pok_setting){
		if(pok_setting) res.render('pok/pok', {layout: false, pok_name: pok_setting.toObject().name, title: "Home"});
			else res.render('pok/pok', {layout: false, pok_name: 'Noname', title: "Home"});
	})
});

module.exports = index;