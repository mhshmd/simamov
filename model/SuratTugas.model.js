var fs = require('fs');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SuratTugasSchema = new Schema({
    "_id" : Number,
    "tahun" : Number,

    "tugas" : String,
    "output" : String,
    "kode_output" : String,

    "org" : String,
    "prov" : String,
    "kab" : String,

    "tgl_berangkat" : String,
    "tgl_kembali" : String,
    "jumlah_hari" : Number,

    "jenis_ang" : String,

    "ttd_surat_tugas" : String,
    "ttd_legalitas" : String,
    "tgl_ttd_st" : String,
    "tgl_ttd_ppk" : String,

    "ttd_surat_tugas_jabatan" : String,
    "ttd_surat_tugas_nip" : String,

    "ppk_nip" : String,
    "ppk_nama" : String,

    "ttd_legalitas_jabatan" : String,
    "ttd_legalitas_nip" : String,

    "nama_lengkap" : String,
    "jabatan" : String,
    "gol" : String,
    "nip" : String,
    "created_date": {
        type: Date,
        default: Date.now,
        
    }
}, { collection: 'surat_tugas' });

SuratTugasSchema.virtual('nomor_surat').get(function () {
  return this._id + '/SPD/STIS/' + this.tahun;
});

SuratTugasSchema.virtual('atas_nama_ketua_stis').get(function () {
    var atas_nama_ketua_stis = "";

    if(this.ttd_surat_tugas_jabatan !== "Ketua STIS"){
        atas_nama_ketua_stis = "A.n. Ketua Sekolah Tinggi Ilmu Statistik";
    } else{
        this.ttd_surat_tugas_jabatan = "Ketua Sekolah Tinggi Ilmu Statistik";
    }
    return atas_nama_ketua_stis;
});

SuratTugasSchema.virtual('lokasi').get(function () {

    var lokasi_ = [];

    if(this.org){
        lokasi_.push(this.org);
    }

    if (this.kab) {
        lokasi_.push(this.kab)
    }

    if (this.prov) {
        lokasi_.push(this.prov)
    }

    return lokasi_.join(", ");

});

SuratTugasSchema.statics.getAll = function(cb) {
  return this.model('SuratTugas').find({}, null, {sort: {_id:1}}, cb);
};

SuratTugasSchema.methods.getSurat = function () {
    var sppdTemplate = fs.readFileSync(__dirname+"/../template/surat_tugas.docx","binary");


    return fileName;
}

module.exports = mongoose.model('SuratTugas', SuratTugasSchema);