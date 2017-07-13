var async = require('async');

// var stack = [];

// var functionOne = function(callback){
// 	//perform action
// 	console.log("Ambil data pegawai");
// 	callback(null, "Ambil data pegawai");
// 	// callback("Error", null);
// }

// var functionTwo = function(callback){
// 	//perform action
// 	setTimeout(function(){
// 	console.log("Ambil data pengaturan sppd");
// 		callback(null, "Ambil data pengaturan sppd");
// 	}, 5000)
// }

// var functionThree = function(callback){
// 	//perform action
// 	console.log("Ambil data surat sppd");
// 	callback(null, "Ambil data surat sppd");
// }

// stack.push(functionOne);
// stack.push(functionTwo);
// stack.push(functionThree);

// async.parallel(stack, function(err, result){
// 	console.log(result);
// })

// var stack = {};

// stack.getUserName = function(callback){
// 	var userName = 'Bob';
// 	callback(null, userName)
// }

// stack.getUserAge = function(callback){
// 	var userAge = 23;
// 	callback(null, userAge)
// }

// stack.getGender = function(callback){
// 	var gender = 'Male';
// 	callback(null, gender)
// }
// //////////////
// async.parallel(stack, function(err, result){
// 	if(err){
// 		console.err(err);
// 		return;
// 	}

// 	console.log(result.getUserAge);
// })
// //////////////
// var stack = [];

// var functionOne = function(callback){
// 	//perform action
// 	console.log("Ambil data pegawai");
// 	callback(null, "Ambil data pegawai");
// 	// callback("Error", null);
// }

// var functionTwo = function(pegawai, callback){
// 	//perform action
// 	setTimeout(function(){
// 	console.log("Ambil data pengaturan sppd");
// 		callback(null, pegawai + "Ambil data pengaturan sppd");
// 	}, 5000)
// }

// var functionThree = function(sppd_setting, callback){
// 	//perform action
// 	console.log("Ambil data surat sppd");
// 	callback(null, sppd_setting + "Ambil data surat sppd");
// }

// stack.push(functionOne);
// stack.push(functionTwo);
// stack.push(functionThree);

// async.waterfall(stack, function(err, result){
// 	if(err){
// 		console.error(err);
// 		return;
// 	}
// 	console.log(result);
// })

// var surats = ['a', 'b', 'c', 'd', 'e'];

// var createSurat = function(id, callback){
// 	console.log('Surat '+id+' telah dibuat...');
// 	callback(null, id+' finished');
// }

// async.times(surats.length, function(n, next){
// 	console.log(n)
// 	createSurat(n, function(err, entry){
// 		console.log(n+'. Blalalaskksk')
// 		next(err, entry);
// 	})
// }, function(err, entries){
// 	if(err) return;
// 	console.log(entries);
// })


async.auto({
	login: function(callback){
		callback("Suksesn login", null);
		return;
		callback(null, "Suksesn login");
	},
	kerja: function(callback){
		callback(null, "Ok, so now you work???")
	},
	connect: ['kerja', function(result, callback){
		callback("ok",null);
	}]
}, function(err, result){
	console.log(result);
})