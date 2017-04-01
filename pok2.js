use simamov_2017;

db.pok_program.insert([{
	_id: '054.01.01',
	version: '2',
	version_comment: 'Revised 1',
	create_date: new Date(),
	uraian: 'Program Dukungan Manajemen dan Pelaksanaan Tugas Teknis Lainnya BPS',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	kegiatan: ['2888'],
	old_ver:[{
		version: '1',
		version_comment: 'Original',
		create_date: new Date()
	}]
}]);

db.pok_kegiatan.insert([{
	_id: '2888',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'Penyelenggaraan Sekolah Tinggi Ilmu Statistik (STIS)',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	output: ['2888.004'],
	old_ver:[]
}]);

db.pok_output.insert([{
	_id: '2888.004',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'MAHASISWA STIS YANG BERKUALITAS DAN UNGGUL [Base Line]',
	vol: 12,
	sat: 'Orang',
	hrg_satuan: 0,
	jlh: 0,
	komponen: ['701','702'],
	old_ver:[]
}]);

db.pok_komponen.insert([{
	_id: '701',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'RISET/JURNAL DOSEN',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	akun: ['521211','521213'],
	old_ver:[]
},{
	_id: '702',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'BELAJAR DAN BEKERJA DI BIDANG STATISTIK',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	akun: ['531211'],
	old_ver:[]
}]);

db.pok_akun.insert([{
	_id: '521211',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'Belanja Bahan',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	detailBelanja: ['521211.1','521211.2'],
	old_ver:[]
},{
	_id: '521213',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'Honor Output Kegiatan',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	detailBelanja: ['521213.1', '521213.2'],
	old_ver:[]
},{
	_id: '531211',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'Belanja Bahan',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	detailBelanja: ['531211.1', '531211.2'],
	old_ver:[]
}]);

db.pok_detailBelanja.insert([{
	_id: '521211.1',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'konsumsi seminar proposal penelitian (Snack)',
	vol: 675,
	sat: 'O-K',
	hrg_satuan: 100000,
	jlh: 67500000,
	old_ver:[]
},{
	_id: '521211.2',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'konsumsi seminar hasil penelitian dosen (snack)',
	vol: 675,
	sat: 'O-K',
	hrg_satuan: 0,
	jlh: 0,
	old_ver:[]
},{
	_id: '521213.1',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'honor moderator seminar penelitian dosen',
	vol: 0,
	sat: '',
	hrg_satuan: 0,
	jlh: 0,
	old_ver:[]
},{
	_id: '521213.2',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'honor pengolahan data penelitian dosen',
	vol: 30,
	sat: 'O-J',
	hrg_satuan: 0,
	jlh: 0,
	old_ver:[]
},{
	_id: '531211.1',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'konsumsi rapat metodologi',
	vol: 140,
	sat: 'O-K',
	hrg_satuan: 0,
	jlh: 0,
	old_ver:[]
},{
	_id: '531211.2',
	version: '1',
	version_comment: 'Original',
	create_date: new Date(),
	uraian: 'konsumsi rapat kuesioner',
	vol: 140,
	sat: 'O-K',
	hrg_satuan: 0,
	jlh: 0,
	old_ver:[]
},]);