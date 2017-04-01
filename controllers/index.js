//====== MODUL ======//
//load framework express
var express = require('express');

//buat router khusus index/home
var index = express.Router();

index.get('/', function(req, res){
	res.render('blank', {title: ''})
});

index.get('/home', function(req, res){
	res.render('home', {layout: false, title: "Home"});
});

module.exports = index;