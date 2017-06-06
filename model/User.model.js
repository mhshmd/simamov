var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: String,
    password: String,
    jenis: Number,
    ip_address: String,
    last_login_time: String
}, { collection: 'user' });

UserSchema.methods.isExist = function(cb) {
  return this.model('User').findOne({ _id: this._id }, cb);
};

UserSchema.statics.getAll = function(cb) {
  return this.model('User').find({}, null, {sort: {username:1}}, cb);
};

module.exports = mongoose.model('User', UserSchema);