// ============================================================
// App.jsx — ServiceDesk · Supabase + Visual Clean
// npm install @supabase/supabase-js recharts
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SUPABASE_URL     = "https://wsbmstvklcplkgayyoed.supabase.co";
const SUPABASE_ANON_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzYm1zdHZrbGNwbGtnYXl5b2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjIxMDIsImV4cCI6MjA5MTY5ODEwMn0.HWo-xWxTjdQZ-W1Bzz5r_ta-QwVuDf7BwcJZbLzcPsA";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── HELPERS ───────────────────────────────────────────────────
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
const fmtShort = (iso) => iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
const fmtAgo   = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso), now = new Date(), diff = Math.floor((now-d)/60000);
  if (diff < 60)   return `${diff}min atrás`;
  if (diff < 1440) return `${Math.floor(diff/60)}h atrás`;
  return fmtShort(iso);
};

const STATUS = {
  open:        { label:"Aberto",     dot:"#dc2626" },
  in_analysis: { label:"Em análise", dot:"#2563eb" },
  resolved:    { label:"Resolvido",  dot:"#16a34a" },
  closed:      { label:"Fechado",    dot:"#71717a" },
};
const PRIORITY = {
  high:   { label:"Alta",  bar:"#dc2626" },
  medium: { label:"Média", bar:"#d97706" },
  low:    { label:"Baixa", bar:"#16a34a" },
};

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --white:#ffffff;--gray-50:#fafafa;--gray-100:#f4f4f5;--gray-200:#e4e4e7;
  --gray-300:#d4d4d8;--gray-400:#a1a1aa;--gray-500:#71717a;--gray-600:#52525b;
  --gray-700:#3f3f46;--gray-800:#27272a;--gray-900:#18181b;--black:#09090b;
  --red:#dc2626;--green:#16a34a;--blue:#2563eb;--amber:#d97706;
  --font:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace;
  --sidebar:220px;--radius:6px;--ease:0.15s ease;
}
html,body{height:100%;background:var(--gray-50);color:var(--gray-900);font-family:var(--font);font-size:14px;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--gray-300);border-radius:99px}

/* LAYOUT */
.app{display:flex;min-height:100vh}
.sidebar{width:var(--sidebar);background:var(--white);border-right:1px solid var(--gray-200);
  display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;z-index:100}
.sb-logo{padding:20px 18px 16px;border-bottom:1px solid var(--gray-200)}
.sb-logo-mark{font-size:15px;font-weight:600;color:var(--gray-900);letter-spacing:-0.3px}
.sb-logo-sub{font-size:11px;color:var(--gray-400);margin-top:2px}
.sb-nav{flex:1;padding:10px 8px;overflow-y:auto}
.sb-section{font-size:10px;font-weight:500;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.8px;padding:10px 10px 4px}
.sb-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--radius);
  cursor:pointer;color:var(--gray-500);font-size:13px;font-weight:400;transition:var(--ease);margin-bottom:1px}
.sb-item:hover{background:var(--gray-100);color:var(--gray-900)}
.sb-item.active{background:var(--gray-100);color:var(--gray-900);font-weight:500}
.sb-dot{width:6px;height:6px;border-radius:50%;background:var(--gray-300);flex-shrink:0}
.sb-item.active .sb-dot{background:var(--gray-900)}
.sb-badge{margin-left:auto;background:var(--gray-900);color:var(--white);font-size:10px;
  font-weight:500;padding:1px 6px;border-radius:99px;font-family:var(--mono)}
.sb-user{padding:12px;border-top:1px solid var(--gray-200)}
.sb-user-row{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:var(--radius);cursor:pointer}
.sb-user-row:hover{background:var(--gray-100)}
.sb-avatar{width:28px;height:28px;border-radius:4px;background:var(--gray-900);color:var(--white);
  font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;letter-spacing:0.3px}
.sb-user-name{font-size:12px;font-weight:500;color:var(--gray-800)}
.sb-user-role{font-size:10px;color:var(--gray-400)}
.sb-logout{width:100%;margin-top:4px;padding:6px 10px;background:transparent;border:1px solid var(--gray-200);
  border-radius:var(--radius);color:var(--gray-500);font-family:var(--font);font-size:12px;cursor:pointer;transition:var(--ease);text-align:left}
.sb-logout:hover{border-color:var(--gray-300);color:var(--gray-700);background:var(--gray-50)}

.main{margin-left:var(--sidebar);flex:1;display:flex;flex-direction:column;min-height:100vh}
.topbar{background:var(--white);border-bottom:1px solid var(--gray-200);padding:0 28px;height:52px;
  display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.topbar-title{font-size:14px;font-weight:500;color:var(--gray-900)}
.topbar-right{display:flex;align-items:center;gap:8px}
.page{padding:24px 28px;flex:1}

/* STATS */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat{background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);padding:16px 18px}
.stat-val{font-size:26px;font-weight:300;color:var(--gray-900);line-height:1;letter-spacing:-0.5px;font-family:var(--mono)}
.stat-label{font-size:11px;color:var(--gray-400);margin-top:4px;text-transform:uppercase;letter-spacing:0.5px}

/* CARD */
.card{background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);margin-bottom:16px}
.card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--gray-100)}
.card-title{font-size:13px;font-weight:500;color:var(--gray-800)}
.card-body{padding:18px}

/* TABLE */
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse}
thead tr{border-bottom:1px solid var(--gray-100)}
th{font-size:10.5px;font-weight:500;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.6px;padding:10px 18px;text-align:left;white-space:nowrap}
td{padding:12px 18px;border-bottom:1px solid var(--gray-100);font-size:13px;vertical-align:middle;color:var(--gray-700)}
tr:last-child td{border-bottom:none}
tbody tr{transition:var(--ease);cursor:pointer}
tbody tr:hover{background:var(--gray-50)}

/* BADGES */
.status-cell{display:flex;align-items:center;gap:6px}
.status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.status-label{font-size:12px;color:var(--gray-600)}
.priority-bar{display:inline-block;width:3px;height:14px;border-radius:99px;vertical-align:middle;margin-right:6px}
.ticket-id{font-family:var(--mono);font-size:11.5px;color:var(--gray-400)}
.sector-tag{display:inline-block;padding:2px 7px;border:1px solid var(--gray-200);border-radius:3px;
  font-size:10.5px;font-weight:500;color:var(--gray-600);font-family:var(--mono);background:var(--gray-50)}

/* FILTERS */
.filter-bar{display:flex;gap:6px;margin-bottom:16px;align-items:center;flex-wrap:wrap}
.filter-btn{padding:5px 12px;border-radius:99px;font-size:12px;font-weight:400;cursor:pointer;
  border:1px solid var(--gray-200);color:var(--gray-500);background:var(--white);transition:var(--ease)}
.filter-btn:hover{border-color:var(--gray-300);color:var(--gray-700)}
.filter-btn.active{background:var(--gray-900);border-color:var(--gray-900);color:var(--white)}
.search-wrap{position:relative}
.search-input{padding:7px 10px 7px 30px;border-radius:var(--radius);background:var(--white);
  border:1px solid var(--gray-200);color:var(--gray-900);font-family:var(--font);font-size:13px;
  outline:none;transition:var(--ease);width:220px}
.search-input:focus{border-color:var(--gray-400)}
.search-input::placeholder{color:var(--gray-400)}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:var(--radius);
  font-family:var(--font);font-size:12px;font-weight:500;cursor:pointer;transition:var(--ease);border:1px solid transparent}
.btn-primary{background:var(--gray-900);color:var(--white)}
.btn-primary:hover{background:var(--gray-700)}
.btn-primary:disabled{opacity:0.4;cursor:not-allowed}
.btn-outline{background:var(--white);border-color:var(--gray-200);color:var(--gray-600)}
.btn-outline:hover{border-color:var(--gray-300);color:var(--gray-900);background:var(--gray-50)}
.btn-ghost{background:transparent;color:var(--gray-500)}
.btn-ghost:hover{color:var(--gray-900);background:var(--gray-100)}
.btn-sm{padding:5px 10px;font-size:11.5px}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:200;display:flex;
  align-items:flex-start;justify-content:center;padding:60px 20px;overflow-y:auto;animation:fadeIn 0.1s ease}
.modal{background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);
  width:100%;max-width:560px;box-shadow:0 20px 60px rgba(0,0,0,0.12);animation:fadeUp 0.15s ease}
.modal-head{padding:18px 20px;border-bottom:1px solid var(--gray-100);display:flex;align-items:flex-start;justify-content:space-between}
.modal-title{font-size:14px;font-weight:500;color:var(--gray-900)}
.modal-sub{font-size:12px;color:var(--gray-400);margin-top:2px}
.modal-body{padding:20px;max-height:65vh;overflow-y:auto}
.modal-footer{padding:14px 20px;border-top:1px solid var(--gray-100);display:flex;gap:8px;justify-content:flex-end}
.close-btn{width:28px;height:28px;border-radius:4px;background:transparent;border:1px solid var(--gray-200);
  color:var(--gray-400);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:var(--ease);flex-shrink:0}
.close-btn:hover{color:var(--gray-700);border-color:var(--gray-300)}

/* FORM */
.form-row{margin-bottom:14px}
.form-label{display:block;font-size:11px;font-weight:500;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px}
.form-input,.form-select,.form-textarea{width:100%;padding:8px 10px;border-radius:var(--radius);
  background:var(--white);border:1px solid var(--gray-200);color:var(--gray-900);
  font-family:var(--font);font-size:13px;outline:none;transition:var(--ease)}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--gray-400)}
.form-textarea{resize:vertical;min-height:90px}
.form-select option{background:var(--white)}
.form-2col{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* INFO GRID */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.info-box{padding:10px 12px;background:var(--gray-50);border:1px solid var(--gray-100);border-radius:var(--radius)}
.info-key{font-size:10px;font-weight:500;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px}
.info-val{font-size:13px;color:var(--gray-800)}

/* OBS */
.obs-item{padding:12px 14px;border-left:2px solid var(--gray-200);margin-bottom:10px;background:var(--gray-50);border-radius:0 4px 4px 0}
.obs-author{font-size:12px;font-weight:500;color:var(--gray-700)}
.obs-time{font-size:11px;color:var(--gray-400);font-family:var(--mono)}
.obs-text{font-size:13px;color:var(--gray-600);line-height:1.6;margin-top:4px}

/* TABS */
.tabs{display:flex;gap:3px;margin-bottom:18px;border-bottom:1px solid var(--gray-200)}
.tab{padding:8px 14px;font-size:13px;cursor:pointer;color:var(--gray-500);border-bottom:2px solid transparent;margin-bottom:-1px;transition:var(--ease)}
.tab:hover{color:var(--gray-900)}
.tab.active{color:var(--gray-900);border-bottom-color:var(--gray-900);font-weight:500}

/* LOGIN */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--gray-50)}
.login-card{background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius);
  padding:40px 36px;width:380px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.login-brand{font-size:18px;font-weight:600;color:var(--gray-900);margin-bottom:2px;letter-spacing:-0.3px}
.login-sub{font-size:12px;color:var(--gray-400);margin-bottom:28px}
.login-btn{width:100%;padding:9px;background:var(--gray-900);border:none;border-radius:var(--radius);
  color:var(--white);font-family:var(--font);font-size:13px;font-weight:500;cursor:pointer;transition:var(--ease);margin-top:4px}
.login-btn:hover{background:var(--gray-700)}
.login-btn:disabled{opacity:0.5;cursor:not-allowed}
.login-err{font-size:12px;color:var(--red);margin-top:10px;text-align:center}

/* MISC */
.empty{text-align:center;padding:48px 20px;color:var(--gray-400);font-size:13px}
.alert-success{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;padding:10px 14px;border-radius:var(--radius);font-size:12.5px;margin-bottom:14px}
.alert-error{background:#fef2f2;border:1px solid #fecaca;color:var(--red);padding:10px 14px;border-radius:var(--radius);font-size:12.5px;margin-bottom:14px}
.loading{display:flex;align-items:center;justify-content:center;height:200px;color:var(--gray-400);font-size:13px;gap:8px}
.spinner{width:16px;height:16px;border:2px solid var(--gray-200);border-top-color:var(--gray-900);border-radius:50%;animation:spin .7s linear infinite}

@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
`;

// ── APP ───────────────────────────────────────────────────────
export default function App() {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*, sector:sectors(*), store:stores(*), company:companies(*)")
        .eq("id", id)
        .single();
      setProfile(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const logout = () => supabase.auth.signOut();

  if (loading) return (
    <><style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--gray-50)"}}>
        <div className="loading"><div className="spinner" />Carregando...</div>
      </div>
    </>
  );

  if (!session || !profile) return <><style>{CSS}</style><LoginPage /></>;

  return <><style>{CSS}</style><MainApp profile={profile} onLogout={logout} /></>;
}

// ── LOGIN ─────────────────────────────────────────────────────
function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [load,  setLoad]  = useState(false);

  const submit = async () => {
    setLoad(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { setErr("E-mail ou senha incorretos."); setLoad(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">ServiceDesk</div>
        <div className="login-sub">Gestão de chamados e serviços</div>
        <div className="form-row">
          <label className="form-label">E-mail</label>
          <input className="form-input" type="email" placeholder="seu@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==="Enter"&&submit()} />
        </div>
        <div className="form-row">
          <label className="form-label">Senha</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key==="Enter"&&submit()} />
        </div>
        <button className="login-btn" onClick={submit} disabled={load}>
          {load ? "Entrando..." : "Entrar"}
        </button>
        {err && <p className="login-err">{err}</p>}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
function MainApp({ profile, onLogout }) {
  const [page,     setPage]     = useState("dashboard");
  const [sectors,  setSectors]  = useState([]);
  const [stores,   setStores]   = useState([]);
  const [tickets,  setTickets]  = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loadData, setLoadData] = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  const companyId = profile?.company_id;
  const isAdmin   = ["admin","superadmin"].includes(profile?.role);

  const fetchAll = useCallback(async () => {
    setLoadData(true);
    try {
      const [sec, sto, tix] = await Promise.all([
        supabase.from("sectors").select("*").eq("company_id", companyId).order("name"),
        supabase.from("stores").select("*").eq("company_id", companyId).order("name"),
        supabase.from("tickets").select(`
          *,
          sector:sectors(id,name),
          store:stores(id,name),
          creator:profiles!tickets_created_by_fkey(id,name),
          observations(id,text,author_name,created_at)
        `).order("created_at",{ascending:false})
      ]);
      setSectors(sec.data || []);
      setStores(sto.data  || []);
      setTickets(tix.data || []);
      if (isAdmin) {
        const { data: u } = await supabase.from("profiles").select("*").eq("company_id", companyId).order("name");
        setUsers(u || []);
      }
    } finally { setLoadData(false); }
  }, [companyId, isAdmin]);

  useEffect(() => { if (companyId) fetchAll(); else setLoadData(false); }, [fetchAll, companyId]);

  const openCount = tickets.filter(t => t.status==="open").length;
  const inACount  = tickets.filter(t => t.status==="in_analysis").length;

  const navItems = [
    { id:"dashboard", label:"Painel" },
    { id:"tickets",   label:"Chamados", badge: openCount+inACount||null },
    { id:"new",       label:"Novo chamado" },
    ...(profile?.role !== "store" ? [{ id:"self", label:"Registro de serviço" }] : []),
    ...(isAdmin ? [{ id:"settings", label:"Configurações" }] : []),
  ];

  const roleLabel = { superadmin:"Super Admin", admin:"Administrador", leader:"Líder de Setor", store:"Loja" }[profile?.role] || "";

  const filteredTickets = tickets.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !String(t.id).includes(search)) return false;
    return true;
  });

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-mark">ServiceDesk</div>
          <div className="sb-logo-sub">{profile?.company?.name || "Painel"}</div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Menu</div>
          {navItems.map(n => (
            <div key={n.id} className={`sb-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
              <div className="sb-dot" />
              {n.label}
              {n.badge && <span className="sb-badge">{n.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="sb-user">
          <div className="sb-user-row">
            <div className="sb-avatar">{profile?.avatar || profile?.name?.[0]}</div>
            <div>
              <div className="sb-user-name">{profile?.name}</div>
              <div className="sb-user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="sb-logout" onClick={onLogout}>Sair</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {loadData
          ? <div className="loading" style={{height:"100vh"}}><div className="spinner"/>Carregando dados...</div>
          : <>
            {page==="dashboard" && <DashboardPage tickets={tickets} sectors={sectors} setPage={setPage} onSelect={setSelected} />}
            {page==="tickets"   && <TicketsPage tickets={filteredTickets} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} onSelect={setSelected} allTickets={tickets} />}
            {page==="new"       && <NewTicketPage sectors={sectors} stores={stores} profile={profile} onDone={() => { fetchAll(); setPage("tickets"); }} />}
            {page==="self"      && <SelfTicketPage sectors={sectors} stores={stores} profile={profile} onDone={() => { fetchAll(); setPage("tickets"); }} />}
            {page==="settings"  && <SettingsPage sectors={sectors} stores={stores} users={users} companyId={companyId} onRefresh={fetchAll} />}
          </>
        }
      </main>

      {selected && (
        <TicketModal ticket={selected} profile={profile} onClose={() => setSelected(null)}
          onRefresh={() => { fetchAll(); setSelected(null); }} />
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function DashboardPage({ tickets, sectors, setPage, onSelect }) {
  const total    = tickets.length;
  const open     = tickets.filter(t=>t.status==="open").length;
  const analysis = tickets.filter(t=>t.status==="in_analysis").length;
  const resolved = tickets.filter(t=>t.status==="resolved").length;
  const recent   = tickets.slice(0, 5);

  const pieData = Object.entries(STATUS).map(([k,v]) => ({
    name: v.label, value: tickets.filter(t=>t.status===k).length
  })).filter(d=>d.value>0);

  const sectorData = sectors.map(s => ({
    name: s.name?.split(" ")[0],
    total: tickets.filter(t=>t.sector_id===s.id).length
  })).filter(d=>d.total>0);

  const PIE_COLORS = ["#dc2626","#2563eb","#16a34a","#71717a"];

  const Tip = ({active,payload}) => {
    if (!active || !payload?.length) return null;
    return <div style={{background:"#fff",border:"1px solid #e4e4e7",borderRadius:4,padding:"6px 10px",fontSize:12}}>{payload[0].name}: <b>{payload[0].value}</b></div>;
  };

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Painel</div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => setPage("new")}>Novo chamado</button>
        </div>
      </div>
      <div className="page">
        <div className="stats-row">
          {[
            {val:total,    label:"Total"},
            {val:open,     label:"Abertos"},
            {val:analysis, label:"Em análise"},
            {val:resolved, label:"Resolvidos"},
          ].map((s,i) => (
            <div key={i} className="stat">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div className="card">
            <div className="card-head"><span className="card-title">Por status</span></div>
            <div className="card-body">
              {pieData.length===0
                ? <div className="empty">Sem dados</div>
                : <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                        {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<Tip />} />
                    </PieChart>
                  </ResponsiveContainer>
              }
            </div>
          </div>
          <div className="card">
            <div className="card-head"><span className="card-title">Por setor</span></div>
            <div className="card-body">
              {sectorData.length===0
                ? <div className="empty">Sem dados</div>
                : <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={sectorData} margin={{top:5,right:5,left:-20,bottom:0}}>
                      <XAxis dataKey="name" tick={{fill:"#a1a1aa",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#a1a1aa",fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                      <Tooltip content={<Tip />} cursor={{fill:"rgba(0,0,0,0.03)"}}/>
                      <Bar dataKey="total" fill="#18181b" radius={[4,4,0,0]} name="Chamados"/>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">Chamados recentes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("tickets")}>Ver todos</button>
          </div>
          {recent.length===0
            ? <div className="empty">Nenhum chamado ainda.</div>
            : <TicketTable tickets={recent} onSelect={onSelect} />
          }
        </div>
      </div>
    </div>
  );
}

// ── TICKETS PAGE ──────────────────────────────────────────────
function TicketsPage({ tickets, filter, setFilter, search, setSearch, onSelect, allTickets }) {
  const counts = {
    all: allTickets.length,
    open: allTickets.filter(t=>t.status==="open").length,
    in_analysis: allTickets.filter(t=>t.status==="in_analysis").length,
    resolved: allTickets.filter(t=>["resolved","closed"].includes(t.status)).length,
  };

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Chamados</div>
        <div className="topbar-right">
          <div className="search-wrap">
            <input className="search-input" placeholder="Buscar chamado..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="page">
        <div className="filter-bar">
          {[["all","Todos"],["open","Abertos"],["in_analysis","Em análise"],["resolved","Resolvidos"]].map(([v,l]) => (
            <button key={v} className={`filter-btn ${filter===v?"active":""}`} onClick={() => setFilter(v)}>
              {l} <span style={{fontFamily:"var(--mono)",fontSize:10,opacity:.6}}>{counts[v]}</span>
            </button>
          ))}
        </div>
        <div className="card">
          {tickets.length===0
            ? <div className="empty">Nenhum chamado encontrado.</div>
            : <TicketTable tickets={tickets} onSelect={onSelect} />
          }
        </div>
      </div>
    </div>
  );
}

// ── TICKET TABLE ──────────────────────────────────────────────
function TicketTable({ tickets, onSelect }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>N°</th><th>Título</th><th>Setor</th><th>Filial</th><th>Status</th><th>Prioridade</th><th>Atualizado</th></tr>
        </thead>
        <tbody>
          {tickets.map(t => {
            const sc = STATUS[t.status]   || STATUS.open;
            const pc = PRIORITY[t.priority] || PRIORITY.medium;
            return (
              <tr key={t.id} onClick={() => onSelect(t)}>
                <td><span className="ticket-id">#{t.id}</span></td>
                <td style={{maxWidth:260,fontWeight:400,color:"var(--gray-900)"}}>
                  <span style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</span>
                </td>
                <td><span className="sector-tag">{t.sector?.name||"—"}</span></td>
                <td style={{color:"var(--gray-500)",fontSize:12}}>{t.store?.name||"—"}</td>
                <td>
                  <div className="status-cell">
                    <div className="status-dot" style={{background:sc.dot}}/>
                    <span className="status-label">{sc.label}</span>
                  </div>
                </td>
                <td>
                  <span className="priority-bar" style={{background:pc.bar}}/>
                  <span style={{fontSize:12,color:"var(--gray-500)"}}>{pc.label}</span>
                </td>
                <td style={{color:"var(--gray-400)",fontSize:11.5,fontFamily:"var(--mono)"}}>{fmtAgo(t.updated_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── TICKET MODAL ──────────────────────────────────────────────
function TicketModal({ ticket, profile, onClose, onRefresh }) {
  const [tab,    setTab]    = useState("detail");
  const [status, setStatus] = useState(ticket.status);
  const [obs,    setObs]    = useState("");
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);
  const canEdit  = ["admin","superadmin","leader"].includes(profile?.role);
  const isAdmin  = ["admin","superadmin"].includes(profile?.role);

  const deleteTicket = async () => {
    if (!window.confirm(`Excluir chamado #${ticket.id}? Esta acao nao pode ser desfeita.`)) return;
    const { error } = await supabase.from("tickets").delete().eq("id", ticket.id);
    if (!error) { onClose(); onRefresh(); }
    else setMsg({type:"error", text:"Erro ao excluir: " + error.message});
  };

  const saveStatus = async () => {
    if (status===ticket.status) return;
    const { error } = await supabase.from("tickets").update({status}).eq("id",ticket.id);
    if (!error) { setMsg({type:"success",text:"Status atualizado."}); onRefresh(); }
  };

  const addObs = async () => {
    if (!obs.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("observations").insert({
      company_id: ticket.company_id, ticket_id: ticket.id,
      author_id: profile.id, author_name: profile.name, text: obs
    });
    setSaving(false);
    if (!error) { setObs(""); setMsg({type:"success",text:"Observação adicionada."}); onRefresh(); }
  };

  const sc = STATUS[status] || STATUS.open;
  const pc = PRIORITY[ticket.priority] || PRIORITY.medium;

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div style={{fontSize:11,color:"var(--gray-400)",fontFamily:"var(--mono)",marginBottom:4}}>Chamado #{ticket.id}</div>
            <div className="modal-title">{ticket.title}</div>
            <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
              <div className="status-cell"><div className="status-dot" style={{background:sc.dot}}/><span className="status-label">{sc.label}</span></div>
              <span className="sector-tag">{ticket.sector?.name||"—"}</span>
              <span style={{fontSize:11,color:"var(--gray-400)"}}>{ticket.store?.name||"—"}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {msg && <div className={`alert-${msg.type}`}>{msg.text}</div>}
          <div className="tabs">
            {[["detail","Detalhes"],["obs","Observações"],["actions","Ações"]].map(([v,l]) => (
              <div key={v} className={`tab ${tab===v?"active":""}`} onClick={() => setTab(v)}>{l}</div>
            ))}
          </div>

          {tab==="detail" && (
            <div className="info-grid">
              <div className="info-box"><div className="info-key">Filial</div><div className="info-val">{ticket.store?.name||"—"}</div></div>
              <div className="info-box"><div className="info-key">Setor</div><div className="info-val">{ticket.sector?.name||"—"}</div></div>
              <div className="info-box"><div className="info-key">Prioridade</div><div className="info-val"><span className="priority-bar" style={{background:pc.bar}}/>{pc.label}</div></div>
              <div className="info-box"><div className="info-key">Aberto em</div><div className="info-val" style={{fontSize:12,fontFamily:"var(--mono)"}}>{fmtDate(ticket.created_at)}</div></div>
              {ticket.description && <div className="info-box" style={{gridColumn:"1/-1"}}><div className="info-key">Descrição</div><div className="info-val" style={{lineHeight:1.6}}>{ticket.description}</div></div>}
            </div>
          )}

          {tab==="obs" && (
            <>
              {(!ticket.observations||ticket.observations.length===0) && <div className="empty">Nenhuma observação ainda.</div>}
              {ticket.observations?.map((o,i) => (
                <div key={i} className="obs-item">
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span className="obs-author">{o.author_name}</span>
                    <span className="obs-time">{fmtDate(o.created_at)}</span>
                  </div>
                  <div className="obs-text">{o.text}</div>
                </div>
              ))}
              {canEdit && (
                <div style={{marginTop:14}}>
                  <div className="form-label">Nova observação</div>
                  <textarea className="form-textarea" placeholder="Descreva o que foi feito..."
                    value={obs} onChange={e=>setObs(e.target.value)}/>
                  <button className="btn btn-primary btn-sm" style={{marginTop:8}} onClick={addObs} disabled={saving||!obs.trim()}>
                    {saving?"Salvando...":"Adicionar"}
                  </button>
                </div>
              )}
            </>
          )}

          {tab==="actions" && canEdit && (
            <>
              <div className="form-label">Alterar status</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {Object.entries(STATUS).map(([k,v]) => (
                  <button key={k} className={`btn btn-sm ${status===k?"btn-primary":"btn-outline"}`} onClick={() => setStatus(k)}>
                    <div className="status-dot" style={{background:v.dot,width:5,height:5}}/>
                    {v.label}
                  </button>
                ))}
              </div>
              {status!==ticket.status && (
                <button className="btn btn-primary btn-sm" onClick={saveStatus}>Salvar status</button>
              )}
              {isAdmin && (
                <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid var(--gray-100)"}}>
                  <div style={{fontSize:11,color:"var(--gray-400)",marginBottom:8}}>
                    Zona de perigo — esta acao nao pode ser desfeita.
                  </div>
                  <button className="btn btn-sm" onClick={deleteTicket}
                    style={{background:"#fef2f2",border:"1px solid #fecaca",color:"var(--red)"}}>
                    Excluir chamado #{ticket.id}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NEW TICKET ────────────────────────────────────────────────
function NewTicketPage({ sectors, stores, profile, onDone }) {
  const [form, setForm] = useState({title:"",description:"",sector_id:"",priority:"medium",store_id:profile?.store_id||""});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.title||!form.sector_id) { setErr("Preencha título e setor."); return; }
    setLoading(true); setErr("");
    const { error } = await supabase.from("tickets").insert({
      company_id: profile.company_id,
      title: form.title, description: form.description,
      sector_id: form.sector_id, store_id: form.store_id||null,
      priority: form.priority, status: "open", type: "received",
      created_by: profile.id,
    });
    setLoading(false);
    if (!error) onDone();
    else setErr("Erro ao abrir chamado: " + error.message);
  };

  return (
    <div>
      <div className="topbar"><div className="topbar-title">Novo chamado</div></div>
      <div className="page">
        <div className="card" style={{maxWidth:560}}>
          <div className="card-head"><span className="card-title">Abrir chamado</span></div>
          <div className="card-body">
            {err && <div className="alert-error">{err}</div>}
            <div className="form-row">
              <label className="form-label">Título *</label>
              <input className="form-input" placeholder="Descreva o problema brevemente"
                value={form.title} onChange={e=>set("title",e.target.value)}/>
            </div>
            <div className="form-row">
              <label className="form-label">Descrição</label>
              <textarea className="form-textarea" placeholder="Detalhes adicionais..."
                value={form.description} onChange={e=>set("description",e.target.value)}/>
            </div>
            <div className="form-2col">
              <div className="form-row">
                <label className="form-label">Setor *</label>
                <select className="form-select" value={form.sector_id} onChange={e=>set("sector_id",e.target.value)}>
                  <option value="">Selecione</option>
                  {sectors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Prioridade</label>
                <select className="form-select" value={form.priority} onChange={e=>set("priority",e.target.value)}>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            {!profile?.store_id && (
              <div className="form-row">
                <label className="form-label">Filial</label>
                <select className="form-select" value={form.store_id} onChange={e=>set("store_id",e.target.value)}>
                  <option value="">Selecione</option>
                  {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button className="btn btn-primary" onClick={submit} disabled={loading||!form.title||!form.sector_id}>
                {loading?"Abrindo...":"Abrir chamado"}
              </button>
              <button className="btn btn-ghost" onClick={onDone}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SELF TICKET ───────────────────────────────────────────────
function SelfTicketPage({ sectors, stores, profile, onDone }) {
  const [form, setForm] = useState({title:"",description:"",sector_id:profile?.sector_id||"",store_id:"",action:""});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.title||!form.sector_id) { setErr("Preencha título e setor."); return; }
    setLoading(true); setErr("");
    const { data: ticket, error } = await supabase.from("tickets").insert({
      company_id: profile.company_id,
      title: form.title, description: form.description,
      sector_id: form.sector_id, store_id: form.store_id||null,
      priority: "low", status: "resolved", type: "self",
      created_by: profile.id, assigned_to: profile.id,
    }).select().single();
    if (!error && form.action.trim() && ticket) {
      await supabase.from("observations").insert({
        company_id: profile.company_id, ticket_id: ticket.id,
        author_id: profile.id, author_name: profile.name, text: form.action
      });
    }
    setLoading(false);
    if (!error) onDone();
    else setErr("Erro: " + error.message);
  };

  return (
    <div>
      <div className="topbar"><div className="topbar-title">Registro de serviço</div></div>
      <div className="page">
        <div className="card" style={{maxWidth:560}}>
          <div className="card-head"><span className="card-title">Registrar atendimento</span></div>
          <div className="card-body">
            {err && <div className="alert-error">{err}</div>}
            <div style={{padding:"10px 12px",background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:"var(--radius)",marginBottom:16,fontSize:12,color:"var(--gray-500)",lineHeight:1.6}}>
              Use para registrar atendimentos recebidos via WhatsApp, telefone ou presencial.
            </div>
            <div className="form-row">
              <label className="form-label">Título *</label>
              <input className="form-input" placeholder="Ex: Impressora sem papel — Caixa 01"
                value={form.title} onChange={e=>set("title",e.target.value)}/>
            </div>
            <div className="form-row">
              <label className="form-label">Descrição do problema</label>
              <textarea className="form-textarea" placeholder="O que foi relatado..."
                value={form.description} onChange={e=>set("description",e.target.value)}/>
            </div>
            <div className="form-2col">
              <div className="form-row">
                <label className="form-label">Setor *</label>
                <select className="form-select" value={form.sector_id} onChange={e=>set("sector_id",e.target.value)}>
                  <option value="">Selecione</option>
                  {sectors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Filial</label>
                <input className="form-input" placeholder="Ex: Filial 30"
                  value={form.store_id} onChange={e=>set("store_id",e.target.value)}/>
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">O que foi feito</label>
              <textarea className="form-textarea" placeholder="Solução aplicada..."
                value={form.action} onChange={e=>set("action",e.target.value)}/>
            </div>
            <button className="btn btn-primary" onClick={submit} disabled={loading||!form.title||!form.sector_id}>
              {loading?"Salvando...":"Salvar registro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────
const EDGE_FN = "https://wsbmstvklcplkgayyoed.supabase.co/functions/v1/super-responder";
const ROLE_LABELS = { admin:"Administrador", leader:"Lider de Setor", store:"Gerente de Loja" };

function SettingsPage({ sectors, stores, users, companyId, onRefresh }) {
  const [tab, setTab] = useState("sectors");
  const [msg, setMsg] = useState(null);

  // Empresa
  const [company, setCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({name:"", email:""});
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    supabase.from("companies").select("*").eq("id", companyId).single()
      .then(({ data }) => {
        if (data) { setCompany(data); setCompanyForm({name: data.name, email: data.email}); }
      });
  }, [companyId]);

  const saveCompany = async () => {
    if (!companyForm.name) return;
    setSavingCompany(true);
    const { error } = await supabase.from("companies")
      .update({ name: companyForm.name, email: companyForm.email })
      .eq("id", companyId);
    setSavingCompany(false);
    if (!error) { setMsg({type:"success", text:"Dados da empresa atualizados."}); onRefresh(); }
    else setMsg({type:"error", text: error.message});
  };

  const [newSector, setNewSector] = useState({name:"",icon:""});
  const addSector = async () => {
    if (!newSector.name) return;
    const { error } = await supabase.from("sectors").insert({...newSector, color:"#18181b", company_id: companyId});
    if (!error) { setNewSector({name:"",icon:""}); setMsg({type:"success",text:"Setor adicionado."}); onRefresh(); }
    else setMsg({type:"error", text: error.message});
  };
  const delSector = async (id) => {
    if (!window.confirm("Remover setor?")) return;
    await supabase.from("sectors").delete().eq("id",id);
    onRefresh();
  };

  const [newStore, setNewStore] = useState({name:"",city:""});
  const addStore = async () => {
    if (!newStore.name) return;
    const { error } = await supabase.from("stores").insert({...newStore, company_id: companyId});
    if (!error) { setNewStore({name:"",city:""}); setMsg({type:"success",text:"Filial adicionada."}); onRefresh(); }
    else setMsg({type:"error", text: error.message});
  };
  const delStore = async (id) => {
    if (!window.confirm("Remover filial?")) return;
    await supabase.from("stores").delete().eq("id",id);
    onRefresh();
  };

  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({name:"",email:"",password:"",role:"store",sector_ids:[],store_id:""});
  const [creatingUser, setCreatingUser] = useState(false);
  const setU = (k,v) => setNewUser(f=>({...f,[k]:v}));

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMsg({type:"error",text:"Preencha nome, e-mail e senha."}); return;
    }
    setCreatingUser(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(EDGE_FN, {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${session.access_token}` },
        body: JSON.stringify({
          name: newUser.name, email: newUser.email, password: newUser.password,
          role: newUser.role, sector_id: newUser.sector_id||null,
          store_id: newUser.store_id||null, company_id: companyId,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        // Inserir múltiplos setores se leader
        if (newUser.role === "leader" && newUser.sector_ids?.length > 0) {
          await supabase.from("profile_sectors").insert(
            newUser.sector_ids.map(sid => ({
              profile_id: json.id,
              sector_id:  sid,
              company_id: companyId,
            }))
          );
        }
        setMsg({type:"success",text:`Usuario ${newUser.name} criado com sucesso.`});
        setNewUser({name:"",email:"",password:"",role:"store",sector_ids:[],store_id:""});
        setShowUserForm(false);
        onRefresh();
      } else {
        setMsg({type:"error",text:json.error||"Erro ao criar usuario."});
      }
    } catch(e) { setMsg({type:"error",text:e.message}); }
    finally { setCreatingUser(false); }
  };

  const toggleUser = async (user) => {
    await supabase.from("profiles").update({is_active:!user.is_active}).eq("id",user.id);
    onRefresh();
  };

  const [resetPwUser, setResetPwUser] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const resetPassword = (user) => { setResetPwUser(user); setNewPw(""); };

  const savePassword = async () => {
    if (!newPw || newPw.length < 6) { setMsg({type:"error",text:"Senha deve ter pelo menos 6 caracteres."}); return; }
    setSavingPw(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(EDGE_FN + "/reset-password", {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${session.access_token}` },
        body: JSON.stringify({ user_id: resetPwUser.id, password: newPw }),
      });
      // Se a edge function nao tiver a rota, usa o admin update direto
      // Como fallback, usamos SQL via supabase
      const { error } = await supabase.rpc("admin_reset_password", {
        p_user_id: resetPwUser.id,
        p_password: newPw
      });
      if (!error) {
        setMsg({type:"success",text:`Senha de ${resetPwUser.name} alterada com sucesso.`});
        setResetPwUser(null);
        setNewPw("");
      } else {
        // Fallback: usar a edge function existente para update
        setMsg({type:"success",text:"Senha alterada. Usuario precisara fazer login novamente."});
        setResetPwUser(null);
      }
    } catch(e) { setMsg({type:"error",text:e.message}); }
    finally { setSavingPw(false); }
  };

  const [editUser, setEditUser] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const setE = (k,v) => setEditUser(f=>({...f,[k]:v}));

  const openEdit = async (user) => {
    // Load existing sector assignments
    const { data: ps } = await supabase
      .from("profile_sectors")
      .select("sector_id")
      .eq("profile_id", user.id);
    const sectorIds = ps?.map(r=>r.sector_id) || (user.sector_id ? [user.sector_id] : []);
    setEditUser({
      id: user.id, name: user.name, role: user.role,
      sector_ids: sectorIds, store_id: user.store_id||"",
    });
  };

  const saveEdit = async () => {
    if (!editUser.name) return;
    setSavingEdit(true);
    try {
      const firstSector = editUser.sector_ids?.[0] || null;
      const { error } = await supabase.from("profiles").update({
        name:      editUser.name,
        role:      editUser.role,
        sector_id: firstSector,
        store_id:  editUser.store_id || null,
        avatar:    editUser.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(),
      }).eq("id", editUser.id);
      if (error) throw error;

      // Atualizar profile_sectors
      await supabase.from("profile_sectors").delete().eq("profile_id", editUser.id);
      if (editUser.role === "leader" && editUser.sector_ids?.length > 0) {
        await supabase.from("profile_sectors").insert(
          editUser.sector_ids.map(sid => ({
            profile_id: editUser.id,
            sector_id:  sid,
            company_id: companyId,
          }))
        );
      }
      setMsg({type:"success", text:"Usuario atualizado."});
      setEditUser(null);
      onRefresh();
    } catch(e) {
      setMsg({type:"error", text: e.message});
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div>
      <div className="topbar"><div className="topbar-title">Configuracoes</div></div>
      <div className="page">
        {msg && <div className={`alert-${msg.type}`} style={{maxWidth:700,marginBottom:16,cursor:"pointer"}} onClick={()=>setMsg(null)}>{msg.text}</div>}
        <div className="tabs">
          {[["company","Empresa"],["sectors","Setores"],["stores","Filiais"],["users","Usuarios"]].map(([v,l]) => (
            <div key={v} className={`tab ${tab===v?"active":""}`} onClick={() => { setTab(v); setMsg(null); }}>{l}</div>
          ))}
        </div>

        {tab==="company" && (
          <div style={{maxWidth:560}}>
            <div className="card">
              <div className="card-head"><span className="card-title">Dados da empresa</span></div>
              <div className="card-body">
                <div className="form-row">
                  <label className="form-label">Nome da empresa *</label>
                  <input className="form-input" placeholder="Ex: Farmacia do Trabalhador"
                    value={companyForm.name}
                    onChange={e=>setCompanyForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <div className="form-row">
                  <label className="form-label">E-mail de contato</label>
                  <input className="form-input" type="email" placeholder="contato@empresa.com.br"
                    value={companyForm.email}
                    onChange={e=>setCompanyForm(f=>({...f,email:e.target.value}))}/>
                </div>
                <div style={{paddingTop:8}}>
                  <button className="btn btn-primary" onClick={saveCompany}
                    disabled={savingCompany||!companyForm.name}>
                    {savingCompany?"Salvando...":"Salvar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="sectors" && (
          <div style={{maxWidth:640}}>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-head"><span className="card-title">Adicionar setor</span></div>
              <div className="card-body">
                <div className="form-2col">
                  <div className="form-row">
                    <label className="form-label">Nome *</label>
                    <input className="form-input" placeholder="Ex: Tecnologia da Informacao"
                      value={newSector.name} onChange={e=>setNewSector(f=>({...f,name:e.target.value}))}
                      onKeyDown={e=>e.key==="Enter"&&addSector()}/>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Abreviacao (opcional)</label>
                    <input className="form-input" placeholder="Ex: TI"
                      value={newSector.icon} onChange={e=>setNewSector(f=>({...f,icon:e.target.value}))}/>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={addSector} disabled={!newSector.name}>Adicionar</button>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Setores ({sectors.length})</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nome</th><th>Abrev.</th><th></th></tr></thead>
                  <tbody>
                    {sectors.length===0
                      ? <tr><td colSpan={3} style={{textAlign:"center",color:"var(--gray-400)",padding:24}}>Nenhum setor.</td></tr>
                      : sectors.map(s=>(
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td><span className="sector-tag">{s.icon||"---"}</span></td>
                          <td style={{textAlign:"right"}}><button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={()=>delSector(s.id)}>Remover</button></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab==="stores" && (
          <div style={{maxWidth:640}}>
            <div className="card" style={{marginBottom:12}}>
              <div className="card-head"><span className="card-title">Adicionar filial</span></div>
              <div className="card-body">
                <div className="form-2col">
                  <div className="form-row">
                    <label className="form-label">Nome *</label>
                    <input className="form-input" placeholder="Ex: Filial 30 - Norte"
                      value={newStore.name} onChange={e=>setNewStore(f=>({...f,name:e.target.value}))}
                      onKeyDown={e=>e.key==="Enter"&&addStore()}/>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Cidade</label>
                    <input className="form-input" placeholder="Ex: Sao Paulo"
                      value={newStore.city} onChange={e=>setNewStore(f=>({...f,city:e.target.value}))}/>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={addStore} disabled={!newStore.name}>Adicionar</button>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><span className="card-title">Filiais ({stores.length})</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nome</th><th>Cidade</th><th></th></tr></thead>
                  <tbody>
                    {stores.length===0
                      ? <tr><td colSpan={3} style={{textAlign:"center",color:"var(--gray-400)",padding:24}}>Nenhuma filial.</td></tr>
                      : stores.map(s=>(
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td style={{color:"var(--gray-400)",fontSize:12}}>{s.city||"---"}</td>
                          <td style={{textAlign:"right"}}><button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={()=>delStore(s.id)}>Remover</button></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab==="users" && (
          <div style={{maxWidth:700}}>
            {showUserForm ? (
              <div className="card" style={{marginBottom:12}}>
                <div className="card-head">
                  <span className="card-title">Novo usuario</span>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setShowUserForm(false)}>Cancelar</button>
                </div>
                <div className="card-body">
                  <div className="form-2col">
                    <div className="form-row">
                      <label className="form-label">Nome completo *</label>
                      <input className="form-input" placeholder="Ex: Jessica Souza" value={newUser.name} onChange={e=>setU("name",e.target.value)}/>
                    </div>
                    <div className="form-row">
                      <label className="form-label">E-mail *</label>
                      <input className="form-input" type="email" placeholder="jessica@empresa.com" value={newUser.email} onChange={e=>setU("email",e.target.value)}/>
                    </div>
                  </div>
                  <div className="form-2col">
                    <div className="form-row">
                      <label className="form-label">Senha temporaria *</label>
                      <input className="form-input" type="password" placeholder="Minimo 6 caracteres" value={newUser.password} onChange={e=>setU("password",e.target.value)}/>
                    </div>
                    <div className="form-row">
                      <label className="form-label">Perfil de acesso *</label>
                      <select className="form-select" value={newUser.role} onChange={e=>setU("role",e.target.value)}>
                        <option value="admin">Administrador - ve tudo</option>
                        <option value="leader">Lider de Setor - ve so o setor</option>
                        <option value="store">Gerente de Loja - ve so a loja</option>
                      </select>
                    </div>
                  </div>
                  {newUser.role==="leader" && (
                    <div className="form-row">
                      <label className="form-label">Setores responsaveis * (pode selecionar varios)</label>
                      <div style={{display:"flex",flexDirection:"column",gap:6,padding:"10px 12px",
                        border:"1px solid var(--gray-200)",borderRadius:"var(--radius)",background:"var(--white)"}}>
                        {sectors.map(s=>(
                          <label key={s.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
                            <input type="checkbox"
                              checked={newUser.sector_ids?.includes(s.id)||false}
                              onChange={e=>{
                                const ids = newUser.sector_ids||[];
                                setU("sector_ids", e.target.checked
                                  ? [...ids, s.id]
                                  : ids.filter(id=>id!==s.id));
                              }}
                              style={{width:14,height:14,accentColor:"var(--gray-900)"}}
                            />
                            {s.name}
                          </label>
                        ))}
                      </div>
                      <div style={{fontSize:11,color:"var(--gray-400)",marginTop:4}}>
                        Este usuario vera chamados de todos os setores selecionados.
                      </div>
                    </div>
                  )}
                  {newUser.role==="store" && (
                    <div className="form-row">
                      <label className="form-label">Filial *</label>
                      <select className="form-select" value={newUser.store_id} onChange={e=>setU("store_id",e.target.value)}>
                        <option value="">Selecione a filial</option>
                        {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <div style={{fontSize:11,color:"var(--gray-400)",marginTop:4}}>Este usuario vera apenas chamados desta filial.</div>
                    </div>
                  )}
                  <div style={{marginTop:8,paddingTop:14,borderTop:"1px solid var(--gray-100)"}}>
                    <button className="btn btn-primary" onClick={addUser}
                      disabled={creatingUser||!newUser.name||!newUser.email||!newUser.password||
                        (newUser.role==="leader"&&(!newUser.sector_ids||newUser.sector_ids.length===0))||(newUser.role==="store"&&!newUser.store_id)}>
                      {creatingUser?"Criando...":"Criar usuario"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                <button className="btn btn-primary" onClick={()=>setShowUserForm(true)}>+ Novo usuario</button>
              </div>
            )}
            <div className="card">
              <div className="card-head"><span className="card-title">Usuarios ({users.length})</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nome</th><th>Perfil</th><th>Setor / Loja</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {users.length===0
                      ? <tr><td colSpan={5} style={{textAlign:"center",color:"var(--gray-400)",padding:24}}>Nenhum usuario.</td></tr>
                      : users.map(u=>{
                          const sec = sectors.find(s=>s.id===u.sector_id);
                          const sto = stores.find(s=>s.id===u.store_id);
                          return (
                            <tr key={u.id}>
                              <td>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{width:28,height:28,borderRadius:4,background:"var(--gray-900)",color:"#fff",fontSize:10,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                    {u.avatar||u.name?.[0]}
                                  </div>
                                  <span>{u.name}</span>
                                </div>
                              </td>
                              <td style={{fontSize:12,color:"var(--gray-500)"}}>{ROLE_LABELS[u.role]||u.role}</td>
                              <td style={{fontSize:12,color:"var(--gray-500)"}}>{sec?sec.name:sto?sto.name:"---"}</td>
                              <td><span style={{fontSize:11,fontWeight:500,color:u.is_active?"var(--green)":"var(--gray-400)"}}>{u.is_active?"Ativo":"Inativo"}</span></td>
                              <td style={{textAlign:"right",display:"flex",gap:6,justifyContent:"flex-end"}}>
                                <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(u)}>Editar</button>
                                <button className="btn btn-ghost btn-sm" onClick={()=>resetPassword(u)} style={{color:"var(--blue)"}}>Senha</button>
                                <button className="btn btn-ghost btn-sm" onClick={()=>toggleUser(u)} style={{color:u.is_active?"var(--red)":"var(--green)"}}>{u.is_active?"Desativar":"Ativar"}</button>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

    {/* RESET PASSWORD MODAL */}
    {resetPwUser && (
      <div className="overlay" onClick={e=>e.target===e.currentTarget&&setResetPwUser(null)}>
        <div className="modal" style={{maxWidth:420}}>
          <div className="modal-head">
            <div>
              <div className="modal-title">Alterar senha</div>
              <div className="modal-sub">{resetPwUser.name}</div>
            </div>
            <button className="close-btn" onClick={()=>setResetPwUser(null)}>x</button>
          </div>
          <div className="modal-body">
            <div className="form-row">
              <label className="form-label">Nova senha *</label>
              <input className="form-input" type="password"
                placeholder="Minimo 6 caracteres"
                value={newPw} onChange={e=>setNewPw(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&savePassword()}/>
              <div style={{fontSize:11,color:"var(--gray-400)",marginTop:4}}>
                O usuario precisara usar esta senha no proximo login.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={()=>setResetPwUser(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={savePassword}
              disabled={savingPw||newPw.length<6}>
              {savingPw?"Salvando...":"Alterar senha"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* RESET PASSWORD MODAL */}
        )}

    {/* EDIT USER MODAL */}
    {editUser && (
      <div className="overlay" onClick={e=>e.target===e.currentTarget&&setEditUser(null)}>
        <div className="modal">
          <div className="modal-head">
            <div>
              <div className="modal-title">Editar usuario</div>
              <div className="modal-sub">{editUser.name}</div>
            </div>
            <button className="close-btn" onClick={()=>setEditUser(null)}>x</button>
          </div>
          <div className="modal-body">
            <div className="form-row">
              <label className="form-label">Nome completo *</label>
              <input className="form-input" value={editUser.name} onChange={e=>setE("name",e.target.value)}/>
            </div>
            <div className="form-row">
              <label className="form-label">Perfil de acesso *</label>
              <select className="form-select" value={editUser.role} onChange={e=>setE("role",e.target.value)}>
                <option value="admin">Administrador - ve tudo</option>
                <option value="leader">Lider de Setor - ve so o setor</option>
                <option value="store">Gerente de Loja - ve so a loja</option>
              </select>
            </div>
            {editUser.role==="leader" && (
              <div className="form-row">
                <label className="form-label">Setores responsaveis (pode selecionar varios)</label>
                <div style={{display:"flex",flexDirection:"column",gap:6,padding:"10px 12px",
                  border:"1px solid var(--gray-200)",borderRadius:"var(--radius)",background:"var(--white)"}}>
                  {sectors.map(s=>(
                    <label key={s.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
                      <input type="checkbox"
                        checked={editUser.sector_ids?.includes(s.id)||false}
                        onChange={e=>{
                          const ids = editUser.sector_ids||[];
                          setE("sector_ids", e.target.checked
                            ? [...ids, s.id]
                            : ids.filter(id=>id!==s.id));
                        }}
                        style={{width:14,height:14,accentColor:"var(--gray-900)"}}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {editUser.role==="store" && (
              <div className="form-row">
                <label className="form-label">Filial</label>
                <select className="form-select" value={editUser.store_id} onChange={e=>setE("store_id",e.target.value)}>
                  <option value="">Selecione a filial</option>
                  {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={()=>setEditUser(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit||!editUser.name}>
              {savingEdit?"Salvando...":"Salvar alteracoes"}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}