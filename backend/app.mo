import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Principal "mo:base/Principal";

actor {
  // === User Auth Types ===
  type User = {
    email : Text;
    passwordHash : Text;
  };

  var userMap : HashMap.HashMap<Text, User> = HashMap.HashMap<Text, User>(10, Text.equal, Text.hash);
  stable var userStore : [(Text, User)] = [];

  public shared func register(email : Text, passwordHash : Text) : async Text {
    if (userMap.get(email) != null) {
      return "Email already registered";
    };
    userMap.put(email, { email = email; passwordHash = passwordHash });
    return "Register success";
  };

  public shared query func login(email : Text, passwordHash : Text) : async Bool {
    switch (userMap.get(email)) {
      case (?user) user.passwordHash == passwordHash;
      case null false;
    }
  };

  public shared func loginWithGoogle(email : Text) : async Text {
    if (userMap.get(email) == null) {
      userMap.put(email, { email = email; passwordHash = "" });
      return "Registered & Logged in via Google";
    };
    return "Logged in via Google";
  };

  // === KPR Types ===
  type InterestPeriod = {
    tahunMulai : Nat;
    tahunSelesai : Nat;
    bungaTahunan : Float;
    tipe : Text;
    cicilanBulanan : Nat;
  };

  type Penalti = {
    bulan : Nat;
    persen : Float;
    jenis : Text;
  };

  type KPRData = {
    hargaRumah : Nat;
    dp : Nat;
    tenorBulan : Nat;
    tanggalMulai : Text;
    tanggalAnalisa : Text;
    bungaSkema : [InterestPeriod];
    pelunasanEkstra : [(Nat, Nat)];
    penalti : [Penalti];
    keterangan : Text;
    hasilAI : Text;
  };

  var kprMap : HashMap.HashMap<Text, [KPRData]> = HashMap.HashMap<Text, [KPRData]>(10, Text.equal, Text.hash);
  stable var kprStore : [(Text, [KPRData])] = [];

  system func preupgrade() {
    userStore := Iter.toArray(userMap.entries());
    kprStore := Iter.toArray(kprMap.entries());
    oauthUserStore := Iter.toArray(oauthUsers.entries());
  };

  system func postupgrade() {
    userMap := HashMap.HashMap<Text, User>(10, Text.equal, Text.hash);
    for ((email, user) in userStore.vals()) {
      userMap.put(email, user);
    };
    userStore := [];

    kprMap := HashMap.HashMap<Text, [KPRData]>(10, Text.equal, Text.hash);
    for ((email, data) in kprStore.vals()) {
      kprMap.put(email, data);
    };
    kprStore := [];

    oauthUsers := HashMap.HashMap<Principal, OAuthUser>(10, Principal.equal, Principal.hash);
  for ((k, v) in oauthUserStore.vals()) {
    oauthUsers.put(k, v);
  };
  oauthUserStore := [];
  };

  public shared func saveKPR(email : Text, data : KPRData) : async () {
    let existing = kprMap.get(email);
    let updated = switch (existing) {
      case (?list) Array.append(list, [data]);
      case null [data];
    };
    kprMap.put(email, updated);
  };

  public shared query func getKPR(email : Text) : async [KPRData] {
    switch (kprMap.get(email)) {
      case (?list) list;
      case null [];
    }
  };

  public shared query func getSimulasi(email : Text, index : Nat) : async [(Nat, Float, Float, Float)] {
    let userData = switch (kprMap.get(email)) {
      case (?list) list;
      case null return [];
    };
    if (index >= userData.size()) return [];

    let data = userData[index];
    var simulasi : [(Nat, Float, Float, Float)] = [];

    let totalBulan = data.tenorBulan;
    let bungaSkema = data.bungaSkema;
    let pelunasanEkstra = data.pelunasanEkstra;
    let daftarPenalti = data.penalti;

    let pokokAwal : Float = Float.fromInt(data.hargaRumah - data.dp);
    var sisaPokok : Float = pokokAwal;

    label sim {
      var bulan : Nat = 1;

      loop {
        if (bulan > totalBulan or sisaPokok <= 0.0) break sim;

        let tahun = (bulan - 1) / 12 + 1;

        let bungaAktif = Array.find(
          bungaSkema,
          func(p : InterestPeriod) : Bool {
            tahun >= p.tahunMulai and tahun <= p.tahunSelesai
          }
        );

        let bungaPerTahun = switch (bungaAktif) {
          case (?periode) periode.bungaTahunan;
          case null 10.0;
        };

        let cicilanAktif = switch (bungaAktif) {
          case (?periode) periode.cicilanBulanan;
          case null 0;
        };

        let bungaBulanIni : Float = sisaPokok * (bungaPerTahun / 12.0) / 100.0;
        let pokokBulanIni : Float = Float.max(0.0, Float.fromInt(cicilanAktif)) - bungaBulanIni;

        let ekstraOpt = Array.find(pelunasanEkstra, func((b, _) : (Nat, Nat)) : Bool {
          b == bulan
        });

        let nominalEkstra : Nat = switch ekstraOpt {
          case (?(b, n)) n;
          case null 0;
        };

        let totalBayarPokok = pokokBulanIni + Float.fromInt(nominalEkstra);

        let penaltiOpt = Array.find(daftarPenalti, func(p : Penalti) : Bool {
          p.bulan == bulan
        });

        let nilaiPenalti : Float = switch penaltiOpt {
          case (?p) {
            if (p.jenis == "early") {
              Float.fromInt(nominalEkstra) * p.persen / 100.0;
            } else if (p.jenis == "late") {
              Float.fromInt(cicilanAktif) * p.persen / 100.0;
            } else 0.0;
          };
          case null 0.0;
        };

        simulasi := Array.append(simulasi, [(bulan, totalBayarPokok, bungaBulanIni, nilaiPenalti)]);

        sisaPokok := Float.max(0.0, sisaPokok - totalBayarPokok);
        bulan += 1;
      }
    };

    return simulasi;
  };

// Tambahan struktur user untuk OAuth
type OAuthUser = {
  principal: Principal;
  email: Text;
};

// Simpan user Google (OAuth) berdasarkan principal
var oauthUsers : HashMap.HashMap<Principal, OAuthUser> = HashMap.HashMap<Principal, OAuthUser>(10, Principal.equal, Principal.hash);
stable var oauthUserStore : [(Principal, OAuthUser)] = [];

// Fungsi login/register dengan OAuth (Google, Internet Identity)
public shared func loginWithOAuth(principal: Principal, email: Text) : async Text {
  if (oauthUsers.get(principal) == null) {
    oauthUsers.put(principal, { principal = principal; email = email });
    return "OAuth user registered & logged in";
  };
  return "OAuth user logged in";
};

public shared query func getOAuthUser(principal: Principal) : async ?OAuthUser {
  oauthUsers.get(principal)
};

}
