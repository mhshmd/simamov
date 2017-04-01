//====== MODUL ======//
//load framework express
var express = require('express');
var app = express(); //meload modul express saja
// app.disable('x-powered-by'); //disable response head powered by express

//Security
var helmet = require('helmet');
app.use(helmet());

//Kompresi gzip
var compression = require('compression');
app.use(compression());

//modul morgan utk debug log ke console
var logger = require('morgan');
app.use(logger('dev'));

//modul cookie parser utk mengatur cookie
var cookieParser = require('cookie-parser');
var credentials = require('./credentials.js'); //string acak utk encrypt
app.use(cookieParser(credentials.cookieSecret));

//modul body parser utk mengatur POST request
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//modul formidable utk parse POST gambar
var formidable = require('formidable');

//modul mongodb utk koneksi mongo db keuangan
var mongo = require('mongodb');

//modul sql utk koneksi db mysql sipadu
var mysql = require('mysql');
var connection = mysql.createPool({
	connectionLimit: 50,
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'sipadu_db'
});

//modul session utk tracking visitor
var session = require('express-session');
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: credentials.cookieSecret
}));

//modul handlebars utk dynamic page render
var handlebars = require('express-handlebars').create({defaultLayout: 'main',
	helpers:{
		if_eq: function(a, b, opts) {
		    if (a == b) {
		        return opts.fn(this);
		    } else {
		        return opts.inverse(this);
		    }
		},
		json : function(context) {
		    return JSON.stringify(context);
		},
		"inc" : function(value, options){
		    return parseInt(value) + 1;
		}
	}
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//====== DIRECTORY PUBLIC ACCESS ======//
//dir yg bisa diakses langsung
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/result', express.static(__dirname + '/template/output'));

//====== ROUTES ======//
//Home
var index = require('./controllers/index.js'); //route index
app.use('/', index); //root menggunakan dialihkan ke index.js

//SPPD
var sppd = require('./controllers/sppd.js'); //route index
app.use('/sppd', sppd); //root menggunakan dialihkan ke index.js

//====== ERROR HANDLER ======//
//jika ada error, tampilkan di console
app.use(function(err, req, res, next){
	console.log("Error: "+err.message);
	next(); //diteruskan ke route selanjutnya/ di bawah
});

//route jika halaman tidak ditemukan
app.use(function(req, res){
	res.type('text/html');
	res.status(404);
	res.render('404', {layout: false});
});
//route jika terjadi error di server/bug code
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500', {layout: false});
});

//set port server
app.set('port', process.env.PORT || 3000);
//run server
app.listen(app.get('port'), function(){
	console.log('Server listening on '+app.get('port'));
});