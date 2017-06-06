//====== MODUL ======//
//load framework express
var express = require('express');
//buat router khusus logout
var logout = express.Router();
//route GET /logout
logout.get('/', function(req, res){
	req.session.destroy();
	res.redirect('login');
});

module.exports = logout;