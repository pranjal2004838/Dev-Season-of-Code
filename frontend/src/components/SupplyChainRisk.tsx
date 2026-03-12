import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { DetectedApp } from '../services/api';

/* ── types ─────────────────────────────────────────────────────────────────── */
interface ChainLink {
  source: string;
  target: string;
  type: 'integration' | 'data-share' | 'workflow';
  label: string;
}

/* ── constants ─────────────────────────────────────────────────────────────── */
const RISK_CLR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
};

const COMPLIANCE: Record<string, string[]> = {
  PII:              ['GDPR Art. 33 — 72 h notification', 'CCPA §1798.82'],
  Credentials:      ['SOC 2 CC6.1 — Logical Access', 'ISO 27001 A.9'],
  Financial:        ['SOX Section 302', 'PCI-DSS Req 12.10'],
  'Employee Records': ['GDPR Art. 88 — Employment', 'HIPAA §164.308'],
  Documents:        ['SOC 2 CC6.7 — Change Mgmt', 'ISO 27001 A.8'],
  'API Keys':       ['SOC 2 CC6.6 — System Ops', 'NIST 800-53 IA-5'],
};

/* known integration patterns  [keyword1, keyword2, type, label] */
const KNOWN_LINKS: [string, string, ChainLink['type'], string][] = [
  ['slack','notion','integration','Workspace sync'],
  ['slack','figma','integration','Design notifications'],
  ['slack','datadog','integration','Alert pipeline'],
  ['slack','sentry','integration','Error tracking alerts'],
  ['slack','zendesk','integration','Support ticket stream'],
  ['slack','trello','integration','Task board updates'],
  ['slack','asana','integration','Project notifications'],
  ['slack','monday','integration','Work management sync'],
  ['slack','copper','integration','CRM deal updates'],
  ['slack','pipedrive','integration','Pipeline notifications'],
  ['slack','loom','integration','Video sharing'],
  ['slack','miro','integration','Whiteboard sync'],
  ['slack','calendly','integration','Meeting scheduling'],
  ['slack','airtable','integration','Database alerts'],
  ['slack','hotjar','integration','Analytics alerts'],
  ['slack','hootsuite','integration','Social media alerts'],
  ['zapier','slack','workflow','Automation hub'],
  ['zapier','copper','workflow','CRM automation'],
  ['zapier','pipedrive','workflow','Sales automation'],
  ['zapier','notion','workflow','Doc automation'],
  ['zapier','airtable','workflow','Database automation'],
  ['gusto','quickbooks','data-share','Payroll → Accounting'],
  ['docusign','dropbox','data-share','Signed doc storage'],
  ['chatgpt','notion','data-share','AI content → KB'],
  ['jasper','chatgpt','data-share','AI model data overlap'],
  ['copy.ai','jasper','data-share','Content data overlap'],
  ['figma','canva','data-share','Design asset overlap'],
  ['hootsuite','canva','integration','Social media design'],
  ['grammarly','notion','integration','Writing assistance'],
  ['notion','miro','integration','Collab workspace'],
  ['airtable','notion','data-share','Database sync'],
  ['trello','asana','data-share','Task data overlap'],
  ['monday','asana','data-share','PM data overlap'],
  ['copper','pipedrive','data-share','CRM data overlap'],
  ['discord','slack','data-share','Chat data overlap'],
  ['dropbox','notion','integration','File embedding'],
  ['postman','datadog','integration','API monitoring'],
  ['activecampaign','slack','integration','Campaign alerts'],
  ['expensify','quickbooks','data-share','Expense → Finance'],
];

/* ── helpers ───────────────────────────────────────────────────────────────── */
function generateChainLinks(apps: DetectedApp[]): ChainLink[] {
  const links: ChainLink[] = [];
  const seen = new Set<string>();
  const key = (a: string, b: string) => [a, b].sort().join('|||');

  // known integrations
  for (const [kw1, kw2, type, label] of KNOWN_LINKS) {
    const a1 = apps.find(a => a.name.toLowerCase().includes(kw1));
    const a2 = apps.find(a => a.name.toLowerCase().includes(kw2));
    if (a1 && a2 && a1.name !== a2.name) {
      const k = key(a1.name, a2.name);
      if (!seen.has(k)) {
        seen.add(k);
        links.push({ source: a1.name, target: a2.name, type, label });
      }
    }
  }

  // same-category data-share
  const byCat = new Map<string, DetectedApp[]>();
  for (const a of apps) {
    if (!byCat.has(a.category)) byCat.set(a.category, []);
    byCat.get(a.category)!.push(a);
  }
  for (const [cat, arr] of byCat) {
    if (arr.length < 2) continue;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const k = key(arr[i].name, arr[j].name);
        if (!seen.has(k)) {
          seen.add(k);
          links.push({ source: arr[i].name, target: arr[j].name, type: 'data-share', label: `${cat} overlap` });
        }
      }
    }
  }
  return links;
}

function inferDataTypes(perms: string[]): string[] {
  const t = new Set<string>();
  for (const p of perms) {
    const l = p.toLowerCase();
    if (/pii|ssn|contact|phone|email|personal/.test(l)) t.add('PII');
    if (/credential|password|api.key|token|secret/.test(l)) t.add('Credentials');
    if (/financ|payment|invoice|billing|expense/.test(l)) t.add('Financial');
    if (/employee|hr|payroll|salary/.test(l)) t.add('Employee Records');
    if (/document|file|storage|drive/.test(l)) t.add('Documents');
    if (/api|key|secret|token/.test(l)) t.add('API Keys');
  }
  if (t.size === 0) t.add('Documents');
  return Array.from(t);
}

/* ── component ─────────────────────────────────────────────────────────────── */
export default function SupplyChainRisk({ detectedApps }: { detectedApps: DetectedApp[] }) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [breachPhase, setBreachPhase] = useState(0);      // 0=idle, 1-4=cascade
  const [affected, setAffected] = useState<Map<string, number>>(new Map());
  const timers = useRef<number[]>([]);

  const links = useMemo(() => generateChainLinks(detectedApps), [detectedApps]);

  /* node positions — circular layout */
  const positions = useMemo(() => {
    const m: Record<string, { x: number; y: number }> = {};
    const cx = 480, cy = 260, r = 210;
    detectedApps.forEach((a, i) => {
      const ang = (i / detectedApps.length) * 2 * Math.PI - Math.PI / 2;
      m[a.name] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
    });
    return m;
  }, [detectedApps]);

  /* BFS cascade */
  const computeCascade = useCallback((name: string) => {
    const adj = new Map<string, Set<string>>();
    detectedApps.forEach(a => adj.set(a.name, new Set()));
    links.forEach(l => { adj.get(l.source)?.add(l.target); adj.get(l.target)?.add(l.source); });
    const vis = new Map<string, number>([[name, 0]]);
    const q: [string, number][] = [[name, 0]];
    while (q.length) {
      const [cur, h] = q.shift()!;
      if (h >= 3) continue;
      for (const nb of adj.get(cur) || []) {
        if (!vis.has(nb)) { vis.set(nb, h + 1); q.push([nb, h + 1]); }
      }
    }
    return vis;
  }, [detectedApps, links]);

  /* run simulation */
  const runBreach = useCallback(() => {
    if (!selectedApp) return;
    const cascade = computeCascade(selectedApp);
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
    setBreachPhase(1);
    setAffected(new Map([[selectedApp, 0]]));

    timers.current.push(window.setTimeout(() => {
      setBreachPhase(2);
      const m = new Map<string, number>();
      for (const [k, v] of cascade) if (v <= 1) m.set(k, v);
      setAffected(m);
    }, 1200));

    timers.current.push(window.setTimeout(() => {
      setBreachPhase(3);
      const m = new Map<string, number>();
      for (const [k, v] of cascade) if (v <= 2) m.set(k, v);
      setAffected(m);
    }, 2400));

    timers.current.push(window.setTimeout(() => {
      setBreachPhase(4);
      setAffected(cascade);
    }, 3600));
  }, [selectedApp, computeCascade]);

  const resetBreach = useCallback(() => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
    setBreachPhase(0);
    setAffected(new Map());
  }, []);

  useEffect(() => () => { timers.current.forEach(t => clearTimeout(t)); }, []);

  /* impact stats */
  const impact = useMemo(() => {
    if (breachPhase === 0 || affected.size === 0) return null;
    const apps = detectedApps.filter(a => affected.has(a.name));
    const dataTypes = new Set<string>();
    const depts = new Set<string>();
    const violations = new Set<string>();
    let spend = 0;
    for (const a of apps) {
      const types = inferDataTypes(a.data_permissions || []);
      types.forEach(t => { dataTypes.add(t); (COMPLIANCE[t] || []).forEach(v => violations.add(v)); });
      if (a.department) depts.add(a.department);
      spend += a.typical_price;
    }
    return {
      count: apps.length,
      pct: Math.round((apps.length / detectedApps.length) * 100),
      dataTypes: Array.from(dataTypes),
      depts: Array.from(depts),
      violations: Array.from(violations),
      cost: spend * 150,
      monthlySpend: spend,
    };
  }, [breachPhase, affected, detectedApps]);

  const breachActive = breachPhase > 0;

  /* ── empty state ─────────────────────────────────────────────────────────── */
  if (detectedApps.length === 0) {
    return (
      <section className="sc-section">
        <div className="sc-empty">
          <h2>🔗 Supply Chain Risk Graph</h2>
          <p>Upload your company data on the <strong>Dashboard</strong> tab first.<br/>
          Then return here to simulate vendor breaches and see cascading impact.</p>
        </div>
      </section>
    );
  }

  /* ── main render ─────────────────────────────────────────────────────────── */
  return (
    <section className="sc-section">

      {/* header */}
      <div className="sc-header">
        <h2>🔗 Supply Chain Risk Graph</h2>
        <p className="sc-subtitle">
          Your shadow SaaS apps form a hidden supply chain. Click any app, then
          <strong> Simulate Breach</strong> to watch risk cascade across your organization in real time.
        </p>
        <div className="sc-stats-bar">
          <div className="sc-stat-pill"><strong>{detectedApps.length}</strong> Apps</div>
          <div className="sc-stat-pill"><strong>{links.length}</strong> Chain Links</div>
          <div className="sc-stat-pill"><strong>{detectedApps.filter(a => a.risk_level === 'critical' || a.risk_level === 'high').length}</strong> High-Risk Nodes</div>
          <div className="sc-stat-pill"><strong>{new Set(detectedApps.map(a => a.department).filter(Boolean)).size || '—'}</strong> Departments</div>
        </div>
      </div>

      {/* controls */}
      <div className="sc-controls">
        <select
          className="sc-select"
          value={selectedApp || ''}
          onChange={e => { setSelectedApp(e.target.value || null); resetBreach(); }}
        >
          <option value="">— Select an app to breach —</option>
          {[...detectedApps]
            .sort((a, b) => {
              const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
              return (o[a.risk_level || 'low'] ?? 3) - (o[b.risk_level || 'low'] ?? 3);
            })
            .map(a => (
              <option key={a.name} value={a.name}>
                {a.risk_level === 'critical' ? '🔴' : a.risk_level === 'high' ? '🟠' : a.risk_level === 'medium' ? '🟡' : '🟢'}{' '}
                {a.name} ({a.category})
              </option>
            ))}
        </select>

        {!breachActive ? (
          <button className="sc-breach-btn" onClick={runBreach} disabled={!selectedApp}>
            💥 Simulate Breach
          </button>
        ) : (
          <button className="sc-reset-btn" onClick={resetBreach}>↩ Reset</button>
        )}
      </div>

      {/* SVG graph */}
      <div className="sc-graph-wrap">
        <svg viewBox="0 0 960 520" className="sc-svg">
          <defs>
            <filter id="scGlowRed"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="scGlowOrg"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="scGlowBlu"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* center hub */}
          <circle cx={480} cy={260} r={32} fill="#1e3a5f" stroke="#60a5fa" strokeWidth={2}
            opacity={breachActive ? 0.25 : 0.85} style={{ transition: 'all .5s' }}/>
          <text x={480} y={256} textAnchor="middle" fill="#93c5fd" fontSize={9} fontWeight="bold">YOUR</text>
          <text x={480} y={269} textAnchor="middle" fill="#93c5fd" fontSize={9} fontWeight="bold">ORG DATA</text>

          {/* hub spokes */}
          {detectedApps.map(a => {
            const p = positions[a.name]; if (!p) return null;
            return <line key={`hub-${a.name}`} x1={480} y1={260} x2={p.x} y2={p.y}
              stroke={breachActive ? (affected.has(a.name) ? '#ef444430' : '#ffffff06') : '#ffffff10'}
              strokeWidth={0.5} style={{ transition: 'all .5s' }}/>;
          })}

          {/* chain edges */}
          {links.map((lk, i) => {
            const p1 = positions[lk.source], p2 = positions[lk.target];
            if (!p1 || !p2) return null;
            const hit = breachActive && affected.has(lk.source) && affected.has(lk.target);
            return <line key={`e${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={hit ? '#ef4444' : lk.type === 'integration' ? '#3b82f6' : lk.type === 'workflow' ? '#10b981' : '#8b5cf6'}
              strokeWidth={hit ? 2.5 : 1}
              strokeDasharray={lk.type === 'data-share' ? '4,4' : lk.type === 'workflow' ? '8,4' : 'none'}
              opacity={breachActive ? (hit ? .9 : .07) : .35}
              filter={hit ? 'url(#scGlowRed)' : undefined}
              style={{ transition: 'all .6s' }}/>;
          })}

          {/* nodes */}
          {detectedApps.map(app => {
            const p = positions[app.name]; if (!p) return null;
            const hop = affected.get(app.name);
            const isHit = hop !== undefined;
            const isSrc = hop === 0;
            const isSel = app.name === selectedApp && !breachActive;

            const fill = breachActive
              ? isSrc ? '#ef4444' : hop === 1 ? '#f97316' : hop === 2 ? '#eab308' : hop === 3 ? '#fbbf24' : '#374151'
              : RISK_CLR[app.risk_level || 'low'] || RISK_CLR.low;
            const r = isSrc ? 20 : isHit ? 16 : isSel ? 18 : 14;
            const filt = isSrc ? 'url(#scGlowRed)' : hop === 1 ? 'url(#scGlowOrg)' : isSel ? 'url(#scGlowBlu)' : undefined;
            const op = breachActive ? (isHit ? 1 : .15) : .9;

            const ang = Math.atan2(p.y - 260, p.x - 480);
            const lx = p.x + Math.cos(ang) * 24;
            const ly = p.y + Math.sin(ang) * 24;
            const anchor = p.x > 500 ? 'start' : p.x < 460 ? 'end' : 'middle';
            const short = app.name.length > 14 ? app.name.slice(0, 13) + '…' : app.name;

            return (
              <g key={app.name} style={{ cursor: 'pointer', transition: 'all .5s' }}
                onClick={() => { setSelectedApp(app.name); if (breachActive) resetBreach(); }}>
                {isSrc && breachActive && (
                  <circle cx={p.x} cy={p.y} r={32} fill="none" stroke="#ef4444" strokeWidth={2} className="sc-pulse-ring"/>
                )}
                <circle cx={p.x} cy={p.y} r={r} fill={fill}
                  stroke={isSel ? '#fff' : 'rgba(255,255,255,.25)'} strokeWidth={isSel ? 2 : 1}
                  opacity={op} filter={filt} style={{ transition: 'all .5s' }}/>
                <text x={lx} y={ly + 4} textAnchor={anchor}
                  fill={breachActive ? (isHit ? '#fff' : '#555') : '#cbd5e1'}
                  fontSize={isSrc ? 11 : 9} fontWeight={isHit ? 700 : 400}
                  style={{ transition: 'all .5s' }}>{short}</text>
                {isHit && !isSrc && breachActive && (
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="bold">
                    {hop}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* legend */}
      <div className="sc-legend">
        <span className="sc-leg"><span className="sc-leg-line" style={{ background: '#3b82f6' }}/> Integration</span>
        <span className="sc-leg"><span className="sc-leg-line sc-leg-dash" style={{ background: '#8b5cf6' }}/> Data Share</span>
        <span className="sc-leg"><span className="sc-leg-line sc-leg-dot" style={{ background: '#10b981' }}/> Workflow</span>
        <span className="sc-leg"><span className="sc-leg-circ" style={{ background: '#ef4444' }}/> Critical</span>
        <span className="sc-leg"><span className="sc-leg-circ" style={{ background: '#f97316' }}/> High</span>
        <span className="sc-leg"><span className="sc-leg-circ" style={{ background: '#eab308' }}/> Medium</span>
        <span className="sc-leg"><span className="sc-leg-circ" style={{ background: '#22c55e' }}/> Low</span>
      </div>

      {/* ── breach impact panel ─────────────────────────────────────────────── */}
      {breachActive && impact && breachPhase >= 2 && (
        <div className="sc-impact" style={{ animation: 'scSlideIn .5s ease' }}>
          <h3 className="sc-impact-title">
            💥 Breach Impact — <span className="sc-impact-appname">{selectedApp}</span>
          </h3>

          <div className="sc-impact-grid">
            <div className="sc-impact-card sc-card-red">
              <span className="sc-card-val">{impact.count}</span>
              <span className="sc-card-lbl">Apps Compromised</span>
              <span className="sc-card-sub">{impact.pct}% of your SaaS stack</span>
            </div>
            <div className="sc-impact-card sc-card-orange">
              <span className="sc-card-val">{impact.dataTypes.length}</span>
              <span className="sc-card-lbl">Data Types Exposed</span>
              <span className="sc-card-sub">{impact.dataTypes.join(', ')}</span>
            </div>
            <div className="sc-impact-card sc-card-yellow">
              <span className="sc-card-val">{impact.depts.length || '—'}</span>
              <span className="sc-card-lbl">Departments Hit</span>
              <span className="sc-card-sub">{impact.depts.join(', ') || 'Cross-organization'}</span>
            </div>
            <div className="sc-impact-card sc-card-purple">
              <span className="sc-card-val">${(impact.cost / 1000).toFixed(0)}K</span>
              <span className="sc-card-lbl">Est. Breach Cost</span>
              <span className="sc-card-sub">${impact.monthlySpend}/mo × 150× multiplier</span>
            </div>
          </div>

          {/* compliance violations */}
          {impact.violations.length > 0 && (
            <div className="sc-violations">
              <h4>⚖️ Regulatory Violations Triggered</h4>
              <div className="sc-violation-tags">
                {impact.violations.map((v, i) => <span key={i} className="sc-vtag">{v}</span>)}
              </div>
            </div>
          )}

          {/* breach timeline */}
          <div className="sc-timeline">
            <h4>📅 Breach Progression Timeline</h4>
            <div className="sc-timeline-track">
              {[
                { time: 'Hour 0', desc: `${selectedApp} credentials compromised`, cls: 'sc-te-crit' },
                { time: 'Hour 1-6', desc: `Attacker accesses ${impact.dataTypes.slice(0, 2).join(' & ')}`, cls: 'sc-te-crit' },
                { time: 'Day 1-3', desc: `Lateral movement to ${impact.count - 1} connected apps`, cls: 'sc-te-high' },
                { time: 'Day 3-7', desc: `Full data exfiltration across ${impact.depts.length || 'all'} departments`, cls: 'sc-te-high' },
                { time: 'Day 7+', desc: `${impact.violations.length} regulatory penalties — $${(impact.cost / 1000).toFixed(0)}K+ in damages`, cls: 'sc-te-med' },
              ].map((ev, i) => (
                <div key={i} className={`sc-te ${ev.cls}`}>
                  <span className="sc-te-time">{ev.time}</span>
                  <span className="sc-te-desc">{ev.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
