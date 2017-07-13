var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SettingSchema = new Schema({
    'type': String
}, { collection: 'setting', strict: false });

module.exports = mongoose.model('Setting', SettingSchema);