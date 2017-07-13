var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TestSchema = new Schema({
    numb: Number
}, { collection: 'Test' });

TestSchema.methods.isExist = function(cb) {
  return this.model('Test').findOne({ _id: this._id }, cb);
};

TestSchema.statics.getAll = function(cb) {
  return this.model('Test').find({}, null, {sort: {nama:1}}, cb);
};

// a setter
TestSchema.path('numb').set(function (x) {
	if(!x) x = '0';
	return parseInt(x.replace(/\D/g, ""));
});

// middleware
TestSchema.pre('save', function (next) {
  console.log('Im about to saving')
  next();
});

module.exports = mongoose.model('Test', TestSchema);