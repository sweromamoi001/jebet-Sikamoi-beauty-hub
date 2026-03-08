import { useState, useEffect, useRef } from "react";

const ZONES = [
  { id: "Z1", name: "Marigat–Chemolingot Road", x: 28, y: 35, risk: "critical" },
  { id: "Z2", name: "Loruk–Kagir Route", x: 55, y: 25, risk: "high" },
  { id: "Z3", name: "Ng'aratuko Village", x: 70, y: 55, risk: "critical" },
  { id: "Z4", name: "Kerio River Belt", x: 45, y: 65, risk: "medium" },
  { id: "Z5", name: "Yatya–Chemoe Road", x: 20, y: 60, risk: "high" },
  { id: "Z6", name: "Chemolingot Market", x: 80, y: 30, risk: "low" },
];

const SENSOR_TYPES = [
  { type: "ACOUSTIC", icon: "🎙️", label: "Gunshot Detection" },
  { type: "MOTION", icon: "📡", label: "Motion/PIR Sensor" },
  { type: "SEISMIC", icon: "🌍", label: "Ground Vibration" },
  { type: "THERMAL", icon: "🔥", label: "Thermal Imaging" },
  { type: "CCTV", icon: "📷", label: "AI Camera Node" },
];

const INITIAL_SENSORS = ZONES.flatMap((z, zi) =>
  SENSOR_TYPES.map((s, si) => ({
    id: `${z.id}-${s.type}`,
    zone: z.id,
    zoneName: z.name,
    type: s.type,
    icon: s.icon,
    label: s.label,
    status: zi === 0 && si < 2 ? "ALERT" : zi === 2 && si === 0 ? "ALERT" : Math.random() > 0.15 ? "ONLINE" : "OFFLINE",
    lastPing: new Date(),
    value: Math.floor(Math.random() * 100),
  }))
);

const INITIAL_ALERTS = [
  { id: 1, time: "08:42", zone: "Ng'aratuko Village", type: "GUNSHOT DETECTED", severity: "CRITICAL", status: "ACTIVE", sensor: "ACOUSTIC" },
  { id: 2, time: "08:39", zone: "Marigat–Chemolingot Road", type: "MULTIPLE INTRUDERS", severity: "CRITICAL", status: "ACTIVE", sensor: "MOTION + THERMAL" },
  { id: 3, time: "07:55", zone: "Loruk–Kagir Route", type: "VEHICLE AMBUSH PATTERN", severity: "HIGH", status: "PATROL DISPATCHED" },
  { id: 4, time: "07:12", zone: "Yatya–Chemoe Road", type: "UNUSUAL MOVEMENT", severity: "MEDIUM", status: "MONITORING" },
  { id: 5, time: "06:30", zone: "Kerio River Belt", type: "SEISMIC ANOMALY", severity: "LOW", status: "RESOLVED" },
];

const PATROLS = [
  { id: "P1", callsign: "ALPHA-1", location: "Marigat Base", status: "RESPONDING", eta: "4 min" },
  { id: "P2", callsign: "BRAVO-2", location: "Chemolingot Post", status: "STANDBY", eta: "—" },
  { id: "P3", callsign: "CHARLIE-3", location: "En Route Z3", status: "DEPLOYED", eta: "2 min" },
  { id: "P4", callsign: "DELTA-4", location: "Loruk Station", status: "STANDBY", eta: "—" },
];

const riskColor = {
  critical: "#ff2d2d",
  high: "#ff8c00",
  medium: "#ffd700",
  low: "#00e676",
};

const severityColor = {
  CRITICAL: "#ff2d2d",
  HIGH: "#ff8c00",
  MEDIUM: "#ffd700",
  LOW: "#00e676",
};

const statusColor = {
  ACTIVE: "#ff2d2d",
  "PATROL DISPATCHED": "#ff8c00",
  MONITORING: "#ffd700",
  RESOLVED: "#00e676",
};

const patrolStatusColor = {
  RESPONDING: "#ff8c00",
  STANDBY: "#4fc3f7",
  DEPLOYED: "#ff2d2d",
};

export default function App() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [sensors] = useState(INITIAL_SENSORS);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeTab, setActiveTab] = useState("map");
  const [time, setTime] = useState(new Date());
  const [pulseCount, setPulseCount] = useState(0);
  const [newAlert, setNewAlert] = useState(null);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      tickRef.current++;
      setPulseCount(p => p + 1);
      // Simulate random alert
      if (tickRef.current % 20 === 0) {
        const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
        const types = ["MOVEMENT DETECTED", "GUNSHOT DETECTED", "VEHICLE DETECTED", "GROUND VIBRATION"];
        const sevs = ["HIGH", "MEDIUM", "CRITICAL"];
        const na = {
          id: Date.now(),
          time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
          zone: zone.name,
          type: types[Math.floor(Math.random() * types.length)],
          severity: sevs[Math.floor(Math.random() * sevs.length)],
          status: "ACTIVE",
          sensor: SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)].type,
        };
        setNewAlert(na);
        setAlerts(prev => [na, ...prev.slice(0, 19)]);
        setTimeout(() => setNewAlert(null), 3000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter(a => a.status === "ACTIVE").length;
  const onlineSensors = sensors.filter(s => s.status === "ONLINE" || s.status === "ALERT").length;
  const alertSensors = sensors.filter(s => s.status === "ALERT").length;

  const zoneSensors = selectedZone
    ? sensors.filter(s => s.zone === selectedZone)
    : [];

  return (
    <div style={{
      fontFamily: "'Courier New', monospace",
      background: "#050a0f",
      color: "#a0c4d8",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanline { 0%{top:-4px} 100%{top:100%} }
        @keyframes glow { 0%,100%{box-shadow:0 0 6px #ff2d2d88} 50%{box-shadow:0 0 18px #ff2d2dcc} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} }
        .pulse-dot { animation: pulse 1.5s infinite; }
        .alert-row-new { animation: fadeIn 0.5s ease; }
        .critical-glow { animation: glow 1s infinite; }
        .blink { animation: blink 1s infinite; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0a1520; }
        ::-webkit-scrollbar-thumb { background:#1e4060; }
        .tab-btn:hover { background: #112233 !important; }
        .zone-node:hover { cursor:pointer; transform:scale(1.2); }
        .patrol-row:hover { background:#0d2035 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #020810 0%, #071828 50%, #020810 100%)",
        borderBottom: "1px solid #1a4060",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,180,255,0.015) 2px, rgba(0,180,255,0.015) 4px)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42,
            background: "linear-gradient(135deg, #0d3050, #1a6090)",
            border: "2px solid #2a90cc",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, borderRadius: 4,
          }}>🛡️</div>
          <div>
            <div style={{ fontSize: 13, color: "#4fc3f7", letterSpacing: 4, fontWeight: "bold" }}>
              BARINGO EARLY WARNING & THREAT DETECTION SYSTEM
            </div>
            <div style={{ fontSize: 10, color: "#4a7090", letterSpacing: 3, marginTop: 1 }}>
              BEWTDS v2.1 — NATIONAL POLICE SERVICE | BARINGO SOUTH COMMAND
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#ff2d2d" }} className={activeAlerts > 0 ? "blink" : ""}>
              {activeAlerts}
            </div>
            <div style={{ fontSize: 9, color: "#4a7090", letterSpacing: 2 }}>ACTIVE ALERTS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#00e676" }}>{onlineSensors}</div>
            <div style={{ fontSize: 9, color: "#4a7090", letterSpacing: 2 }}>SENSORS LIVE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, color: "#4fc3f7", letterSpacing: 2 }}>
              {time.toLocaleTimeString("en-KE")}
            </div>
            <div style={{ fontSize: 10, color: "#4a7090" }}>
              {time.toLocaleDateString("en-KE", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* New Alert Notification */}
      {newAlert && (
        <div className="alert-row-new" style={{
          background: `linear-gradient(90deg, ${severityColor[newAlert.severity]}22, transparent)`,
          borderBottom: `2px solid ${severityColor[newAlert.severity]}`,
          padding: "8px 20px",
          display: "flex", gap: 12, alignItems: "center",
          fontSize: 12,
        }}>
          <span style={{ color: severityColor[newAlert.severity] }} className="blink">⚠ NEW ALERT</span>
          <span style={{ color: "#fff", fontWeight: "bold" }}>{newAlert.type}</span>
          <span style={{ color: "#4a7090" }}>|</span>
          <span>{newAlert.zone}</span>
          <span style={{ color: "#4a7090" }}>|</span>
          <span style={{ color: "#4fc3f7" }}>{newAlert.sensor}</span>
          <span style={{ marginLeft: "auto", color: severityColor[newAlert.severity] }}>{newAlert.severity}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: "flex", gap: 1,
        borderBottom: "1px solid #1a4060",
        background: "#030c14",
        padding: "0 20px",
      }}>
        {[
          { id: "map", label: "🗺  THREAT MAP" },
          { id: "alerts", label: "⚠  ALERTS" },
          { id: "sensors", label: "📡  SENSOR NETWORK" },
          { id: "patrols", label: "🚔  PATROL UNITS" },
          { id: "system", label: "⚙  SYSTEM DESIGN" },
        ].map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? "#0d2540" : "transparent",
            color: activeTab === t.id ? "#4fc3f7" : "#4a6070",
            border: "none",
            borderBottom: activeTab === t.id ? "2px solid #4fc3f7" : "2px solid transparent",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: 11,
            letterSpacing: 2,
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>

        {/* === MAP TAB === */}
        {activeTab === "map" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, height: "100%" }}>
            <div style={{
              background: "#060f1a",
              border: "1px solid #1a4060",
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
              minHeight: 480,
            }}>
              {/* Grid overlay */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(rgba(0,150,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,150,255,0.04) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }} />
              {/* Map label */}
              <div style={{
                position: "absolute", top: 12, left: 16,
                fontSize: 10, letterSpacing: 3, color: "#2a6090",
              }}>BARINGO SOUTH — TACTICAL OVERVIEW</div>

              {/* Terrain representation */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                <ellipse cx="50" cy="70" rx="30" ry="15" fill="#2a6030" />
                <ellipse cx="20" cy="50" rx="12" ry="20" fill="#3a5020" />
                <ellipse cx="75" cy="40" rx="15" ry="12" fill="#2a5028" />
                <path d="M30 80 Q50 60 70 80" stroke="#4fc3f7" strokeWidth="1" fill="none" />
                {/* Road lines */}
                <path d="M28 35 L80 30" stroke="#888" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
                <path d="M55 25 L70 55" stroke="#888" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
              </svg>

              {/* Zone nodes */}
              {ZONES.map(z => {
                const zoneSens = sensors.filter(s => s.zone === z.id);
                const hasAlert = zoneSens.some(s => s.status === "ALERT");
                return (
                  <div key={z.id}
                    className="zone-node"
                    onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
                    style={{
                      position: "absolute",
                      left: `${z.x}%`, top: `${z.y}%`,
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      transition: "transform 0.2s",
                    }}
                  >
                    {/* Pulse ring */}
                    {hasAlert && (
                      <div className="pulse-dot" style={{
                        position: "absolute",
                        inset: -14,
                        borderRadius: "50%",
                        border: `2px solid ${riskColor[z.risk]}`,
                        pointerEvents: "none",
                      }} />
                    )}
                    <div className={hasAlert ? "critical-glow" : ""} style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${riskColor[z.risk]}66, ${riskColor[z.risk]}22)`,
                      border: `2px solid ${riskColor[z.risk]}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12,
                      margin: "0 auto",
                    }}>
                      {hasAlert ? "⚠" : "📡"}
                    </div>
                    <div style={{
                      fontSize: 8, color: riskColor[z.risk],
                      marginTop: 4, letterSpacing: 1,
                      background: "#060f1acc",
                      padding: "1px 4px",
                      whiteSpace: "nowrap",
                      maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis",
                    }}>{z.id}</div>
                    {selectedZone === z.id && (
                      <div style={{
                        position: "absolute",
                        top: 36, left: "50%", transform: "translateX(-50%)",
                        background: "#0a1e30",
                        border: `1px solid ${riskColor[z.risk]}`,
                        borderRadius: 4,
                        padding: "8px 12px",
                        minWidth: 180,
                        zIndex: 10,
                        textAlign: "left",
                      }}>
                        <div style={{ fontSize: 10, color: "#4fc3f7", marginBottom: 6, letterSpacing: 1 }}>{z.name}</div>
                        <div style={{ fontSize: 9, color: riskColor[z.risk], marginBottom: 4 }}>
                          THREAT LEVEL: {z.risk.toUpperCase()}
                        </div>
                        {SENSOR_TYPES.map(st => {
                          const s = sensors.find(x => x.zone === z.id && x.type === st.type);
                          return (
                            <div key={st.type} style={{
                              display: "flex", justifyContent: "space-between",
                              fontSize: 9, padding: "2px 0",
                              color: s?.status === "ALERT" ? "#ff2d2d" : s?.status === "ONLINE" ? "#00e676" : "#4a6070",
                            }}>
                              <span>{st.icon} {st.label}</span>
                              <span>{s?.status}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Legend */}
              <div style={{
                position: "absolute", bottom: 12, left: 16,
                display: "flex", gap: 12, fontSize: 9,
              }}>
                {Object.entries(riskColor).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: v }} />
                    <span style={{ color: v, letterSpacing: 1 }}>{k.toUpperCase()}</span>
                  </div>
                ))}
              </div>

              <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 9, color: "#2a4060" }}>
                CLICK NODE TO INSPECT SENSORS
              </div>
            </div>

            {/* Side panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Threat summary */}
              <div style={{ background: "#060f1a", border: "1px solid #1a4060", borderRadius: 4, padding: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a6070", marginBottom: 12 }}>ZONE STATUS</div>
                {ZONES.map(z => {
                  const hasAlert = sensors.filter(s => s.zone === z.id).some(s => s.status === "ALERT");
                  return (
                    <div key={z.id} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 8, fontSize: 10,
                      padding: "6px 8px",
                      background: hasAlert ? "#1a050522" : "transparent",
                      border: hasAlert ? "1px solid #ff2d2d33" : "1px solid transparent",
                      borderRadius: 3,
                    }}>
                      <div>
                        <span style={{ color: "#4fc3f7" }}>{z.id}</span>
                        <span style={{ color: "#4a6070", marginLeft: 8, fontSize: 8 }}>
                          {z.name.substring(0, 22)}{z.name.length > 22 ? "…" : ""}
                        </span>
                      </div>
                      <div style={{
                        color: riskColor[z.risk], fontSize: 8,
                        letterSpacing: 1, display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {hasAlert && <span className="blink">⚠</span>}
                        {z.risk.toUpperCase()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sensor overview */}
              <div style={{ background: "#060f1a", border: "1px solid #1a4060", borderRadius: 4, padding: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a6070", marginBottom: 12 }}>SENSOR NETWORK</div>
                {SENSOR_TYPES.map(st => {
                  const all = sensors.filter(s => s.type === st.type);
                  const online = all.filter(s => s.status !== "OFFLINE").length;
                  const alerted = all.filter(s => s.status === "ALERT").length;
                  return (
                    <div key={st.type} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 3 }}>
                        <span>{st.icon} {st.label}</span>
                        <span style={{ color: alerted > 0 ? "#ff2d2d" : "#00e676" }}>
                          {alerted > 0 ? `${alerted} ALERT` : `${online}/${all.length} OK`}
                        </span>
                      </div>
                      <div style={{ height: 3, background: "#0a1e30", borderRadius: 2 }}>
                        <div style={{
                          height: "100%",
                          width: `${(online / all.length) * 100}%`,
                          background: alerted > 0 ? "#ff2d2d" : "#00e676",
                          borderRadius: 2,
                          transition: "width 1s",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comms status */}
              <div style={{ background: "#060f1a", border: "1px solid #1a4060", borderRadius: 4, padding: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a6070", marginBottom: 10 }}>COMMUNICATIONS</div>
                {[
                  { label: "LoRaWAN Network", status: "ACTIVE", latency: "~120ms" },
                  { label: "Satellite Uplink", status: "ACTIVE", latency: "~680ms" },
                  { label: "4G Backup", status: "ACTIVE", latency: "~45ms" },
                  { label: "NPS Command HQ", status: "CONNECTED", latency: "—" },
                ].map(c => (
                  <div key={c.label} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 9, marginBottom: 7, color: "#4a7090",
                  }}>
                    <span>{c.label}</span>
                    <span style={{ color: "#00e676" }}>{c.status} <span style={{ color: "#4a6070" }}>{c.latency}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === ALERTS TAB === */}
        {activeTab === "alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6070" }}>
                INCIDENT LOG — {alerts.length} EVENTS RECORDED
              </div>
              <div style={{ fontSize: 9, color: "#4a6070" }}>
                <span className="pulse-dot" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ff2d2d", marginRight: 6 }} />
                LIVE FEED
              </div>
            </div>
            {alerts.map((a, i) => (
              <div key={a.id} className={i === 0 && newAlert ? "alert-row-new" : ""} style={{
                background: `linear-gradient(90deg, ${severityColor[a.severity]}11, #060f1a)`,
                border: `1px solid ${severityColor[a.severity]}44`,
                borderLeft: `3px solid ${severityColor[a.severity]}`,
                borderRadius: 3,
                padding: "10px 16px",
                display: "grid",
                gridTemplateColumns: "60px 1fr 1fr 140px 160px",
                gap: 16,
                alignItems: "center",
                fontSize: 10,
              }}>
                <div style={{ color: "#4a7090", letterSpacing: 1 }}>{a.time}</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: "bold", marginBottom: 2 }}>{a.type}</div>
                  <div style={{ color: "#4a7090", fontSize: 9 }}>{a.zone}</div>
                </div>
                <div style={{ color: "#4fc3f7", fontSize: 9 }}>
                  <span style={{ color: "#4a6070" }}>SENSOR: </span>{a.sensor}
                </div>
                <div style={{
                  color: severityColor[a.severity],
                  letterSpacing: 2, fontSize: 9, fontWeight: "bold",
                }}>{a.severity}</div>
                <div style={{
                  color: statusColor[a.status] || "#4a6070",
                  fontSize: 9, letterSpacing: 1,
                }}>{a.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* === SENSORS TAB === */}
        {activeTab === "sensors" && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6070", marginBottom: 12 }}>
              SENSOR NETWORK — {sensors.length} NODES | {alertSensors} ALERTING | {sensors.filter(s => s.status === "OFFLINE").length} OFFLINE
            </div>
            {ZONES.map(z => (
              <div key={z.id} style={{ marginBottom: 20 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  borderBottom: `1px solid ${riskColor[z.risk]}44`,
                  paddingBottom: 6, marginBottom: 8,
                }}>
                  <span style={{ color: riskColor[z.risk], fontSize: 12, fontWeight: "bold" }}>{z.id}</span>
                  <span style={{ fontSize: 10, color: "#4fc3f7" }}>{z.name}</span>
                  <span style={{ fontSize: 9, color: riskColor[z.risk], letterSpacing: 2 }}>
                    ● {z.risk.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {SENSOR_TYPES.map(st => {
                    const s = sensors.find(x => x.zone === z.id && x.type === st.type);
                    const clr = s?.status === "ALERT" ? "#ff2d2d" : s?.status === "ONLINE" ? "#00e676" : "#4a4a4a";
                    return (
                      <div key={st.type} className={s?.status === "ALERT" ? "critical-glow" : ""} style={{
                        background: "#060f1a",
                        border: `1px solid ${clr}44`,
                        borderTop: `2px solid ${clr}`,
                        borderRadius: 4,
                        padding: 10,
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{st.icon}</div>
                        <div style={{ fontSize: 8, color: "#4a7090", letterSpacing: 1, marginBottom: 4 }}>{st.label}</div>
                        <div style={{
                          fontSize: 9, color: clr, fontWeight: "bold",
                          letterSpacing: 1,
                        }} className={s?.status === "ALERT" ? "blink" : ""}>{s?.status}</div>
                        {s?.status !== "OFFLINE" && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ height: 2, background: "#0a1e30", borderRadius: 1 }}>
                              <div style={{
                                height: "100%",
                                width: `${s?.value}%`,
                                background: clr,
                                borderRadius: 1,
                              }} />
                            </div>
                            <div style={{ fontSize: 7, color: "#4a6070", marginTop: 2 }}>{s?.value}% sensitivity</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === PATROLS TAB === */}
        {activeTab === "patrols" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6070", marginBottom: 12 }}>FIELD UNITS</div>
              {PATROLS.map(p => (
                <div key={p.id} className="patrol-row" style={{
                  background: "#060f1a",
                  border: "1px solid #1a4060",
                  borderLeft: `3px solid ${patrolStatusColor[p.status]}`,
                  borderRadius: 3,
                  padding: "14px 16px",
                  marginBottom: 8,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}>
                  <div>
                    <div style={{ color: "#4fc3f7", fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>
                      🚔 {p.callsign}
                    </div>
                    <div style={{ color: "#4a7090", fontSize: 9 }}>📍 {p.location}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: patrolStatusColor[p.status], fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>
                      {p.status}
                    </div>
                    <div style={{ color: "#4a6070", fontSize: 9 }}>ETA: {p.eta}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6070", marginBottom: 12 }}>DISPATCH CONSOLE</div>
              <div style={{ background: "#060f1a", border: "1px solid #1a4060", borderRadius: 4, padding: 16 }}>
                {alerts.filter(a => a.status === "ACTIVE").slice(0, 3).map(a => (
                  <div key={a.id} style={{
                    border: "1px solid #ff2d2d44", borderRadius: 3,
                    padding: "10px 14px", marginBottom: 10,
                    background: "#1a050511",
                  }}>
                    <div style={{ fontSize: 10, color: "#ff2d2d", fontWeight: "bold", marginBottom: 4 }}>
                      ⚠ {a.type}
                    </div>
                    <div style={{ fontSize: 9, color: "#4a7090", marginBottom: 8 }}>{a.zone} — {a.time}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {PATROLS.filter(p => p.status === "STANDBY").map(p => (
                        <button key={p.id} style={{
                          background: "#0d2540",
                          border: "1px solid #4fc3f7",
                          color: "#4fc3f7",
                          fontSize: 9, padding: "4px 10px",
                          borderRadius: 2, cursor: "pointer",
                          fontFamily: "inherit", letterSpacing: 1,
                        }}>
                          DISPATCH {p.callsign}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 9, color: "#4a6070", marginTop: 8 }}>
                  All dispatch actions are logged and timestamped for accountability.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SYSTEM DESIGN TAB === */}
        {activeTab === "system" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#060f1a", border: "1px solid #1a4060", borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6070", marginBottom: 16 }}>SYSTEM ARCHITECTURE</div>
              {[
                {
                  layer: "01 — SENSOR LAYER",
                  color: "#4fc3f7",
                  items: [
                    "🎙️ Acoustic Gunshot Detection (ShotSpotter-type)",
                    "📡 PIR Motion Sensors + Doppler Radar",
                    "🌍 Seismic Ground Sensors (footstep detection)",
                    "🔥 Thermal / Infrared Cameras",
                    "📷 AI-Powered Edge Vision (CCTV + ML)",
                    "🔋 Solar + LiPo Battery Powered",
                  ],
                },
                {
                  layer: "02 — COMMUNICATION LAYER",
                  color: "#00e676",
                  items: [
                    "📶 LoRaWAN (15–40 km range, low power)",
                    "🛰️ Iridium Satellite (off-grid backup)",
                    "📱 4G LTE (urban/semi-urban areas)",
                    "🔒 AES-256 Encrypted Mesh Network",
                    "📊 MQTT Protocol for real-time streaming",
                  ],
                },
                {
                  layer: "03 — INTELLIGENCE LAYER",
                  color: "#ffd700",
                  items: [
                    "🤖 AI Threat Classification Engine",
                    "📈 Anomaly Detection (movement patterns)",
                    "🧠 Predictive Hotspot Mapping (ML model)",
                    "📍 Real-time GPS Incident Tagging",
                    "🔗 Cross-zone Correlation Analysis",
                  ],
                },
                {
                  layer: "04 — RESPONSE LAYER",
                  color: "#ff8c00",
                  items: [
                    "🚔 Automated Patrol Unit Dispatch",
                    "📲 SMS/Push Alerts to Officers",
                    "🚨 Community Alert Sirens (solar)",
                    "📋 Incident Logging + Evidence Trail",
                    "📊 NPS Command Dashboard (this system)",
                  ],
                },
              ].map(l => (
                <div key={l.layer} style={{ marginBottom: 16 }}>
                  <div style={{ color: l.color, fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>{l.layer}</div>
                  {l.items.map(item => (
                    <div key={item} style={{ fontSize: 9, color: "#4a7090", marginBottom: 4, paddingLeft: 8 }}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#060f1a", border: "1px solid #1a4060", borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6070", marginBottom: 16 }}>DEPLOYMENT SPECS</div>
                {[
                  ["Sensor Nodes per Zone", "5–8 units"],
                  ["Coverage Radius per Node", "300–500m"],
                  ["Alert Latency", "< 3 seconds"],
                  ["Battery Life (solar)", "72h backup"],
                  ["Operating Temperature", "0°C – 55°C"],
                  ["Tamper Protection", "Yes (alert on tampering)"],
                  ["Government Access Level", "NPS + County Command"],
                  ["Data Retention", "90 days encrypted"],
                  ["Estimated Deployment Cost", "KES 2–5M per zone"],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 9, marginBottom: 7, borderBottom: "1px solid #0d2030",
                    paddingBottom: 6,
                  }}>
                    <span style={{ color: "#4a7090" }}>{k}</span>
                    <span style={{ color: "#4fc3f7" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#060f1a", border: "1px solid #1a4060", borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6070", marginBottom: 12 }}>STAKEHOLDERS</div>
                {[
                  { icon: "🏛️", name: "National Police Service", role: "Primary operator + dispatcher" },
                  { icon: "🏢", name: "Baringo County Gov't", role: "Infrastructure + funding" },
                  { icon: "📡", name: "Communications Authority", role: "Spectrum licensing" },
                  { icon: "🌐", name: "Ministry of ICT", role: "National integration" },
                  { icon: "👥", name: "Community Leaders", role: "Local intelligence + alerts" },
                ].map(s => (
                  <div key={s.name} style={{
                    display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 9, color: "#4fc3f7" }}>{s.name}</div>
                      <div style={{ fontSize: 8, color: "#4a6070" }}>{s.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #1a4060",
        padding: "6px 20px",
        display: "flex", justifyContent: "space-between",
        fontSize: 8, color: "#2a4050",
        background: "#030c14",
      }}>
        <span>BEWTDS © 2026 — BARINGO SOUTH COMMAND | DESIGNED FOR NATIONAL POLICE SERVICE</span>
        <span>ENCRYPTION: AES-256 | UPTIME: 99.7% | ALL RIGHTS RESERVED</span>
      </div>
    </div>
  );
}
