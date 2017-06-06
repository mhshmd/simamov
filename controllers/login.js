//====== MODUL ======//
//load framework express
var express = require('express');
//load crypto utk hashing password
var crypto = require('crypto');
//load model User
var User = require(__dirname+"/../model/User.model");
//buat router khusus login
var login = express.Router();
//route GET /login
login.get('/', function(req, res){
	var href = '';
	if(req.query.href){
		href = '?href='+req.query.href;
	}
	res.render('login', {layout: false, href: href});
});
//route POST /login
login.post('/', function(req, res){
	//hashing pass utk pengecekan
	var hash = crypto.createHmac('sha256', req.body.password)
                   .digest('hex');
	//cek login ke db
	User.findOne({ '_id':  req.body.username, 'password': hash}, function (err, user) {
		if (err) {
			//jika koneksi error
			res.send('Database bermasalah, mohon hubungi admin');
			return;
		} else if(!user){
			//jika user tdk ada
			var href = '';
			if(req.query.href){
				href = '?href='+req.query.href;
			}
			res.render('login', {layout: false, href: href, message: 'User atau password salah'});
			return;
		}
		//simpan session utk nama & tahun anggaran
		req.session.username = req.body.username;
		req.session.tahun_anggaran = req.body.tahun_anggaran;
		//ke home
		if(!req.query.href) req.query.href = ''
			else req.query.href = '#'+req.query.href
		res.redirect('/'+req.query.href);
		//update user sikap
    	User.update({_id: req.body.username}, {ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress, last_login_time: formatDate(new Date())}, function(err, raw){
    		console.log(raw);
    	})
	});
});



function formatDate(date) {
  var monthNames = [
    "Januari", "Februari", "Maret",
    "April", "Mei", "Juni", "Juli",
    "Agustus", "September", "Oktober",
    "November", "Desember"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var min = date.getMinutes();
  var hour = date.getHours();

  return hour + ':' + min + ' ' + day + ' ' + monthNames[monthIndex] + ' ' + year;
}

module.exports = login;