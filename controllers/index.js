//====== MODUL ======//
//load framework express
var express = require('express');

//buat router khusus index/home
var index = express.Router();

index.get('/', function(req, res){
	res.render('blank', {display_name: req.session.username});
});

index.get('/home', function(req, res){
	res.render('pok/pok', {layout: false, title: "Home"});
});

module.exports = index;