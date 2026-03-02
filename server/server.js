const express  = require("express");
const cors     = require("cors");
const { Pool } = require("pg");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const path     = require("path");
const fs       = require("fs");

const app        = express();
const PORT       = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "racker-dev-secret-change-in-prod";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway.internal")
    ? false
    : { rejectUnauthorized: false },
  family: 4,
});

// ── MIDDLEWARE ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

const DIST = path.join(__dirname, "../client/dist");
if (fs.existsSync(DIST)) app.use(express.static(DIST));

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  try { req.user = jwt.verify(header.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid or expired token" }); }
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    next();
  });
}

// ── DB INIT ──────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id           SERIAL PRIMARY KEY,
      username     TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role         TEXT NOT NULL DEFAULT 'player',
      is_banned    INTEGER NOT NULL DEFAULT 0,
      created_at   TIMESTAMP DEFAULT NOW(),
      last_login   TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS players (
      id   SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      ign  TEXT DEFAULT '',
      role TEXT DEFAULT '',
      av   TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id          SERIAL PRIMARY KEY,
      player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      title       TEXT NOT NULL,
      description TEXT DEFAULT '',
      due         TEXT DEFAULT '',
      labels      TEXT DEFAULT '[]',
      done        INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS labels (
      id    SERIAL PRIMARY KEY,
      name  TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS strats (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      map         TEXT DEFAULT 'Ascent',
      side        TEXT DEFAULT 'atk',
      cat         TEXT DEFAULT 'Default',
      description TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS vods (
      id       SERIAL PRIMARY KEY,
      title    TEXT NOT NULL,
      folder   TEXT DEFAULT 'Scrims',
      url      TEXT DEFAULT '',
      ts       TEXT DEFAULT '[]',
      gen_note TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS scrims (
      id     SERIAL PRIMARY KEY,
      date   TEXT NOT NULL,
      map    TEXT NOT NULL,
      opp    TEXT NOT NULL,
      comp   TEXT DEFAULT '[]',
      score  TEXT DEFAULT '0-0',
      res    TEXT DEFAULT 'loss',
      rounds TEXT DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS calendar_events (
      id    SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date  TEXT NOT NULL,
      time  TEXT DEFAULT '18:00',
      cat   TEXT DEFAULT 'Scrim',
      color TEXT DEFAULT '#4fc3f7'
    );
    CREATE TABLE IF NOT EXISTS playbooks (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      url         TEXT NOT NULL,
      map         TEXT DEFAULT 'Ascent',
      side        TEXT DEFAULT 'atk',
      description TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS gameplans (
      id      SERIAL PRIMARY KEY,
      title   TEXT NOT NULL,
      content TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);

  // Migrate: add gen_note to vods if missing
  await pool.query(`ALTER TABLE vods ADD COLUMN IF NOT EXISTS gen_note TEXT DEFAULT ''`).catch(()=>{});
  // Migrate: add player_stats to scrims if missing
  await pool.query(`ALTER TABLE scrims ADD COLUMN IF NOT EXISTS player_stats TEXT DEFAULT '[]'`).catch(()=>{});

  // Seed admin user if none exist
  const { rows } = await pool.query("SELECT COUNT(*) as count FROM users");
  if (Number(rows[0].count) === 0) {
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    const hash = await bcrypt.hash(adminPass, 12);
    await pool.query("INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3)", ["admin", hash, "admin"]);
    console.log(`✅ Admin seeded — username: admin  password: ${adminPass}`);
  }
  console.log("✅ Database ready");
}

// ── AUTH ROUTES ──────────────────────────────────────────
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    const { rows } = await pool.query("SELECT * FROM users WHERE username=$1", [username.trim().toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid username or password" });
    if (user.is_banned) return res.status(403).json({ error: "Your account has been suspended. Contact your coach." });
    if (!await bcrypt.compare(password, user.password_hash)) return res.status(401).json({ error: "Invalid username or password" });
    await pool.query("UPDATE users SET last_login=NOW() WHERE id=$1", [user.id]);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id,username,role,is_banned FROM users WHERE id=$1", [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.is_banned) return res.status(403).json({ error: "Account suspended" });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/auth/users", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id,username,role,is_banned,created_at,last_login FROM users ORDER BY created_at ASC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/auth/users", requireAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    if (!["admin","player"].includes(role)) return res.status(400).json({ error: "Role must be admin or player" });
    const clean = username.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query("INSERT INTO users (username,password_hash,role) VALUES ($1,$2,$3) RETURNING id,username,role", [clean, hash, role]);
    res.json({ success: true, ...rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Username already taken" });
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/users/:id/reset-password", requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
    const hash = await bcrypt.hash(password, 12);
    await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/auth/users/:id/ban", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT role FROM users WHERE id=$1", [req.params.id]);
    if (rows[0]?.role === "admin") return res.status(403).json({ error: "Cannot ban an admin" });
    await pool.query("UPDATE users SET is_banned=1 WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/auth/users/:id/unban", requireAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET is_banned=0 WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/auth/users/:id", requireAdmin, async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) return res.status(400).json({ error: "Cannot delete your own account" });
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PLAYERS ──────────────────────────────────────────────
app.get("/api/players", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM players ORDER BY id"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/players", requireAdmin, async (req, res) => {
  try {
    const { name, ign="", role="", av="" } = req.body;
    const { rows } = await pool.query("INSERT INTO players (name,ign,role,av) VALUES ($1,$2,$3,$4) RETURNING *", [name,ign,role,av]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/players/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM players WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TASKS ────────────────────────────────────────────────
app.get("/api/tasks", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/tasks", requireAdmin, async (req, res) => {
  try {
    const { player_id, title, description="", due="", labels="[]", done=0 } = req.body;
    const { rows } = await pool.query("INSERT INTO tasks (player_id,title,description,due,labels,done) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *", [player_id,title,description,due,labels,done?1:0]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put("/api/tasks/:id", requireAuth, async (req, res) => {
  try { const { done } = req.body; await pool.query("UPDATE tasks SET done=$1 WHERE id=$2", [done?1:0, req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/tasks/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── LABELS ───────────────────────────────────────────────
app.get("/api/labels", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM labels ORDER BY id"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/labels", requireAdmin, async (req, res) => {
  try {
    const { name, color } = req.body;
    const { rows } = await pool.query("INSERT INTO labels (name,color) VALUES ($1,$2) RETURNING *", [name,color]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code==="23505") return res.status(400).json({ error:"Label already exists" });
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/labels/:name", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM labels WHERE name=$1", [decodeURIComponent(req.params.name)]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── STRATS ───────────────────────────────────────────────
app.get("/api/strats", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM strats ORDER BY id"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/strats", requireAdmin, async (req, res) => {
  try {
    const { name, map="Ascent", side="atk", cat="Default", description="" } = req.body;
    const { rows } = await pool.query("INSERT INTO strats (name,map,side,cat,description) VALUES ($1,$2,$3,$4,$5) RETURNING *", [name,map,side,cat,description]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/strats/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM strats WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── VODS ────────────────────────────────────────────────
app.get("/api/vods", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM vods ORDER BY id"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/vods", requireAuth, async (req, res) => {
  try {
    const { title, folder="Scrims", url="", ts="[]" } = req.body;
    const { rows } = await pool.query("INSERT INTO vods (title,folder,url,ts) VALUES ($1,$2,$3,$4) RETURNING *", [title,folder,url,ts]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put("/api/vods/:id", requireAuth, async (req, res) => {
  try {
    const { title, folder, url, ts, gen_note="" } = req.body;
    const { rows } = await pool.query("UPDATE vods SET title=$1,folder=$2,url=$3,ts=$4,gen_note=$5 WHERE id=$6 RETURNING *", [title,folder,url,ts,gen_note,req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/vods/:id", requireAuth, async (req, res) => {
  try { await pool.query("DELETE FROM vods WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SCRIMS ───────────────────────────────────────────────
app.get("/api/scrims", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM scrims ORDER BY id DESC"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/scrims", requireAuth, async (req, res) => {
  try {
    const { date, map, opp, comp="[]", score="0-0", res:result="loss", rounds="[]", player_stats="[]" } = req.body;
    const ps = typeof player_stats === "string" ? player_stats : JSON.stringify(player_stats);
    const { rows } = await pool.query("INSERT INTO scrims (date,map,opp,comp,score,res,rounds,player_stats) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [date,map,opp,JSON.stringify(Array.isArray(comp)?comp:JSON.parse(comp)),score,result,JSON.stringify(Array.isArray(rounds)?rounds:JSON.parse(rounds)),ps]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get("/api/scrims/:id", requireAuth, async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM scrims WHERE id=$1 AND team_id=$2", [req.params.id, req.user.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const s = r.rows[0];
    res.json({ ...s, player_stats: s.player_stats || [], rounds: s.rounds || [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/scrims/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM scrims WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── RIOT IMPORT ──────────────────────────────────────────
// Normalize HenrikDev map path IDs → display names
const MAP_NAME_MAP = {
  "/Game/Maps/Ascent/Ascent":   "Ascent",
  "/Game/Maps/Bonsai/Bonsai":   "Split",
  "/Game/Maps/Canyon/Canyon":   "Fracture",
  "/Game/Maps/Duality/Duality": "Bind",
  "/Game/Maps/Foxtrot/Foxtrot": "Breeze",
  "/Game/Maps/Port/Port":       "Icebox",
  "/Game/Maps/Triad/Triad":     "Haven",
  "/Game/Maps/Pitt/Pitt":       "Pitt",
};

function normalizeMap(mapId) {
  if (!mapId) return "Unknown";
  if (MAP_NAME_MAP[mapId]) return MAP_NAME_MAP[mapId];
  const parts = mapId.split("/").filter(Boolean);
  return parts[parts.length - 1] || "Unknown";
}

app.post("/api/scrims/import", requireAuth, async (req, res) => {
  try {
    const { matchId, teamName } = req.body;
    let { apiKey } = req.body;

    if (!matchId) return res.status(400).json({ error: "matchId is required" });

    // Fall back to saved API key from settings if not provided in request
    if (!apiKey) {
      const { rows } = await pool.query("SELECT value FROM settings WHERE key='henrik_api_key'");
      apiKey = rows[0]?.value || "";
    }
    if (!apiKey) return res.status(400).json({ error: "No HenrikDev API key found. Save one in Settings first." });

    const url = `https://api.henrikdev.xyz/valorant/v4/match/na/${encodeURIComponent(matchId)}`;
    const response = await fetch(url, { headers: { Authorization: apiKey } });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errBody?.errors?.[0]?.message || `HenrikDev API returned ${response.status}`
      });
    }

    const data  = await response.json();
    const match = data?.data;
    if (!match) return res.status(404).json({ error: "Match not found or empty response" });

    // Map + date
    const map  = normalizeMap(match.metadata?.map?.id) || match.metadata?.map?.name || "Unknown";
    const date = match.metadata?.started_at
      ? new Date(match.metadata.started_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const teams   = match.teams   || [];
    const players = match.players || [];

    // Determine our team by matching a player name/tag against teamName hint
    let ourTeamId = teams[0]?.team_id || "Blue";
    if (teamName?.trim()) {
      const lower = teamName.trim().toLowerCase();
      const found = players.find(p =>
        p.name?.toLowerCase().includes(lower) || p.tag?.toLowerCase().includes(lower)
      );
      if (found) ourTeamId = found.team_id;
    }

    const ourTeam   = teams.find(t => t.team_id === ourTeamId);
    const theirTeam = teams.find(t => t.team_id !== ourTeamId);

    const ourScore   = ourTeam?.rounds?.won  ?? 0;
    const theirScore = theirTeam?.rounds?.won ?? 0;
    const result     = ourScore > theirScore ? "win" : "loss";
    const score      = `${ourScore}-${theirScore}`;

    // Our comp (agents)
    const ourPlayers = players.filter(p => p.team_id === ourTeamId);
    const comp = ourPlayers.slice(0, 5).map(p => p.agent?.name || "Unknown");

    // Rounds: "w" we won, "l" we lost
    const rounds = (match.rounds || []).map(r =>
      r.winning_team === ourTeamId ? "w" : "l"
    );

    // Opponent label — use first enemy player's name or "Opponent"
    const theirPlayers = players.filter(p => p.team_id !== ourTeamId);
    const opp = theirPlayers[0]?.name || "Opponent";

    res.json({
      date,
      map,
      opp,
      comp:   JSON.stringify(comp),
      score,
      res:    result,
      rounds: JSON.stringify(rounds),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CALENDAR EVENTS ──────────────────────────────────────
app.get("/api/events", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM calendar_events ORDER BY date,time"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/events", requireAdmin, async (req, res) => {
  try {
    const { title, date, time="18:00", cat="Scrim", color="#4fc3f7" } = req.body;
    const { rows } = await pool.query("INSERT INTO calendar_events (title,date,time,cat,color) VALUES ($1,$2,$3,$4,$5) RETURNING *", [title,date,time,cat,color]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/events/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM calendar_events WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/health", (req, res) => res.send("Tracler backend running ✅"));

// ── SETTINGS ─────────────────────────────────────────────
app.get("/api/settings", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT key, value FROM settings");
    const obj = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/settings/:key", requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",
      [req.params.key, value ?? ""]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PLAYBOOKS ────────────────────────────────────────────
app.get("/api/playbooks", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM playbooks ORDER BY id"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/playbooks", requireAdmin, async (req, res) => {
  try {
    const { title, url, map="Ascent", side="atk", description="" } = req.body;
    const { rows } = await pool.query("INSERT INTO playbooks (title,url,map,side,description) VALUES ($1,$2,$3,$4,$5) RETURNING *", [title,url,map,side,description]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/playbooks/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM playbooks WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GAME PLANS ───────────────────────────────────────────
app.get("/api/gameplans", requireAuth, async (req, res) => {
  try { const { rows } = await pool.query("SELECT * FROM gameplans ORDER BY id"); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post("/api/gameplans", requireAdmin, async (req, res) => {
  try {
    const { title="New Game Plan", content="" } = req.body;
    const { rows } = await pool.query("INSERT INTO gameplans (title,content) VALUES ($1,$2) RETURNING *", [title,content]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put("/api/gameplans/:id", requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    await pool.query("UPDATE gameplans SET title=$1,content=$2 WHERE id=$3", [title,content,req.params.id]);
    res.json({ ok:true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/gameplans/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM gameplans WHERE id=$1", [req.params.id]); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("*", (req, res) => {
  const index = path.join(DIST, "index.html");
  if (fs.existsSync(index)) res.sendFile(index);
  else res.send("API running");
});

initDB()
  .then(() => app.listen(PORT, () => console.log(`Tracler running on :${PORT}`)))
  .catch(err => { console.error("❌ DB init failed:", err.message); process.exit(1); });
