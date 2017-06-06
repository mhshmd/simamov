var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SPPDQuickSearchSchema = new Schema({
    query: String
}, { collection: 'sppd_organisasi_qs' });

SPPDQuickSearchSchema.methods.isExist = function(cb) {
  return this.model('SPPDQuickSearch').findOne({ query: this.query }, cb);
};

SPPDQuickSearchSchema.statics.getAll = function(cb) {
  return this.model('SPPDQuickSearch').find({}, cb);
};

module.exports = mongoose.model('SPPDQuickSearch', SPPDQuickSearchSchema);