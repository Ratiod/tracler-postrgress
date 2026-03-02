import React, { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const api = {
  get:    (path)       => fetch(`${API}${path}`).then(r=>r.json()),
  post:   (path, body) => fetch(`${API}${path}`, { method:"POST",   headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }).then(r=>r.json()),
  put:    (path, body) => fetch(`${API}${path}`, { method:"PUT",    headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }).then(r=>r.json()),
  delete: (path)       => fetch(`${API}${path}`, { method:"DELETE" }).then(r=>r.json()),
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#080a10; --s1:#0d1018; --s2:#131720; --s3:#1a1f2e; --s4:#222736;
    --b1:#1e2436; --b2:#2a3148; --b3:#364060;
    --acc:#d4ff1e; --blue:#4fc3f7; --purple:#b39ddb;
    --red:#ff5252; --green:#69f0ae; --orange:#ffab40;
    --t1:#e8ecf4; --t2:#8892aa; --t3:#4a5470;
    --r:6px; --r2:10px; --r3:14px;
  }
  body { background:var(--bg); color:var(--t1); font-family:'Barlow',sans-serif; font-size:14px; line-height:1.5; overflow:hidden; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--b2); border-radius:2px; }
  .bc { font-family:'Barlow Condensed',sans-serif; }
  .mono { font-family:'JetBrains Mono',monospace; }
  button { font-family:'Barlow',sans-serif; cursor:pointer; border:none; outline:none; }
  input,select,textarea { font-family:'Barlow',sans-serif; outline:none; }
  select option { background:var(--s2); }
  [contenteditable]:empty:before { content:attr(data-placeholder); color:var(--t3); pointer-events:none; }
  [contenteditable] img { max-width:100%; border-radius:6px; margin:8px 0; display:block; }
  .ts-note img { max-width:100%; border-radius:8px; margin:8px 0; display:block; cursor:pointer; }
  .ts-note img:hover { opacity:0.9; }
  [contenteditable] h2 { font-size:20px; font-weight:700; margin:16px 0 6px; color:var(--t1); }
  [contenteditable] h3 { font-size:16px; font-weight:600; margin:12px 0 4px; color:var(--t2); }
  [contenteditable] ul, [contenteditable] ol { padding-left:22px; margin:6px 0; }
  [contenteditable] hr { border:none; border-top:1px solid var(--b2); margin:16px 0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes slideRight { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  .fade-up { animation:fadeUp 0.25s ease forwards; }
  .btn { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--r);font-size:13px;font-weight:500;transition:all 0.15s;white-space:nowrap; }
  .btn-acc { background:var(--acc);color:#080a10; }
  .btn-acc:hover { background:#c8f200;transform:translateY(-1px); }
  .btn-ghost { background:transparent;color:var(--t2);border:1px solid var(--b2); }
  .btn-ghost:hover { background:var(--s3);color:var(--t1);border-color:var(--b3); }
  .btn-sub { background:var(--s3);color:var(--t1);border:1px solid var(--b2); }
  .btn-sub:hover { background:var(--s4);border-color:var(--b3); }
  .btn-red { background:rgba(255,82,82,0.12);color:var(--red);border:1px solid rgba(255,82,82,0.25); }
  .btn-red:hover { background:rgba(255,82,82,0.22); }
  .card { background:var(--s1);border:1px solid var(--b1);border-radius:var(--r3);padding:20px; }
  input[type=text],input[type=email],input[type=date],input[type=password],select,textarea {
    background:var(--s2);border:1px solid var(--b1);border-radius:var(--r);
    color:var(--t1);padding:8px 12px;font-size:13px;width:100%;transition:border-color 0.15s;
  }
  input[type=text]:focus,input[type=email]:focus,input[type=password]:focus,select:focus,textarea:focus { border-color:var(--acc); }
  .chip { display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.03em; }
  .chip-acc    { background:rgba(212,255,30,0.12); color:var(--acc);    border:1px solid rgba(212,255,30,0.2); }
  .chip-blue   { background:rgba(79,195,247,0.12); color:var(--blue);   border:1px solid rgba(79,195,247,0.2); }
  .chip-purple { background:rgba(179,157,219,0.12);color:var(--purple); border:1px solid rgba(179,157,219,0.2); }
  .chip-red    { background:rgba(255,82,82,0.12);  color:var(--red);    border:1px solid rgba(255,82,82,0.2); }
  .chip-green  { background:rgba(105,240,174,0.12);color:var(--green);  border:1px solid rgba(105,240,174,0.2); }
  .chip-dim    { background:var(--s3);             color:var(--t2);     border:1px solid var(--b2); }
  .modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center; }
  .modal { background:var(--s1);border:1px solid var(--b2);border-radius:var(--r3);padding:28px;width:500px;max-width:94vw;max-height:86vh;overflow-y:auto;animation:fadeUp 0.2s ease; }
  .tab-bar { display:flex;background:var(--s2);border-radius:var(--r);padding:3px;gap:2px; }
  .tab { flex:1;padding:6px 10px;border-radius:5px;font-size:12px;font-weight:500;background:transparent;color:var(--t3);border:none;cursor:pointer;transition:all 0.15s;white-space:nowrap; }
  .tab.on { background:var(--s3);color:var(--t1);border:1px solid var(--b2); }
  .hr { height:1px;background:var(--b1);margin:16px 0; }
  .label-sm { font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--t3); }
  .pbar { height:5px;background:var(--b1);border-radius:3px;overflow:hidden; }
  .pfill { height:100%;border-radius:3px;transform-origin:left;animation:slideRight 0.6s ease forwards; }
  .pip { width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-family:'JetBrains Mono',monospace;font-weight:500;flex-shrink:0; }
  .pip-w { background:rgba(105,240,174,0.15);color:var(--green);border:1px solid rgba(105,240,174,0.3); }
  .pip-l { background:rgba(255,82,82,0.15);  color:var(--red);  border:1px solid rgba(255,82,82,0.3); }
  .pip-e { background:var(--s2);border:1px dashed var(--b2);color:var(--t3); }
  .ldot { width:7px;height:7px;border-radius:50%;background:var(--acc);animation:blink 1.4s infinite; }
  .tbl { width:100%;border-collapse:collapse; }
  .tbl th { text-align:left;padding:10px 14px;font-size:10px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:var(--t3);border-bottom:1px solid var(--b1); }
  .tbl td { padding:12px 14px;border-bottom:1px solid var(--b1);vertical-align:middle; }
  .tbl tr:last-child td { border-bottom:none; }
  .tbl tbody tr { transition:background 0.1s; }
  .tbl tbody tr:hover td { background:var(--s2); }
  .kcol { background:var(--s1);border:1px solid var(--b1);border-radius:var(--r3);width:230px;flex-shrink:0;display:flex;flex-direction:column; }
  .ktask { background:var(--s2);border:1px solid var(--b1);border-radius:var(--r2);padding:12px;margin:0 10px 8px;cursor:pointer;transition:border-color 0.15s; }
  .ktask:hover { border-color:var(--b3); }
  .cal-cell { border-right:1px solid var(--b1);border-bottom:1px solid var(--b1);min-height:90px;padding:6px;cursor:pointer;transition:background 0.1s; }
  .cal-cell:hover { background:var(--s2); }
  .cal-ev { padding:3px 7px;border-radius:4px;font-size:11px;font-weight:600;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .strat-card { background:var(--s1);border:1px solid var(--b1);border-radius:var(--r2);overflow:hidden;cursor:pointer;transition:all 0.2s; }
  .strat-card:hover { border-color:var(--b3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3); }
  .vts { display:flex;gap:12px;padding:12px;border-radius:var(--r);transition:background 0.1s; }
  .vts:hover { background:var(--s2); }
  .ab { border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.03em;flex-shrink:0; }
  .nav-item { display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:8px;font-size:14px;font-weight:500;color:var(--t2);cursor:pointer;transition:background 0.15s,color 0.15s;user-select:none;white-space:nowrap;overflow:hidden; }
  .nav-item:hover { background:var(--s3);color:var(--t1); }
  .nav-item.on { background:var(--s3);color:var(--acc); }
  .nav-icon { display:flex;align-items:center;justify-content:center;width:22px;height:22px;flex-shrink:0; }
  /* Sidebar — icons-only by default, expands on hover */
  aside.sidebar { width:58px; transition:width 200ms ease-in-out; overflow:hidden; flex-shrink:0; }
  aside.sidebar:hover { width:220px; }
  aside.sidebar .sb-text { opacity:0; width:0; overflow:hidden; pointer-events:none; transition:opacity 100ms,width 200ms ease-in-out; white-space:nowrap; }
  aside.sidebar:hover .sb-text { opacity:1; width:auto; transition:opacity 150ms 80ms,width 200ms ease-in-out; }
  aside.sidebar .nav-item { gap:0; justify-content:center; padding:9px 0; }
  aside.sidebar:hover .nav-item { gap:12px; justify-content:flex-start; padding:9px 10px; }
  aside.sidebar .nav-item .nav-icon { margin:0 auto; }
  aside.sidebar:hover .nav-item .nav-icon { margin:0; }
  aside.sidebar:hover .sb-logout { display:block !important; }
`;

const MAPS = ["Abyss","Ascent","Bind","Breeze","Corrode","Fracture","Haven","Icebox","Lotus","Pearl","Split","Sunset"];
const AGENTS = [
  { name:"Astra",     color:"#b39ddb", bg:"#1a1428" },
  { name:"Breach",    color:"#ffab40", bg:"#2b1a08" },
  { name:"Brimstone", color:"#ff7043", bg:"#2b1008" },
  { name:"Chamber",   color:"#d4ff1e", bg:"#1e2408" },
  { name:"Clove",     color:"#d4b0ff", bg:"#1c0e2e" },
  { name:"Cypher",    color:"#c8d0e0", bg:"#161c28" },
  { name:"Deadlock",  color:"#69f0ae", bg:"#0a1e16" },
  { name:"Fade",      color:"#d4b0ff", bg:"#1c0e2e" },
  { name:"Gekko",     color:"#a3e84f", bg:"#182010" },
  { name:"Harbor",    color:"#4fc3f7", bg:"#0b1e2b" },
  { name:"Iso",       color:"#8892aa", bg:"#141820" },
  { name:"Jett",      color:"#4fc3f7", bg:"#0b1e2b" },
  { name:"KAY/O",     color:"#c8d0e0", bg:"#161c28" },
  { name:"Killjoy",   color:"#d4ff1e", bg:"#1e2408" },
  { name:"Neon",      color:"#4fc3f7", bg:"#0b1e2b" },
  { name:"Omen",      color:"#8892aa", bg:"#141820" },
  { name:"Phoenix",   color:"#ffab40", bg:"#2b1a08" },
  { name:"Raze",      color:"#ffab40", bg:"#2b1a08" },
  { name:"Reyna",     color:"#b39ddb", bg:"#1a1428" },
  { name:"Sage",      color:"#69f0ae", bg:"#0a1e16" },
  { name:"Skye",      color:"#a3e84f", bg:"#182010" },
  { name:"Sova",      color:"#b39ddb", bg:"#1a1428" },
  { name:"Tejo",      color:"#ffab40", bg:"#2b1a08" },
  { name:"Veto",      color:"#ff5252", bg:"#2b0808" },
  { name:"Viper",     color:"#69f0ae", bg:"#0a1e16" },
  { name:"Vyse",      color:"#4fc3f7", bg:"#0b1e2b" },
  { name:"Waylay",    color:"#d4ff1e", bg:"#1e2408" },
  { name:"Yoru",      color:"#4fc3f7", bg:"#0b1e2b" },
];
const ECO_STATES = ["Full Buy","Eco","Force","Semi Buy","Bonus"];
const CAT_COLORS = {
  "Scrim":"#4fc3f7","Server Time":"#69f0ae","VOD Review":"#b39ddb","Official":"#d4ff1e","Other":"#ffab40",
};
const LABEL_COLORS = ["#4fc3f7","#d4ff1e","#ff5252","#69f0ae","#ffab40","#b39ddb","#ff80ab","#80cbc4"];

const AgentBadge = ({ name, size=32 }) => {
  const ag = AGENTS.find(a=>a.name===name) || { color:"#8892aa", bg:"#141820" };
  return <div className="ab" style={{ width:size, height:size, background:ag.bg, color:ag.color, fontSize:size*0.35, border:`1px solid ${ag.color}28` }}>{name.slice(0,2).toUpperCase()}</div>;
};
const StatBlock = ({ label, value, sub, accent }) => (
  <div className="card" style={{ position:"relative", overflow:"hidden" }}>
    {accent && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"var(--acc)" }}/>}
    <div className="label-sm" style={{ marginBottom:6 }}>{label}</div>
    <div className="bc" style={{ fontSize:36, fontWeight:900, color:accent?"var(--acc)":"var(--t1)", letterSpacing:"0.02em", lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:12,color:"var(--t2)",marginTop:2 }}>{sub}</div>}
  </div>
);
const Bar = ({ pct, color="var(--acc)" }) => (
  <div className="pbar" style={{ flex:1 }}><div className="pfill" style={{ width:`${pct}%`, background:color }}/></div>
);
const Divider = () => <div className="hr"/>;

function Modal({ onClose, title, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <span className="bc" style={{ fontSize:22,fontWeight:700,letterSpacing:"0.03em" }}>{title}</span>
          <button className="btn btn-ghost" style={{ padding:"4px 10px" }} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" style={{ maxWidth:400 }} onClick={e=>e.stopPropagation()}>
        <div className="bc" style={{ fontSize:20, fontWeight:700, marginBottom:12 }}>{title}</div>
        <div style={{ color:"var(--t2)", fontSize:14, marginBottom:20 }}>{message}</div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-red" style={{ flex:1, justifyContent:"center" }} onClick={onConfirm}>Delete</button>
          <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { key:"dashboard", label:"Dashboard",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key:"strategy",  label:"Strategy",     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { key:"tracker",   label:"Tracker",      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>, live:true },
  { key:"scrimlog",  label:"Scrim Log",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
  { key:"analysis",  label:"Data Analysis",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key:"vod",       label:"Review",       icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg> },
  { key:"tasks",     label:"Tasks",        icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { key:"calendar",  label:"Calendar",     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
];

export default function BzTracker() {
  const [page, setPage]         = useState("dashboard");
  const [stratTab, setStratTab] = useState("raw");
  const [players, setPlayers]   = useState([]);

  useEffect(()=>{ api.get("/api/players").then(d=>{ if(Array.isArray(d)) setPlayers(d); }).catch(()=>{}); }, []);

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard setPage={setPage}/>;
      case "tracker":   return <LiveTracker players={players} setPage={setPage}/>;
      case "scrimlog":  return <ScrimLog setPage={setPage}/>;
      case "strategy":  return <Strategy tab={stratTab} setTab={setStratTab}/>;
      case "analysis":  return <DataAnalysis players={players}/>;
      case "vod":       return <VodReview/>;
      case "tasks":     return <Tasks players={players} setPlayers={setPlayers}/>;
      case "calendar":  return <CalendarPage/>;
      default:          return <Dashboard setPage={setPage}/>;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        <aside className="sidebar" style={{ background:"#0d1018", borderRight:"1px solid var(--b1)", display:"flex", flexDirection:"column", zIndex:10 }}>

          {/* Logo */}
          <div style={{ padding:"16px 0 14px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", minHeight:60 }}>
            <div style={{ width:36, height:36, background:"var(--acc)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span className="bc" style={{ fontSize:15, fontWeight:900, color:"#080a10" }}>RA</span>
            </div>
            <div className="sb-text" style={{ marginLeft:10 }}>
              <div className="bc" style={{ fontSize:17, fontWeight:900, letterSpacing:"0.06em" }}>RACKER</div>
              <div className="label-sm">Team Tracker</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"4px 8px", display:"flex", flexDirection:"column", gap:2 }}>
            {NAV.map(n=>(
              <div key={n.key}
                className={`nav-item${page===n.key?" on":""}`}
                onClick={()=>setPage(n.key)}
                title={n.label}>
                <span className="nav-icon" style={{ color: page===n.key ? "var(--acc)" : "inherit", flexShrink:0 }}>{n.icon}</span>
                <span className="sb-text" style={{ flex:1 }}>{n.label}</span>
                {n.live && <div className="sb-text" style={{ width:7, height:7, borderRadius:"50%", background:"var(--acc)", animation:"blink 1.4s infinite", flexShrink:0 }}/>}
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{ borderTop:"1px solid var(--b1)", padding:"12px 0", flexShrink:0, overflow:"hidden", display:"flex", justifyContent:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"var(--acc)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#080a10", flexShrink:0 }}>AD</div>
              <div className="sb-text">
                <div style={{ fontSize:13, fontWeight:700, whiteSpace:"nowrap" }}>admin</div>
                <div style={{ fontSize:11, color:"var(--t3)", whiteSpace:"nowrap" }}>admin</div>
              </div>
            </div>
          </div>
        </aside>
        <main key={page} className="fade-up" style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {renderPage()}
        </main>
      </div>
    </>
  );
}

/* ════ DASHBOARD ════ */
function Dashboard({ setPage }) {
  const [scrims, setScrims]   = useState([]);
  const [events, setEvents]   = useState([]);
  const [pending, setPending] = useState(0);

  useEffect(()=>{
    api.get("/api/scrims").then(d=>{ if(Array.isArray(d)) setScrims(d.slice(0,5)); }).catch(()=>{});
    api.get("/api/events").then(d=>{ if(Array.isArray(d)) { const today=new Date().toISOString().slice(0,10); setEvents(d.filter(e=>e.date>=today).slice(0,3)); } }).catch(()=>{});
    api.get("/api/tasks").then(d=>{ if(Array.isArray(d)) setPending(d.filter(t=>!t.done).length); }).catch(()=>{});
  },[]);

  const wins = scrims.filter(s=>(s.res==="win"||s.res==="W")).length;
  const wr = scrims.length>0 ? Math.round((wins/scrims.length)*100) : null;

  return (
    <div style={{ padding:"28px 32px", maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em", lineHeight:1 }}>DASHBOARD</div>
          <div style={{ color:"var(--t2)", fontSize:13, marginTop:4 }}>Welcome back, Coach</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-sub" onClick={()=>setPage("tracker")}><div className="ldot"/> New Game</button>
          <button className="btn btn-acc" onClick={()=>setPage("vod")}>+ VOD Review</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        <StatBlock label="Win Rate"      value={wr!==null?`${wr}%`:"—"} sub={scrims.length>0?`${scrims.length} games`:"No games yet"} accent/>
        <StatBlock label="Games Tracked" value={scrims.length} sub="Total tracked"/>
        <StatBlock label="Pending Tasks" value={pending} sub="Across team"/>
        <StatBlock label="Upcoming"      value={events.length} sub="Events this week"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr", gap:16 }}>
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span className="bc" style={{ fontSize:18, fontWeight:700, letterSpacing:"0.04em" }}>RECENT SCRIMS</span>
            <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={()=>setPage("scrimlog")}>View all →</button>
          </div>
          {scrims.length===0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"var(--t3)" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>≡</div>
              <div style={{ fontSize:13, marginBottom:4 }}>No scrims tracked yet</div>
            </div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Date</th><th>Map</th><th>vs</th><th>Score</th><th>Result</th></tr></thead>
              <tbody>
                {scrims.map(s=>(
                  <tr key={s.id}>
                    <td style={{ color:"var(--t3)", fontSize:12 }}>{s.date}</td>
                    <td><span className="chip chip-blue">{s.map}</span></td>
                    <td style={{ fontWeight:600 }}>{s.opp}</td>
                    <td className="bc" style={{ fontSize:18, fontWeight:900 }}>{s.score}</td>
                    <td><span className={`chip ${(s.res==="win"||s.res==="W")?"chip-green":"chip-red"}`}>{(s.res==="win"||s.res==="W")?"▲ W":"▼ L"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card">
            <div className="bc" style={{ fontSize:16, fontWeight:700, letterSpacing:"0.04em", marginBottom:12 }}>UPCOMING</div>
            {events.length===0
              ? <div style={{ color:"var(--t3)", fontSize:12 }}>No events scheduled.</div>
              : events.map(e=>(
                <div key={e.id} style={{ padding:"7px 10px", borderRadius:"var(--r)", marginBottom:5, background:"var(--s2)", borderLeft:`3px solid ${e.color}` }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{e.title}</div>
                  <div style={{ fontSize:11, color:"var(--t3)" }}>{e.date} · {e.time}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════ LIVE TRACKER ════ */
function LiveTracker({ players, setPage }) {
  const [phase, setPhase]   = useState("setup");
  const [map, setMap]       = useState("Ascent");
  const [opp, setOpp]       = useState("");
  const [comp, setComp]     = useState(["Jett","Sova","Sage","Omen","Cypher"]);
  const [rounds, setRounds] = useState([]);
  const [eco, setEco]       = useState("Full Buy");
  const [strat, setStrat]   = useState("");
  const [saving, setSaving] = useState(false);

  const score = { us:rounds.filter(r=>r.res==="w").length, them:rounds.filter(r=>r.res==="l").length };

  const logRound = res => { if(rounds.length>=24) return; setRounds(p=>[...p, { res, eco, strat, n:p.length+1 }]); };

  const endGame = () => {
    setSaving(true);
    const us = rounds.filter(r=>r.res==="w").length;
    const them = rounds.filter(r=>r.res==="l").length;
    const result = us > them ? "win" : "loss";
    api.post("/api/scrims", {
      date: new Date().toISOString().slice(0,10),
      map, opp,
      comp: JSON.stringify(comp),
      score: `${us}-${them}`,
      res: result,
      rounds: JSON.stringify(rounds.map(r=>r.res))
    }).finally(()=>{ setSaving(false); setPhase("setup"); setRounds([]); });
  };

  if(phase==="setup") return (
    <div style={{ padding:"28px 32px", maxWidth:640 }}>
      <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em", marginBottom:4 }}>LIVE TRACKER</div>
      <div style={{ color:"var(--t2)", fontSize:13, marginBottom:28 }}>Configure a new game to start tracking</div>
      <div className="card" style={{ maxWidth:520 }}>
        <div className="bc" style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>New Game Setup</div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <div className="label-sm" style={{ marginBottom:6 }}>Map</div>
            <select value={map} onChange={e=>setMap(e.target.value)}>{MAPS.map(m=><option key={m}>{m}</option>)}</select>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom:6 }}>Opponent</div>
            <input type="text" placeholder="Team name..." value={opp} onChange={e=>setOpp(e.target.value)}/>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom:8 }}>Composition — {comp.length}/5</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {AGENTS.map(ag=>{ const sel=comp.includes(ag.name); return (
                <button key={ag.name} onClick={()=>{ if(sel) setComp(p=>p.filter(a=>a!==ag.name)); else if(comp.length<5) setComp(p=>[...p,ag.name]); }}
                  style={{ padding:"5px 11px", borderRadius:"var(--r)", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                    background:sel?ag.bg:"var(--s3)", color:sel?ag.color:"var(--t3)", border:`1px solid ${sel?ag.color+"44":"var(--b2)"}` }}>
                  {ag.name}
                </button>
              ); })}
            </div>
            <div style={{ display:"flex", gap:6, marginTop:10 }}>
              {comp.map((a,i)=><AgentBadge key={i} name={a} size={36}/>)}
              {Array(5-comp.length).fill(null).map((_,i)=><div key={i} style={{ width:36, height:36, border:"1px dashed var(--b2)", borderRadius:"var(--r)" }}/>)}
            </div>
          </div>
          <button className="btn btn-acc" style={{ justifyContent:"center", padding:"12px", marginTop:4 }}
            onClick={()=>comp.length===5&&opp.trim()&&setPhase("active")}>
            Start Tracking →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}><div className="ldot"/><span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"var(--acc)" }}>LIVE</span></div>
          <div className="bc" style={{ fontSize:30, fontWeight:900, letterSpacing:"0.04em" }}>{map} — vs {opp}</div>
        </div>
        <button className="btn btn-red" onClick={endGame} disabled={saving}>{saving?"Saving...":"End & Save Game"}</button>
      </div>
      <div className="card" style={{ textAlign:"center", marginBottom:18, background:"var(--s2)", border:"1px solid var(--b2)" }}>
        <div className="label-sm" style={{ marginBottom:8 }}>HALF {rounds.length>=12?2:1} · ROUND {rounds.length+1}</div>
        <div style={{ display:"flex", justifyContent:"center", gap:40, alignItems:"flex-end" }}>
          <div><div className="bc" style={{ fontSize:80, fontWeight:900, color:"var(--green)", lineHeight:1 }}>{score.us}</div><div style={{ fontSize:12, fontWeight:700, color:"var(--green)", letterSpacing:"0.08em" }}>RACKER</div></div>
          <div style={{ fontSize:30, color:"var(--t3)", paddingBottom:12 }}>:</div>
          <div><div className="bc" style={{ fontSize:80, fontWeight:900, color:"var(--red)", lineHeight:1 }}>{score.them}</div><div style={{ fontSize:12, fontWeight:700, color:"var(--red)", letterSpacing:"0.08em" }}>{opp.toUpperCase()}</div></div>
        </div>
      </div>
      <div className="card" style={{ marginBottom:16 }}>
        <div className="label-sm" style={{ marginBottom:8 }}>ROUND HISTORY</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {rounds.map((r,i)=><div key={i} className={`pip pip-${r.res}`}>{i+1}</div>)}
          {Array(Math.max(0,24-rounds.length)).fill(null).map((_,i)=><div key={`e${i}`} className="pip pip-e">{rounds.length+i+1}</div>)}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
        <div className="card">
          <div className="label-sm" style={{ marginBottom:8 }}>ECONOMY</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {ECO_STATES.map(e=>(
              <button key={e} onClick={()=>setEco(e)} style={{ padding:"5px 11px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                background:eco===e?"rgba(212,255,30,0.12)":"var(--s3)", color:eco===e?"var(--acc)":"var(--t3)",
                border:`1px solid ${eco===e?"rgba(212,255,30,0.3)":"var(--b2)"}`, opacity:eco===e?1:0.7 }}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="label-sm" style={{ marginBottom:8 }}>STRATEGY</div>
          <select value={strat} onChange={e=>setStrat(e.target.value)}>
            <option value="">— None —</option>
          </select>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        <button onClick={()=>logRound("w")} style={{ padding:"32px", borderRadius:12, cursor:"pointer", transition:"all 0.15s",
          background:"rgba(105,240,174,0.07)", color:"var(--green)", border:"2px solid rgba(105,240,174,0.2)",
          fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:900, letterSpacing:"0.1em" }}>▲ ROUND WIN</button>
        <button onClick={()=>logRound("l")} style={{ padding:"32px", borderRadius:12, cursor:"pointer", transition:"all 0.15s",
          background:"rgba(255,82,82,0.07)", color:"var(--red)", border:"2px solid rgba(255,82,82,0.2)",
          fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:900, letterSpacing:"0.1em" }}>▼ ROUND LOSS</button>
      </div>
    </div>
  );
}

/* ════ SCRIM LOG ════ */
function ScrimLog({ setPage }) {
  const [scrims, setScrims]       = useState([]);
  const [filter, setFilter]       = useState({ map:"All", res:"All", q:"" });
  const [sel, setSel]             = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState("");
  const [helperIp, setHelperIp] = useState(() => localStorage.getItem("racker_helper_ip") || "192.168.1.100");
  const [importData, setImportData] = useState({ matchId:"", apiKey:"", teamName:"" });
  const [importState, setImportState] = useState("idle");
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");

  useEffect(()=>{
    api.get("/api/scrims").then(d=>{ if(Array.isArray(d)) setScrims(d); }).catch(()=>{});
    api.get("/api/settings").then(d=>{ if(d?.henrik_api_key) setSavedApiKey(d.henrik_api_key); }).catch(()=>{});
  },[]);

  const saveHelperIp = (ip) => {
    setHelperIp(ip);
    localStorage.setItem("racker_helper_ip", ip);
  };

  const filtered = scrims.filter(s=>{
    if(filter.map!=="All"&&s.map!==filter.map) return false;
    if(filter.res!=="All"&&s.res!==filter.res) return false;
    if(filter.q&&!s.opp.toLowerCase().includes(filter.q.toLowerCase())) return false;
    return true;
  });

  const del = id => { api.delete(`/api/scrims/${id}`).catch(()=>{}); setScrims(p=>p.filter(s=>s.id!==id)); setSel(null); };

  const scanForHelper = async () => {
    // First try saved/local IP
    const ipsToTry = ["127.0.0.1"];
    // Add saved IP if different
    if (helperIp !== "127.0.0.1") ipsToTry.push(helperIp);
    // Scan common LAN subnets for a helper
    const localSubnets = ["192.168.1", "192.168.0", "10.0.0", "10.0.1", "172.16.0"];
    for (const subnet of localSubnets) {
      for (let i = 1; i <= 254; i++) ipsToTry.push(`${subnet}.${i}`);
    }
    for (const ip of ipsToTry) {
      try {
        const r = await Promise.race([
          fetch(`http://${ip}:7429/health`),
          new Promise((_,rej) => setTimeout(()=>rej(new Error("timeout")), 300)),
        ]);
        if (r.ok) {
          const data = await r.json();
          if (data.ok) {
            saveHelperIp(ip);
            return ip;
          }
        }
      } catch(e) { /* skip */ }
    }
    return null;
  };

  const handleImportFetch = async () => {
    setImportState("loading");
    setImportError("");
    try {
      // First try the saved IP quickly
      let ip = helperIp;
      try {
        const health = await Promise.race([
          fetch(`http://${ip}:7429/health`),
          new Promise((_,rej) => setTimeout(()=>rej(new Error("timeout")), 800)),
        ]);
        if (!health.ok) throw new Error("not ok");
      } catch(e) {
        // Saved IP not responding — auto scan
        setImportError("Helper not found at saved IP, scanning network…");
        ip = await scanForHelper();
        if (!ip) {
          setImportError("Could not find Racker Helper on the network. Make sure start-helper.bat is running.");
          setImportState("error");
          return;
        }
        setImportError("");
      }

      const url      = `http://${ip}:7429/import`;
      const response = await fetch(url);
      const result   = await response.json();
      if (!response.ok || result.error) {
        setImportError(result.error || "Import failed");
        setImportState("error");
        return;
      }
      setImportPreview(result.data);
      setImportState("preview");
    } catch(e) {
      setImportError("Could not reach Racker Helper. Make sure start-helper.bat is running.");
      setImportState("error");
    }
  };

  const handleImportSave = async () => {
    if (!importPreview) return;
    setImportState("saving");
    try {
      const saved = await api.post("/api/scrims", importPreview);
      if (saved.id) {
        // Re-fetch full scrim data to ensure player_stats are included
        const full = await api.get(`/api/scrims/${saved.id}`).catch(() => saved);
        setScrims(p => [full || saved, ...p]);
        setShowImport(false);
        setImportData({ matchId:"", apiKey:"", teamName:"" });
        setImportPreview(null);
        setImportState("idle");
      }
    } catch(e) {
      setImportError(e.message || "Failed to save scrim");
      setImportState("error");
    }
  };

  const resetImport = () => {
    setImportState("idle");
    setImportPreview(null);
    setImportError("");
  };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em" }}>SCRIM LOG</div>
          <div style={{ color:"var(--t2)", fontSize:13, marginTop:2 }}>{scrims.length} games tracked</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost" onClick={()=>{ setShowImport(true); resetImport(); }}>⬇ Import from Riot</button>
          <button className="btn btn-acc" onClick={()=>setPage("tracker")}><div className="ldot"/> New Game</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:18 }}>
        <input type="text" placeholder="Search opponent..." style={{ width:200 }} value={filter.q} onChange={e=>setFilter(f=>({...f,q:e.target.value}))}/>
        <select style={{ width:140 }} value={filter.map} onChange={e=>setFilter(f=>({...f,map:e.target.value}))}><option>All</option>{MAPS.map(m=><option key={m}>{m}</option>)}</select>
        <select style={{ width:120 }} value={filter.res} onChange={e=>setFilter(f=>({...f,res:e.target.value}))}><option>All</option><option value="win">Wins</option><option value="loss">Losses</option></select>
      </div>

      {scrims.length===0 ? (
        <div className="card" style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>≡</div>
          <div className="bc" style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>No Scrims Yet</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button className="btn btn-ghost" onClick={()=>{ setShowImport(true); resetImport(); }}>⬇ Import from Riot</button>
            <button className="btn btn-acc" onClick={()=>setPage("tracker")}><div className="ldot"/> Start Tracking</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>Date</th><th>Map</th><th>Opponent</th><th>Score</th><th>Result</th><th></th></tr></thead>
            <tbody>
              {filtered.map(s=>(
                <tr key={s.id} style={{ cursor:"pointer" }} onClick={()=>setSel(s)}>
                  <td className="mono" style={{ color:"var(--t3)", fontSize:12 }}>{s.date}</td>
                  <td><span className="chip chip-blue">{s.map}</span></td>
                  <td style={{ fontWeight:600 }}>vs {s.opp}</td>
                  <td><span className="bc" style={{ fontSize:22, fontWeight:900, color:(s.res==="win"||s.res==="W")?"var(--green)":"var(--red)" }}>{s.score}</span></td>
                  <td><span className={`chip ${(s.res==="win"||s.res==="W")?"chip-green":"chip-red"}`}>{(s.res==="win"||s.res==="W")?"▲ Win":"▼ Loss"}</span></td>
                  <td><button className="btn btn-red" style={{ padding:"3px 9px", fontSize:11 }} onClick={e=>{e.stopPropagation();del(s.id);}}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {sel && (() => {
        const playerStats = (() => { try { return Array.isArray(sel.player_stats) ? sel.player_stats : JSON.parse(sel.player_stats||"[]"); } catch { return []; } })();
        const blueStats   = playerStats.filter(p=>p.side==="blue");
        const redStats    = playerStats.filter(p=>p.side==="red");
        const hasStats    = playerStats.length > 0;
        const ScoreRow = ({p}) => (
          <tr>
            <td>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <AgentBadge name={p.agent} size={22}/>
                <span className="mono" style={{ fontSize:11, color:"var(--t2)" }}>{p.name}</span>
              </div>
            </td>
            <td style={{ textAlign:"right", fontWeight:700, color:"var(--acc)" }}>{p.acs}</td>
            <td style={{ textAlign:"right" }}>{p.kills}</td>
            <td style={{ textAlign:"right", color:"var(--t3)" }}>{p.deaths}</td>
            <td style={{ textAlign:"right", color:"var(--t3)" }}>{p.assists}</td>
            <td style={{ textAlign:"right", fontWeight:600, color: p.kd>=1?"var(--green)":"var(--red)" }}>{p.kd}</td>
            <td style={{ textAlign:"right", color:"var(--t2)" }}>{p.hsRate ?? "—"}%</td>
            <td style={{ textAlign:"right", color: p.firstBloods>0?"var(--green)":"var(--t3)" }}>{p.firstBloods ?? "—"}</td>
            <td style={{ textAlign:"right", color:"var(--t3)" }}>{p.plants ?? "—"}</td>
            <td style={{ textAlign:"right", color:"var(--t3)" }}>{p.defuses ?? "—"}</td>
            <td style={{ textAlign:"right" }}>
              {[p.mk5,p.mk4,p.mk3,p.mk2].map((v,i)=>v>0?(
                <span key={i} style={{ marginRight:3, fontWeight:700, fontSize:10,
                  color: i===0?"#ffd700": i===1?"#ff5252": i===2?"var(--acc)":"var(--t3)" }}>
                  {["5K","4K","3K","2K"][i]}×{v}
                </span>
              ):null)}
              {!p.mk2&&!p.mk3&&!p.mk4&&!p.mk5 && <span style={{color:"var(--t3)"}}>—</span>}
            </td>
            <td style={{ textAlign:"right", color: p.clutchWon>0?"var(--green)":"var(--t3)" }}>{p.clutchWon ?? "—"}</td>
          </tr>
        );
        return (
          <Modal onClose={()=>setSel(null)} title={`vs ${sel.opp}`}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span className="chip chip-blue">{sel.map}</span>
                <span className={`chip ${sel.res==="win"||sel.res==="W"?"chip-green":"chip-red"}`}>{sel.res==="win"||sel.res==="W"?"▲ Win":"▼ Loss"}</span>
                <span style={{ color:"var(--t3)", fontSize:12 }}>{sel.date}</span>
              </div>
              <span className="bc" style={{ fontSize:40, fontWeight:900, color:sel.res==="win"||sel.res==="W"?"var(--green)":"var(--red)" }}>{sel.score}</span>
            </div>
            <Divider/>
            <div className="label-sm" style={{ marginBottom:8 }}>Round History</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:20 }}>
              {(()=>{ try { return Array.isArray(sel.rounds)?sel.rounds:JSON.parse(sel.rounds||"[]"); } catch{ return []; } })().map((r,i)=><div key={i} className={`pip pip-${r}`}>{i+1}</div>)}
            </div>
            {hasStats && (
              <>
                <Divider/>
                <div className="label-sm" style={{ marginBottom:8, color:"var(--acc)" }}>Our Team</div>
                <div style={{ marginBottom:16, overflowX:"auto" }}>
                  <table className="tbl" style={{ minWidth:700 }}>
                    <thead><tr><th>Player</th><th style={{textAlign:"right"}}>ACS</th><th style={{textAlign:"right"}}>K</th><th style={{textAlign:"right"}}>D</th><th style={{textAlign:"right"}}>A</th><th style={{textAlign:"right"}}>K/D</th><th style={{textAlign:"right"}}>HS%</th><th style={{textAlign:"right"}}>FB</th><th style={{textAlign:"right"}}>↑Plant</th><th style={{textAlign:"right"}}>↓Def</th><th style={{textAlign:"right"}}>Multi</th><th style={{textAlign:"right"}}>Clutch</th></tr></thead>
                    <tbody>{blueStats.map((p,i)=><ScoreRow key={i} p={p}/>)}</tbody>
                  </table>
                </div>
                <div className="label-sm" style={{ marginBottom:8, color:"var(--red)" }}>Opponents</div>
                <div style={{ marginBottom:20, overflowX:"auto" }}>
                  <table className="tbl" style={{ minWidth:700 }}>
                    <thead><tr><th>Player</th><th style={{textAlign:"right"}}>ACS</th><th style={{textAlign:"right"}}>K</th><th style={{textAlign:"right"}}>D</th><th style={{textAlign:"right"}}>A</th><th style={{textAlign:"right"}}>K/D</th><th style={{textAlign:"right"}}>HS%</th><th style={{textAlign:"right"}}>FB</th><th style={{textAlign:"right"}}>↑Plant</th><th style={{textAlign:"right"}}>↓Def</th><th style={{textAlign:"right"}}>Multi</th><th style={{textAlign:"right"}}>Clutch</th></tr></thead>
                    <tbody>{redStats.map((p,i)=><ScoreRow key={i} p={p}/>)}</tbody>
                  </table>
                </div>
              </>
            )}
            {!hasStats && (
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:20, padding:"10px 14px", background:"var(--b2)", borderRadius:"var(--r)" }}>
                No scoreboard data — this scrim was entered manually. Import via the Riot helper to get player stats.
              </div>
            )}
            <button className="btn btn-red" style={{ width:"100%", justifyContent:"center" }} onClick={()=>del(sel.id)}>Delete Scrim</button>
          </Modal>
        );
      })()}

      {/* ── Import Modal ── */}
      {showImport && (
        <Modal onClose={()=>setShowImport(false)} title="Import Scrim from Riot">
          {importState === "preview" && importPreview ? (
            <div>
              <div style={{ marginBottom:16, padding:"14px 16px", background:"var(--b2)", borderRadius:"var(--r)", border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <span className="chip chip-blue">{importPreview.map}</span>
                  <span className={`chip ${importPreview.res==="W"?"chip-green":"chip-red"}`}>{importPreview.res==="W"?"▲ Win":"▼ Loss"}</span>
                  <span className="bc" style={{ fontSize:22, fontWeight:900, color:importPreview.res==="W"?"var(--green)":"var(--red)" }}>{importPreview.score}</span>
                </div>
                <div style={{ fontSize:13, color:"var(--t2)", marginBottom:6 }}>Date: <b style={{ color:"var(--t1)" }}>{importPreview.date}</b></div>
                <div style={{ fontSize:13, color:"var(--t2)", marginBottom:6 }}>Opponent: <b style={{ color:"var(--t1)" }}>vs {importPreview.opp}</b></div>
                <div style={{ fontSize:13, color:"var(--t2)", marginBottom:8 }}>Agents:</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                  {(()=>{ try { return Array.isArray(importPreview.comp)?importPreview.comp:JSON.parse(importPreview.comp||"[]"); } catch{ return []; } })().map((a,i)=><AgentBadge key={i} name={a} size={32}/>)}
                </div>
                <div style={{ fontSize:13, color:"var(--t2)", marginBottom:6 }}>Rounds:</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {(()=>{ try { return Array.isArray(importPreview.rounds)?importPreview.rounds:JSON.parse(importPreview.rounds||"[]"); } catch{ return []; } })().map((r,i)=><div key={i} className={`pip pip-${r}`}>{i+1}</div>)}
                </div>
              </div>
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:16 }}>
                ✓ Match parsed successfully. Review above and save to your scrim log.
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-ghost" style={{ flex:1 }} onClick={resetImport}>← Back</button>
                <button className="btn btn-acc" style={{ flex:2, justifyContent:"center" }} onClick={handleImportSave} disabled={importState==="saving"}>
                  {importState==="saving" ? "Saving…" : "Save to Scrim Log"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ padding:"12px 14px", background:"var(--b2)", borderRadius:"var(--r)", border:"1px solid var(--border)", marginBottom:16, display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>🖥</span>
                <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.7 }}>
                  <b style={{ color:"var(--t1)" }}>Racker Helper must be running.</b><br/>
                  If a player is running it on their PC, enter their IP below.<br/>
                  If running on this PC, leave it as <code>127.0.0.1</code>.
                </div>
              </div>
              <div style={{ marginBottom:12, fontSize:12, color:"var(--t3)" }}>
                {helperIp !== "127.0.0.1"
                  ? <span>✓ Helper found at <code style={{color:"var(--acc)"}}>{helperIp}</code> — <button onClick={()=>saveHelperIp("127.0.0.1")} style={{background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:11,textDecoration:"underline"}}>reset</button></span>
                  : <span>Will auto-scan network if helper not found locally</span>
                }
              </div>
              {importState==="error" && (
                <div style={{ color:"var(--red)", fontSize:12, marginBottom:12, padding:"8px 12px", background:"rgba(255,80,80,0.08)", borderRadius:"var(--r)", border:"1px solid rgba(255,80,80,0.2)" }}>
                  ✕ {importError}
                </div>
              )}
              <button
                className="btn btn-acc"
                style={{ width:"100%", justifyContent:"center" }}
                onClick={handleImportFetch}
                disabled={importState==="loading"}
              >
                {importState==="loading" ? "Reading match data…" : "⬇ Import Last Scrim"}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ════ STRATEGY ════ */
function Strategy({ tab, setTab }) {
  const TABS = [{ key:"playbooks", label:"Playbooks" },{ key:"gameplans", label:"Game Plans" },{ key:"compositions", label:"Compositions" }];
  // default to playbooks if on a removed tab
  const safeTab = TABS.find(t=>t.key===tab) ? tab : "playbooks";
  return (
    <div style={{ padding:"28px 32px" }}>
      <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em", marginBottom:4 }}>STRATEGY</div>
      <div style={{ color:"var(--t2)", fontSize:13, marginBottom:20 }}>Tactical hub — playbooks, game plans, and compositions</div>
      <div className="tab-bar" style={{ maxWidth:400, marginBottom:24 }}>
        {TABS.map(t=><button key={t.key} className={`tab${safeTab===t.key?" on":""}`} onClick={()=>setTab(t.key)}>{t.label}</button>)}
      </div>
      {safeTab==="playbooks"    && <Playbooks/>}
      {safeTab==="gameplans"    && <GamePlans/>}
      {safeTab==="compositions" && <Compositions/>}
    </div>
  );
}

/* ── PLAYBOOKS: PDF embed, saved to DB ── */
function Playbooks() {
  const [books, setBooks]   = useState([]);
  const [sel, setSel]       = useState(null);
  const [modal, setModal]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm]     = useState({ title:"", url:"", map:"Ascent", side:"atk", description:"" });

  useEffect(()=>{ api.get("/api/playbooks").then(d=>{ if(Array.isArray(d)){ setBooks(d); if(d.length>0) setSel(d[0]); } }).catch(()=>{}); },[]);

  const add = async () => {
    if(!form.title.trim()||!form.url.trim()) return;
    const d = await api.post("/api/playbooks", form).catch(()=>({ ...form, id:Date.now() }));
    setBooks(p=>[...p, d]); setSel(d);
    setModal(false); setForm({ title:"", url:"", map:"Ascent", side:"atk", description:"" });
  };

  const del = async (id) => {
    await api.delete(`/api/playbooks/${id}`).catch(()=>{});
    const next = books.filter(b=>b.id!==id);
    setBooks(next); setSel(next.length>0?next[0]:null); setConfirm(null);
  };

  const toEmbedPdf = url => {
    // Google Drive direct link → embed
    if(url.includes("drive.google.com/file/d/")) {
      const id = url.match(/\/d\/([^/]+)/)?.[1];
      if(id) return `https://drive.google.com/file/d/${id}/preview`;
    }
    return url;
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:18, minHeight:500 }}>
      {/* sidebar */}
      <div>
        <button className="btn btn-acc" style={{ width:"100%", justifyContent:"center", marginBottom:12 }} onClick={()=>setModal(true)}>+ Add Playbook</button>
        {books.length===0
          ? <div style={{ color:"var(--t3)", fontSize:12, padding:"8px 4px" }}>No playbooks yet.</div>
          : books.map(b=>(
            <div key={b.id} onClick={()=>setSel(b)} style={{ padding:"10px 12px", borderRadius:"var(--r2)", cursor:"pointer", marginBottom:5,
              background:sel?.id===b.id?"var(--s3)":"var(--s1)", border:`1px solid ${sel?.id===b.id?"var(--b3)":"var(--b1)"}`, transition:"all 0.15s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:4, lineHeight:1.3 }}>{b.title}</div>
                <button onClick={e=>{ e.stopPropagation(); setConfirm(b); }} style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:11, padding:"0 2px", flexShrink:0 }}>✕</button>
              </div>
              <div style={{ display:"flex", gap:5 }}>
                <span className="chip chip-blue" style={{ fontSize:10 }}>{b.map}</span>
                <span className={`chip ${b.side==="atk"?"chip-acc":"chip-purple"}`} style={{ fontSize:10 }}>{b.side==="atk"?"ATK":"DEF"}</span>
              </div>
            </div>
          ))
        }
      </div>
      {/* viewer */}
      <div>
        {sel ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div className="card" style={{ padding:"14px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div className="bc" style={{ fontSize:22, fontWeight:700 }}>{sel.title}</div>
                  {sel.description && <div style={{ fontSize:12, color:"var(--t2)", marginTop:3 }}>{sel.description}</div>}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <span className="chip chip-blue">{sel.map}</span>
                  <span className={`chip ${sel.side==="atk"?"chip-acc":"chip-purple"}`}>{sel.side==="atk"?"ATK":"DEF"}</span>
                </div>
              </div>
            </div>
            <div style={{ background:"var(--s1)", border:"1px solid var(--b1)", borderRadius:12, overflow:"hidden", height:"68vh" }}>
              <iframe src={toEmbedPdf(sel.url)} width="100%" height="100%" style={{ border:"none" }} allowFullScreen title={sel.title}/>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400 }}>
            <div style={{ textAlign:"center", color:"var(--t3)" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⬡</div>
              <div className="bc" style={{ fontSize:18, fontWeight:700, color:"var(--t2)", marginBottom:8 }}>No Playbook Selected</div>
              <button className="btn btn-acc" onClick={()=>setModal(true)}>+ Add Playbook</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal onClose={()=>setModal(false)} title="Add Playbook">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Title</div><input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Lotus ATK Default"/></div>
            <div>
              <div className="label-sm" style={{ marginBottom:6 }}>PDF URL</div>
              <input type="text" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="Google Drive share link or direct PDF URL"/>
              <div style={{ fontSize:11, color:"var(--t3)", marginTop:5 }}>Tip: Upload to Google Drive → Share → Copy link. Works with any publicly accessible PDF.</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><div className="label-sm" style={{ marginBottom:6 }}>Map</div><select value={form.map} onChange={e=>setForm(f=>({...f,map:e.target.value}))}>{MAPS.map(m=><option key={m}>{m}</option>)}</select></div>
              <div><div className="label-sm" style={{ marginBottom:6 }}>Side</div><select value={form.side} onChange={e=>setForm(f=>({...f,side:e.target.value}))}><option value="atk">Attack</option><option value="def">Defense</option></select></div>
            </div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Description (optional)</div><input type="text" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Short description"/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={add} disabled={!form.title.trim()||!form.url.trim()}>Save Playbook</button>
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {confirm && (
        <ConfirmModal title="Delete Playbook" message={`Delete "${confirm.title}"? This cannot be undone.`}
          onConfirm={()=>del(confirm.id)} onCancel={()=>setConfirm(null)}/>
      )}
    </div>
  );
}

/* ── GAME PLANS: Google-Docs-like rich editor with image paste ── */
function GamePlans() {
  const [plans, setPlans]   = useState([]);
  const [sel, sSel]         = useState(null);
  const [modal, setModal]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [title, setTitle]   = useState("");
  const editorRef           = React.useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ api.get("/api/gameplans").then(d=>{ if(Array.isArray(d)){ setPlans(d); if(d.length>0) openPlan(d[0]); } }).catch(()=>{}); },[]);

  const openPlan = (p) => { sSel(p); setTitle(p.title); setTimeout(()=>{ if(editorRef.current) editorRef.current.innerHTML = p.content||""; },0); };

  const save = async () => {
    if(!sel||!editorRef.current) return;
    setSaving(true);
    const content = editorRef.current.innerHTML;
    const updated = { ...sel, title, content };
    await api.put(`/api/gameplans/${sel.id}`, updated).catch(()=>{});
    setPlans(p=>p.map(x=>x.id===sel.id?updated:x));
    sSel(updated); setSaving(false);
  };

  const add = async () => {
    const d = await api.post("/api/gameplans", { title:"New Game Plan", content:"" }).catch(()=>({ id:Date.now(), title:"New Game Plan", content:"" }));
    setPlans(p=>[...p, d]); openPlan(d); setModal(false);
  };

  const del = async (id) => {
    await api.delete(`/api/gameplans/${id}`).catch(()=>{});
    const next = plans.filter(p=>p.id!==id);
    setPlans(next); setConfirm(null);
    if(next.length>0) openPlan(next[0]); else { sSel(null); }
  };

  const exec = (cmd, val=null) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

  const handlePaste = e => {
    const items = e.clipboardData?.items;
    if(!items) return;
    for(const item of items) {
      if(item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = ev => { document.execCommand("insertImage", false, ev.target.result); };
        reader.readAsDataURL(file);
      }
    }
  };

  const toolBtn = (label, action, title) => (
    <button title={title||label} onClick={action}
      style={{ padding:"4px 9px", background:"var(--s3)", border:"1px solid var(--b2)", borderRadius:4, color:"var(--t1)", cursor:"pointer", fontSize:12, fontWeight:500, transition:"all 0.1s" }}
      onMouseOver={e=>e.target.style.background="var(--s4)"} onMouseOut={e=>e.target.style.background="var(--s3)"}>
      {label}
    </button>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:18, minHeight:500 }}>
      <div>
        <button className="btn btn-acc" style={{ width:"100%", justifyContent:"center", marginBottom:12 }} onClick={add}>+ New Plan</button>
        {plans.length===0
          ? <div style={{ color:"var(--t3)", fontSize:12, padding:"8px 4px" }}>No game plans yet.</div>
          : plans.map(p=>(
            <div key={p.id} onClick={()=>openPlan(p)} style={{ padding:"10px 12px", borderRadius:"var(--r2)", cursor:"pointer", marginBottom:5,
              background:sel?.id===p.id?"var(--s3)":"var(--s1)", border:`1px solid ${sel?.id===p.id?"var(--b3)":"var(--b1)"}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{p.title}</div>
                <button onClick={e=>{ e.stopPropagation(); setConfirm(p); }} style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:11, padding:"0 2px", flexShrink:0 }}>✕</button>
              </div>
            </div>
          ))
        }
      </div>
      <div>
        {sel ? (
          <div style={{ display:"flex", flexDirection:"column", gap:0, background:"var(--s1)", border:"1px solid var(--b1)", borderRadius:12, overflow:"hidden" }}>
            {/* toolbar */}
            <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--b1)", display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", background:"var(--s2)" }}>
              <input value={title} onChange={e=>setTitle(e.target.value)} onBlur={save}
                style={{ fontSize:15, fontWeight:700, background:"transparent", border:"none", color:"var(--t1)", outline:"none", minWidth:160, flex:1, maxWidth:320 }}
                placeholder="Plan title"/>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {toolBtn("B", ()=>exec("bold"), "Bold")}
                {toolBtn("I", ()=>exec("italic"), "Italic")}
                {toolBtn("U", ()=>exec("underline"), "Underline")}
                {toolBtn("H1", ()=>exec("formatBlock","h2"), "Heading")}
                {toolBtn("H2", ()=>exec("formatBlock","h3"), "Subheading")}
                {toolBtn("•", ()=>exec("insertUnorderedList"), "Bullet list")}
                {toolBtn("1.", ()=>exec("insertOrderedList"), "Numbered list")}
                {toolBtn("—", ()=>exec("insertHorizontalRule"), "Divider")}
                {toolBtn("🖼", ()=>{ const url=prompt("Image URL:"); if(url) exec("insertImage",url); }, "Insert image by URL")}
              </div>
              <button className="btn btn-acc" style={{ padding:"5px 14px", fontSize:12, marginLeft:"auto" }} onClick={save}>{saving?"Saving…":"Save"}</button>
            </div>
            {/* editor */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onPaste={handlePaste}
              onBlur={save}
              style={{
                minHeight:"65vh", padding:"28px 36px", outline:"none", fontSize:14, lineHeight:1.8,
                color:"var(--t1)", overflowY:"auto",
              }}
              data-placeholder="Start writing your game plan… paste images directly, use the toolbar above."
            />
          </div>
        ) : (
          <div className="card" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400 }}>
            <div style={{ textAlign:"center", color:"var(--t3)" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>☰</div>
              <div className="bc" style={{ fontSize:18, fontWeight:700, color:"var(--t2)", marginBottom:8 }}>No Game Plan Selected</div>
              <button className="btn btn-acc" onClick={add}>+ New Plan</button>
            </div>
          </div>
        )}
      </div>
      {confirm && (
        <ConfirmModal title="Delete Game Plan" message={`Delete "${confirm.title}"? This cannot be undone.`}
          onConfirm={()=>del(confirm.id)} onCancel={()=>setConfirm(null)}/>
      )}
    </div>
  );
}

function Compositions() {
  const [comps, setComps]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm]     = useState({ name:"", map:"Ascent", side:"atk", agents:[], notes:"" });

  useEffect(()=>{ api.get("/api/strats").then(d=>{ if(Array.isArray(d)) setComps(d.filter(s=>s.cat==="Composition"||!s.cat||s.cat==="Default")); }).catch(()=>{}); },[]);

  const add = () => {
    if(!form.name.trim()) return;
    api.post("/api/strats", { ...form, cat:"Composition", description: form.notes })
      .then(d=>setComps(p=>[...p, d])).catch(()=>setComps(p=>[...p, { ...form, id:Date.now() }]));
    setModal(false); setForm({ name:"", map:"Ascent", side:"atk", agents:[], notes:"" });
  };

  const del = id => { api.delete(`/api/strats/${id}`).catch(()=>{}); setComps(p=>p.filter(c=>c.id!==id)); setConfirm(null); };

  const toggleAgent = name => setForm(f=>({ ...f, agents: f.agents.includes(name)?f.agents.filter(a=>a!==name):[...f.agents,name].slice(0,5) }));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:18 }}>
        <button className="btn btn-acc" onClick={()=>setModal(true)}>+ New Composition</button>
      </div>
      {comps.length===0
        ? <div className="card" style={{ textAlign:"center", padding:"48px 20px", color:"var(--t3)" }}><div style={{ fontSize:26, marginBottom:8 }}>⬡</div><div>No compositions yet.</div></div>
        : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
          {comps.map(c=>(
            <div key={c.id} className="strat-card">
              <div style={{ padding:"13px 15px", borderBottom:"1px solid var(--b1)", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontWeight:600, marginBottom:7 }}>{c.name}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <span className="chip chip-blue">{c.map}</span>
                    <span className={`chip ${c.side==="atk"?"chip-acc":"chip-purple"}`}>{c.side==="atk"?"ATK":"DEF"}</span>
                  </div>
                </div>
                <button onClick={()=>setConfirm(c)} style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:13, padding:"2px 6px" }}>✕</button>
              </div>
              <div style={{ padding:"11px 15px" }}><p style={{ fontSize:12, color:"var(--t2)", lineHeight:1.65 }}>{c.description}</p></div>
            </div>
          ))}
        </div>
      }
      {modal && (
        <Modal onClose={()=>setModal(false)} title="New Composition">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Name</div><input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Jett Comp"/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><div className="label-sm" style={{ marginBottom:6 }}>Map</div><select value={form.map} onChange={e=>setForm(f=>({...f,map:e.target.value}))}>{MAPS.map(m=><option key={m}>{m}</option>)}</select></div>
              <div><div className="label-sm" style={{ marginBottom:6 }}>Side</div><select value={form.side} onChange={e=>setForm(f=>({...f,side:e.target.value}))}><option value="atk">Attack</option><option value="def">Defense</option></select></div>
            </div>
            <div>
              <div className="label-sm" style={{ marginBottom:8 }}>Agents (pick up to 5)</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {AGENTS.map(a=>{ const on=form.agents.includes(a.name); return (
                  <button key={a.name} onClick={()=>toggleAgent(a.name)} style={{ padding:"4px 10px", borderRadius:5, fontSize:12, fontWeight:600, cursor:"pointer", background:on?a.bg:"var(--s3)", color:on?a.color:"var(--t3)", border:`1px solid ${on?a.color+"44":"var(--b2)"}`, transition:"all 0.15s" }}>{a.name}</button>
                ); })}
              </div>
            </div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Notes</div><textarea rows={3} style={{ resize:"vertical" }} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Describe roles, win conditions, playstyle..."/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={add} disabled={!form.name.trim()}>Create</button>
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {confirm && (
        <ConfirmModal title="Delete Composition" message={`Delete "${confirm.name}"?`}
          onConfirm={()=>del(confirm.id)} onCancel={()=>setConfirm(null)}/>
      )}
    </div>
  );
}

/* ════ DATA ANALYSIS ════ */
function DataAnalysis({ players=[] }) {
  const [tab, setTab]     = useState("team");
  const [scrims, setScrims] = useState([]);
  useEffect(()=>{ api.get("/api/scrims").then(d=>{ if(Array.isArray(d)) setScrims(d); }).catch(()=>{}); },[]);

  const wins = scrims.filter(s=>(s.res==="win"||s.res==="W")).length;
  const wr = scrims.length>0 ? Math.round((wins/scrims.length)*100) : null;
  const mapStats = MAPS.map(m=>{ const ms=scrims.filter(s=>s.map===m); const mw=ms.filter(s=>(s.res==="win"||s.res==="W")).length; return { map:m, games:ms.length, wr:ms.length>0?Math.round((mw/ms.length)*100):null }; }).filter(m=>m.games>0).sort((a,b)=>b.games-a.games);

  return (
    <div style={{ padding:"28px 32px" }}>
      <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em", marginBottom:4 }}>DATA ANALYSIS</div>
      <div style={{ color:"var(--t2)", fontSize:13, marginBottom:20 }}>Performance insights from tracked games</div>
      <div className="tab-bar" style={{ maxWidth:280, marginBottom:24 }}>
        <button className={`tab${tab==="team"?" on":""}`} onClick={()=>setTab("team")}>Team Stats</button>
        <button className={`tab${tab==="player"?" on":""}`} onClick={()=>setTab("player")}>Player Stats</button>
      </div>
      {tab==="team" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
            <StatBlock label="Win Rate"      value={wr!==null?`${wr}%`:"—"} sub={scrims.length>0?`${scrims.length} games`:"No games yet"} accent/>
            <StatBlock label="Total Games"   value={scrims.length} sub="Tracked"/>
            <StatBlock label="Wins"          value={wins} sub="Total wins"/>
            <StatBlock label="Losses"        value={scrims.length-wins} sub="Total losses"/>
          </div>
          {mapStats.length>0 && (
            <div className="card">
              <div className="bc" style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>MAP BREAKDOWN</div>
              {mapStats.map(m=>(
                <div key={m.map} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <div style={{ width:80, fontSize:13, fontWeight:600 }}>{m.map}</div>
                  <Bar pct={m.wr||0} color={m.wr>=50?"var(--green)":"var(--red)"}/>
                  <div className="mono" style={{ fontSize:12, width:50 }}>{m.wr!==null?`${m.wr}%`:"—"} ({m.games}g)</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab==="player" && (() => {
        // Aggregate stats from all scrims that have player_stats
        const allStats = {};
        scrims.forEach(scrim => {
          const ps = Array.isArray(scrim.player_stats)
            ? scrim.player_stats
            : (() => { try { return JSON.parse(scrim.player_stats||"[]"); } catch { return []; } })();
          ps.forEach(p => {
            if (!p.name) return;
            if (!allStats[p.name]) allStats[p.name] = {
              name:p.name, agent:p.agent, side:p.side, games:0,
              totalAcs:0, totalKills:0, totalDeaths:0, totalAssists:0,
              totalHsRate:0, hsGames:0, totalFb:0, totalClutch:0,
            };
            const s = allStats[p.name];
            s.games++;
            s.totalAcs     += p.acs     || 0;
            s.totalKills   += p.kills   || 0;
            s.totalDeaths  += p.deaths  || 0;
            s.totalAssists += p.assists || 0;
            s.side = p.side;
            if (p.hsRate != null) { s.totalHsRate += p.hsRate; s.hsGames++; }
            s.totalFb      += p.firstBloods || 0;
            s.totalClutch  += p.clutchWon   || 0;
          });
        });
        const rows = Object.values(allStats).map(s => ({
          ...s,
          avgAcs:    Math.round(s.totalAcs / s.games),
          avgKills:  Math.round((s.totalKills / s.games) * 10) / 10,
          avgDeaths: Math.round((s.totalDeaths / s.games) * 10) / 10,
          avgAssists: Math.round((s.totalAssists / s.games) * 10) / 10,
          kd:        s.totalDeaths === 0 ? s.totalKills : Math.round((s.totalKills / s.totalDeaths) * 100) / 100,
          avgHs:     s.hsGames > 0 ? Math.round(s.totalHsRate / s.hsGames) : null,
        })).sort((a,b) => b.avgAcs - a.avgAcs);

        const [sideFilter, setSideFilter] = React.useState("all");
        const filtered = sideFilter === "all" ? rows : rows.filter(r => r.side === sideFilter);

        return (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {["all","blue","red"].map(s => (
                <button key={s} className={`btn ${sideFilter===s?"btn-acc":"btn-ghost"}`} style={{ fontSize:12 }} onClick={()=>setSideFilter(s)}>
                  {s==="all"?"All Teams":s==="blue"?"Our Team":"Opponents"}
                </button>
              ))}
            </div>
            {rows.length === 0 ? (
              <div className="card" style={{ padding:"40px", textAlign:"center", color:"var(--t3)" }}>
                No player stats yet — import a scrim using the Riot helper to see stats here.
              </div>
            ) : (
              <div className="card" style={{ padding:0, overflow:"hidden" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Team</th>
                      <th style={{ textAlign:"right" }}>Games</th>
                      <th style={{ textAlign:"right" }}>Avg ACS</th>
                      <th style={{ textAlign:"right" }}>K</th>
                      <th style={{ textAlign:"right" }}>D</th>
                      <th style={{ textAlign:"right" }}>A</th>
                      <th style={{ textAlign:"right" }}>K/D</th>
                      <th style={{ textAlign:"right" }}>HS%</th>
                      <th style={{ textAlign:"right" }}>FB</th>
                      <th style={{ textAlign:"right" }}>Clutch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p,i) => (
                      <tr key={p.name}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <AgentBadge name={p.agent} size={24}/>
                            <span className="mono" style={{ fontSize:12, color:"var(--t2)" }}>{p.name}</span>
                          </div>
                        </td>
                        <td><span className={`chip ${p.side==="blue"?"chip-blue":"chip-red"}`}>{p.side==="blue"?"Our Team":"Opponent"}</span></td>
                        <td style={{ textAlign:"right", color:"var(--t3)", fontSize:12 }}>{p.games}</td>
                        <td style={{ textAlign:"right", fontWeight:700, color:"var(--acc)" }}>{p.avgAcs}</td>
                        <td style={{ textAlign:"right" }}>{p.avgKills}</td>
                        <td style={{ textAlign:"right", color:"var(--t3)" }}>{p.avgDeaths}</td>
                        <td style={{ textAlign:"right", color:"var(--t3)" }}>{p.avgAssists}</td>
                        <td style={{ textAlign:"right", fontWeight:600, color: p.kd >= 1 ? "var(--green)" : "var(--red)" }}>{p.kd}</td>
                        <td style={{ textAlign:"right" }}>{p.avgHs ?? "—"}%</td>
                        <td style={{ textAlign:"right", color: p.totalFb>0?"var(--green)":"var(--t3)" }}>{p.totalFb ?? "—"}</td>
                        <td style={{ textAlign:"right", color: p.totalClutch>0?"var(--green)":"var(--t3)" }}>{p.totalClutch ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ════ VOD REVIEW ════ */
function VodReview() {
  const [vods, setVods]               = useState([]);
  const [sel, setSel]                 = useState(null);
  const [activeFolder, setActiveFolder] = useState("All");
  const [newForm, setNewForm]         = useState({ title:"", folder:"Scrims", url:"" });
  const [showNew, setShowNew]         = useState(false);
  const [urlEdit, setUrlEdit]         = useState(false);
  const [urlVal, setUrlVal]           = useState("");
  // annotation panel state
  const [showAddForm, setShowAddForm] = useState(false);
  const [tsForm, setTsForm]           = useState({ time:"", cat:"General", note:"" });
  const [editingTS, setEditingTS]     = useState(null); // {ti, note}
  const [replyOpen, setReplyOpen]     = useState(null);
  const [replyText, setReplyText]     = useState("");
  const [confirmTS, setConfirmTS]     = useState(null);
  const [confirmVod, setConfirmVod]   = useState(null);
  const [currentTime, setCurrentTime] = useState("0:00");
  const noteEditorRef                 = useRef(null);
  const editEditorRef                 = useRef(null);
  const iframeRef                     = useRef(null);
  const timeTickRef                   = useRef(null);
  const ytPlayerRef                   = useRef(null);
  const ytReadyRef                    = useRef(false);

  const FOLDERS   = ["All","Scrims","Opponent Analysis","Officials"];
  const TS_COLORS = { "General":"#8892aa", "Rotation":"#4fc3f7", "Util Usage":"#b39ddb", "Mistake":"#ff5252", "Win Cond":"#69f0ae" };

  useEffect(()=>{ api.get("/api/vods").then(d=>{ if(Array.isArray(d)){ const p=d.map(v=>({...v,ts:JSON.parse(v.ts||"[]"),genNote:v.gen_note||""})); setVods(p); } }).catch(()=>{}); },[]);

  // Load YouTube IFrame API script once
  useEffect(()=>{
    if(!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    // Poll current time from YT.Player instance
    timeTickRef.current = setInterval(()=>{
      try {
        if(ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          const s = Math.floor(ytPlayerRef.current.getCurrentTime());
          const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
          setCurrentTime(h>0 ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${m}:${String(sec).padStart(2,"0")}`);
        }
      } catch{}
    }, 1000);
    return ()=>{ clearInterval(timeTickRef.current); };
  },[]);

  const filteredVods = activeFolder==="All" ? vods : vods.filter(v=>v.folder===activeFolder);

  const parseTime = str => {
    const parts = str.replace(/\s/g,"").split(":").map(Number);
    if(parts.some(isNaN)) return 0;
    if(parts.length===3) return parts[0]*3600+parts[1]*60+parts[2];
    if(parts.length===2) return parts[0]*60+parts[1];
    return parts[0];
  };

  const extractYouTubeId = (url) => {
    if(!url) return "";
    // Already an embed URL (youtube.com/embed/ or youtube-nocookie.com/embed/)
    const embedMatch = url.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    if(embedMatch) return embedMatch[1];
    try {
      const u = new URL(url);
      // youtu.be/ID
      if(u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
      if(u.hostname.includes("youtube.com")) {
        // Standard watch?v=ID (works for public, unlisted, logged-in)
        const v = u.searchParams.get("v");
        if(v) return v;
        // /live/ID
        if(u.pathname.startsWith("/live/")) return u.pathname.replace("/live/","").split("?")[0];
        // /shorts/ID
        if(u.pathname.startsWith("/shorts/")) return u.pathname.replace("/shorts/","").split("?")[0];
        // /v/ID
        if(u.pathname.startsWith("/v/")) return u.pathname.replace("/v/","").split("?")[0];
      }
    } catch{}
    // Fallback: try regex for any 11-char YouTube ID
    const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})|youtu\.be\/([A-Za-z0-9_-]{11})|\/embed\/([A-Za-z0-9_-]{11})/);
    return m ? (m[1]||m[2]||m[3]) : "";
  };

  const toEmbedUrl = (url, startSec=0) => {
    if(!url) return "";
    const videoId = extractYouTubeId(url);
    // Use regular youtube.com/embed for unlisted video support (nocookie blocks some unlisted)
    if(videoId) return `https://www.youtube.com/embed/${videoId}?start=${startSec}&autoplay=1&rel=0&enablejsapi=1`;
    return url;
  };
  const toBaseEmbedUrl = url => { const id = extractYouTubeId(url); return id ? `https://www.youtube.com/embed/${id}?rel=0&enablejsapi=1` : url; };

  const seekTo = timeStr => {
    const sec = parseTime(timeStr);
    try {
      if(ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        ytPlayerRef.current.seekTo(sec, true);
        ytPlayerRef.current.playVideo();
      }
    } catch{}
  };

  // Initialize or destroy YT.Player when sel changes
  const initYTPlayer = (videoId, startSec=0) => {
    // Destroy existing player
    try { if(ytPlayerRef.current) { ytPlayerRef.current.destroy(); ytPlayerRef.current = null; } } catch{}
    if(!videoId) return;
    const create = () => {
      try {
        ytPlayerRef.current = new window.YT.Player("yt-player-div", {
          videoId,
          playerVars: {
            autoplay: 1,
            start: startSec,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin || "https://localhost",
          },
          events: {
            onReady: e => { try { e.target.playVideo(); } catch{} },
          }
        });
      } catch(err) { console.warn("YT.Player init failed", err); }
    };
    if(window.YT && window.YT.Player) {
      create();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if(prev) prev(); create(); };
    }
  };

  const saveVod = updated => {
    api.put(`/api/vods/${updated.id}`, { ...updated, ts:JSON.stringify(updated.ts), gen_note:updated.genNote||"" }).catch(()=>{});
    setVods(p=>p.map(v=>v.id===updated.id?updated:v));
    setSel(updated);
  };

  const addVod = () => {
    if(!newForm.title.trim()) return;
    const vid = extractYouTubeId(newForm.url);
    const embedUrl = vid ? `https://www.youtube.com/embed/${vid}?rel=0&enablejsapi=1` : (newForm.url||"");
    api.post("/api/vods", { title:newForm.title, folder:newForm.folder, url:embedUrl, ts:"[]" })
      .then(d=>{ const v={...d,ts:[],genNote:""}; setVods(p=>[...p,v]);
        setTimeout(()=>{ setSel(v); if(vid) initYTPlayer(vid); const el=document.getElementById("gen-note-editor"); if(el) el.innerHTML=""; },80);
      })
      .catch(()=>{ const v={id:Date.now(),title:newForm.title,folder:newForm.folder,url:embedUrl,ts:[],genNote:""}; setVods(p=>[...p,v]);
        setTimeout(()=>{ setSel(v); if(vid) initYTPlayer(vid); },80);
      });
    setShowNew(false); setNewForm({ title:"", folder:"Scrims", url:"" });
  };

  const delVod = id => { api.delete(`/api/vods/${id}`).catch(()=>{}); setVods(p=>p.filter(v=>v.id!==id)); if(sel?.id===id) setSel(null); setConfirmVod(null); };

  const attachUrl = () => {
    if(!sel) return;
    const vid = extractYouTubeId(urlVal);
    const embed = vid ? `https://www.youtube.com/embed/${vid}?rel=0&enablejsapi=1` : urlVal;
    saveVod({...sel, url:embed});
    setUrlEdit(false);
    setTimeout(()=>{ if(vid) initYTPlayer(vid); }, 100);
  };

  // image paste helper
  const handleImgPaste = (e, ref) => {
    const items = e.clipboardData?.items;
    if(!items) return;
    for(const item of items){
      if(item.type.startsWith("image/")){
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = ev => document.execCommand("insertImage", false, ev.target.result);
        reader.readAsDataURL(item.getAsFile());
      }
    }
  };

  const addTimestamp = () => {
    if(!sel) return;
    const note = noteEditorRef.current?.innerHTML || "";
    if(!note.replace(/<[^>]+>/g,"").trim() && !note.includes("<img")) return;
    const time = tsForm.time || currentTime;
    const updated = {...sel, ts:[...sel.ts, {time, cat:tsForm.cat, note, replies:[]}]};
    saveVod(updated);
    setShowAddForm(false);
    setTsForm({time:"", cat:"General", note:""});
    if(noteEditorRef.current) noteEditorRef.current.innerHTML = "";
  };

  const saveEditTS = ti => {
    if(!sel||!editEditorRef.current) return;
    const note = editEditorRef.current.innerHTML;
    const updated = {...sel, ts:sel.ts.map((t,i)=>i===ti?{...t,note}:t)};
    saveVod(updated); setEditingTS(null);
  };

  const delTimestamp = ti => {
    if(!sel) return;
    saveVod({...sel, ts:sel.ts.filter((_,i)=>i!==ti)}); setConfirmTS(null);
  };

  const addReply = ti => {
    if(!replyText.trim()||!sel) return;
    const updated = {...sel, ts:sel.ts.map((t,i)=>i===ti?{...t,replies:[...(t.replies||[]),replyText]}:t)};
    saveVod(updated); setReplyText(""); setReplyOpen(null);
  };

  const saveGenNote = () => {
    if(!sel) return;
    const genNote = document.getElementById("gen-note-editor")?.innerHTML || "";
    const updated = {...sel, genNote};
    api.put(`/api/vods/${updated.id}`, { ...updated, ts:JSON.stringify(updated.ts), gen_note:genNote }).catch(()=>{});
    setVods(p=>p.map(v=>v.id===updated.id?updated:v));
    setSel(prev=>prev ? {...prev, genNote} : prev);
  };

  const openSel = v => {
    setSel(v); setShowAddForm(false); setEditingTS(null); setReplyOpen(null);
    setTimeout(()=>{
      const el=document.getElementById("gen-note-editor"); if(el) el.innerHTML=v.genNote||"";
      const vid = extractYouTubeId(v.url||"");
      if(vid) initYTPlayer(vid);
    },80);
  };

  // Group vods by folder for sidebar
  const vodsByFolder = {};
  FOLDERS.filter(f=>f!=="All").forEach(f=>{ vodsByFolder[f]=vods.filter(v=>v.folder===f); });

  // ── FULL PAGE REVIEW MODE ──
  if(sel) return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0d0f14", overflow:"hidden" }}>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0 20px", height:48, borderBottom:"1px solid var(--b1)", flexShrink:0, background:"#0d0f14" }}>
        <button onClick={()=>setSel(null)}
          style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, padding:"4px 8px", borderRadius:6, transition:"color 0.15s" }}
          onMouseOver={e=>e.currentTarget.style.color="var(--t1)"} onMouseOut={e=>e.currentTarget.style.color="var(--t3)"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <span style={{ color:"var(--t3)", fontSize:13 }}>VOD Review</span>
        <span style={{ color:"var(--b3)", fontSize:13 }}>/</span>
        <span style={{ fontSize:14, fontWeight:700, color:"var(--t1)" }}>{sel.title}</span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"var(--s2)", border:"1px solid var(--b1)", borderRadius:20, padding:"3px 12px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"var(--t2)", fontWeight:600 }}>{currentTime}</span>
          </div>
          <button className="btn btn-ghost" style={{ fontSize:11, padding:"4px 12px" }} onClick={()=>{ setUrlVal(sel.url||""); setUrlEdit(true); }}>
            {sel.url ? "Change URL" : "+ Attach URL"}
          </button>
        </div>
      </div>

      {/* URL edit bar */}
      {urlEdit && (
        <div style={{ background:"var(--s2)", borderBottom:"1px solid var(--b1)", padding:"8px 16px", display:"flex", gap:8, flexShrink:0 }}>
          <input type="text" value={urlVal} onChange={e=>setUrlVal(e.target.value)} placeholder="https://youtube.com/..." style={{ flex:1 }} autoFocus/>
          <button className="btn btn-acc" onClick={attachUrl}>Save</button>
          <button className="btn btn-ghost" onClick={()=>setUrlEdit(false)}>Cancel</button>
        </div>
      )}

      {/* Body: video + notes | annotation panel */}
      <div style={{ display:"flex", flex:1, minHeight:0 }}>

        {/* LEFT: scrollable — video then notes card below */}
        <div style={{ flex:1, overflowY:"auto", minWidth:0, background:"#0d0f14" }}>
          {/* Video — explicit height so notes card is reachable by scrolling */}
          <div style={{ height:"56vw", maxHeight:"calc(100vh - 120px)", minHeight:240, background:"#000", position:"relative" }}>
            {sel.url ? (
              <div id="yt-player-div" style={{ width:"100%", height:"100%" }}/>
            ) : (
              <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14, color:"var(--t3)" }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.3 }}><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>
                <div style={{ fontSize:14 }}>No video attached</div>
                <button className="btn btn-acc" onClick={()=>{ setUrlVal(""); setUrlEdit(true); }}>Paste YouTube URL</button>
              </div>
            )}
          </div>

          {/* General Notes — card below video, scroll to reach */}
          <div style={{ margin:"20px 20px 32px", background:"var(--s1)", border:"1px solid var(--b1)", borderRadius:12 }}>
            <div style={{ padding:"18px 20px 14px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid var(--b1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span style={{ fontSize:15, fontWeight:700, color:"var(--t1)" }}>General Notes</span>
            </div>
            <div style={{ padding:"16px" }}>
              <div
                id="gen-note-editor"
                contentEditable
                suppressContentEditableWarning
                onPaste={e=>handleImgPaste(e, null)}
                onFocus={e=>e.currentTarget.style.borderColor="var(--b3)"}
                onBlur={e=>{ e.currentTarget.style.borderColor="var(--b2)"; saveGenNote(); }}
                data-placeholder="Add general notes, observations, or summary for this VOD…"
                style={{
                  minHeight:150, overflowY:"auto",
                  background:"var(--s2)", border:"1px solid var(--b2)", borderRadius:8,
                  padding:"14px 16px", fontSize:13, lineHeight:1.75,
                  color:"var(--t1)", outline:"none", transition:"border-color 0.15s",
                }}
              />
              <div style={{ textAlign:"right", marginTop:8, fontSize:11, color:"var(--t3)", opacity:0.5 }}>Auto-saved on blur · paste images directly</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Annotation Panel — matches Image 2 */}
        <div style={{ width:360, background:"#111318", borderLeft:"1px solid var(--b1)", display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>

          {/* Panel header */}
          <div style={{ padding:"16px 18px 14px", borderBottom:"1px solid var(--b1)", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span style={{ fontWeight:700, fontSize:15, color:"var(--t1)" }}>New Annotation</span>
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--t3)", background:"var(--s2)", padding:"2px 10px", borderRadius:12, border:"1px solid var(--b2)" }}>{currentTime}</div>
            </div>

            {showAddForm ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {/* Timestamp + Category row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--t3)", marginBottom:5 }}>Timestamp</div>
                    <div style={{ position:"relative" }}>
                      <input type="text" value={tsForm.time} onChange={e=>setTsForm(f=>({...f,time:e.target.value}))}
                        placeholder={currentTime}
                        style={{ paddingRight:32, width:"100%", boxSizing:"border-box", background:"#1a1d26", border:"1px solid var(--b2)", borderRadius:6 }}/>
                      <button onClick={()=>setTsForm(f=>({...f,time:currentTime}))} title="Use current time"
                        style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", color:"var(--t3)", padding:0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--t3)", marginBottom:5 }}>Category</div>
                    <select value={tsForm.cat} onChange={e=>setTsForm(f=>({...f,cat:e.target.value}))}
                      style={{ width:"100%", background:"#1a1d26", border:"1px solid var(--b2)", borderRadius:6 }}>
                      {Object.keys(TS_COLORS).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {/* Note editor */}
                <div>
                  <div
                    ref={noteEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onPaste={e=>handleImgPaste(e, noteEditorRef)}
                    data-placeholder="Describe what is happening... (use @ to mention players)"
                    style={{
                      minHeight:72, maxHeight:140, overflowY:"auto",
                      background:"#1a1d26", border:"1px solid var(--b2)", borderRadius:6,
                      padding:"9px 11px", fontSize:13, lineHeight:1.6, color:"var(--t1)", outline:"none",
                    }}
                    onFocus={e=>e.currentTarget.style.borderColor="var(--acc)"}
                    onBlur={e=>e.currentTarget.style.borderColor="var(--b2)"}
                  />
                </div>
                {/* Add button */}
                <button
                  onClick={addTimestamp}
                  style={{
                    width:"100%", padding:"10px", borderRadius:8, border:"none", cursor:"pointer",
                    background:"var(--acc)", color:"#080a10", fontWeight:700, fontSize:13,
                    fontFamily:"'Barlow',sans-serif", transition:"opacity 0.15s",
                  }}
                  onMouseOver={e=>e.currentTarget.style.opacity="0.9"}
                  onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                  Add Note
                </button>
                <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", fontSize:12 }} onClick={()=>setShowAddForm(false)}>Cancel</button>
              </div>
            ) : (
              <button
                onClick={()=>{ setShowAddForm(true); setTsForm(f=>({...f,time:currentTime})); setTimeout(()=>noteEditorRef.current?.focus(), 50); }}
                style={{
                  width:"100%", padding:"11px", borderRadius:8, border:"none", cursor:"pointer",
                  background:"var(--acc)", color:"#080a10", fontWeight:700, fontSize:13,
                  fontFamily:"'Barlow',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080a10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                + Add Timestamp
              </button>
            )}
          </div>

          {/* Annotations list */}
          <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 20px" }}>
            {(!sel.ts||sel.ts.length===0) ? (
              <div style={{ textAlign:"center", color:"var(--t3)", padding:"48px 20px", fontSize:13, opacity:0.6 }}>No timestamps yet.</div>
            ) : [...sel.ts].sort((a,b)=>parseTime(a.time)-parseTime(b.time)).map((t,_i)=>{
              const ti = sel.ts.indexOf(t);
              const col = TS_COLORS[t.cat]||"#8892aa";
              return (
                <div key={ti} style={{ marginBottom:10, background:"#0d0f14", borderRadius:10, border:"1px solid var(--b1)", overflow:"hidden", transition:"border-color 0.15s" }}
                  onMouseOver={e=>e.currentTarget.style.borderColor="var(--b2)"}
                  onMouseOut={e=>e.currentTarget.style.borderColor="var(--b1)"}>
                  {/* Timestamp header */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px" }}>
                    <button onClick={()=>seekTo(t.time)}
                      style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, padding:"2px 9px", borderRadius:6,
                        background:"var(--s2)", border:"1px solid var(--b2)", cursor:"pointer", color:"var(--t1)", flexShrink:0, transition:"all 0.1s" }}
                      onMouseOver={e=>{ e.currentTarget.style.background=col+"33"; e.currentTarget.style.borderColor=col+"66"; e.currentTarget.style.color=col; }}
                      onMouseOut={e=>{ e.currentTarget.style.background="var(--s2)"; e.currentTarget.style.borderColor="var(--b2)"; e.currentTarget.style.color="var(--t1)"; }}>
                      {t.time}
                    </button>
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:10, background:col+"18", color:col, border:`1px solid ${col}30` }}>{t.cat}</span>
                    <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
                      <button onClick={()=>{ setEditingTS(editingTS===ti?null:ti); setTimeout(()=>{ if(editEditorRef.current) editEditorRef.current.innerHTML=t.note||""; },20); }}
                        style={{ background:"transparent", border:"none", color:editingTS===ti?"var(--acc)":"var(--t3)", cursor:"pointer", padding:"3px 6px", borderRadius:4, fontSize:13, transition:"color 0.1s" }}>✏</button>
                      <button onClick={()=>setConfirmTS({ti,t})}
                        style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", padding:"3px 6px", borderRadius:4, fontSize:13, transition:"color 0.1s" }}
                        onMouseOver={e=>e.currentTarget.style.color="var(--red)"}
                        onMouseOut={e=>e.currentTarget.style.color="var(--t3)"}>🗑</button>
                    </div>
                  </div>
                  {/* Note content */}
                  {t.note && editingTS!==ti && (
                    <div style={{ padding:"0 12px 10px", fontSize:13, color:"var(--t2)", lineHeight:1.65 }}
                      className="ts-note"
                      dangerouslySetInnerHTML={{__html:t.note}}/>
                  )}
                  {/* Edit mode */}
                  {editingTS===ti && (
                    <div style={{ padding:"0 12px 10px" }}>
                      <div ref={editEditorRef} contentEditable suppressContentEditableWarning
                        onPaste={e=>handleImgPaste(e, editEditorRef)}
                        style={{ minHeight:50, background:"#1a1d26", border:"1px solid var(--acc)", borderRadius:6, padding:"7px 10px", fontSize:13, lineHeight:1.6, outline:"none", color:"var(--t1)", marginBottom:8 }}/>
                      <div style={{ display:"flex", gap:6 }}>
                        <button className="btn btn-acc" style={{ fontSize:11, padding:"4px 12px" }} onClick={()=>saveEditTS(ti)}>Save</button>
                        <button className="btn btn-ghost" style={{ fontSize:11, padding:"4px 10px" }} onClick={()=>setEditingTS(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNew && (
        <Modal title="New Review" onClose={()=>setShowNew(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Title</div><input type="text" value={newForm.title} onChange={e=>setNewForm(f=>({...f,title:e.target.value}))} placeholder="Review name" autoFocus/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Folder</div><select value={newForm.folder} onChange={e=>setNewForm(f=>({...f,folder:e.target.value}))}>{FOLDERS.filter(f=>f!=="All").map(f=><option key={f}>{f}</option>)}</select></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>YouTube URL (optional)</div><input type="text" value={newForm.url} onChange={e=>setNewForm(f=>({...f,url:e.target.value}))} placeholder="https://youtube.com/..."/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={addVod} disabled={!newForm.title.trim()}>Create Review</button>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {confirmVod && <ConfirmModal title="Delete Review" message={`Delete "${confirmVod.title}"?`} onConfirm={()=>delVod(confirmVod.id)} onCancel={()=>setConfirmVod(null)}/>}
      {confirmTS  && <ConfirmModal title="Delete Timestamp" message={`Delete the "${confirmTS.t.cat}" timestamp at ${confirmTS.t.time}?`} onConfirm={()=>delTimestamp(confirmTS.ti)} onCancel={()=>setConfirmTS(null)}/>}
    </div>
  );

  // ── FOLDER BROWSE MODE ──
  return (
    <div style={{ display:"flex", height:"calc(100vh - 0px)", overflow:"hidden" }}>

      {/* ── LEFT SIDEBAR: fixed VOD folders panel ── */}
      <div style={{ width:250, background:"var(--s1)", borderRight:"1px solid var(--b1)", display:"flex", flexDirection:"column", flexShrink:0 }}>

        {/* Header */}
        <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid var(--b1)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div className="bc" style={{ fontSize:15, fontWeight:900, letterSpacing:"0.1em", color:"var(--t1)" }}>VOD REVIEW</div>
          <button onClick={()=>setShowNew(true)}
            style={{ background:"var(--acc)", border:"none", borderRadius:6, width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:18, fontWeight:700, color:"#080a10", lineHeight:1 }}>+</button>
        </div>

        {/* FOLDERS label */}
        <div style={{ padding:"14px 16px 6px" }}>
          <div className="label-sm">FOLDERS</div>
        </div>

        {/* Folder list */}
        <div style={{ flex:1, overflowY:"auto", padding:"4px 8px 8px" }}>
          {FOLDERS.filter(f=>f!=="All").map(folder=>{
            const folderVods = vodsByFolder[folder]||[];
            const isExpanded = activeFolder===folder;
            return (
              <div key={folder}>
                {/* Folder row */}
                <div onClick={()=>{ setActiveFolder(isExpanded?null:folder); setSel(null); }}
                  style={{ padding:"8px 10px", borderRadius:8, display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                    background: isExpanded ? "var(--s3)" : "transparent",
                    color: isExpanded ? "var(--t1)" : "var(--t2)",
                    marginBottom:2, userSelect:"none", transition:"all 0.12s" }}
                  onMouseOver={e=>{ if(!isExpanded) e.currentTarget.style.background="var(--s2)"; }}
                  onMouseOut={e=>{ if(!isExpanded) e.currentTarget.style.background="transparent"; }}>
                  {/* chevron */}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ flexShrink:0, opacity:0.5, transition:"transform 0.15s", transform:isExpanded?"rotate(90deg)":"rotate(0deg)" }}>
                    <polygon points="2,1 8,5 2,9"/>
                  </svg>
                  {/* folder icon */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{folder}</span>
                  <span style={{ fontSize:11, color:"var(--t3)", background:"var(--s3)", borderRadius:10, padding:"1px 7px", fontWeight:700 }}>{folderVods.length}</span>
                </div>

                {/* Reviews under folder */}
                {isExpanded && (
                  <div style={{ marginBottom:4 }}>
                    {folderVods.length===0 ? (
                      <div style={{ padding:"6px 10px 6px 34px", fontSize:11, color:"var(--t3)", fontStyle:"italic" }}>No reviews yet</div>
                    ) : folderVods.map(v=>(
                      <div key={v.id} onClick={()=>openSel(v)}
                        className="vod-row"
                        style={{ padding:"7px 10px 7px 34px", borderRadius:6, cursor:"pointer", fontSize:13, marginBottom:1,
                          background: sel?.id===v.id ? "rgba(212,255,30,0.08)" : "transparent",
                          borderLeft: sel?.id===v.id ? "2px solid var(--acc)" : "2px solid transparent",
                          color: sel?.id===v.id ? "var(--t1)" : "var(--t2)",
                          display:"flex", alignItems:"center", gap:8, transition:"all 0.1s" }}
                        onMouseOver={e=>{ if(sel?.id!==v.id) e.currentTarget.style.background="var(--s2)"; e.currentTarget.querySelector(".vod-del").style.opacity="1"; }}
                        onMouseOut={e=>{ if(sel?.id!==v.id) e.currentTarget.style.background="transparent"; e.currentTarget.querySelector(".vod-del").style.opacity="0"; }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0, opacity:0.4 }}>
                          <polygon points="5,3 19,12 5,21"/>
                        </svg>
                        <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight: sel?.id===v.id?600:400 }}>{v.title}</span>
                        <button className="vod-del" onClick={e=>{e.stopPropagation();setConfirmVod(v);}}
                          style={{ background:"transparent", border:"none", color:"var(--red)", cursor:"pointer", fontSize:12, padding:"2px 5px", borderRadius:4, opacity:0, transition:"opacity 0.15s", flexShrink:0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      {!activeFolder && !sel ? (
        /* ── NO FOLDER SELECTED: show folder cards ── */
        <div style={{ flex:1, padding:"32px 36px", overflowY:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <div className="bc" style={{ fontSize:32, fontWeight:900, letterSpacing:"0.04em" }}>VOD REVIEW</div>
            <button className="btn btn-acc" onClick={()=>setShowNew(true)}>+ New Review</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:14 }}>
            {FOLDERS.filter(f=>f!=="All").map(folder=>{
              const count = (vodsByFolder[folder]||[]).length;
              return (
                <div key={folder} onClick={()=>setActiveFolder(folder)}
                  style={{ background:"var(--s2)", border:"1px solid var(--b1)", borderRadius:12, padding:"20px 18px", cursor:"pointer", transition:"all 0.15s" }}
                  onMouseOver={e=>{ e.currentTarget.style.borderColor="var(--acc)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.borderColor="var(--b1)"; e.currentTarget.style.transform="none"; }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:10 }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{folder}</div>
                  <div style={{ fontSize:12, color:"var(--t3)" }}>{count} review{count!==1?"s":""}</div>
                </div>
              );
            })}
          </div>
        </div>

      ) : !sel ? (
        /* ── FOLDER SELECTED: reviews table ── */
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"24px 32px 16px", borderBottom:"1px solid var(--b1)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="bc" style={{ fontSize:28, fontWeight:900 }}>{activeFolder}</span>
              </div>
              <div style={{ color:"var(--t3)", fontSize:13 }}>{(vodsByFolder[activeFolder]||[]).length} review{(vodsByFolder[activeFolder]||[]).length!==1?"s":""} in this folder</div>
            </div>
            <button className="btn btn-acc" onClick={()=>setShowNew(true)}>+ New Review</button>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"24px 32px" }}>
            {(vodsByFolder[activeFolder]||[]).length===0 ? (
              <div style={{ textAlign:"center", color:"var(--t3)", paddingTop:60 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
                <div style={{ fontSize:16, marginBottom:8 }}>No reviews in this folder yet</div>
                <button className="btn btn-acc" onClick={()=>setShowNew(true)}>+ New Review</button>
              </div>
            ) : (
              <div className="card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--b1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>Reviews</div>
                  <div style={{ fontSize:12, color:"var(--t3)" }}>{(vodsByFolder[activeFolder]||[]).length} review{(vodsByFolder[activeFolder]||[]).length!==1?"s":""}</div>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"var(--s2)" }}>
                      <th style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--t3)", letterSpacing:"0.08em", textTransform:"uppercase", width:40 }}></th>
                      <th style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--t3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Title</th>
                      <th style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--t3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Date</th>
                      <th style={{ padding:"10px 20px", textAlign:"right", fontSize:11, fontWeight:700, color:"var(--t3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(vodsByFolder[activeFolder]||[]).map(v=>(
                      <tr key={v.id} style={{ borderTop:"1px solid var(--b1)" }}
                        onMouseOver={e=>e.currentTarget.style.background="var(--s2)"}
                        onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"12px 20px", color:"var(--t3)", fontSize:12 }}>⠿</td>
                        <td style={{ padding:"12px 20px", fontWeight:600, fontSize:14, cursor:"pointer" }} onClick={()=>openSel(v)}>{v.title}</td>
                        <td style={{ padding:"12px 20px", fontSize:13, color:"var(--t3)" }}>{v.date || new Date().toLocaleDateString()}</td>
                        <td style={{ padding:"12px 20px", textAlign:"right" }}>
                          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", alignItems:"center" }}>
                            {/* Edit name button */}
                            <button title="Rename" style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:14, padding:"4px 6px", borderRadius:5 }}>✏</button>
                            {/* PLAY button — opens review */}
                            <button onClick={()=>openSel(v)} title="Open review"
                              style={{ background:"var(--s3)", border:"1px solid var(--b2)", borderRadius:6, padding:"6px 10px", cursor:"pointer", color:"var(--t2)", display:"flex", alignItems:"center", gap:4, fontSize:13, transition:"all 0.15s" }}
                              onMouseOver={e=>{ e.currentTarget.style.background="var(--acc)"; e.currentTarget.style.color="#080a10"; e.currentTarget.style.borderColor="var(--acc)"; }}
                              onMouseOut={e=>{ e.currentTarget.style.background="var(--s3)"; e.currentTarget.style.color="var(--t2)"; e.currentTarget.style.borderColor="var(--b2)"; }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                            </button>
                            {/* Delete button */}
                            <button onClick={e=>{e.stopPropagation();setConfirmVod(v);}} title="Delete"
                              style={{ background:"rgba(255,82,82,0.1)", border:"1px solid rgba(255,82,82,0.3)", borderRadius:6, padding:"6px 10px", cursor:"pointer", color:"var(--red)", fontSize:13, transition:"all 0.15s" }}
                              onMouseOver={e=>{ e.currentTarget.style.background="rgba(255,82,82,0.25)"; }}
                              onMouseOut={e=>{ e.currentTarget.style.background="rgba(255,82,82,0.1)"; }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      ) : null}

      {showNew && (
        <Modal onClose={()=>setShowNew(false)} title="New VOD Review">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Title</div><input type="text" value={newForm.title} onChange={e=>setNewForm(f=>({...f,title:e.target.value}))} placeholder="e.g. SKF vs GC Scrim" autoFocus/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Folder</div><select value={newForm.folder} onChange={e=>setNewForm(f=>({...f,folder:e.target.value}))}>{FOLDERS.filter(f=>f!=="All").map(f=><option key={f}>{f}</option>)}</select></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>YouTube URL (optional)</div><input type="text" value={newForm.url} onChange={e=>setNewForm(f=>({...f,url:e.target.value}))} placeholder="https://youtube.com/..."/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={addVod} disabled={!newForm.title.trim()}>Create Review</button>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
       )}

      {confirmVod && <ConfirmModal title="Delete Review" message={`Delete "${confirmVod.title}"? All timestamps will be lost.`} onConfirm={()=>delVod(confirmVod.id)} onCancel={()=>setConfirmVod(null)}/>}
      {confirmTS  && <ConfirmModal title="Delete Timestamp" message={`Delete the "${confirmTS.t.cat}" timestamp at ${confirmTS.t.time}?`} onConfirm={()=>delTimestamp(confirmTS.ti)} onCancel={()=>setConfirmTS(null)}/>}
    </div>
  );
}

/* ════ TASKS ════ */
function Tasks({ players, setPlayers, isAdmin=true }) {
  const [tasks, setTasks]         = useState({});
  const [labels, setLabels]       = useState([]);
  const [taskModal, setTaskModal] = useState(false);
  const [playerModal, setPlayerModal] = useState(false);
  const [labelModal, setLabelModal]   = useState(false);
  const [pForm, setPForm]         = useState({ name:"", ign:"", role:"" });
  const [lForm, setLForm]         = useState({ name:"", color: LABEL_COLORS[0] });
  const [form, setForm]           = useState({ title:"", description:"", due:"", assignedTo:"", labels:[] });

  useEffect(()=>{
    api.get("/api/labels").then(d=>{ if(Array.isArray(d)) setLabels(d); }).catch(()=>{});
    api.get("/api/tasks").then(d=>{
      if(Array.isArray(d)){
        const byPlayer = {};
        d.forEach(t=>{ if(!byPlayer[t.player_id]) byPlayer[t.player_id]=[]; byPlayer[t.player_id].push({...t, labels:JSON.parse(t.labels||"[]")}); });
        setTasks(byPlayer);
      }
    }).catch(()=>{});
  },[]);

  const pending = Object.values(tasks).flatMap(t=>t).filter(t=>!t.done).length;

  const toggle = (pid,tid) => {
    const task = (tasks[pid]||[]).find(t=>t.id===tid);
    if(!task) return;
    const done = !task.done;
    api.put(`/api/tasks/${tid}`, { done }).catch(()=>{});
    setTasks(p=>({ ...p, [pid]:(p[pid]||[]).map(t=>t.id===tid?{...t,done}:t) }));
  };

  const delTask = (pid,tid) => {
    api.delete(`/api/tasks/${tid}`).catch(()=>{});
    setTasks(p=>({ ...p, [pid]:(p[pid]||[]).filter(t=>t.id!==tid) }));
  };

  const addTask = () => {
    if(!form.title.trim() || !form.assignedTo) return;
    const pid = Number(form.assignedTo);
    api.post("/api/tasks", { ...form, player_id:pid, labels:JSON.stringify(form.labels) })
      .then(d=>{ setTasks(p=>({ ...p, [pid]:[...(p[pid]||[]), {...d, labels:form.labels}] })); })
      .catch(()=>{ setTasks(p=>({ ...p, [pid]:[...(p[pid]||[]), { id:Date.now(), ...form, done:false }] })); });
    setTaskModal(false); setForm({ title:"", description:"", due:"", assignedTo:"", labels:[] });
  };

  const addPlayer = () => {
    if(!pForm.name.trim()) return;
    const av = pForm.name.slice(0,2).toUpperCase();
    api.post("/api/players", { ...pForm, av })
      .then(d=>{ setPlayers(prev=>[...prev, d]); setTasks(p=>({ ...p, [d.id]:[] })); })
      .catch(()=>{ const id=Date.now(); setPlayers(prev=>[...prev,{id,...pForm,av}]); setTasks(p=>({...p,[id]:[]})); });
    setPForm({ name:"", ign:"", role:"" }); setPlayerModal(false);
  };

  const addLabel = () => {
    if(!lForm.name.trim()) return;
    api.post("/api/labels", lForm).then(d=>{ setLabels(prev=>[...prev, d]); }).catch(()=>{ setLabels(prev=>[...prev, { name:lForm.name.trim(), color:lForm.color }]); });
    setLForm({ name:"", color: LABEL_COLORS[0] }); setLabelModal(false);
  };

  const removeLabel = name => {
    api.delete(`/api/labels/${encodeURIComponent(name)}`).catch(()=>{});
    setLabels(prev=>prev.filter(l=>l.name!==name));
  };

  const removePlayer = pid => {
    api.delete(`/api/players/${pid}`).catch(()=>{});
    setPlayers(prev=>prev.filter(p=>p.id!==pid));
    setTasks(p=>{ const next={...p}; delete next[pid]; return next; });
  };

  const hex2rgba = (hex, a) => { const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em" }}>TASKS</div>
          <div style={{ color:"var(--t2)", fontSize:13, marginTop:2 }}>{pending} pending tasks across the team</div>
        </div>
        {isAdmin && <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost" onClick={()=>setLabelModal(true)}>⊕ Labels{labels.length>0?` (${labels.length})`:""}</button>
          <button className="btn btn-sub" onClick={()=>setPlayerModal(true)}>+ Add Player</button>
          <button className="btn btn-acc" onClick={()=>setTaskModal(true)} disabled={players.length===0} style={{ opacity:players.length===0?0.45:1 }}>+ Add Task</button>
        </div>}
      </div>
      {players.length===0 ? (
        <div className="card" style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>☑</div>
          <div className="bc" style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>No Players Yet</div>
          <button className="btn btn-acc" onClick={()=>setPlayerModal(true)}>+ Add Player</button>
        </div>
      ) : (
        <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:12, alignItems:"flex-start" }}>
          {players.map(p=>(
            <div key={p.id} className="kcol">
              <div style={{ padding:"13px 14px", borderBottom:"1px solid var(--b1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--s3)", border:"1px solid var(--b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"var(--acc)", flexShrink:0 }}>{p.av}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                    <div style={{ fontSize:10, color:"var(--t3)" }}>{p.role||"Player"}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ background:"var(--s3)", border:"1px solid var(--b2)", borderRadius:10, padding:"1px 8px", fontSize:11, fontWeight:700 }}>{(tasks[p.id]||[]).filter(t=>!t.done).length}</span>
                  <button onClick={()=>removePlayer(p.id)} style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:13, lineHeight:1, padding:"2px 4px", borderRadius:4 }}>✕</button>
                </div>
              </div>
              <div style={{ flex:1, padding:"8px 0", minHeight:80 }}>
                {(tasks[p.id]||[]).length===0 && <div style={{ textAlign:"center", color:"var(--t3)", fontSize:11, padding:"20px 10px" }}>No tasks yet</div>}
                {(tasks[p.id]||[]).map(t=>(
                  <div key={t.id} className="ktask">
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <div onClick={()=>toggle(p.id,t.id)} style={{ width:15, height:15, borderRadius:4, flexShrink:0, marginTop:1, transition:"all 0.15s", cursor:"pointer",
                        background:t.done?"var(--acc)":"transparent", border:`1px solid ${t.done?"var(--acc)":"var(--b3)"}`,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {t.done && <span style={{ fontSize:9, color:"#080a10", fontWeight:700 }}>✓</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:500, lineHeight:1.4, marginBottom:5, textDecoration:t.done?"line-through":"none", color:t.done?"var(--t3)":"var(--t1)" }}>{t.title}</div>
                        {t.labels.length>0 && (
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:4 }}>
                            {t.labels.map(lname=>{ const lb=labels.find(l=>l.name===lname); if(!lb) return null; return <span key={lname} style={{ padding:"1px 6px", borderRadius:3, fontSize:10, fontWeight:600, background:hex2rgba(lb.color,0.12), color:lb.color, border:`1px solid ${hex2rgba(lb.color,0.25)}` }}>{lname}</span>; })}
                          </div>
                        )}
                        {t.due && <div style={{ fontSize:10, color:"var(--t3)" }}>Due {t.due}</div>}
                      </div>
                      <button onClick={()=>delTask(p.id,t.id)} style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:11, padding:"2px 4px", flexShrink:0 }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {taskModal && (
        <Modal onClose={()=>setTaskModal(false)} title="New Task">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Assigned To</div><select value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}><option value="">— Select player —</option>{players.map(p=><option key={p.id} value={p.id}>{p.name}{p.role?` · ${p.role}`:""}</option>)}</select></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Title</div><input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Task title"/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Description</div><textarea rows={2} style={{ resize:"none" }} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Due Date</div><input type="date" value={form.due} onChange={e=>setForm(f=>({...f,due:e.target.value}))}/></div>
            {labels.length>0 && (
              <div>
                <div className="label-sm" style={{ marginBottom:8 }}>Labels</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {labels.map(lb=>{ const on=form.labels.includes(lb.name); return (
                    <button key={lb.name} onClick={()=>setForm(f=>({ ...f, labels:on?f.labels.filter(x=>x!==lb.name):[...f.labels,lb.name] }))}
                      style={{ padding:"4px 10px", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                        background:on?hex2rgba(lb.color,0.12):"var(--s3)", color:on?lb.color:"var(--t3)", border:`1px solid ${on?hex2rgba(lb.color,0.3):"var(--b2)"}` }}>
                      {lb.name}
                    </button>
                  ); })}
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={addTask} disabled={!form.title.trim()||!form.assignedTo}>Create Task</button>
              <button className="btn btn-ghost" onClick={()=>setTaskModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {labelModal && (
        <Modal onClose={()=>setLabelModal(false)} title="Manage Labels">
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {labels.length>0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {labels.map(lb=>(
                  <div key={lb.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:"var(--s2)", borderRadius:"var(--r)", border:"1px solid var(--b1)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:12, height:12, borderRadius:3, background:lb.color, flexShrink:0 }}/>
                      <span style={{ fontSize:13, fontWeight:500 }}>{lb.name}</span>
                    </div>
                    <button onClick={()=>removeLabel(lb.name)} style={{ background:"transparent", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:13, padding:"2px 6px", borderRadius:4 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="hr" style={{ margin:"0" }}/>
            <div className="label-sm">New Label</div>
            <input type="text" value={lForm.name} onChange={e=>setLForm(f=>({...f,name:e.target.value}))} placeholder="Label name"/>
            <div><div className="label-sm" style={{ marginBottom:8 }}>Color</div><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{LABEL_COLORS.map(c=><button key={c} onClick={()=>setLForm(f=>({...f,color:c}))} style={{ width:28, height:28, borderRadius:6, background:c, border:`2px solid ${lForm.color===c?"#fff":"transparent"}`, cursor:"pointer", transition:"all 0.15s", outline:"none" }}/>)}</div></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={addLabel} disabled={!lForm.name.trim()}>Create Label</button>
              <button className="btn btn-ghost" onClick={()=>setLabelModal(false)}>Done</button>
            </div>
          </div>
        </Modal>
      )}
      {playerModal && (
        <Modal onClose={()=>setPlayerModal(false)} title="Add Player">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Name</div><input type="text" value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value}))} placeholder="Player name"/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>IGN (optional)</div><input type="text" value={pForm.ign} onChange={e=>setPForm(f=>({...f,ign:e.target.value}))} placeholder="name#tag"/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Role (optional)</div><input type="text" value={pForm.role} onChange={e=>setPForm(f=>({...f,role:e.target.value}))} placeholder="e.g. IGL, Entry, Flex"/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={addPlayer}>Add Player</button>
              <button className="btn btn-ghost" onClick={()=>setPlayerModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════ CALENDAR ════ */
function CalendarPage({ isAdmin=true }) {
  const [events, setEvents] = useState([]);
  const [week, setWeek]     = useState(0);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ title:"", time:"18:00", cat:"Scrim" });

  useEffect(()=>{ api.get("/api/events").then(d=>{ if(Array.isArray(d)) setEvents(d); }).catch(()=>{}); },[]);

  const getWeekDays = offset => {
    const base=new Date(); const start=new Date(base); const dow=base.getDay();
    start.setDate(base.getDate()-(dow===0?6:dow-1)+offset*7);
    return Array.from({length:7},(_,i)=>{ const d=new Date(start); d.setDate(start.getDate()+i); return d; });
  };

  const days    = getWeekDays(week);
  const DAYS    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const fmt     = d => d.toISOString().slice(0,10);
  const today   = new Date().toISOString().slice(0,10);
  const weekLbl = `${days[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${days[6].toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;

  const addEvent = date => {
    if(!form.title.trim()) return;
    const color = CAT_COLORS[form.cat]||"#8892aa";
    api.post("/api/events", { ...form, date, color })
      .then(d=>setEvents(p=>[...p, d]))
      .catch(()=>setEvents(p=>[...p, { id:Date.now(), ...form, date, color }]));
    setModal(null); setForm({ title:"", time:"18:00", cat:"Scrim" });
  };

  const delEvent = id => { api.delete(`/api/events/${id}`).catch(()=>{}); setEvents(p=>p.filter(e=>e.id!==id)); };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em" }}>CALENDAR</div>
          <div style={{ color:"var(--t2)", fontSize:13, marginTop:2 }}>{weekLbl}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost" onClick={()=>setWeek(w=>w-1)}>← Prev</button>
          <button className="btn btn-ghost" onClick={()=>setWeek(0)}>Today</button>
          <button className="btn btn-ghost" onClick={()=>setWeek(w=>w+1)}>Next →</button>
          {isAdmin && <button className="btn btn-acc" onClick={()=>setModal("manual")}>+ New Event</button>}
        </div>
      </div>
      <div style={{ display:"flex", gap:16, marginBottom:14 }}>
        {Object.entries(CAT_COLORS).map(([cat,color])=>(
          <div key={cat} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--t2)" }}>
            <div style={{ width:9, height:9, borderRadius:2, background:color }}/>{cat}
          </div>
        ))}
      </div>
      <div style={{ background:"var(--s1)", border:"1px solid var(--b1)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid var(--b1)" }}>
          {days.map((d,i)=>{ const isToday=fmt(d)===today; return (
            <div key={i} style={{ padding:"10px", textAlign:"center", background:"var(--s2)", borderRight:i<6?"1px solid var(--b1)":"none" }}>
              <div className="label-sm" style={{ marginBottom:4 }}>{DAYS[i]}</div>
              <div className="bc" style={{ fontSize:24, fontWeight:900, color:isToday?"var(--acc)":"var(--t1)" }}>{d.getDate()}</div>
            </div>
          ); })}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {days.map((d,i)=>{ const ds=fmt(d); const dayEvents=events.filter(e=>e.date===ds); return (
            <div key={i} className="cal-cell" style={{ borderRight:i<6?"1px solid var(--b1)":"none" }} onClick={()=>isAdmin&&setModal(ds)}>
              {dayEvents.map(ev=>(
                <div key={ev.id} className="cal-ev" style={{ background:ev.color+"20", color:ev.color, border:`1px solid ${ev.color}28` }} onClick={e=>e.stopPropagation()}>
                  <span style={{ opacity:0.65, fontSize:10, marginRight:4 }}>{ev.time}</span>{ev.title}
                  {isAdmin && <span onClick={e=>{e.stopPropagation();delEvent(ev.id);}} style={{ marginLeft:4, cursor:"pointer", opacity:0.5 }}>✕</span>}
                </div>
              ))}
            </div>
          ); })}
        </div>
      </div>
      {modal && (
        <Modal onClose={()=>setModal(null)} title={modal==="manual"?"New Event":`New Event — ${modal}`}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Title</div><input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Event title"/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><div className="label-sm" style={{ marginBottom:6 }}>Time</div><input type="text" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} placeholder="19:00"/></div>
              <div><div className="label-sm" style={{ marginBottom:6 }}>Category</div><select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>{Object.keys(CAT_COLORS).map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={()=>addEvent(modal==="manual"?today:modal)}>Create Event</button>
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════ AUTH WRAPPER — replaces default export ════ */
// Store token in memory
let _token = localStorage.getItem("racker_token") || null;
let _user  = JSON.parse(localStorage.getItem("racker_user") || "null");

const authApi = {
  get: (path) => fetch(`${API}${path}`, { headers: _token ? { Authorization:`Bearer ${_token}` } : {} }).then(r=>r.json()),
  post: (path, body) => fetch(`${API}${path}`, { method:"POST", headers:{"Content-Type":"application/json", ...(_token?{Authorization:`Bearer ${_token}`}:{})}, body:JSON.stringify(body) }).then(r=>r.json()),
  put: (path, body) => fetch(`${API}${path}`, { method:"PUT", headers:{"Content-Type":"application/json", ...(_token?{Authorization:`Bearer ${_token}`}:{})}, body:JSON.stringify(body) }).then(r=>r.json()),
  delete: (path) => fetch(`${API}${path}`, { method:"DELETE", headers:{ ...(_token?{Authorization:`Bearer ${_token}`}:{}) } }).then(r=>r.json()),
};

// Override the api object to use auth headers
Object.assign(api, authApi);

export function AuthApp() {
  const [user, setUser]     = useState(_user);
  const [checking, setChecking] = useState(true);

  useEffect(()=>{
    if (_token) {
      authApi.get("/auth/me")
        .then(d=>{ if(d.id){ setUser(d); _user=d; localStorage.setItem("racker_user", JSON.stringify(d)); } else { logout(); } })
        .catch(()=>logout())
        .finally(()=>setChecking(false));
    } else { setChecking(false); }
  },[]);

  const login = (token, userData) => {
    _token = token;
    _user  = userData;
    localStorage.setItem("racker_token", token);
    localStorage.setItem("racker_user", JSON.stringify(userData));
    Object.assign(api, authApi);
    setUser(userData);
  };

  const logout = () => {
    _token = null; _user = null;
    localStorage.removeItem("racker_token");
    localStorage.removeItem("racker_user");
    setUser(null);
  };

  if (checking) return (
    <div style={{ background:"var(--bg)", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{css}</style>
      <div style={{ color:"var(--t3)", fontSize:13 }}>Loading...</div>
    </div>
  );

  if (!user) return <LoginPage onLogin={login}/>;

  return <AppWithAuth user={user} onLogout={logout}/>;
}

function LoginPage({ onLogin }) {
  const [form, setForm]   = useState({ username:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.username.trim() || !form.password.trim()) return;
    setLoading(true); setError("");
    try {
      const d = await fetch(`${API}/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) }).then(r=>r.json());
      if (d.token) { onLogin(d.token, d.user); }
      else { setError(d.error || "Login failed"); }
    } catch { setError("Cannot connect to server"); }
    setLoading(false);
  };

  return (
    <div style={{ background:"var(--bg)", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{css}</style>
      <div style={{ width:380 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:"var(--acc)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <span className="bc" style={{ fontSize:28, fontWeight:900, color:"#080a10" }}>RA</span>
          </div>
          <div className="bc" style={{ fontSize:32, fontWeight:900, letterSpacing:"0.06em" }}>RACKER</div>
          <div style={{ color:"var(--t3)", fontSize:13, marginTop:4 }}>Team Tracker — Sign in to continue</div>
        </div>
        <div className="card">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div className="label-sm" style={{ marginBottom:6 }}>Username</div>
              <input type="text" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="username" autoFocus/>
            </div>
            <div>
              <div className="label-sm" style={{ marginBottom:6 }}>Password</div>
              <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="••••••••"/>
            </div>
            {error && <div style={{ color:"var(--red)", fontSize:12, background:"rgba(255,82,82,0.08)", border:"1px solid rgba(255,82,82,0.2)", borderRadius:"var(--r)", padding:"8px 12px" }}>{error}</div>}
            <button className="btn btn-acc" style={{ justifyContent:"center", padding:"12px", marginTop:4 }} onClick={submit} disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </div>
        </div>
        <div style={{ textAlign:"center", marginTop:16, color:"var(--t3)", fontSize:12 }}>Contact your coach if you need an account</div>
      </div>
    </div>
  );
}

function AppWithAuth({ user, onLogout }) {
  const [page, setPage]         = useState("dashboard");
  const [stratTab, setStratTab] = useState("raw");
  const [players, setPlayers]   = useState([]);
  const isAdmin = user.role === "admin";

  useEffect(()=>{ api.get("/api/players").then(d=>{ if(Array.isArray(d)) setPlayers(d); }).catch(()=>{}); }, []);

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard setPage={setPage}/>;
      case "tracker":   return <LiveTracker players={players} setPage={setPage}/>;
      case "scrimlog":  return <ScrimLog setPage={setPage}/>;
      case "strategy":  return <Strategy tab={stratTab} setTab={setStratTab}/>;
      case "analysis":  return <DataAnalysis players={players}/>;
      case "vod":       return <VodReview/>;
      case "tasks":     return <Tasks players={players} setPlayers={setPlayers} isAdmin={isAdmin}/>;
      case "calendar":  return <CalendarPage isAdmin={isAdmin}/>;
      case "admin":     return isAdmin ? <AdminPanel/> : <Dashboard setPage={setPage}/>;
      case "settings":  return isAdmin ? <SettingsPage/> : <Dashboard setPage={setPage}/>;
      default:          return <Dashboard setPage={setPage}/>;
    }
  };

  const NAV_WITH_ADMIN = NAV;
  const ADMIN_NAV = isAdmin ? [
    { key:"admin",    label:"Admin",    icon:"⚙" },
    { key:"settings", label:"Settings", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ] : [];

  return (
    <>
      <style>{css}</style>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        <aside className="sidebar" style={{ background:"var(--s1)", borderRight:"1px solid var(--b1)", display:"flex", flexDirection:"column", flexShrink:0, zIndex:10 }}>
          <div style={{ padding:"18px 0 14px", borderBottom:"1px solid var(--b1)", display:"flex", justifyContent:"center", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, background:"var(--acc)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span className="bc" style={{ fontSize:20, fontWeight:900, color:"#080a10" }}>RA</span>
              </div>
              <div className="sb-text">
                <div className="bc" style={{ fontSize:17, fontWeight:900, letterSpacing:"0.06em" }}>RACKER</div>
                <div className="label-sm">{isAdmin ? "⚙ Admin" : "Player"}</div>
              </div>
            </div>
          </div>
          <nav style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
            {NAV_WITH_ADMIN.map(n=>(
              <div key={n.key} className={`nav-item${page===n.key?" on":""}`} onClick={()=>setPage(n.key)} style={{ marginBottom:2 }} title={n.label}>
                <span className="nav-icon" style={{ fontSize:14, width:22, textAlign:"center", flexShrink:0, color: page===n.key?"var(--acc)":"inherit" }}>{n.icon}</span>
                <span className="sb-text" style={{ flex:1 }}>{n.label}</span>
                {n.live && <div className="sb-text ldot"/>}
              </div>
            ))}
          </nav>
          {ADMIN_NAV.length > 0 && (
            <div style={{ borderTop:"1px solid var(--b1)", padding:"6px 8px", flexShrink:0 }}>
              {ADMIN_NAV.map(n=>(
                <div key={n.key} className={`nav-item${page===n.key?" on":""}`} onClick={()=>setPage(n.key)} style={{ marginBottom:2 }} title={n.label}>
                  <span className="nav-icon" style={{ fontSize:14, width:22, textAlign:"center", flexShrink:0, color: page===n.key?"var(--acc)":"var(--t3)" }}>{n.icon}</span>
                  <span className="sb-text" style={{ flex:1, color:"var(--t3)" }}>{n.label}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop:"1px solid var(--b1)", padding:"10px 8px", flexShrink:0, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:isAdmin?"var(--acc)":"var(--s3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:isAdmin?"#080a10":"var(--t2)", flexShrink:0 }}>
                {user.username.slice(0,2).toUpperCase()}
              </div>
              <div className="sb-text" style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.username}</div>
                <div style={{ fontSize:10, color:"var(--t3)", whiteSpace:"nowrap" }}>{user.role}</div>
              </div>
              <button onClick={onLogout} style={{ background:"transparent", border:"1px solid var(--b2)", color:"var(--t3)", cursor:"pointer", fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:4, whiteSpace:"nowrap", letterSpacing:"0.03em", flexShrink:0, display:"none" }} className="sb-logout" title="Sign out" onMouseEnter={e=>{e.target.style.color="var(--red)";e.target.style.borderColor="var(--red)";}} onMouseLeave={e=>{e.target.style.color="var(--t3)";e.target.style.borderColor="var(--b2)";}}>Sign out</button>
            </div>
          </div>
        </aside>
        <main key={page} className="fade-up" style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {renderPage()}
        </main>
      </div>
    </>
  );
}

/* ════ SETTINGS PAGE ════ */
function SettingsPage() {
  const [apiKey, setApiKey]     = useState("");
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const token = localStorage.getItem("racker_token") || "";

  useEffect(() => {
    api.get("/api/settings").then(d => {
      if (d?.henrik_api_key) setApiKey(d.henrik_api_key);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    await api.put("/api/settings/henrik_api_key", { value: apiKey.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <div style={{ padding:"28px 32px", maxWidth:600 }}>
      <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em", marginBottom:4 }}>SETTINGS</div>
      <div style={{ color:"var(--t2)", fontSize:13, marginBottom:28 }}>App configuration & integrations</div>

      <div className="card" style={{ padding:"24px", marginBottom:16 }}>
        <div className="bc" style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Racker Recorder — Auth Token</div>
        <div style={{ color:"var(--t2)", fontSize:13, marginBottom:16, lineHeight:1.6 }}>
          Used by the <b style={{color:"var(--t1)"}}>Racker Recorder</b> desktop app to save scrims automatically.
          Paste this into the app the first time you save a scrim.
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input
            type={showToken ? "text" : "password"}
            readOnly
            value={token}
            style={{ flex:1, fontFamily:"monospace", fontSize:11, color:"var(--t2)", cursor:"default" }}
          />
          <button className="btn btn-ghost" onClick={()=>setShowToken(s=>!s)} style={{padding:"4px 10px",fontSize:11}}>
            {showToken ? "Hide" : "Show"}
          </button>
          <button className="btn btn-acc" onClick={copyToken} style={{padding:"4px 14px",fontSize:11}}>
            {tokenCopied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div style={{ fontSize:11, color:"var(--t3)", marginTop:8 }}>
          ⚠ Keep this private — it gives access to your Racker account.
        </div>
      </div>

      <div className="card" style={{ padding:"24px" }}>
        <div className="bc" style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>HenrikDev API Key</div>
        <div style={{ color:"var(--t2)", fontSize:13, marginBottom:16, lineHeight:1.6 }}>
          Used to auto-import scrim data from Riot. Save it here once and you'll never need to paste it into the import modal again.
          Get a free key at <a href="https://dash.henrikdev.xyz" target="_blank" rel="noreferrer" style={{ color:"var(--acc)" }}>dash.henrikdev.xyz</a>.
        </div>
        {loading ? (
          <div style={{ color:"var(--t3)", fontSize:13 }}>Loading…</div>
        ) : (
          <div style={{ display:"flex", gap:8 }}>
            <input
              type="password"
              placeholder="HDEV-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{ flex:1 }}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setSaved(false); }}
            />
            <button className="btn btn-acc" onClick={save} disabled={!apiKey.trim()}>
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        )}
        {saved && <div style={{ color:"var(--green)", fontSize:12, marginTop:8 }}>✓ API key saved successfully</div>}
      </div>
    </div>
  );
}

/* ════ ADMIN PANEL ════ */
function AdminPanel() {
  const [users, setUsers]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [pwModal, setPwModal] = useState(null);
  const [form, setForm]     = useState({ username:"", password:"", role:"player" });
  const [pwForm, setPwForm] = useState({ password:"" });
  const [error, setError]   = useState("");
  const [msg, setMsg]       = useState("");

  useEffect(()=>{ load(); },[]);
  const load = () => api.get("/auth/users").then(d=>{ if(Array.isArray(d)) setUsers(d); });

  const flash = (m, isError=false) => { if(isError) setError(m); else setMsg(m); setTimeout(()=>{ setError(""); setMsg(""); },3000); };

  const createUser = async () => {
    if(!form.username.trim()||!form.password.trim()) return;
    const d = await api.post("/auth/users", form);
    if(d.success) { flash("User created!"); setModal(false); setForm({ username:"", password:"", role:"player" }); load(); }
    else flash(d.error||"Failed", true);
  };

  const resetPw = async () => {
    if(!pwForm.password.trim()) return;
    const d = await api.post(`/auth/users/${pwModal.id}/reset-password`, { password:pwForm.password });
    if(d.success) { flash("Password reset!"); setPwModal(null); setPwForm({ password:"" }); }
    else flash(d.error||"Failed", true);
  };

  const ban = async (u) => {
    const d = await api.post(`/auth/users/${u.id}/${u.is_banned?"unban":"ban"}`, {});
    if(d.success) { flash(u.is_banned?"User unbanned":"User banned"); load(); }
    else flash(d.error||"Failed", true);
  };

  const del = async (u) => {
    if(!confirm(`Delete user "${u.username}"?`)) return;
    const d = await api.delete(`/auth/users/${u.id}`);
    if(d.success) { flash("User deleted"); load(); }
    else flash(d.error||"Failed", true);
  };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div className="bc" style={{ fontSize:38, fontWeight:900, letterSpacing:"0.04em" }}>ADMIN PANEL</div>
          <div style={{ color:"var(--t2)", fontSize:13, marginTop:2 }}>Manage team accounts and access</div>
        </div>
        <button className="btn btn-acc" onClick={()=>setModal(true)}>+ Create User</button>
      </div>

      {msg && <div style={{ background:"rgba(105,240,174,0.1)", border:"1px solid rgba(105,240,174,0.3)", borderRadius:"var(--r)", padding:"10px 14px", marginBottom:16, color:"var(--green)", fontSize:13 }}>{msg}</div>}
      {error && <div style={{ background:"rgba(255,82,82,0.1)", border:"1px solid rgba(255,82,82,0.3)", borderRadius:"var(--r)", padding:"10px 14px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{error}</div>}

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="tbl">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Last Login</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:u.role==="admin"?"var(--acc)":"var(--s3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:u.role==="admin"?"#080a10":"var(--t2)", flexShrink:0 }}>
                      {u.username.slice(0,2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight:600 }}>{u.username}</span>
                  </div>
                </td>
                <td><span className={`chip ${u.role==="admin"?"chip-acc":"chip-blue"}`}>{u.role}</span></td>
                <td><span className={`chip ${u.is_banned?"chip-red":"chip-green"}`}>{u.is_banned?"Banned":"Active"}</span></td>
                <td style={{ color:"var(--t3)", fontSize:12 }}>{u.last_login?new Date(u.last_login).toLocaleDateString():"Never"}</td>
                <td style={{ color:"var(--t3)", fontSize:12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="btn btn-ghost" style={{ padding:"3px 9px", fontSize:11 }} onClick={()=>{ setPwModal(u); setPwForm({ password:"" }); }}>Reset PW</button>
                    {u.role!=="admin" && <button className={`btn ${u.is_banned?"btn-sub":"btn-red"}`} style={{ padding:"3px 9px", fontSize:11 }} onClick={()=>ban(u)}>{u.is_banned?"Unban":"Ban"}</button>}
                    {u.role!=="admin" && <button className="btn btn-red" style={{ padding:"3px 9px", fontSize:11 }} onClick={()=>del(u)}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal onClose={()=>setModal(false)} title="Create User">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Username</div><input type="text" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="e.g. player1"/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Password</div><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Temporary password"/></div>
            <div><div className="label-sm" style={{ marginBottom:6 }}>Role</div>
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                <option value="player">Player</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={createUser}>Create</button>
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {pwModal && (
        <Modal onClose={()=>setPwModal(null)} title={`Reset Password — ${pwModal.username}`}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><div className="label-sm" style={{ marginBottom:6 }}>New Password</div><input type="password" value={pwForm.password} onChange={e=>setPwForm({ password:e.target.value })} placeholder="New password (min 4 chars)"/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-acc" style={{ flex:1, justifyContent:"center" }} onClick={resetPw}>Reset Password</button>
              <button className="btn btn-ghost" onClick={()=>setPwModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
