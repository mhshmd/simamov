use simamov;
// show collections
// db.user.remove({jenis:0})
// db.user.find({})
// db.user.insert({_id: 'admin', password: '9a9e0d33fa0d884224f816e2e9691ee9267208399d18d17095253555791fa975', display_name: "Admin"})
// db.surat_tugas.findOne();

// db.old_pok_detailBelanja.drop()
// db.old_pok_akun.drop()
// db.old_pok_sub_komponen.drop()
// db.old_pok_komponen.drop()
// db.old_pok_sub_output.drop()
// db.old_pok_output.drop()
// db.old_pok_kegiatan.drop()
// db.old_pok_program.drop()
// show collections
// db.sppd.findOne({})

// db.pok_detailBelanja.drop()
// db.pok_akun.drop()
// db.pok_sub_komponen.drop()
// db.pok_komponen.drop()
// db.pok_sub_output.drop()
// db.pok_output.drop()
// db.pok_kegiatan.drop()
// db.pok_program.drop()
// db.custom_entity.drop()
// db.pegawai.drop()
// db.setting.drop()

// db.custom_entity.find().pretty()
// db.pegawai.find({}).length()
db.setting_sppd.find().pretty()
// db.pok_uraian_akun.find().pretty()
// db.pok_detailBelanja.findOne()
// db.pok_akun.findOne({'kdkmpnen': '002'})
// db.pok_sub_komponen.findOne()
// db.pok_komponen.findOne()
// db.pok_sub_output.findOne()
// db.pok_output.findOne()
// db.pok_kegiatan.find()
// db.pok_program.find()
// db.kab.drop()

// db.old_pok_detailBelanja.find()
// db.old_pok_akun.findOne({'kdkmpnen': '002'})
// db.old_pok_sub_komponen.findOne()
// db.old_pok_komponen.findOne()
// db.old_pok_sub_output.findOne()
// db.old_pok_output.findOne()
// db.old_pok_kegiatan.findOne()
// db.old_pok_program.findOne() 1498667824 1498588982518

// db.pok_detailBelanja.aggregate(
//    [
//      {
//        $group:
//          {
//          	_id: {'kd':"$kdprogram", 'act':"$active"},
//            totalAmount: { $sum: "$jumlah" }
//          }
//      }
//    ]
// )

// show collections
// pok_detailBelanja v
// pok_akun
// pok_komponen v
// pok_output
// pok_kegiatan
// pok_program

// {
// 	"_id" : "521211.1",
// 	"version" : "1",
// 	"version_comment" : "Original",
// 	"create_date" : ISODate("2017-03-15T17:08:44.215Z"),
// 	"uraian" : "konsumsi seminar proposal penelitian (Snack)",
// 	"vol" : 675,
// 	"sat" : "O-K",
// 	"hrg_satuan" : 100000,
// 	"jlh" : 67500000,
// 	"old_ver" : [ ]
// }