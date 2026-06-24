import { useState, useRef, useCallback, useEffect } from "react";

// ─── RISK CONFIG — mutated by Implementor Agent based on performance ──────────
const BASE_RISK = {
  maxKelly:        0.07,
  minEdge:         0.05,
  minConfidence:   0.52,
  maxExposurePct:  0.12,
  stopLossPct:     0.35,
  minBetUSDC:      1.50,
  maxBetUSDC:      300,
  councilNeeded:   3,
  claudeMs:        12000,
  maxConsecLoss:   3,
  dedupCycles:     4,
  edgeWeight:      1.0,
  confWeight:      1.0,
  hawkFloor:       0.08,
  doveFloor:       0.62,
};

const GAMMA = "https://gamma-api.polymarket.com";
const CLOB  = "https://clob.polymarket.com";
const DATA  = "https://data-api.polymarket.com";
const BACK  = "http://localhost:4242";

const sleep  = ms => new Promise(r => setTimeout(r, ms));
const fmt$   = n  => `$${Number(n).toFixed(2)}`;
const fmtPct = n  => `${(n*100).toFixed(1)}%`;
const clamp  = (v,lo,hi) => Math.min(Math.max(v,lo),hi);
const short  = (s,n=46) => s?.length>n ? s.slice(0,n)+"…" : (s||"");
const now8   = () => { const d=new Date(); return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`; };

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STORE_KEY = "polyswarm_v6";
function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)||"{}"); } catch { return {}; }
}
function saveStore(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {}
}

// ─── OPENAI CALL (replaces Anthropic) ────────────────────────────────────────
// Uses gpt-4o-mini — cheaper per-call, same structured-output capability.
// Expects VITE_OPENAI_API_KEY in env or falls back to window.__OPENAI_KEY__.
async function callOpenAI(system, user, ms=12000) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || window.__OPENAI_KEY__;
  if (!apiKey) throw new Error("No OpenAI API key — set VITE_OPENAI_API_KEY");

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user",   content: user   },
        ],
      }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || "OpenAI error");
    return d.choices?.[0]?.message?.content || "";
  } catch(e) {
    if (e.name === "AbortError") throw new Error("OpenAI timeout");
    throw e;
  } finally { clearTimeout(t); }
}

// ─── VALIDATED EDGE PARSE ─────────────────────────────────────────────────────
function parseEdge(raw) {
  try {
    const p = JSON.parse(raw.replace(/```json|```/g,"").trim());
    if(typeof p.edge!=="number"||p.edge<0||p.edge>0.5) return null;
    if(typeof p.confidence!=="number"||p.confidence<0||p.confidence>1) return null;
    if(!["YES","NO"].includes(p.side)) return null;
    if(typeof p.kellySizing!=="number") return null;
    return {
      edge:       clamp(p.edge,0,0.40),
      confidence: clamp(p.confidence,0,1),
      side:       p.side,
      reasoning:  String(p.reasoning||"").slice(0,80),
      kellySizing:clamp(p.kellySizing,0.01,BASE_RISK.maxKelly),
    };
  } catch { return null; }
}

// ─── BACKEND HELPERS ──────────────────────────────────────────────────────────
async function bGet(path) {
  const r = await fetch(`${BACK}${path}`,{signal:AbortSignal.timeout(8000)});
  if(!r.ok) throw new Error(`Backend ${path} → HTTP ${r.status}`);
  return r.json();
}
async function bPost(path,body) {
  const r = await fetch(`${BACK}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!r.ok) throw new Error(`Backend ${path} → HTTP ${r.status}`);
  return r.json();
}
async function bDel(path) {
  const r = await fetch(`${BACK}${path}`,{method:"DELETE",signal:AbortSignal.timeout(8000)});
  return r.json();
}

// ─── PUBLIC READS ─────────────────────────────────────────────────────────────
async function getMarkets(limit=40) {
  try {
    const r = await fetch(`${GAMMA}/markets?limit=${limit}&active=true&closed=false&order=volume24hr&ascending=false`,{signal:AbortSignal.timeout(8000)});
    const d = await r.json();
    return Array.isArray(d)?d:d.markets||[];
  } catch { return []; }
}
async function getBook(tokenId) {
  try {
    const r = await fetch(`${CLOB}/book?token_id=${tokenId}`,{signal:AbortSignal.timeout(5000)});
    return r.json();
  } catch { return null; }
}
async function getPositions(walletAddr) {
  try {
    const r = await fetch(`${DATA}/positions?user=${walletAddr}&sizeThreshold=.1`,{signal:AbortSignal.timeout(8000)});
    return r.json();
  } catch { return []; }
}
async function pingCLOB() {
  try {
    const r = await fetch(`${CLOB}/markets?limit=1`,{signal:AbortSignal.timeout(5000)});
    return r.ok;
  } catch { return false; }
}

// ─── FALLBACK MARKETS ─────────────────────────────────────────────────────────
const FALLBACK = [
  {id:"f1",title:"Will Fed cut rates before Sep 2026?",   yesPrice:0.38,noPrice:0.62,volume:340000,liquidity:82000,tokenYes:null,tokenNo:null,source:"sim"},
  {id:"f2",title:"Will Bitcoin hit $120k by end of 2026?",yesPrice:0.44,noPrice:0.56,volume:290000,liquidity:71000,tokenYes:null,tokenNo:null,source:"sim"},
  {id:"f3",title:"Will US inflation stay <3% Q3 2026?",   yesPrice:0.55,noPrice:0.45,volume:155000,liquidity:38000,tokenYes:null,tokenNo:null,source:"sim"},
  {id:"f4",title:"Will OpenAI IPO before end of 2026?",   yesPrice:0.22,noPrice:0.78,volume:98000, liquidity:22000,tokenYes:null,tokenNo:null,source:"sim"},
  {id:"f5",title:"Will a US recession be declared 2026?", yesPrice:0.31,noPrice:0.69,volume:88000, liquidity:19000,tokenYes:null,tokenNo:null,source:"sim"},
  {id:"f6",title:"Will Trump sign AI exec order Jun 2026?",yesPrice:0.61,noPrice:0.39,volume:180000,liquidity:44000,tokenYes:null,tokenNo:null,source:"sim"},
];

// ──────────────────────────────────────────────────────────────────────────────
export default function App() {

  const riskRef = useRef({...BASE_RISK});
  const [riskSnap, setRiskSnap] = useState({...BASE_RISK});

  const [screen,    setScreen]   = useState("connect");

  const [privKey,   setPrivKey]  = useState("");
  const [wallet,    setWallet]   = useState("");
  const [connErr,   setConnErr]  = useState("");
  const [connecting,setConn]     = useState(false);
  const [creds,     setCreds]    = useState(null);

  const [checks,    setChecks]   = useState([]);
  const [preflightOk, setPreflightOk] = useState(false);

  const [running,   setRunning]  = useState(false);
  const [liveMode,  setLiveMode] = useState(false);
  const [phase,     setPhase]    = useState("IDLE");
  const [balance,   setBalance]  = useState(null);
  const [positions, setPos]      = useState([]);
  const [openOrds,  setOpenOrds] = useState([]);
  const [markets,   setMarkets]  = useState([]);
  const [votes,     setVotes]    = useState([]);
  const [agents,    setAgents]   = useState([]);
  const [history,   setHistory]  = useState(()=>loadStore().history||[]);
  const [lastTrade, setLastTrade]= useState(null);
  const [log,       setLog]      = useState([]);
  const [tab,       setTab]      = useState("live");
  const [circuit,   setCircuit]  = useState(false);
  const [cycle,     setCycle]    = useState(0);
  const [dailyReports,setDailyReports] = useState(()=>loadStore().reports||[]);
  const [implReport,  setImplReport]   = useState(null);
  const [testTradeRunning, setTestRunning] = useState(false);
  const [target,    setTarget]   = useState(10000);

  const runRef     = useRef(false);
  const lockRef    = useRef(false);
  const cycleRef   = useRef(0);
  const balRef     = useRef(null);
  const startBal   = useRef(null);
  const winStr     = useRef(0);
  const lossStr    = useRef(0);
  const pnlRef     = useRef(0);
  const liveMRef   = useRef(false);
  const credsRef   = useRef(null);
  const walletRef  = useRef("");
  const seen       = useRef(new Map());
  const histRef    = useRef([]);
  const lastReport8am = useRef(null);

  useEffect(() => {
    histRef.current = history;
    const store = loadStore();
    saveStore({...store, history: history.slice(0,200)});
  }, [history]);
  useEffect(() => {
    const store = loadStore();
    saveStore({...store, reports: dailyReports.slice(0,60)});
  }, [dailyReports]);

  const lg = useCallback((agent,msg,type="info")=>{
    const e={id:Date.now()+Math.random(),t:new Date().toLocaleTimeString(),agent,msg,type};
    setLog(p=>[e,...p].slice(0,600));
  },[]);

  async function connect() {
    const key=privKey.trim(), addr=wallet.trim();
    if(!addr){ setConnErr("Paste your Polymarket wallet address."); return; }
    if(!key || !key.startsWith("0x")){ setConnErr("Private key must start with 0x."); return; }
    setConn(true); setConnErr("");
    lg("AUTH","Connecting to backend…","info");
    try {
      const d = await bGet("/credentials");
      if(!d.ok) throw new Error(d.error||"Credential fetch failed");
      const c={apiKey:d.apiKey,secret:d.secret,passphrase:d.passphrase,depositWallet:addr};
      setCreds(c); credsRef.current=c; walletRef.current=addr;
      lg("AUTH",`✓ L2 credentials derived — ${d.apiKey?.slice(0,14)}…`,"success");
      setScreen("preflight");
      await runPreflight(c, addr);
    } catch(e){ setConnErr(e.message); lg("AUTH",`✗ ${e.message}`,"error"); }
    finally { setConn(false); }
  }

  async function runPreflight(c, addr) {
    const add = (label,status,detail) =>
      setChecks(prev=>[...prev.filter(x=>x.label!==label),{label,status,detail}]);

    setChecks([]);
    setPreflightOk(false);

    add("Backend server","checking","Pinging localhost:4242…");
    try {
      await bGet("/credentials");
      add("Backend server","pass","localhost:4242 responding");
    } catch(e){ add("Backend server","fail",e.message); return; }

    add("CLOB API","checking","Pinging clob.polymarket.com…");
    const clobOk = await pingCLOB();
    add("CLOB API", clobOk?"pass":"fail", clobOk?"CLOB endpoint live":"CLOB unreachable — check network");
    if(!clobOk) return;

    add("Gamma API","checking","Fetching markets…");
    const raw = await getMarkets(5);
    add("Gamma API",raw.length>0?"pass":"warn", raw.length>0?`${raw.length} markets returned`:"No markets — will use fallback");

    add("Account balance","checking","Loading USDC balance…");
    try {
      const bd = await bGet("/balance");
      const bal = parseFloat(bd.balance?.USDC??bd.balance??0);
      setBalance(bal); balRef.current=bal; startBal.current=bal;
      add("Account balance", bal>=1.50?"pass":"fail",
        bal>=1.50?`${fmt$(bal)} USDC available`:`${fmt$(bal)} — below $1.50 minimum to trade`);
      if(bal<1.50) return;
    } catch(e){ add("Account balance","fail",e.message); return; }

    add("Open positions","checking","Fetching positions…");
    try {
      const pos = await getPositions(addr);
      const list = Array.isArray(pos)?pos:[];
      setPos(list);
      add("Open positions","pass",`${list.length} existing positions loaded`);
    } catch(e){ add("Open positions","warn",`Could not load positions: ${e.message}`); }

    add("Open orders","checking","Fetching open orders…");
    try {
      const od = await bGet("/orders");
      const list = od.ok?(od.orders||[]):[];
      setOpenOrds(list);
      add("Open orders","pass",`${list.length} open orders`);
    } catch(e){ add("Open orders","warn",`Could not load orders: ${e.message}`); }

    add("Risk params","checking","Validating config…");
    const R=riskRef.current;
    const sane = R.minBetUSDC>=1&&R.maxKelly<=0.25&&R.stopLossPct>0&&R.stopLossPct<1;
    add("Risk params", sane?"pass":"fail",
      sane?`maxKelly=${fmtPct(R.maxKelly)} minBet=${fmt$(R.minBetUSDC)} stopLoss=${fmtPct(R.stopLossPct)}`:"Invalid risk config — check constants");

    const allChecks = ["Backend server","CLOB API","Account balance","Risk params"];
    setTimeout(()=>{
      setChecks(prev=>{
        const failed = prev.filter(c=>allChecks.includes(c.label)&&c.status==="fail");
        const ok = failed.length===0;
        setPreflightOk(ok);
        if(ok) lg("PREFLIGHT","✓ All critical checks passed — ready to trade","success");
        else lg("PREFLIGHT",`✗ ${failed.map(c=>c.label).join(", ")} failed — fix before trading`,"error");
        return prev;
      });
    },200);
  }

  function enterTrading() {
    setScreen("trading");
    lg("SWARM","Dashboard loaded — swarm ready","success");
  }

  async function refresh() {
    if(!credsRef.current) return;
    try {
      const [bd,pos,od] = await Promise.all([
        bGet("/balance"),
        getPositions(walletRef.current),
        bGet("/orders"),
      ]);
      if(bd.ok){ const b=parseFloat(bd.balance?.USDC??bd.balance??balRef.current??0); setBalance(b); balRef.current=b; }
      if(Array.isArray(pos)) setPos(pos);
      if(od.ok) setOpenOrds(od.orders||[]);
    } catch(e){ lg("Account",`Refresh: ${e.message}`,"warn"); }
  }

  function tripped() {
    const cur=balRef.current, start=startBal.current;
    const R=riskRef.current;
    if(start&&cur&&cur<start*(1-R.stopLossPct)){
      lg("CIRCUIT",`🛑 Stop-loss hit — ${fmt$(cur)} < ${fmtPct(R.stopLossPct)} of ${fmt$(start)}`,"error");
      setCircuit(true); return true;
    }
    if(lossStr.current>=R.maxConsecLoss){
      lg("CIRCUIT",`🛑 ${lossStr.current} consecutive losses — halted`,"error");
      setCircuit(true); return true;
    }
    return false;
  }
  function resetCircuit(){
    lossStr.current=0; winStr.current=0; setCircuit(false);
    lg("CIRCUIT","Circuit manually reset — may restart","warn");
  }

  async function runImplementor(triggerReason="scheduled") {
    const h = histRef.current;
    if(h.length<3){ lg("Implementor","Need ≥3 trades to analyze — skipping","info"); return; }

    lg("Implementor",`Running post-trade analysis (${h.length} trades, trigger: ${triggerReason})…`,"info");
    setAgents(["Implementor Agent","Pattern Analyst","Risk Tuner","Calibration Writer"]);

    const recent = h.slice(0,20);
    const wins   = recent.filter(t=>t.won===true).length;
    const losses = recent.filter(t=>t.won===false).length;
    const avgEdge= recent.filter(t=>t.edge).reduce((s,t)=>s+t.edge,0)/(recent.filter(t=>t.edge).length||1);
    const avgConf= recent.filter(t=>t.confidence).reduce((s,t)=>s+t.confidence,0)/(recent.filter(t=>t.confidence).length||1);
    const pnlSum = recent.filter(t=>t.pnl!=null).reduce((s,t)=>s+t.pnl,0);
    const R=riskRef.current;

    const sys=`You are an AI trading system implementor. You analyze recent trade outcomes and adjust risk parameters to improve profitability.
Respond ONLY with valid JSON, one line, no markdown:
{"minEdge":number,"minConfidence":number,"hawkFloor":number,"doveFloor":number,"edgeWeight":number,"confWeight":number,"maxKelly":number,"diagnosis":"string","action":"string"}
Constraints: minEdge 0.03-0.15, minConfidence 0.40-0.80, hawkFloor 0.05-0.15, doveFloor 0.50-0.80, edgeWeight 0.7-1.3, confWeight 0.7-1.3, maxKelly 0.04-0.12`;

    const usr=`Recent performance (last ${recent.length} trades):
Wins: ${wins} | Losses: ${losses} | Win rate: ${recent.length?(wins/recent.length*100).toFixed(1):0}%
Avg edge used: ${fmtPct(avgEdge)} | Avg confidence: ${fmtPct(avgConf)} | Net P&L: ${fmt$(pnlSum)}
Current params: minEdge=${fmtPct(R.minEdge)} minConf=${fmtPct(R.minConfidence)} hawkFloor=${fmtPct(R.hawkFloor)} doveFloor=${fmtPct(R.doveFloor)} maxKelly=${fmtPct(R.maxKelly)}
Trigger: ${triggerReason}
Diagnose the pattern and suggest optimal parameter adjustments to increase win rate and P&L.`;

    try {
      const raw = await callOpenAI(sys,usr);
      const p = JSON.parse(raw.replace(/```json|```/g,"").trim());

      const updated = {
        ...R,
        minEdge:       clamp(p.minEdge||R.minEdge,       0.03,0.15),
        minConfidence: clamp(p.minConfidence||R.minConfidence, 0.40,0.80),
        hawkFloor:     clamp(p.hawkFloor||R.hawkFloor,   0.05,0.15),
        doveFloor:     clamp(p.doveFloor||R.doveFloor,   0.50,0.80),
        edgeWeight:    clamp(p.edgeWeight||R.edgeWeight,  0.70,1.30),
        confWeight:    clamp(p.confWeight||R.confWeight,  0.70,1.30),
        maxKelly:      clamp(p.maxKelly||R.maxKelly,      0.04,0.12),
      };
      riskRef.current = updated;
      setRiskSnap({...updated});

      const report={
        t:new Date().toLocaleTimeString(),
        date:new Date().toLocaleDateString(),
        diagnosis:p.diagnosis||"",
        action:p.action||"",
        wins,losses,pnlSum,
        changes:{
          minEdge:   `${fmtPct(R.minEdge)} → ${fmtPct(updated.minEdge)}`,
          minConf:   `${fmtPct(R.minConfidence)} → ${fmtPct(updated.minConfidence)}`,
          hawkFloor: `${fmtPct(R.hawkFloor)} → ${fmtPct(updated.hawkFloor)}`,
          maxKelly:  `${fmtPct(R.maxKelly)} → ${fmtPct(updated.maxKelly)}`,
        }
      };
      setImplReport(report);
      lg("Implementor",`✓ Params updated — ${p.action||"adjustments applied"}`,"success");
      lg("Implementor",`Diagnosis: ${p.diagnosis||"N/A"}`,"info");
    } catch(e){
      lg("Implementor",`Analysis failed: ${e.message} — keeping current params`,"warn");
    }
  }

  function buildDailyReport() {
    const h = histRef.current;
    const today = new Date().toLocaleDateString();
    const todayTrades = h.filter(t=>t.date===today);
    const done = h.filter(t=>t.won!==null);
    const wins = done.filter(t=>t.won).length;
    const losses = done.filter(t=>!t.won).length;
    const totalPnl = h.filter(t=>t.pnl!=null).reduce((s,t)=>s+t.pnl,0);
    const bal = balRef.current;
    const start = startBal.current;
    const roi = start&&bal ? ((bal-start)/start*100).toFixed(1) : "0.0";
    const progress = bal&&target ? (bal/target*100).toFixed(1) : "0.0";
    const R = riskRef.current;

    const report = {
      date:today,
      time:"08:00",
      balance:bal,
      startBalance:start,
      totalPnl,roi,
      totalTrades:done.length,
      todayTrades:todayTrades.length,
      wins,losses,
      winRate:done.length?(wins/done.length*100).toFixed(1):"0",
      target,
      progress,
      cyclesRun:cycleRef.current,
      riskParams:{minEdge:R.minEdge,minConf:R.minConfidence,maxKelly:R.maxKelly},
      streak:winStr.current>0?`Win ×${winStr.current}`:lossStr.current>0?`Loss ×${lossStr.current}`:"Neutral",
    };
    setDailyReports(prev=>[report,...prev].slice(0,60));
    lg("Daily Report",
      `📊 ${today} — Bal: ${fmt$(bal)} | ROI: ${roi}% | W/L: ${wins}/${losses} | Progress to $${target.toLocaleString()}: ${progress}%`,
      parseFloat(roi)>=0?"success":"warn"
    );

    if(bal&&bal>=target){
      lg("MILESTONE",`🎯 TARGET HIT — ${fmt$(bal)} ≥ ${fmt$(target)}! Swarm auto-halted.`,"success");
      runRef.current=false; lockRef.current=false;
      setRunning(false); setPhase("IDLE");
    }
  }

  useEffect(()=>{
    const interval = setInterval(()=>{
      const h=new Date().getHours(), m=new Date().getMinutes();
      const today=new Date().toLocaleDateString();
      if(h===8&&m===0&&lastReport8am.current!==today){
        lastReport8am.current=today;
        buildDailyReport();
      }
    },30000);
    return ()=>clearInterval(interval);
  },[]);

  async function scout() {
    setPhase("SCOUT"); setAgents(["Gamma Scout","Volume Tracer","Spread Hunter","Liquidity Probe"]);
    lg("Scout","Fetching live markets…","info");
    const raw = await getMarkets(40);
    let list = raw.length>0
      ? raw.map(m=>({
          id:m.id||m.conditionId||"?",
          title:m.question||m.title||"Unknown",
          volume:parseFloat(m.volumeNum||m.volume24hr||0),
          liquidity:parseFloat(m.liquidityNum||m.liquidity||0),
          yesPrice:m.outcomePrices?.[0]?parseFloat(m.outcomePrices[0]):0.5,
          noPrice:m.outcomePrices?.[1]?parseFloat(m.outcomePrices[1]):0.5,
          tokenYes:m.clobTokenIds?.[0]||m.tokens?.[0]?.token_id||null,
          tokenNo:m.clobTokenIds?.[1]||m.tokens?.[1]?.token_id||null,
          endDate:m.endDateIso||m.endDate||null,source:"live",
        }))
      : FALLBACK;

    if(!raw.length) lg("Scout","Gamma API down — using fallback markets","warn");
    else lg("Scout",`${raw.length} live markets fetched`,"success");

    const R=riskRef.current;
    list = list
      .map(m=>({...m,noPrice:m.noPrice||(1-m.yesPrice),score:m.volume*0.6+m.liquidity*0.4}))
      .sort((a,b)=>b.score-a.score)
      .filter(m=>{const last=seen.current.get(m.id)||0; return cycleRef.current-last>=R.dedupCycles;});

    setMarkets(list.slice(0,14));
    lg("Volume Tracer",`Top: "${short(list[0]?.title,48)}" — $${(list[0]?.volume||0).toLocaleString()} vol`,"info");
    return list.slice(0,7);
  }

  async function edgePhase(topMarkets) {
    setPhase("EDGE"); setAgents(["Base Rate Analyst","Calibration Checker","Spread Hunter","Kelly Sizer"]);
    lg("Edge","Scanning for mispriced markets…","info");
    const R=riskRef.current;
    const candidates=[];

    for(const m of topMarkets.slice(0,5)){
      seen.current.set(m.id,cycleRef.current);
      let spread=0.05,bid=null,ask=null;
      if(m.tokenYes){
        const book=await getBook(m.tokenYes);
        if(book?.bids?.length&&book?.asks?.length){
          bid=parseFloat(book.bids[0]?.price);
          ask=parseFloat(book.asks[0]?.price);
          spread=parseFloat((ask-bid).toFixed(4));
          lg("Spread Hunter",`${short(m.title,28)}: bid ${bid.toFixed(3)} ask ${ask.toFixed(3)} Δ${spread.toFixed(4)}`,"success");
        }
      }

      const sys=`You are a prediction market edge analyst. Find mispriced markets.
ONE line of valid JSON only, no markdown:
{"edge":number,"confidence":number,"side":"YES"|"NO","reasoning":"string","kellySizing":number}
Ranges: edge 0.00-0.30, confidence 0.0-1.0, kellySizing 0.01-0.10`;

      const usr=`Market: "${m.title}"
YES: ${m.yesPrice.toFixed(4)} | NO: ${m.noPrice.toFixed(4)} | Spread: ${spread.toFixed(4)}
Vol 24h: $${m.volume.toLocaleString()} | Liq: $${m.liquidity.toLocaleString()}
Source: ${m.source} | Date: ${new Date().toISOString().split("T")[0]}`;

      let e=null;
      try {
        const raw=await callOpenAI(sys,usr);
        e=parseEdge(raw);
        if(!e) lg("Calibration Checker",`"${short(m.title,26)}" — bad schema, skip`,"warn");
      } catch(err){ lg("Calibration Checker",`"${short(m.title,26)}" — ${err.message}`,"warn"); }
      if(!e) continue;

      const adjEdge = e.edge * R.edgeWeight;
      const adjConf = e.confidence * R.confWeight;
      const pass = adjEdge>=R.minEdge && adjConf>=R.minConfidence;
      lg("Kelly Sizer",`${short(m.title,28)}: edge=${fmtPct(adjEdge)} conf=${fmtPct(adjConf)} ${pass?"✓ PASS":"✗"}`,"info");
      if(pass) candidates.push({...m,...e,edge:adjEdge,confidence:adjConf,spread,bid,ask});
    }

    lg("Edge",`${candidates.length} candidates passed thresholds`,"info");
    return candidates;
  }

  async function councilPhase(candidates) {
    setPhase("COUNCIL"); setAgents(["Hawk","Dove","Quant","Risk Gatekeeper"]);
    if(!candidates.length){ lg("Council","No candidates — standing down","warn"); return null; }

    const best=candidates.sort((a,b)=>(b.edge*b.confidence)-(a.edge*a.confidence))[0];
    const R=riskRef.current;
    const cur=balRef.current??50;
    const start=startBal.current??cur;
    const ws=winStr.current, ls=lossStr.current;

    const baseK=Math.min(best.kellySizing||0.04,R.maxKelly);
    const adjK=ws>=3?baseK*1.10:ls>=2?baseK*0.65:baseK;
    const bet=clamp(Math.min(cur*adjK,cur*R.maxExposurePct),R.minBetUSDC,Math.min(R.maxBetUSDC,cur*R.maxExposurePct));

    if(bet>cur*R.maxExposurePct+0.01){ lg("Risk Gatekeeper","Bet exceeds max exposure — skip","error"); return null; }

    const floor=start*(1-R.stopLossPct);
    const v=[
      {who:"Hawk",        vote:best.edge>R.hawkFloor?"BUY":"PASS",   why:`Edge ${fmtPct(best.edge)} vs ${fmtPct(R.hawkFloor)} floor`},
      {who:"Dove",        vote:best.confidence>=R.doveFloor&&ls<2?"BUY":"PASS",why:`Conf ${fmtPct(best.confidence)}, L-streak ${ls}`},
      {who:"Quant",       vote:bet>=R.minBetUSDC?"BUY":"PASS",       why:`Kelly ${fmt$(bet)}`},
      {who:"Risk Gatekeeper",vote:cur>floor?"BUY":"HALT",            why:`${fmt$(cur)} vs floor ${fmt$(floor)}`},
    ];
    setVotes(v);
    v.forEach(x=>lg(x.who,`${x.vote}: ${x.why}`,x.vote==="BUY"?"success":x.vote==="HALT"?"error":"warn"));

    const buyVotes=v.filter(x=>x.vote==="BUY").length;
    if(buyVotes<R.councilNeeded){ lg("Council",`${buyVotes}/${v.length} — REJECTED`,"warn"); return null; }
    lg("Council",`${buyVotes}/${v.length} — APPROVED → ${fmt$(bet)} on ${best.side}`,"success");
    return {...best,bet,adjK,buyVotes};
  }

  async function executePhase(trade, forceBet=null) {
    setPhase("EXECUTE"); setAgents(["Order Builder","Signature Forge","CLOB Poster","Fill Monitor"]);
    if(!trade){ setPhase("IDLE"); return; }

    const price=trade.side==="YES"?trade.yesPrice:trade.noPrice;
    if(!price||price<=0||price>=1){ lg("Order Builder",`Invalid price ${price} — abort`,"error"); setPhase("IDLE"); return; }

    const betAmt = forceBet!=null ? forceBet : trade.bet;
    const shares=parseFloat((betAmt/price).toFixed(4));
    const token=trade.side==="YES"?trade.tokenYes:trade.tokenNo;
    const today=new Date().toLocaleDateString();

    lg("Order Builder",`${trade.side} ${shares} shares @ ${price.toFixed(4)} = ${fmt$(betAmt)}${forceBet?" [TEST TRADE]":""}`,"info");

    if(!liveMRef.current){
      await sleep(700);
      const winP=clamp(0.42+trade.edge*1.5+trade.confidence*0.10,0,0.90);
      const won=Math.random()<winP;
      const pnl=won?parseFloat((shares*(1-price)).toFixed(4)):-betAmt;
      const newB=parseFloat(((balRef.current??50)+pnl).toFixed(4));
      balRef.current=newB; setBalance(newB);
      pnlRef.current=parseFloat((pnlRef.current+pnl).toFixed(4));
      won?(winStr.current++,lossStr.current=0):(lossStr.current++,winStr.current=0);

      const entry={id:Date.now(),cycle:cycleRef.current,title:trade.title,side:trade.side,
        price,shares,bet:betAmt,pnl,won,bal:newB,edge:trade.edge,confidence:trade.confidence,
        mode:"paper",t:new Date().toLocaleTimeString(),date:today,test:forceBet!=null};
      setHistory(h=>[entry,...h]);
      histRef.current=[entry,...histRef.current];
      setLastTrade(entry);
      lg("Fill Monitor",won?`✓ WIN +${fmt$(pnl)} | Bal ${fmt$(newB)} W${winStr.current}`:`✗ LOSS ${fmt$(pnl)} | Bal ${fmt$(newB)} L${lossStr.current}`,won?"success":"error");

    } else {
      if(!token){ lg("CLOB Poster","No token ID — live order impossible","error"); setPhase("IDLE"); return; }
      lg("Signature Forge","EIP-712 signing via backend…","info");
      try {
        const res=await bPost("/order",{tokenId:token,price,size:betAmt,side:"BUY"});
        if(res.ok){
          const oid=res.order?.orderID||res.order?.id||"confirmed";
          lg("CLOB Poster",`✓ LIVE ORDER → id: ${oid}`,"success");
          const entry={id:Date.now(),cycle:cycleRef.current,title:trade.title,side:trade.side,
            price,shares,bet:betAmt,pnl:null,won:null,orderId:oid,bal:balRef.current,edge:trade.edge,
            confidence:trade.confidence,mode:"live",t:new Date().toLocaleTimeString(),date:today,test:forceBet!=null};
          setHistory(h=>[entry,...h]);
          histRef.current=[entry,...histRef.current];
          setLastTrade(entry);
          await sleep(3000); await refresh();
        } else { lg("CLOB Poster",`Rejected: ${res.error}`,"error"); lossStr.current++; }
      } catch(e){ lg("CLOB Poster",`Failed: ${e.message}`,"error"); lossStr.current++; }
    }
    setPhase("IDLE");
  }

  async function runTestTrade() {
    if(testTradeRunning){ lg("TEST","Already running","warn"); return; }
    setTestRunning(true);
    lg("TEST","$5 test trade initiated — running full pipeline with forced $5 bet…","info");
    try {
      const top=await scout(); if(!top.length){ lg("TEST","No markets — abort","error"); return; }
      const cand=await edgePhase(top);
      const best=cand.length>0
        ? cand.sort((a,b)=>(b.edge*b.confidence)-(a.edge*a.confidence))[0]
        : {...top[0],edge:0.06,confidence:0.55,side:"YES",kellySizing:0.03,reasoning:"Test trade forced"};
      lg("TEST",`Selected: "${short(best.title,50)}" → ${best.side}`,"info");
      await executePhase(best, 5.00);
      lg("TEST","✓ Test trade complete — check history tab","success");
      await runImplementor("post-test-trade");
    } catch(e){ lg("TEST",`Test failed: ${e.message}`,"error"); }
    finally { setTestRunning(false); }
  }

  async function loop() {
    if(!runRef.current) return;
    cycleRef.current++; setCycle(cycleRef.current);
    lg("SWARM",`━━━ Cycle ${cycleRef.current} ━━━`,"info");

    if(tripped()){ runRef.current=false; lockRef.current=false; setRunning(false); setPhase("IDLE"); return; }

    try {
      const top  = await scout();            if(!runRef.current) return;
      const cand = await edgePhase(top);     if(!runRef.current) return;
      const ok   = await councilPhase(cand); if(!runRef.current) return;
      await executePhase(ok);
    } catch(e){ lg("SWARM",`Cycle error: ${e.message}`,"error"); setPhase("IDLE"); }

    if(!runRef.current) return;

    if(cycleRef.current%5===0) await runImplementor(`cycle-${cycleRef.current}`);

    await refresh();
    lg("SWARM","Next cycle in 45s…","info");
    for(let i=0;i<45&&runRef.current;i++) await sleep(1000);
    if(runRef.current) loop();
  }

  function start(){
    if(lockRef.current){lg("SWARM","Already running","warn"); return;}
    if(circuit){lg("SWARM","Circuit open — click RESET first","error"); return;}
    lockRef.current=true; runRef.current=true; setRunning(true); setCircuit(false);
    lg("SWARM",`▶ Started — ${liveMRef.current?"LIVE ⚡":"PAPER"}`,"success");
    loop();
  }
  function stop(){
    runRef.current=false; lockRef.current=false;
    setRunning(false); setPhase("IDLE"); setAgents([]);
    lg("SWARM","■ Halted","warn");
  }
  function setMode(live){
    liveMRef.current=live; setLiveMode(live);
  }

  const done    = history.filter(t=>t.won!==null);
  const wins    = done.filter(t=>t.won).length;
  const losses  = done.filter(t=>!t.won).length;
  const wrate   = done.length?(wins/done.length*100).toFixed(0):"--";
  const totalPnl= history.filter(t=>t.pnl!=null).reduce((s,t)=>s+t.pnl,0);
  const roi     = startBal.current&&balance?((balance-startBal.current)/startBal.current*100).toFixed(1):"0.0";
  const progress= balance&&target?(Math.min(balance/target*100,100)).toFixed(1):"0.0";
  const phColor = {IDLE:"#252535",SCOUT:"#00D4FF",EDGE:"#FFB800",COUNCIL:"#FF6B35",EXECUTE:"#00FF88"};
  const R=riskSnap;

  const statusIcon = s => s==="pass"?"✓":s==="fail"?"✗":s==="warn"?"⚠":"…";
  const statusColor= s => s==="pass"?"#00FF88":s==="fail"?"#FF4455":s==="warn"?"#FFB800":"#888";

  // ── CONNECT SCREEN ──────────────────────────────────────────────────────────
  if(screen==="connect") return (
    <div style={{minHeight:"100vh",background:"#06070E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');*{box-sizing:border-box;margin:0;padding:0}input{background:#0a0b16;border:1px solid #1e2038;color:#E0E0F0;padding:11px 14px;border-radius:5px;font-family:'DM Mono',monospace;font-size:12px;outline:none;width:100%;transition:border 0.15s}input:focus{border-color:#BF5FFF}input::placeholder{color:#252545}.btn{cursor:pointer;border:none;border-radius:5px;font-family:'DM Mono',monospace;letter-spacing:0.08em;transition:opacity 0.15s}.btn:hover:not(:disabled){opacity:0.85}.btn:disabled{opacity:0.5;cursor:not-allowed}`}</style>
      <div style={{width:460,padding:36,background:"#0C0D1A",border:"1px solid #181828",borderRadius:10}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:"0.12em",color:"#BF5FFF"}}>POLY</span>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:"0.12em",color:"#00D4FF"}}>SWARM</span>
          <span style={{fontSize:8,color:"#252545",letterSpacing:"0.1em"}}>v6 · OpenAI</span>
        </div>
        <div style={{fontSize:9,color:"#3a3a5a",marginBottom:24,lineHeight:1.7}}>
          Autonomous prediction market trading agent · $200 → $10,000 target
        </div>

        <div style={{background:"#08091A",borderRadius:6,padding:12,marginBottom:20,fontSize:8,color:"#444",lineHeight:2}}>
          <div style={{color:"#BF5FFF",marginBottom:4,letterSpacing:"0.08em"}}>REQUIRES LOCAL BACKEND RUNNING FIRST</div>
          Terminal: <span style={{color:"#00D4FF"}}>node polymarket-auth-server.js</span><br/>
          Set <span style={{color:"#FFB800"}}>VITE_OPENAI_API_KEY</span> in your <span style={{color:"#00D4FF"}}>.env</span> file.
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
          <div>
            <div style={{fontSize:7,color:"#3a3a5a",letterSpacing:"0.1em",marginBottom:5}}>DEPOSIT WALLET ADDRESS</div>
            <input value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="0x… (polymarket.com/settings)"/>
          </div>
          <div>
            <div style={{fontSize:7,color:"#3a3a5a",letterSpacing:"0.1em",marginBottom:5}}>PRIVATE KEY (stays in .env — backend only)</div>
            <input value={privKey} onChange={e=>setPrivKey(e.target.value)} placeholder="0x…" type="password"/>
          </div>
        </div>

        {connErr&&<div style={{background:"#FF445510",border:"1px solid #FF445530",borderRadius:4,padding:"8px 12px",fontSize:9,color:"#FF7788",marginBottom:14,lineHeight:1.6}}>{connErr}</div>}

        <button className="btn" onClick={connect} disabled={connecting} style={{width:"100%",padding:"13px",background:connecting?"#2a1a3a":"#BF5FFF",color:"#fff",fontSize:11,letterSpacing:"0.1em"}}>
          {connecting?"CONNECTING…":"CONNECT →"}
        </button>
        <div style={{marginTop:12,fontSize:7,color:"#1e1e2e",textAlign:"center",lineHeight:1.8}}>Private key never leaves your machine · Orders signed locally</div>
      </div>
    </div>
  );

  // ── PREFLIGHT SCREEN ────────────────────────────────────────────────────────
  if(screen==="preflight") return (
    <div style={{minHeight:"100vh",background:"#06070E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');*{box-sizing:border-box;margin:0;padding:0}.btn{cursor:pointer;border:none;border-radius:5px;font-family:'DM Mono',monospace;letter-spacing:0.08em;transition:opacity 0.15s;padding:10px 20px;font-size:10px}.btn:hover:not(:disabled){opacity:0.85}.btn:disabled{opacity:0.4;cursor:not-allowed}`}</style>
      <div style={{width:520,padding:32,background:"#0C0D1A",border:"1px solid #181828",borderRadius:10}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:20}}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:"0.12em",color:"#BF5FFF"}}>PRE-LAUNCH</span>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:"0.12em",color:"#00D4FF"}}>CHECKLIST</span>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
          {[
            "Backend server","CLOB API","Gamma API",
            "Account balance","Open positions","Open orders","Risk params"
          ].map(label=>{
            const chk=checks.find(c=>c.label===label)||{status:"pending",detail:""};
            return (
              <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#08091A",borderRadius:5,border:`1px solid ${chk.status==="fail"?"#FF445530":chk.status==="pass"?"#00FF8820":"#181828"}`}}>
                <span style={{fontSize:14,color:statusColor(chk.status),minWidth:16,textAlign:"center"}}>
                  {chk.status==="checking"?"◌":statusIcon(chk.status)}
                </span>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:"#ccc"}}>{label}</div>
                  {chk.detail&&<div style={{fontSize:8,color:"#555",marginTop:2}}>{chk.detail}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{display:"flex",gap:10}}>
          <button className="btn" onClick={()=>runPreflight(credsRef.current,walletRef.current)} style={{background:"#181828",color:"#888",flex:1}}>
            ↺ RE-RUN
          </button>
          <button className="btn" onClick={enterTrading} disabled={!preflightOk} style={{background:preflightOk?"#BF5FFF":"#2a1a3a",color:"#fff",flex:2}}>
            {preflightOk?"ALL CLEAR — ENTER DASHBOARD →":"WAITING FOR CHECKS…"}
          </button>
        </div>

        {!preflightOk&&checks.some(c=>c.status==="fail")&&(
          <div style={{marginTop:12,fontSize:8,color:"#FF7788",lineHeight:1.7}}>
            Fix the failed checks above, then click RE-RUN. Common fixes: ensure the backend server is running, your wallet has USDC, and your network can reach Polymarket.
          </div>
        )}
      </div>
    </div>
  );

  // ── TRADING SCREEN ──────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"#06070E",color:"#E0E0F0",fontFamily:"'DM Mono',monospace",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#181828}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}
        @keyframes fadein{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
        .pulse{animation:blink 1.8s infinite}
        .row{animation:fadein 0.14s ease}
        .tab{cursor:pointer;padding:6px 13px;border-radius:3px;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;border:1px solid transparent;transition:all 0.14s;white-space:nowrap}
        .tab.on{background:#BF5FFF18;border-color:#BF5FFF44;color:#BF5FFF}
        .tab:not(.on){color:#2a2a3a}
        .tab:not(.on):hover{color:#666}
        .btn{cursor:pointer;border:none;border-radius:4px;font-family:'DM Mono',monospace;letter-spacing:0.08em;transition:opacity 0.14s;font-size:9px;padding:7px 14px}
        .btn:hover:not(:disabled){opacity:0.85}
        .btn:disabled{opacity:0.4;cursor:not-allowed}
        .card{background:#0C0D1A;border:1px solid #181828;border-radius:6px;padding:14px}
      `}</style>

      {/* HEADER */}
      <div style={{padding:"11px 18px",borderBottom:"1px solid #0e0e1e",background:"#08091A",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:19,letterSpacing:"0.12em",color:"#BF5FFF"}}>POLY</span>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:19,letterSpacing:"0.12em",color:"#00D4FF"}}>SWARM</span>
          <span style={{fontSize:7,color:"#1e1e2e"}}>v6</span>
          <span style={{fontSize:7,color:"#2a2a3a",marginLeft:6}}>{creds?.depositWallet?.slice(0,12)}…</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {circuit&&<div onClick={resetCircuit} style={{fontSize:8,color:"#FF4455",padding:"3px 9px",border:"1px solid #FF445540",borderRadius:3,cursor:"pointer"}}>🛑 RESET CIRCUIT</div>}
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:8}}>
            {running&&<div className="pulse" style={{width:5,height:5,borderRadius:"50%",background:phColor[phase]||"#333"}}/>}
            <span style={{color:phColor[phase]||"#2a2a3a",letterSpacing:"0.1em"}}>{phase}</span>
          </div>
          <span style={{fontSize:7,color:"#1e1e2e"}}>#C{cycle}</span>
          <div style={{display:"flex",borderRadius:4,overflow:"hidden",border:"1px solid #181828"}}>
            <div onClick={()=>!running&&setMode(false)} style={{padding:"4px 10px",fontSize:8,cursor:"pointer",background:!liveMode?"#1a2010":"transparent",color:!liveMode?"#88CC44":"#2a2a3a"}}>PAPER</div>
            <div onClick={()=>!running&&setMode(true)}  style={{padding:"4px 10px",fontSize:8,cursor:"pointer",background:liveMode?"#1a1020":"transparent",color:liveMode?"#FF6B35":"#2a2a3a"}}>LIVE</div>
          </div>
        </div>
      </div>

      {/* PROGRESS TO TARGET */}
      <div style={{padding:"6px 18px",background:"#08091A",borderBottom:"1px solid #0e0e1e"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#333",marginBottom:4}}>
          <span>{fmt$(balance||0)}</span>
          <span style={{color:"#BF5FFF"}}>TARGET {fmt$(target)} · {progress}%</span>
          <span style={{color:"#444"}}>{fmt$(target)}</span>
        </div>
        <div style={{height:3,background:"#0e0e1e",borderRadius:2}}>
          <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#BF5FFF,#00D4FF)",borderRadius:2,transition:"width 1s ease"}}/>
        </div>
      </div>

      {/* STATS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,background:"#111",borderBottom:"1px solid #0e0e1e"}}>
        {[
          ["BALANCE",  balance!=null?fmt$(balance):"--",  balance!=null&&startBal.current?balance>=startBal.current?"#00FF88":"#FF4455":"#888"],
          ["P&L",      (totalPnl>=0?"+":"")+fmt$(totalPnl),totalPnl>=0?"#00FF88":"#FF4455"],
          ["ROI",      (parseFloat(roi)>=0?"+":"")+roi+"%",parseFloat(roi)>=0?"#00FF88":"#FF4455"],
          ["WIN RATE", wrate+"%","#00D4FF"],
          ["TRADES",   done.length,"#BF5FFF"],
          ["POSITIONS",positions.length,"#FFB800"],
          ["STREAK",   winStr.current>0?`W${winStr.current}`:lossStr.current>0?`L${lossStr.current}`:"—",
                       winStr.current>0?"#00FF88":lossStr.current>0?"#FF4455":"#444"],
        ].map(([l,v,c])=>(
          <div key={l} style={{padding:"9px 6px",background:"#08091A",textAlign:"center"}}>
            <div style={{fontSize:6,color:"#1e1e2e",letterSpacing:"0.12em",marginBottom:3}}>{l}</div>
            <div style={{fontSize:13,color:c,fontFamily:"'Bebas Neue'",letterSpacing:"0.04em"}}>{v}</div>
          </div>
        ))}
      </div>

      {/* TABS + CONTROLS */}
      <div style={{display:"flex",gap:3,padding:"7px 14px",background:"#08091A",borderBottom:"1px solid #0e0e1e",alignItems:"center"}}>
        {["live","markets","positions","implementor","reports","log","history"].map(t=>(
          <div key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</div>
        ))}
        <div style={{flex:1}}/>
        <button className="btn" onClick={runTestTrade} disabled={testTradeRunning||running} style={{background:"#FFB80022",color:"#FFB800",border:"1px solid #FFB80044"}}>
          {testTradeRunning?"TESTING…":"$5 TEST"}
        </button>
        <button className="btn" onClick={refresh} style={{background:"#181828",color:"#555"}}>↻</button>
        {!running
          ?<button className="btn" onClick={start} style={{background:"#BF5FFF",color:"#fff",padding:"7px 20px"}}>▶ START SWARM</button>
          :<button className="btn" onClick={stop}  style={{background:"#FF4455",color:"#fff",padding:"7px 20px"}}>■ HALT</button>
        }
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflow:"auto",padding:14}}>

        {/* LIVE */}
        {tab==="live"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div className="card">
              <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em",marginBottom:10}}>AGENTS — {phase}</div>
              {agents.length?agents.map(a=>(
                <div key={a} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #0e0e1e"}}>
                  <div className="pulse" style={{width:4,height:4,borderRadius:"50%",background:"#BF5FFF",flexShrink:0}}/>
                  <span style={{fontSize:9,color:"#bbb"}}>{a}</span>
                </div>
              )):<div style={{fontSize:9,color:"#1a1a2a",padding:"8px 0"}}>Swarm idle — press START SWARM</div>}
            </div>

            <div className="card">
              <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em",marginBottom:10}}>COUNCIL</div>
              {votes.length?votes.map(v=>(
                <div key={v.who} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #0e0e1e"}}>
                  <div>
                    <div style={{fontSize:8,color:"#666"}}>{v.who}</div>
                    <div style={{fontSize:7,color:"#2a2a3a",marginTop:1}}>{v.why}</div>
                  </div>
                  <span style={{fontSize:10,fontWeight:600,color:v.vote==="BUY"?"#00FF88":v.vote==="HALT"?"#FF4455":"#FFB800",marginLeft:8}}>{v.vote}</span>
                </div>
              )):<div style={{fontSize:9,color:"#1a1a2a",padding:"8px 0"}}>No vote yet</div>}
            </div>

            {lastTrade?(
              <div className="card" style={{gridColumn:"1/-1",borderColor:lastTrade.won===true?"#00FF8830":lastTrade.won===false?"#FF445530":"#FFB80030"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em"}}>LAST TRADE{lastTrade.test?" · TEST":""} · {lastTrade.mode?.toUpperCase()}</span>
                  <span style={{fontSize:8,color:lastTrade.won===true?"#00FF88":lastTrade.won===false?"#FF4455":"#FFB800",fontWeight:600}}>
                    {lastTrade.won===true?"WIN":lastTrade.won===false?"LOSS":"PENDING"}
                  </span>
                </div>
                <div style={{fontSize:10,color:"#ccc",marginBottom:8}}>{lastTrade.title}</div>
                <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:8}}>
                  <span style={{color:"#BF5FFF"}}>SIDE: {lastTrade.side}</span>
                  <span style={{color:"#00D4FF"}}>PRICE: {lastTrade.price?.toFixed(4)}</span>
                  <span style={{color:"#FFB800"}}>SIZE: {fmt$(lastTrade.bet)}</span>
                  <span style={{color:"#888"}}>SHARES: {lastTrade.shares?.toFixed(4)}</span>
                  {lastTrade.pnl!=null&&<span style={{color:lastTrade.won?"#00FF88":"#FF4455",fontWeight:600}}>P&L: {lastTrade.won?"+":""}{fmt$(lastTrade.pnl)}</span>}
                  {lastTrade.orderId&&<span style={{color:"#333"}}>ID: {lastTrade.orderId?.slice(0,16)}…</span>}
                </div>
              </div>
            ):(
              <div className="card" style={{gridColumn:"1/-1",padding:20,textAlign:"center"}}>
                <div style={{fontSize:9,color:"#1a1a2a"}}>No trades yet — run $5 TEST or START SWARM</div>
              </div>
            )}

            <div className="card" style={{gridColumn:"1/-1"}}>
              <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em",marginBottom:10}}>LIVE RISK PARAMS (Implementor-tuned)</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[["MAX KELLY",fmtPct(R.maxKelly)],["MIN EDGE",fmtPct(R.minEdge)],["MIN CONF",fmtPct(R.minConfidence)],
                  ["HAWK FLOOR",fmtPct(R.hawkFloor)],["DOVE FLOOR",fmtPct(R.doveFloor)],
                  ["EDGE WT",R.edgeWeight?.toFixed(2)],["CONF WT",R.confWeight?.toFixed(2)],
                  ["MAX BET",fmt$(R.maxBetUSDC)],["STOP-LOSS",fmtPct(R.stopLossPct)]
                ].map(([l,v])=>(
                  <div key={l} style={{padding:"5px 9px",background:"#08091A",borderRadius:4,border:"1px solid #181828"}}>
                    <div style={{fontSize:6,color:"#2a2a3a",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:10,color:"#BF5FFF",fontFamily:"'Bebas Neue'"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MARKETS */}
        {tab==="markets"&&(
          <div className="card">
            <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em",marginBottom:10}}>SCOUTED MARKETS ({markets.length})</div>
            {markets.map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #0e0e1e",gap:8}}>
                <div style={{fontSize:9,color:"#aaa",flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{m.title}</div>
                <div style={{display:"flex",gap:10,flexShrink:0,fontSize:8}}>
                  <span style={{color:"#00D4FF"}}>Y:{m.yesPrice?.toFixed(3)}</span>
                  <span style={{color:"#555"}}>${(m.volume/1000).toFixed(0)}k</span>
                  <span style={{color:m.source==="live"?"#00FF8866":"#333",fontSize:7}}>{m.source==="live"?"●LIVE":"●SIM"}</span>
                </div>
              </div>
            ))}
            {!markets.length&&<div style={{fontSize:9,color:"#1a1a2a",padding:12}}>Run swarm to populate</div>}
          </div>
        )}

        {/* POSITIONS */}
        {tab==="positions"&&(
          <div style={{display:"grid",gap:10}}>
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em"}}>OPEN ORDERS ({openOrds.length})</div>
                {openOrds.length>0&&<button className="btn" onClick={async()=>{await bDel("/orders");await refresh();}} style={{background:"#FF445518",color:"#FF4455",border:"1px solid #FF445530"}}>CANCEL ALL</button>}
              </div>
              {openOrds.slice(0,8).map((o,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #0e0e1e",fontSize:8}}>
                  <span style={{color:"#888"}}>{short(o.asset||o.market||"Order",32)}</span>
                  <span style={{color:"#00D4FF"}}>{o.side} {o.price?`@${parseFloat(o.price).toFixed(3)}`:""}</span>
                </div>
              ))}
              {!openOrds.length&&<div style={{fontSize:9,color:"#1a1a2a"}}>None</div>}
            </div>
            <div className="card">
              <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em",marginBottom:10}}>POSITIONS ({positions.length})</div>
              {positions.slice(0,10).map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #0e0e1e",gap:8}}>
                  <div style={{fontSize:9,color:"#aaa",flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.title||p.market||p.conditionId||"Unknown"}</div>
                  <div style={{display:"flex",gap:10,flexShrink:0,fontSize:8}}>
                    <span style={{color:"#BF5FFF"}}>{p.outcome||p.side||""}</span>
                    <span style={{color:"#FFB800"}}>{p.size?fmt$(parseFloat(p.size)):""}</span>
                  </div>
                </div>
              ))}
              {!positions.length&&<div style={{fontSize:9,color:"#1a1a2a"}}>None</div>}
            </div>
          </div>
        )}

        {/* IMPLEMENTOR */}
        {tab==="implementor"&&(
          <div style={{display:"grid",gap:10}}>
            <div className="card">
              <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em",marginBottom:10}}>IMPLEMENTOR AGENT</div>
              <div style={{fontSize:9,color:"#555",lineHeight:1.8,marginBottom:14}}>
                Runs automatically every 5 cycles. Reads all trade outcomes, diagnoses win/loss patterns via OpenAI analysis,
                and adjusts the 9 tunable risk parameters in real-time to improve future performance.
                No manual intervention needed.
              </div>
              <button className="btn" onClick={()=>runImplementor("manual")} disabled={running} style={{background:"#BF5FFF22",color:"#BF5FFF",border:"1px solid #BF5FFF44"}}>
                RUN IMPLEMENTOR NOW
              </button>
            </div>
            {implReport&&(
              <div className="card" style={{border:"1px solid #BF5FFF30"}}>
                <div style={{fontSize:7,color:"#BF5FFF",letterSpacing:"0.12em",marginBottom:10}}>LATEST REPORT · {implReport.date} {implReport.t}</div>
                <div style={{fontSize:9,color:"#ccc",marginBottom:8}}><span style={{color:"#555"}}>Diagnosis:</span> {implReport.diagnosis}</div>
                <div style={{fontSize:9,color:"#ccc",marginBottom:12}}><span style={{color:"#555"}}>Action:</span> {implReport.action}</div>
                <div style={{fontSize:7,color:"#2a2a3a",marginBottom:8,letterSpacing:"0.1em"}}>PARAM CHANGES</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {Object.entries(implReport.changes).map(([k,v])=>(
                    <div key={k} style={{padding:"6px 10px",background:"#08091A",borderRadius:4}}>
                      <div style={{fontSize:7,color:"#2a2a3a",marginBottom:2}}>{k.toUpperCase()}</div>
                      <div style={{fontSize:9,color:"#00FF88"}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10,fontSize:8,color:"#555"}}>
                  Based on {implReport.wins}W / {implReport.losses}L · Net P&L: {(implReport.pnlSum>=0?"+":"")+fmt$(implReport.pnlSum)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DAILY REPORTS */}
        {tab==="reports"&&(
          <div style={{display:"grid",gap:10}}>
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:7,color:"#2a2a3a",letterSpacing:"0.12em"}}>DAILY REPORTS (8AM · auto-generated)</div>
                <button className="btn" onClick={buildDailyReport} style={{background:"#00D4FF22",color:"#00D4FF",border:"1px solid #00D4FF33",fontSize:8}}>GENERATE NOW</button>
              </div>
              <div style={{fontSize:8,color:"#2a2a3a",marginBottom:14,lineHeight:1.7}}>
                Reports auto-fire at 8:00 AM daily and halt the swarm when ${target.toLocaleString()} is reached.
                Keep this tab open for live tracking.
              </div>
              {dailyReports.length?dailyReports.map((r,i)=>(
                <div key={i} style={{padding:"12px",background:"#08091A",borderRadius:6,marginBottom:8,border:`1px solid ${parseFloat(r.roi)>=0?"#00FF8820":"#FF445520"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:9,color:"#ccc",fontWeight:500}}>{r.date}</span>
                    <span style={{fontSize:9,color:parseFloat(r.roi)>=0?"#00FF88":"#FF4455"}}>{(parseFloat(r.roi)>=0?"+":"")+r.roi}% ROI</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
                    {[["BALANCE",fmt$(r.balance)],["W/L",`${r.wins}/${r.losses}`],["WIN RATE",r.winRate+"%"],["P&L",(r.totalPnl>=0?"+":"")+fmt$(r.totalPnl)]].map(([l,v])=>(
                      <div key={l} style={{textAlign:"center"}}>
                        <div style={{fontSize:6,color:"#2a2a3a",marginBottom:2}}>{l}</div>
                        <div style={{fontSize:10,color:"#E0E0F0",fontFamily:"'Bebas Neue'"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{height:2,background:"#0e0e1e",borderRadius:1,marginBottom:6}}>
                    <div style={{height:"100%",width:`${r.progress}%`,background:"linear-gradient(90deg,#BF5FFF,#00D4FF)",borderRadius:1}}/>
                  </div>
                  <div style={{fontSize:7,color:"#333"}}>{r.progress}% to ${r.target?.toLocaleString()} target · Streak: {r.streak} · Cycles: {r.cyclesRun}</div>
                </div>
              )):(
                <div style={{fontSize:9,color:"#1a1a2a",padding:12}}>No reports yet. Click "GENERATE NOW" to create one, or wait for 8am.</div>
              )}
            </div>
          </div>
        )}

        {/* LOG */}
        {tab==="log"&&(
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            {log.map(e=>(
              <div key={e.id} className="row" style={{display:"flex",gap:8,padding:"3px 8px",borderRadius:2,background:e.type==="error"?"#FF445506":e.type==="success"?"#00FF8806":"transparent"}}>
                <span style={{fontSize:7,color:"#1a1a2a",flexShrink:0,minWidth:48}}>{e.t}</span>
                <span style={{fontSize:7,color:"#BF5FFF33",flexShrink:0,minWidth:120}}>[{e.agent}]</span>
                <span style={{fontSize:9,color:e.type==="error"?"#FF7788":e.type==="success"?"#88EE88":e.type==="warn"?"#FFB800":"#777",lineHeight:1.5}}>{e.msg}</span>
              </div>
            ))}
            {!log.length&&<div style={{fontSize:9,color:"#1a1a2a",padding:16}}>No activity</div>}
          </div>
        )}

        {/* HISTORY */}
        {tab==="history"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:1,marginBottom:12}}>
              {[["COMPLETED",done.length],["WINS",wins],["LOSSES",losses],["WIN RATE",wrate+"%"],["NET P&L",(totalPnl>=0?"+":"")+fmt$(totalPnl)]].map(([l,v])=>(
                <div key={l} style={{background:"#0C0D1A",border:"1px solid #181828",borderRadius:4,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:7,color:"#1a1a2a",marginBottom:4}}>{l}</div>
                  <div style={{fontSize:13,fontFamily:"'Bebas Neue'",color:"#E0E0F0"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {history.map(t=>(
                <div key={t.id} className="row" style={{display:"flex",gap:8,alignItems:"center",padding:"7px 12px",background:"#0C0D1A",borderRadius:4,border:`1px solid ${t.won===true?"#00FF8815":t.won===false?"#FF445515":"#FFB80012"}`}}>
                  <span style={{fontSize:7,color:"#1a1a2a",minWidth:24}}>#{t.cycle}</span>
                  <span style={{fontSize:8,color:"#555",flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.title}</span>
                  <span style={{fontSize:8,color:"#BF5FFF",flexShrink:0,minWidth:28}}>{t.side}</span>
                  <span style={{fontSize:8,color:"#00D4FF",flexShrink:0,minWidth:42}}>{t.price?.toFixed(3)}</span>
                  <span style={{fontSize:8,color:"#FFB800",flexShrink:0,minWidth:46}}>{fmt$(t.bet)}</span>
                  {t.pnl!=null
                    ?<span style={{fontSize:8,color:t.won?"#00FF88":"#FF4455",flexShrink:0,minWidth:52,textAlign:"right"}}>{t.won?"+":""}{fmt$(t.pnl)}</span>
                    :<span style={{fontSize:7,color:"#FFB800",flexShrink:0}}>PENDING</span>}
                  {t.test&&<span style={{fontSize:6,color:"#FFB80088",flexShrink:0}}>TEST</span>}
                  <span style={{fontSize:7,color:t.mode==="live"?"#FF6B3566":"#1a1a2a",flexShrink:0}}>{t.mode==="live"?"⚡":""}</span>
                </div>
              ))}
              {!history.length&&<div style={{fontSize:9,color:"#1a1a2a",padding:16}}>No trades yet</div>}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{padding:"5px 16px",borderTop:"1px solid #0e0e1e",background:"#08091A",display:"flex",justifyContent:"space-between",fontSize:7,color:"#1a1a2a"}}>
        <span>POLYSWARM v6 · OpenAI gpt-4o-mini · Implementor auto-tunes every 5 cycles · Daily reports at 8AM</span>
        <span>{liveMode?"⚡LIVE":"PAPER"} · {running?"RUNNING":"IDLE"} · CB:{circuit?"OPEN":"OK"} · {fmt$(balance||0)} USDC</span>
      </div>
    </div>
  );
}
