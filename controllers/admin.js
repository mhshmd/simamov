//====== MODUL ======//
//load framework express
var express = require('express');
//buat router khusus admin
var admin = express.Router();

//load model User
var User = require(__dirname+"/../model/User.model");

//load crypto utk hashing password
var crypto = require('crypto');

//route GET /admin
admin.get('/', function(req, res){
	User.find({jenis: 1}, null, {sort: {username:1}}, function(err, adm_user){
		User.find({jenis: 0}, null, {sort: {username:1}}, function(err, editor_user){
			res.render('admin', {layout: false, adm_user: adm_user, editor_user: editor_user});
		});
	});
});
//route tambah user
admin.post('/tambah_user', function(req, res){
	req.body.password = crypto.createHmac('sha256', req.body.password)
                   .digest('hex');
	var user = new User(req.body);
	User.update(
	    {_id: user._id}, 
	    {$setOnInsert: user}, 
	    {upsert: true}, 
	    function(err, numAffected) {
	    	if(err){
	    		res.send('Database bermasalah, mohon hubungi admin');
	    		return;
	    	}
	    	//jika blm ada
	    	if(numAffected.upserted){
	    		res.send('added');
	    	} else{
	    		//jika sudah ada
	    		res.send('existed');
	    	}
	    }
	);
});

//route hapus user
admin.delete('/hapus_user/:username', function(req, res){
	User.remove({_id: req.params.username}, function(err, numAffected){
		if(err){
    		res.send('Database bermasalah, mohon hubungi admin');
    		return;
    	}
    	res.send('Berhasil dihapus.');
	});
});

//route edit user
admin.post('/edit/:username', function(req, res){
	if(req.body.password){
		req.body.password = crypto.createHmac('sha256', req.body.password)
                   .digest('hex');		
	} else delete req.body.password;
	var user = new User(req.body);
	console.log(user)
	User.update(
	    {_id: req.params.username}, 
	    user, 
	    {upsert: false}, 
	    function(err, numAffected) {
	    	if(err){
	    		res.send('Database bermasalah, mohon hubungi admin');
	    		return;
	    	}
	    	res.send('Berhasil diubah.')
	    	console.log(numAffected)
	    }
	);
});

module.exports = admin;