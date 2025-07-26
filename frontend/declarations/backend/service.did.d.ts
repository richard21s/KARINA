import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface InterestPeriod {
  'tahunSelesai' : bigint,
  'tipe' : string,
  'cicilanBulanan' : bigint,
  'bungaTahunan' : number,
  'tahunMulai' : bigint,
}
export interface KPRData {
  'dp' : bigint,
  'penalti' : Array<Penalti>,
  'hasilAI' : string,
  'bungaSkema' : Array<InterestPeriod>,
  'pelunasanEkstra' : Array<[bigint, bigint]>,
  'hargaRumah' : bigint,
  'keterangan' : string,
  'tanggalMulai' : string,
  'tanggalAnalisa' : string,
  'tenorBulan' : bigint,
}
export interface Penalti {
  'persen' : number,
  'jenis' : string,
  'bulan' : bigint,
}
export interface _SERVICE {
  'getKPR' : ActorMethod<[string], Array<KPRData>>,
  'getSimulasi' : ActorMethod<
    [string, bigint],
    Array<[bigint, number, number, number]>
  >,
  'login' : ActorMethod<[string, string], boolean>,
  'loginWithGoogle' : ActorMethod<[string], string>,
  'register' : ActorMethod<[string, string], string>,
  'saveKPR' : ActorMethod<[string, KPRData], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
