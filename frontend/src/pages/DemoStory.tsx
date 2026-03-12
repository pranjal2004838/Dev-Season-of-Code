import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   DemoStory — Interactive Guided Tour for Judges
   ═══════════════════════════════════════════════════════════════════════════ */

interface Section {
  id: string;
  icon: string;
  tab: string;
  title: string;
  why: string;
  features: { label: string; detail: string }[];
  interactions: { action: string; result: string }[];
  judgeNote: string;
}

const SECTIONS: Section[] = [
  {
    id: 'overview',
    icon: '🔍',
    tab: 'All',
    title: 'What Is Shadow SaaS Detector?',
    why: 'Employees sign up for SaaS tools (Slack, Notion, ChatGPT, Figma…) without IT approval. This creates hidden costs, duplicate subscriptions, data leaks, and compliance violations. Shadow SaaS Detector discovers all of them from simple data uploads — no agents, no MDM, no admin access required.',
    features: [
      { label: 'Zero-Agent Detection', detail: 'Works from expense CSVs + browser history JSON — no software to install on employee devices.' },
      { label: '100+ SaaS Database', detail: 'Matches against a curated database of 100 popular SaaS apps with known risk levels and data permissions.' },
      { label: 'AI-Powered Analysis', detail: 'Uses Google Gemini AI for risk assessment, smart consolidation, and compliance auditing.' },
      { label: 'Breach Simulation', detail: 'Supply Chain Risk Graph lets you simulate a vendor breach and see cascading impact in real time.' },
    ],
    interactions: [
      { action: 'Navigate the tabs above', result: 'Each tab represents a key capability: Dashboard → Threat Map → Simulator → AI Insights.' },
    ],
    judgeNote: 'This solves a real $45B/year enterprise problem. 65% of SaaS apps in most companies are unknown to IT.',
  },
  {
    id: 'dashboard',
    icon: '📊',
    tab: 'Dashboard',
    title: 'Dashboard — Detection Engine',
    why: 'The Dashboard is where detection happens. Upload company data (expense reports + browser history) and the engine cross-references against our SaaS database to find unauthorized apps.',
    features: [
      { label: 'Quick-Connect Buttons', detail: 'Click "Connect" on Google Workspace, Microsoft 365, or Expense System to simulate OAuth integration. This triggers an automatic scan with built-in demo data.' },
      { label: 'Manual File Upload', detail: 'Or upload your own CSV + JSON files. Sample files are in the sample_uploads/ folder in the repository.' },
      { label: 'Stats Overview', detail: 'After detection: total apps found, monthly spend total, high/critical risk count, and categories breakdown.' },
      { label: 'App Cards', detail: 'Each detected app shows: name, category, cost, risk badge (color-coded), data permissions, and detection evidence.' },
      { label: 'Interactive Charts', detail: 'Donut chart (risk distribution), bar chart (top 10 apps by cost), horizontal bar chart (spending by department).' },
      { label: 'Playbook Modal', detail: 'Click "⚡ Playbook" on any app to simulate revoking access. Generates an email draft and audit log entry.' },
    ],
    interactions: [
      { action: 'Click any "Connect" button (e.g., Google Workspace)', result: 'Simulates OAuth flow → scanning animation with progress bar → 25-30 shadow SaaS apps detected automatically from demo data.' },
      { action: 'Click "⚡ Playbook" on a high-risk app card', result: 'Opens a modal showing app details → click "Simulate Revoke" → confirmation dialog → email draft generated → 30-second undo countdown starts.' },
      { action: 'Click "Undo" during the 30-second countdown', result: 'Revoke is cancelled, app access is restored. Demonstrates non-destructive remediation flow.' },
      { action: 'Click "🔄 New Scan" in the dashboard header', result: 'Resets all detected apps. You can start fresh and upload different data files.' },
      { action: 'Click "Or upload files manually" and use sample_uploads/ files', result: 'Upload sample_expenses.csv + sample_browser_history.json from the repo. Different set of detections appears.' },
    ],
    judgeNote: 'The zero-agent approach is the key differentiator — most competitors require installing MDM, browser extensions, or SSO integration. This works with data any company already has.',
  },
  {
    id: 'threat-map',
    icon: '🗺️',
    tab: 'Threat Map',
    title: 'Threat Map — Supply Chain Risk & Attack Surface',
    why: 'Shadow SaaS apps don\'t exist in isolation — they form a hidden supply chain. If one vendor is breached, the attack cascades through integrations (Slack→Notion→Zapier→CRM). This tab visualizes that risk web and lets you simulate breaches.',
    features: [
      { label: '🔗 Supply Chain Risk Graph', detail: 'Interactive network visualization showing how apps connect through integrations (solid blue), data sharing (dashed purple), and workflows (dotted green). Each connection is a potential breach pathway.' },
      { label: '💥 Breach Cascade Simulator', detail: 'Select any app → click "Simulate Breach" → watch red/orange/yellow cascade spread through the network in real-time over 4 phases. Numbers on nodes show "hop distance" from the breach.' },
      { label: '📊 Breach Impact Dashboard', detail: 'Appears after breach: apps compromised, data types exposed (PII, Credentials, Financial, etc.), departments hit, estimated breach cost (150× monthly multiplier).' },
      { label: '⚖️ Regulatory Violations', detail: 'Auto-detects violated regulations: GDPR Art. 33, CCPA, SOC 2, HIPAA, SOX, PCI-DSS — with specific article/section citations.' },
      { label: '📅 Breach Timeline', detail: 'Hour-by-hour progression: Hour 0 (compromise) → Hour 1-6 (data access) → Day 1-3 (lateral movement) → Day 3-7 (exfiltration) → Day 7+ (regulatory penalties).' },
      { label: '🕸️ Attack Surface Map', detail: 'Below the Supply Chain Graph: apps as circles, data types as diamonds. Three view modes: Risk Level, Data Flow (animated), Blast Radius (expanding circles).' },
      { label: '📋 Executive Brief', detail: 'One-click generates a professional, print-ready HTML board report in a new browser tab. Includes KPIs, risk table, consolidation opportunities, 4-phase remediation timeline, full app inventory.' },
    ],
    interactions: [
      { action: 'Select "Slack" from the breach dropdown → click "💥 Simulate Breach"', result: 'Slack has the most integrations — watch 10+ apps cascade into compromise. Impact panel shows $30K+ in breach damages and multiple GDPR/SOC 2 violations.' },
      { action: 'Click "↩ Reset" → Select "Zapier" → Simulate', result: 'Zapier is an automation hub connecting everything — this shows the absolute worst-case scenario with maximum cascade reach.' },
      { action: 'Click "Reset" → try a low-risk, low-connection app', result: 'Compare: a standalone app like Canva has minimal blast radius vs. a hub like Slack/Zapier. This demonstrates why supply chain position matters more than individual risk level.' },
      { action: 'Scroll to Attack Surface Map → click "Data Flow" mode', result: 'Animated dashed lines show data flowing between apps and data types. Visual representation of where your data actually lives.' },
      { action: 'Scroll to Executive Brief → click "📋 Generate Executive Report"', result: 'Professional McKinsey-style report opens in new tab. Use Ctrl+P to print or save as PDF. Includes everything a board needs to understand the risk.' },
    ],
    judgeNote: 'The breach cascade simulator is the "holy shit" moment. No other shadow IT tool shows supply chain risk visualization. This makes executives viscerally understand why shadow SaaS is dangerous — one breach in Slack can compromise your entire organization.',
  },
  {
    id: 'simulator',
    icon: '💰',
    tab: 'Simulator',
    title: 'Simulator — Cost Savings Calculator',
    why: 'Companies waste 30-40% of SaaS spend on duplicate tools (3 CRMs, 4 project management tools, 2 design tools). The Simulator lets you model consolidation scenarios and see exactly how much you save by keeping one app per category.',
    features: [
      { label: 'Category Grouping', detail: 'Apps are automatically grouped by category. Categories with 2+ apps are flagged as consolidation opportunities.' },
      { label: 'Keep/Remove Selection', detail: 'Radio buttons let you pick which app to keep in each duplicate category. All others are marked for removal.' },
      { label: 'Adoption Rate Slider', detail: 'Slide from 0-100% to model partial adoption: "What if only 70% of teams actually migrate?" Savings scale proportionally.' },
      { label: 'Real-Time Savings', detail: 'Animated counter shows monthly and annual savings updating instantly as you change selections.' },
      { label: 'Breakdown Table', detail: 'Per-category breakdown showing: kept app, removed apps, and dollar savings for each category.' },
    ],
    interactions: [
      { action: 'In a category with 3+ apps (like CRM), click different radio buttons', result: 'The "kept" app changes. Try keeping the cheapest option vs. the most full-featured — savings recalculate instantly.' },
      { action: 'Drag the adoption slider from 100% to 50%', result: 'Savings cut in half — this models the realistic scenario where not all teams migrate immediately. Plan for phased rollout.' },
      { action: 'Set everything to 100% adoption and note the Annual Savings', result: 'This is the maximum possible savings. For typical demo data, expect $3,000-$6,000/year in potential savings.' },
    ],
    judgeNote: 'The real-time simulation with adoption rate modeling goes beyond basic "remove duplicates" — it models realistic enterprise rollout scenarios that CFOs actually need.',
  },
  {
    id: 'ai',
    icon: '🤖',
    tab: 'AI Insights',
    title: 'AI Insights — Intelligent Analysis (Gemini-Powered)',
    why: 'Raw detection data isn\'t enough — IT teams need actionable intelligence. AI Insights uses Google Gemini 1.5 Flash to generate risk assessments, consolidation recommendations, and compliance audit reports. Falls back to rule-based analysis if no API key is configured.',
    features: [
      { label: 'Risk Assessment', detail: 'Each app gets an AI-generated risk score (0-100), severity level, reasoning explanation, specific risks identified, and actionable recommendations with priorities.' },
      { label: 'Smart Consolidation', detail: 'AI identifies duplicate categories and recommends which tools to keep based on features, cost, risk profile, and team adoption. Shows projected savings per category.' },
      { label: 'Compliance Audit', detail: 'Full compliance report: overall score (0-100), critical issues table with regulation citations (GDPR, HIPAA, SOC 2, etc.), action items list, and 12-month risk forecast.' },
      { label: 'Export: Markdown & HTML', detail: 'Download the compliance report as a .md file for documentation, or open as styled HTML for printing/PDF generation.' },
    ],
    interactions: [
      { action: 'Click the "Risk Assessment" sub-tab', result: 'Auto-loads risk analysis. Summary bar shows critical/high/medium/low counts. Scroll through cards — each has AI-generated reasoning and specific recommendations.' },
      { action: 'Click the "Smart Consolidation" sub-tab', result: 'Category cards appear with green "KEEP" and red "REMOVE" tags. AI explains WHY to keep each tool. Total savings banner at top.' },
      { action: 'Click the "Compliance Audit" sub-tab', result: 'Compliance score gauge appears. Issues table lists problems with severity badges. Scroll to see action items and 12-month forecast.' },
      { action: 'Click "📥 Download .md" button', result: 'Downloads a Markdown compliance report file. Open in any editor or include in documentation.' },
      { action: 'Click "🖨️ Open as HTML" button', result: 'Opens a styled HTML report in new tab. Use Ctrl+P / Cmd+P to print or "Save as PDF".' },
    ],
    judgeNote: 'The AI adds genuine intelligence — not just "here are your apps" but "here\'s exactly what to do about each one and why." The rule-based fallback ensures the app works perfectly even without an API key.',
  },
  {
    id: 'architecture',
    icon: '🏗️',
    tab: 'Architecture',
    title: 'Technical Architecture & Key Design Decisions',
    why: 'Under the hood, Shadow SaaS Detector is a full-stack TypeScript application designed for production deployment. Every component is modular, testable, and built with modern best practices.',
    features: [
      { label: 'Frontend Stack', detail: 'React 19.2 + TypeScript 5.9 + Vite 7.3. Recharts for data visualization. CSS-in-CSS with CSS custom properties for theming. Zero component libraries — all hand-crafted UI.' },
      { label: 'Backend Stack', detail: 'Node.js + Express + TypeScript. Multer for secure file uploads. Modular route/service architecture (routes/upload.ts, services/detector.ts, etc.).' },
      { label: 'AI Integration', detail: 'Google Generative AI SDK (Gemini 1.5 Flash). Structured JSON output parsing. Graceful fallback to rule-based analysis. Caching layer for performance.' },
      { label: 'Detection Engine', detail: 'Pattern-matching against 100-app curated database with keywords, risk levels, and data permissions. CSV parser + JSON analyzer. Multi-evidence tracking per app.' },
      { label: 'Testing', detail: 'Vitest for unit tests (simulator, playbook services). Playwright for E2E tests and automated screenshot generation.' },
      { label: 'Deployment', detail: 'Render.com with Infrastructure-as-Code (render.yaml). Single build pipeline: frontend build → backend compile → production Node.js server.' },
    ],
    interactions: [],
    judgeNote: 'Built with production-grade tools and patterns. Not a hackathon prototype — a deployable product. Zero external UI libraries keeps the bundle lean and demonstrates full-stack capability.',
  },
];

export default function DemoStory() {
  const [activeSection, setActiveSection] = useState('overview');

  const section = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="demo-story">
      {/* header */}
      <div className="ds-header">
        <h2>🎬 Interactive Demo Guide</h2>
        <p className="ds-header-sub">
          A walkthrough for judges and users explaining every feature, interaction, and design decision.
          Click each section below to learn what each part of the app does and how to interact with it.
        </p>
      </div>

      {/* section nav */}
      <div className="ds-nav">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`ds-nav-btn ${activeSection === s.id ? 'ds-nav-active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <span className="ds-nav-icon">{s.icon}</span>
            <span className="ds-nav-label">{s.tab}</span>
          </button>
        ))}
      </div>

      {/* section content */}
      <div className="ds-content">
        <div className="ds-section-header">
          <span className="ds-section-icon">{section.icon}</span>
          <div>
            <h3 className="ds-section-title">{section.title}</h3>
            <span className="ds-tab-badge">Tab: {section.tab}</span>
          </div>
        </div>

        {/* why */}
        <div className="ds-why">
          <h4>Why This Matters</h4>
          <p>{section.why}</p>
        </div>

        {/* features */}
        <div className="ds-features">
          <h4>✨ Features</h4>
          <div className="ds-feature-grid">
            {section.features.map((f, i) => (
              <div key={i} className="ds-feature-card">
                <div className="ds-feature-label">{f.label}</div>
                <div className="ds-feature-detail">{f.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* interactions */}
        {section.interactions.length > 0 && (
          <div className="ds-interactions">
            <h4>👆 Try This — Interactive Guide</h4>
            <div className="ds-interaction-list">
              {section.interactions.map((int, i) => (
                <div key={i} className="ds-interaction">
                  <div className="ds-int-action">
                    <span className="ds-int-num">{i + 1}</span>
                    <span className="ds-int-do">{int.action}</span>
                  </div>
                  <div className="ds-int-result">→ {int.result}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* judge note */}
        <div className="ds-judge-note">
          <div className="ds-judge-badge">🏆 Why This Matters for Judging</div>
          <p>{section.judgeNote}</p>
        </div>
      </div>

      {/* quick stats footer */}
      <div className="ds-footer">
        <div className="ds-footer-stat"><strong>5</strong> Interactive Tabs</div>
        <div className="ds-footer-stat"><strong>100+</strong> SaaS Apps in DB</div>
        <div className="ds-footer-stat"><strong>AI</strong> Gemini-Powered</div>
        <div className="ds-footer-stat"><strong>0</strong> Agents Required</div>
        <div className="ds-footer-stat"><strong>∞</strong> Breach Simulations</div>
      </div>
    </div>
  );
}
