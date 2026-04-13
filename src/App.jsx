import { useState, useEffect } from "react";

// ── MOCK DATA ──────────────────────────────────────────────────
const MOCK_USER    = { name: "Roberto Alves", role: "admin", initials: "RA", store: null, sector: null };
const MOCK_SECTORS = [
  { id:1, name:"Tecnologia da Informação", abbr:"T.I",  color:"#18181b" },
  { id:2, name:"Recursos Humanos",         abbr:"RH",   color:"#18181b" },
  { id:3, name:"Financeiro",               abbr:"FIN",  color:"#18181b" },
  { id:4, name:"Manutenção",               abbr:"MNT",  color:"#18181b" },
];
const MOCK_TICKETS = [
  { id:1087, title:"Computador travando no caixa 02",     sector:"T.I",  store:"Filial 30", status:"resolved",    priority:"high",   created:"2026-03-24T09:15:00", updated:"2026-03-24T11:29:00", obs:[{author:"Carlos",text:"Memória RAM substituída.",at:"2026-03-24T11:20:00"}] },
  { id:1098, title:"Divergência no fechamento do caixa",  sector:"FIN",  store:"Filial 01", status:"in_analysis", priority:"high",   created:"2026-03-25T14:00:00", updated:"2026-03-25T14:30:00", obs:[] },
  { id:1102, title:"Ar-condicionado sem funcionar",       sector:"MNT",  store:"Filial 30", status:"open",        priority:"medium", created:"2026-03-26T08:45:00", updated:"2026-03-26T08:45:00", obs:[] },
  { id:1105, title:"Dúvida sobre adiantamento salarial",  sector:"RH",   store:"Filial 15", status:"closed",      priority:"low",    created:"2026-03-22T10:00:00", updated:"2026-03-22T16:00:00", obs:[{author:"Ana RH",text:"Encaminhado para análise.",at:"2026-03-22T15:55:00"}] },
  { id:1109, title:"Sistema PDV travando no caixa 03",    sector:"T.I",  store:"Filial 30", status:"open",        priority:"high",   created:"2026-03-26T11:30:00", updated:"2026-03-26T11:30:00", obs:[] },
  { id:1112, title:"Impressora sem papel — caixa 01",     sector:"T.I",  store:"Filial 15", status:"resolved",    priority:"low",    created:"2026-03-26T07:00:00", updated:"2026-03-26T07:40:00", obs:[{author:"Carlos",text:"Papel reposto.",at:"2026-03-26T07:38:00"}] },
];

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

const fmtDate  = (iso) => new Date(iso).toLocaleDateString("pt-BR", {day:"2-digit",month:"2-digit",year:"numeric"});
const fmtFull  = (iso) => new Date(iso).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
const fmtShort = (iso) => {
  const d=new Date(iso), now=new Date(), diff=Math.floor((now-d)/60000);
  if(diff<60) return `${diff}min`;
  if(diff<1440) return `${Math.floor(diff/60)}h`;
  return fmtDate(iso);
};

// ── CSS ────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --white:   #ffffff;
  --gray-50: #fafafa;
  --gray-100:#f4f4f5;
  --gray-200:#e4e4e7;
  --gray-300:#d4d4d8;
  --gray-400:#a1a1aa;
  --gray-500:#71717a;
  --gray-600:#52525b;
  --gray-700:#3f3f46;
  --gray-800:#27272a;
  --gray-900:#18181b;
  --black:   #09090b;
  --red:     #dc2626;
  --green:   #16a34a;
  --blue:    #2563eb;
  --amber:   #d97706;
  --font:    'IBM Plex Sans', sans-serif;
  --mono:    'IBM Plex Mono', monospace;
  --sidebar: 220px;
  --radius:  6px;
  --ease:    0.15s ease;
}

html, body { height: 100%; background: var(--gray-50); color: var(--gray-900); font-family: var(--font); font-size: 14px; -webkit-font-smoothing: antialiased; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 99px; }

/* ── LAYOUT ── */
.app { display: flex; min-height: 100vh; }

/* ── SIDEBAR ── */
.sidebar {
  width: var(--sidebar);
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0; top: 0; bottom: 0;
  z-index: 100;
}
.sb-logo {
  padding: 20px 18px 16px;
  border-bottom: 1px solid var(--gray-200);
}
.sb-logo-mark {
  font-family: var(--font);
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.3px;
}
.sb-logo-sub {
  font-size: 11px;
  color: var(--gray-400);
  margin-top: 2px;
  font-weight: 400;
}
.sb-nav { flex: 1; padding: 10px 8px; overflow-y: auto; }
.sb-section {
  font-size: 10px;
  font-weight: 500;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 10px 10px 4px;
}
.sb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--gray-500);
  font-size: 13px;
  font-weight: 400;
  transition: var(--ease);
  margin-bottom: 1px;
}
.sb-item:hover { background: var(--gray-100); color: var(--gray-900); }
.sb-item.active { background: var(--gray-100); color: var(--gray-900); font-weight: 500; }
.sb-item-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--gray-300);
  flex-shrink: 0;
}
.sb-item.active .sb-item-dot { background: var(--gray-900); }
.sb-badge {
  margin-left: auto;
  background: var(--gray-900);
  color: var(--white);
  font-size: 10px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 99px;
  font-family: var(--mono);
}
.sb-user {
  padding: 12px;
  border-top: 1px solid var(--gray-200);
}
.sb-user-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: var(--radius);
  cursor: pointer;
}
.sb-user-row:hover { background: var(--gray-100); }
.sb-avatar {
  width: 28px; height: 28px;
  border-radius: 4px;
  background: var(--gray-900);
  color: var(--white);
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}
.sb-user-name { font-size: 12px; font-weight: 500; color: var(--gray-800); }
.sb-user-role { font-size: 10px; color: var(--gray-400); }
.sb-logout {
  width: 100%;
  margin-top: 4px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  color: var(--gray-500);
  font-family: var(--font);
  font-size: 12px;
  cursor: pointer;
  transition: var(--ease);
  text-align: left;
}
.sb-logout:hover { border-color: var(--gray-300); color: var(--gray-700); background: var(--gray-50); }

/* ── MAIN ── */
.main { margin-left: var(--sidebar); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

/* ── TOPBAR ── */
.topbar {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: 0 28px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-title { font-size: 14px; font-weight: 500; color: var(--gray-900); }
.topbar-right { display: flex; align-items: center; gap: 8px; }

/* ── PAGE ── */
.page { padding: 24px 28px; flex: 1; }

/* ── STATS ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.stat {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  padding: 16px 18px;
}
.stat-val { font-size: 26px; font-weight: 300; color: var(--gray-900); line-height: 1; letter-spacing: -0.5px; font-family: var(--mono); }
.stat-label { font-size: 11px; color: var(--gray-400); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-sub { font-size: 11px; color: var(--gray-500); margin-top: 6px; }

/* ── CARD ── */
.card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  margin-bottom: 16px;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--gray-100);
}
.card-title { font-size: 13px; font-weight: 500; color: var(--gray-800); }
.card-body { padding: 18px; }

/* ── TABLE ── */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead tr { border-bottom: 1px solid var(--gray-100); }
th {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 10px 18px;
  text-align: left;
  white-space: nowrap;
}
td { padding: 12px 18px; border-bottom: 1px solid var(--gray-100); font-size: 13px; vertical-align: middle; color: var(--gray-700); }
tr:last-child td { border-bottom: none; }
tbody tr { transition: var(--ease); cursor: pointer; }
tbody tr:hover { background: var(--gray-50); }

/* ── STATUS ── */
.status-cell { display: flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.status-label { font-size: 12px; color: var(--gray-600); }

/* ── PRIORITY ── */
.priority-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  border-radius: 99px;
  vertical-align: middle;
  margin-right: 6px;
}

/* ── TICKET ID ── */
.ticket-id {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--gray-400);
}

/* ── SECTOR TAG ── */
.sector-tag {
  display: inline-block;
  padding: 2px 7px;
  border: 1px solid var(--gray-200);
  border-radius: 3px;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--gray-600);
  font-family: var(--mono);
  background: var(--gray-50);
}

/* ── FILTER BAR ── */
.filter-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  border: 1px solid var(--gray-200);
  color: var(--gray-500);
  background: var(--white);
  transition: var(--ease);
}
.filter-btn:hover { border-color: var(--gray-300); color: var(--gray-700); }
.filter-btn.active { background: var(--gray-900); border-color: var(--gray-900); color: var(--white); }

/* ── SEARCH ── */
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--gray-400); font-size: 12px; pointer-events: none; }
.search-input {
  padding: 7px 10px 7px 30px;
  border-radius: var(--radius);
  background: var(--white);
  border: 1px solid var(--gray-200);
  color: var(--gray-900);
  font-family: var(--font);
  font-size: 13px;
  outline: none;
  transition: var(--ease);
  width: 220px;
}
.search-input:focus { border-color: var(--gray-400); }
.search-input::placeholder { color: var(--gray-400); }

/* ── BUTTONS ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: var(--radius);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--ease);
  border: 1px solid transparent;
}
.btn-primary { background: var(--gray-900); color: var(--white); }
.btn-primary:hover { background: var(--gray-700); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-outline { background: var(--white); border-color: var(--gray-200); color: var(--gray-600); }
.btn-outline:hover { border-color: var(--gray-300); color: var(--gray-900); background: var(--gray-50); }
.btn-ghost { background: transparent; color: var(--gray-500); }
.btn-ghost:hover { color: var(--gray-900); background: var(--gray-100); }
.btn-danger { background: var(--white); border-color: #fca5a5; color: var(--red); }
.btn-danger:hover { background: #fef2f2; }
.btn-sm { padding: 5px 10px; font-size: 11.5px; }

/* ── MODAL ── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px;
  overflow-y: auto;
  animation: fadeIn 0.1s ease;
}
.modal {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  width: 100%;
  max-width: 560px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  animation: fadeUp 0.15s ease;
}
.modal-head {
  padding: 18px 20px;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.modal-title { font-size: 14px; font-weight: 500; color: var(--gray-900); }
.modal-sub { font-size: 12px; color: var(--gray-400); margin-top: 2px; }
.modal-body { padding: 20px; max-height: 65vh; overflow-y: auto; }
.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--gray-100);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.close-btn {
  width: 28px; height: 28px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid var(--gray-200);
  color: var(--gray-400);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  transition: var(--ease);
  flex-shrink: 0;
}
.close-btn:hover { color: var(--gray-700); border-color: var(--gray-300); }

/* ── FORM ── */
.form-row { margin-bottom: 14px; }
.form-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}
.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--radius);
  background: var(--white);
  border: 1px solid var(--gray-200);
  color: var(--gray-900);
  font-family: var(--font);
  font-size: 13px;
  outline: none;
  transition: var(--ease);
}
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--gray-400); }
.form-textarea { resize: vertical; min-height: 90px; }
.form-select option { background: var(--white); }
.form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-hint { font-size: 11px; color: var(--gray-400); margin-top: 4px; }

/* ── OBSERVATION ── */
.obs-item {
  padding: 12px 14px;
  border-left: 2px solid var(--gray-200);
  margin-bottom: 10px;
  background: var(--gray-50);
  border-radius: 0 4px 4px 0;
}
.obs-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.obs-author { font-size: 12px; font-weight: 500; color: var(--gray-700); }
.obs-time { font-size: 11px; color: var(--gray-400); font-family: var(--mono); }
.obs-text { font-size: 13px; color: var(--gray-600); line-height: 1.6; }

/* ── INFO GRID ── */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
.info-box {
  padding: 10px 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius);
}
.info-key { font-size: 10px; font-weight: 500; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
.info-val { font-size: 13px; color: var(--gray-800); font-weight: 400; }

/* ── EMPTY ── */
.empty { text-align: center; padding: 48px 20px; color: var(--gray-400); font-size: 13px; }

/* ── ALERTS ── */
.alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 10px 14px; border-radius: var(--radius); font-size: 12.5px; margin-bottom: 14px; }
.alert-error   { background: #fef2f2; border: 1px solid #fecaca; color: var(--red);   padding: 10px 14px; border-radius: var(--radius); font-size: 12.5px; margin-bottom: 14px; }

/* ── LOGIN ── */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
}
.login-card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  padding: 40px 36px;
  width: 380px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.login-brand { font-size: 18px; font-weight: 600; color: var(--gray-900); margin-bottom: 2px; letter-spacing: -0.3px; }
.login-sub { font-size: 12px; color: var(--gray-400); margin-bottom: 28px; }
.login-btn {
  width: 100%;
  padding: 9px;
  background: var(--gray-900);
  border: none;
  border-radius: var(--radius);
  color: var(--white);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--ease);
  margin-top: 4px;
}
.login-btn:hover { background: var(--gray-700); }
.login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.login-err { font-size: 12px; color: var(--red); margin-top: 10px; text-align: center; }
.login-hint {
  margin-top: 20px;
  padding: 10px 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius);
  font-size: 11.5px;
  color: var(--gray-500);
  line-height: 1.7;
}

/* ── TABS ── */
.tabs { display: flex; gap: 3px; margin-bottom: 18px; border-bottom: 1px solid var(--gray-200); }
.tab { padding: 8px 14px; font-size: 13px; font-weight: 400; cursor: pointer; color: var(--gray-500); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: var(--ease); }
.tab:hover { color: var(--gray-900); }
.tab.active { color: var(--gray-900); border-bottom-color: var(--gray-900); font-weight: 500; }

@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

// ── APP ────────────────────────────────────────────────────────
export default function App() {
  const [user,    setUser]    = useState(null);
  const [page,    setPage]    = useState("dashboard");
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(null);

  if (!user) return <LoginPage onLogin={setUser} />;

  const openCount = tickets.filter(t => t.status === "open").length;
  const inACount  = tickets.filter(t => t.status === "in_analysis").length;

  const navItems = [
    { id:"dashboard", label:"Painel" },
    { id:"tickets",   label:"Chamados", badge: openCount + inACount || null },
    { id:"new",       label:"Novo chamado" },
    { id:"self",      label:"Registro de serviço" },
    { id:"settings",  label:"Configurações" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-mark">ServiceDesk</div>
            <div className="sb-logo-sub">Gestão de chamados</div>
          </div>
          <nav className="sb-nav">
            <div className="sb-section">Menu</div>
            {navItems.map(n => (
              <div key={n.id} className={`sb-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
                <div className="sb-item-dot" />
                {n.label}
                {n.badge && <span className="sb-badge">{n.badge}</span>}
              </div>
            ))}
          </nav>
          <div className="sb-user">
            <div className="sb-user-row">
              <div className="sb-avatar">{MOCK_USER.initials}</div>
              <div>
                <div className="sb-user-name">{MOCK_USER.name}</div>
                <div className="sb-user-role">Administrador</div>
              </div>
            </div>
            <button className="sb-logout" onClick={() => setUser(null)}>Sair</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {page === "dashboard" && <DashboardPage tickets={tickets} setPage={setPage} onSelect={t => setModal(t)} />}
          {page === "tickets"   && <TicketsPage   tickets={tickets} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} onSelect={t => setModal(t)} />}
          {page === "new"       && <NewTicketPage  onSubmit={(t) => { setTickets(p => [t,...p]); setPage("tickets"); }} />}
          {page === "self"      && <SelfTicketPage onSubmit={(t) => { setTickets(p => [t,...p]); setPage("tickets"); }} />}
          {page === "settings"  && <SettingsPage />}
        </main>
      </div>

      {modal && (
        <TicketModal
          ticket={modal}
          onClose={() => setModal(null)}
          onUpdate={(upd) => { setTickets(p => p.map(t => t.id===upd.id?upd:t)); setModal(upd); }}
        />
      )}
    </>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [load,  setLoad]  = useState(false);

  const submit = async () => {
    setLoad(true); setErr("");
    await new Promise(r => setTimeout(r, 600));
    if (email === "admin@empresa.com" && pass === "admin123") {
      onLogin({ name:"Admin Geral", initials:"AG", role:"admin" });
    } else {
      setErr("E-mail ou senha incorretos.");
    }
    setLoad(false);
  };

  return (
    <>
      <style>{CSS}</style>
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
          <div className="login-hint">
            <strong>Demo:</strong> admin@empresa.com / admin123
          </div>
        </div>
      </div>
    </>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────
function DashboardPage({ tickets, setPage, onSelect }) {
  const total    = tickets.length;
  const open     = tickets.filter(t => t.status==="open").length;
  const analysis = tickets.filter(t => t.status==="in_analysis").length;
  const resolved = tickets.filter(t => t.status==="resolved").length;
  const recent   = [...tickets].sort((a,b) => new Date(b.updated)-new Date(a.updated)).slice(0,5);

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Painel</div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => setPage("new")}>
            Novo chamado
          </button>
        </div>
      </div>
      <div className="page">
        <div className="stats-row">
          {[
            { val: total,    label: "Total",       sub: "chamados" },
            { val: open,     label: "Abertos",     sub: "aguardando atendimento" },
            { val: analysis, label: "Em análise",  sub: "em andamento" },
            { val: resolved, label: "Resolvidos",  sub: "este mês" },
          ].map((s,i) => (
            <div key={i} className="stat">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">Chamados recentes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("tickets")}>Ver todos</button>
          </div>
          <TicketTable tickets={recent} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}

// ── TICKETS PAGE ───────────────────────────────────────────────
function TicketsPage({ tickets, filter, setFilter, search, setSearch, onSelect }) {
  const filtered = tickets.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !String(t.id).includes(search)) return false;
    return true;
  });

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Chamados</div>
        <div className="topbar-right">
          <div className="search-wrap">
            <span className="search-icon">&#9906;</span>
            <input className="search-input" placeholder="Buscar chamado..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="page">
        <div className="filter-bar">
          {[["all","Todos"],["open","Abertos"],["in_analysis","Em análise"],["resolved","Resolvidos"],["closed","Fechados"]].map(([v,l]) => (
            <button key={v} className={`filter-btn ${filter===v?"active":""}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
          <span style={{fontSize:11,color:"var(--gray-400)",marginLeft:4}}>{filtered.length} resultado{filtered.length!==1?"s":""}</span>
        </div>
        <div className="card">
          {filtered.length === 0
            ? <div className="empty">Nenhum chamado encontrado.</div>
            : <TicketTable tickets={filtered} onSelect={onSelect} />
          }
        </div>
      </div>
    </div>
  );
}

// ── TICKET TABLE ───────────────────────────────────────────────
function TicketTable({ tickets, onSelect }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>Título</th>
            <th>Setor</th>
            <th>Filial</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Atualizado</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => {
            const sc = STATUS[t.status];
            const pc = PRIORITY[t.priority];
            return (
              <tr key={t.id} onClick={() => onSelect(t)}>
                <td><span className="ticket-id">#{t.id}</span></td>
                <td style={{fontWeight:400,color:"var(--gray-900)",maxWidth:280}}>
                  <span style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {t.title}
                  </span>
                </td>
                <td><span className="sector-tag">{t.sector}</span></td>
                <td style={{color:"var(--gray-500)",fontSize:12}}>{t.store}</td>
                <td>
                  <div className="status-cell">
                    <div className="status-dot" style={{background:sc.dot}} />
                    <span className="status-label">{sc.label}</span>
                  </div>
                </td>
                <td>
                  <span className="priority-bar" style={{background:pc.bar}} />
                  <span style={{fontSize:12,color:"var(--gray-500)"}}>{pc.label}</span>
                </td>
                <td style={{color:"var(--gray-400)",fontSize:11.5,fontFamily:"var(--mono)"}}>{fmtShort(t.updated)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── TICKET MODAL ───────────────────────────────────────────────
function TicketModal({ ticket, onClose, onUpdate }) {
  const [tab,     setTab]     = useState("detail");
  const [status,  setStatus]  = useState(ticket.status);
  const [obs,     setObs]     = useState("");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");

  const sc = STATUS[status];
  const pc = PRIORITY[ticket.priority];

  const saveStatus = () => {
    if (status === ticket.status) return;
    onUpdate({ ...ticket, status });
    setSuccess("Status atualizado.");
    setTimeout(() => setSuccess(""), 2500);
  };

  const addObs = () => {
    if (!obs.trim()) return;
    setSaving(true);
    setTimeout(() => {
      const updated = {
        ...ticket,
        observations: [...(ticket.obs||[]), { author:"Admin", text:obs, at:new Date().toISOString() }]
      };
      onUpdate(updated);
      setObs("");
      setSaving(false);
      setSuccess("Observação adicionada.");
      setTimeout(() => setSuccess(""), 2500);
    }, 500);
  };

  return (
    <div className="overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div style={{fontSize:11,color:"var(--gray-400)",fontFamily:"var(--mono)",marginBottom:4}}>
              Chamado #{ticket.id}
            </div>
            <div className="modal-title">{ticket.title}</div>
            <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
              <div className="status-cell">
                <div className="status-dot" style={{background:sc.dot}} />
                <span className="status-label">{sc.label}</span>
              </div>
              <span className="sector-tag">{ticket.sector}</span>
              <span style={{fontSize:11,color:"var(--gray-400)"}}>{ticket.store}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {success && <div className="alert-success">{success}</div>}

          <div className="tabs">
            {[["detail","Detalhes"],["obs","Observações"],["actions","Ações"]].map(([v,l]) => (
              <div key={v} className={`tab ${tab===v?"active":""}`} onClick={() => setTab(v)}>{l}</div>
            ))}
          </div>

          {tab === "detail" && (
            <>
              <div className="info-grid">
                <div className="info-box">
                  <div className="info-key">Filial</div>
                  <div className="info-val">{ticket.store}</div>
                </div>
                <div className="info-box">
                  <div className="info-key">Setor</div>
                  <div className="info-val">{ticket.sector}</div>
                </div>
                <div className="info-box">
                  <div className="info-key">Prioridade</div>
                  <div className="info-val">
                    <span className="priority-bar" style={{background:pc.bar}} />
                    {pc.label}
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-key">Aberto em</div>
                  <div className="info-val" style={{fontFamily:"var(--mono)",fontSize:12}}>{fmtFull(ticket.created)}</div>
                </div>
              </div>
            </>
          )}

          {tab === "obs" && (
            <>
              {(!ticket.obs || ticket.obs.length === 0) && (
                <div className="empty">Nenhuma observação ainda.</div>
              )}
              {ticket.obs?.map((o,i) => (
                <div key={i} className="obs-item">
                  <div className="obs-meta">
                    <span className="obs-author">{o.author}</span>
                    <span className="obs-time">{fmtFull(o.at)}</span>
                  </div>
                  <div className="obs-text">{o.text}</div>
                </div>
              ))}
              <div style={{marginTop:14}}>
                <div className="form-label">Nova observação</div>
                <textarea className="form-textarea" placeholder="Descreva o que foi feito..."
                  value={obs} onChange={e => setObs(e.target.value)} />
                <button className="btn btn-primary btn-sm" style={{marginTop:8}} onClick={addObs} disabled={saving||!obs.trim()}>
                  {saving?"Salvando...":"Adicionar"}
                </button>
              </div>
            </>
          )}

          {tab === "actions" && (
            <>
              <div className="form-label">Alterar status</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {Object.entries(STATUS).map(([k,v]) => (
                  <button key={k}
                    className={`btn btn-sm ${status===k?"btn-primary":"btn-outline"}`}
                    onClick={() => setStatus(k)}>
                    <div className="status-dot" style={{background:v.dot}} />
                    {v.label}
                  </button>
                ))}
              </div>
              {status !== ticket.status && (
                <button className="btn btn-primary btn-sm" onClick={saveStatus}>Salvar status</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NEW TICKET ─────────────────────────────────────────────────
function NewTicketPage({ onSubmit }) {
  const [form, setForm] = useState({ title:"", desc:"", sector:"", priority:"medium", store:"" });
  const [done, setDone] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const submit = () => {
    if (!form.title || !form.sector) return;
    onSubmit({ id: 1100+Math.floor(Math.random()*900), title:form.title, sector:form.sector,
      store:form.store||"Filial 01", status:"open", priority:form.priority,
      created:new Date().toISOString(), updated:new Date().toISOString(), obs:[] });
  };

  return (
    <div>
      <div className="topbar"><div className="topbar-title">Novo chamado</div></div>
      <div className="page">
        <div className="card" style={{maxWidth:560}}>
          <div className="card-head"><span className="card-title">Abrir chamado</span></div>
          <div className="card-body">
            <div className="form-row">
              <label className="form-label">Título *</label>
              <input className="form-input" placeholder="Descreva o problema brevemente"
                value={form.title} onChange={e => set("title",e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Descrição</label>
              <textarea className="form-textarea" placeholder="Detalhes adicionais..."
                value={form.desc} onChange={e => set("desc",e.target.value)} />
            </div>
            <div className="form-2col">
              <div className="form-row">
                <label className="form-label">Setor responsável *</label>
                <select className="form-select" value={form.sector} onChange={e => set("sector",e.target.value)}>
                  <option value="">Selecione</option>
                  {MOCK_SECTORS.map(s => <option key={s.id} value={s.abbr}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Prioridade</label>
                <select className="form-select" value={form.priority} onChange={e => set("priority",e.target.value)}>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button className="btn btn-primary" onClick={submit} disabled={!form.title||!form.sector}>
                Abrir chamado
              </button>
              <button className="btn btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SELF TICKET ────────────────────────────────────────────────
function SelfTicketPage({ onSubmit }) {
  const [form, setForm] = useState({ title:"", desc:"", sector:"", store:"", action:"" });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const submit = () => {
    if (!form.title || !form.sector) return;
    onSubmit({ id:1100+Math.floor(Math.random()*900), title:form.title, sector:form.sector,
      store:form.store||"Geral", status:"resolved", priority:"low",
      created:new Date().toISOString(), updated:new Date().toISOString(),
      obs: form.action ? [{ author:"Admin", text:form.action, at:new Date().toISOString() }] : [] });
  };

  return (
    <div>
      <div className="topbar"><div className="topbar-title">Registro de serviço</div></div>
      <div className="page">
        <div className="card" style={{maxWidth:560}}>
          <div className="card-head"><span className="card-title">Registrar atendimento</span></div>
          <div className="card-body">
            <div style={{padding:"10px 12px",background:"var(--gray-50)",border:"1px solid var(--gray-200)",
              borderRadius:"var(--radius)",marginBottom:16,fontSize:12,color:"var(--gray-500)",lineHeight:1.6}}>
              Use para registrar atendimentos recebidos via WhatsApp, telefone ou presencial —
              sem chamado formal aberto pelo usuário.
            </div>
            <div className="form-row">
              <label className="form-label">Título do atendimento *</label>
              <input className="form-input" placeholder="Ex: Impressora não compartilhada — Caixa 01"
                value={form.title} onChange={e => set("title",e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Descrição do problema</label>
              <textarea className="form-textarea" placeholder="O que foi relatado..."
                value={form.desc} onChange={e => set("desc",e.target.value)} />
            </div>
            <div className="form-2col">
              <div className="form-row">
                <label className="form-label">Setor *</label>
                <select className="form-select" value={form.sector} onChange={e => set("sector",e.target.value)}>
                  <option value="">Selecione</option>
                  {MOCK_SECTORS.map(s => <option key={s.id} value={s.abbr}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Filial atendida</label>
                <input className="form-input" placeholder="Ex: Filial 30"
                  value={form.store} onChange={e => set("store",e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">O que foi feito</label>
              <textarea className="form-textarea" placeholder="Descreva a solução aplicada..."
                value={form.action} onChange={e => set("action",e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={submit} disabled={!form.title||!form.sector}>
              Salvar registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PAGE ──────────────────────────────────────────────
function SettingsPage() {
  const [tab, setTab] = useState("sectors");
  return (
    <div>
      <div className="topbar"><div className="topbar-title">Configurações</div></div>
      <div className="page">
        <div className="tabs">
          {[["sectors","Setores"],["stores","Filiais"],["users","Usuários"]].map(([v,l]) => (
            <div key={v} className={`tab ${tab===v?"active":""}`} onClick={() => setTab(v)}>{l}</div>
          ))}
        </div>

        {tab === "sectors" && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">Setores ({MOCK_SECTORS.length})</span>
              <button className="btn btn-primary btn-sm">Adicionar</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nome</th><th>Abreviação</th><th></th></tr></thead>
                <tbody>
                  {MOCK_SECTORS.map(s => (
                    <tr key={s.id}>
                      <td style={{fontWeight:400}}>{s.name}</td>
                      <td><span className="sector-tag">{s.abbr}</span></td>
                      <td><button className="btn btn-ghost btn-sm">Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "stores" && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">Filiais</span>
              <button className="btn btn-primary btn-sm">Adicionar</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nome</th><th>Cidade</th><th></th></tr></thead>
                <tbody>
                  {["Filial 01 — Centro","Filial 15 — Sul","Filial 30 — Norte"].map((n,i) => (
                    <tr key={i}>
                      <td>{n}</td>
                      <td style={{color:"var(--gray-400)",fontSize:12}}>São Paulo</td>
                      <td><button className="btn btn-ghost btn-sm">Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">Usuários</span>
              <button className="btn btn-primary btn-sm">Adicionar</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th></th></tr></thead>
                <tbody>
                  {[
                    ["Admin Geral",    "admin@empresa.com",   "Administrador"],
                    ["Carlos T.I",     "ti@empresa.com",      "Líder — T.I"],
                    ["Filial 30",      "filial30@empresa.com","Loja"],
                  ].map(([n,e,r],i) => (
                    <tr key={i}>
                      <td style={{fontWeight:400}}>{n}</td>
                      <td style={{color:"var(--gray-400)",fontSize:12,fontFamily:"var(--mono)"}}>{e}</td>
                      <td style={{fontSize:12,color:"var(--gray-500)"}}>{r}</td>
                      <td><button className="btn btn-ghost btn-sm">Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
