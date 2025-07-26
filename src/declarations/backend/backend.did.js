export const idlFactory = ({ IDL }) => {
  const Penalti = IDL.Record({
    'persen' : IDL.Float64,
    'jenis' : IDL.Text,
    'bulan' : IDL.Nat,
  });
  const InterestPeriod = IDL.Record({
    'tahunSelesai' : IDL.Nat,
    'tipe' : IDL.Text,
    'cicilanBulanan' : IDL.Nat,
    'bungaTahunan' : IDL.Float64,
    'tahunMulai' : IDL.Nat,
  });
  const KPRData = IDL.Record({
    'dp' : IDL.Nat,
    'penalti' : IDL.Vec(Penalti),
    'hasilAI' : IDL.Text,
    'bungaSkema' : IDL.Vec(InterestPeriod),
    'pelunasanEkstra' : IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
    'hargaRumah' : IDL.Nat,
    'keterangan' : IDL.Text,
    'tanggalMulai' : IDL.Text,
    'tanggalAnalisa' : IDL.Text,
    'tenorBulan' : IDL.Nat,
  });
  return IDL.Service({
    'getKPR' : IDL.Func([IDL.Text], [IDL.Vec(KPRData)], ['query']),
    'getSimulasi' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Float64, IDL.Float64, IDL.Float64))],
        ['query'],
      ),
    'login' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], ['query']),
    'loginWithGoogle' : IDL.Func([IDL.Text], [IDL.Text], []),
    'register' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'saveKPR' : IDL.Func([IDL.Text, KPRData], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
