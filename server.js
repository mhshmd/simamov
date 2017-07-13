//====== MODUL ======//
//load framework express
var express = require('express');
var app = express(); //meload modul express saja

var server = require('http').createServer(app);  
var io = require('socket.io')(server);
//clients connection
var connections = {};

// //Redis utk cache request client
// var redis = require('redis');
// //creates a new client
// var client = redis.createClient(); 

require('dotenv').config();

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

//modul mongodb utk koneksi mongo db keuangan
var mongo = require('mongodb');

var url = 'mongodb://127.0.0.1:27017/simamov';

var mongoose = require('mongoose');

mongoose.connect(url);

//modul session utk tracking visitor
var session = require('express-session')({
	resave: false,
	saveUninitialized: true,
	secret: credentials.cookieSecret
});
var sharedsession = require("express-socket.io-session");
app.use(session);
io.use(sharedsession(session, {
    autoSave:true
})); 

//modul handlebars utk dynamic page render
var handlebars = require('express-handlebars').create({defaultLayout: 'main',
	helpers:{
		if_eq: function(a, b, opts) {
		    if (a == b) {
		    	// console.log('booooooooooom')
		        return opts.fn(this);
		    } else {
		    	// console.log('sssssssssssss booooooooooom')
		        return opts.inverse(this);
		    }
		},
		if_neq: function(a, opts) {
		    if ( !(a == 'tanpa sub komponen' || a == 'tanpa sub output') ) {
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
		},
		"fullYear" : function(){
			return (new Date()).getFullYear();
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
var login = require('./controllers/login.js'); //route index
app.use('/login', login); //root menggunakan dialihkan ke index.js

//cek login, urutan harus di bawah route login
var login_check = function (req, res, next) {
	// if(!req.session.username){

	// 	res.set('login', '0')
	// 	res.render('login', {layout: false});
	// 	return;
	// }
	io.on('connection', function(client) {
		if(req.session)
			connections[req.session.username] = client;
	})

  	next()
}

app.use(login_check)

//Home
var index = require('./controllers/index.js'); //route index
app.use('/', index); //root menggunakan dialihkan ke index.js

//SPPD
var sppd = require('./controllers/sppd.js');
sppd.socket(io, connections);
app.use('/sppd', sppd); 
//SPJ
var spj = require('./controllers/spj.js');
spj.socket(io, connections);
app.use('/spj', spj);
//PEGAWAI
var pegawai = require('./controllers/pegawai.js');
pegawai.socket(io, connections);
app.use('/pegawai', pegawai);
//POK
var pok = require('./controllers/pok.js');
pok.socket(io, connections);
app.use('/pok', pok);
//ADMIN
var admin = require('./controllers/admin.js');
app.use('/admin', admin);
//LOGOUT
var logout = require('./controllers/logout.js');
app.use('/logout', logout);

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

server.listen(process.env.PORT || 3000, function(){
	console.log('Server listening on '+(process.env.PORT || 3000));
});

io.on('connection', function(client) {

	// if(!client.handshake.session.username){

	// 	client.emit('login_required', 'Anda harus login.');
	// 	return;

	// }

	client.on('join', function(data) {
    	console.log(data);
    	client.emit('messages', 'Terhubung ke server.');
    });
})