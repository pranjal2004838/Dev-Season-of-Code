import { useState } from 'react';
import type { DetectedApp } from '../services/api';

interface ExecutiveBriefProps {
  detectedApps: DetectedApp[];
}

export default function ExecutiveBrief({ detectedApps }: ExecutiveBriefProps) {
  const [generating, setGenerating] = useState(false);

  const totalSpend = detectedApps.reduce((s, a) => s + a.typical_price, 0);
  const critical = detectedApps.filter((a) => a.risk_level === 'critical');
  const high = detectedApps.filter((a) => a.risk_level === 'high');
  const departments = [...new Set(detectedApps.map((a) => a.department || 'Unknown'))];
  const categories = [...new Set(detectedApps.map((a) => a.category))];

  // Find duplicates
  const catCounts: Record<string, DetectedApp[]> = {};
  detectedApps.forEach((a) => {
    if (!catCounts[a.category]) catCounts[a.category] = [];
    catCounts[a.category].push(a);
  });
  const duplicates = Object.entries(catCounts).filter(([, apps]) => apps.length >= 2);
  const consolidationSavings = duplicates.reduce((sum, [, apps]) => {
    const sorted = [...apps].sort((a, b) => b.typical_price - a.typical_price);
    return sum + sorted.slice(1).reduce((s, a) => s + a.typical_price, 0);
  }, 0);

  const generateBrief = () => {
    setGenerating(true);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Shadow IT Executive Brief — ${today}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; background: #fff; line-height: 1.6; }
  .page { max-width: 800px; margin: 0 auto; padding: 60px 48px; }
  .header { border-bottom: 3px solid #1e293b; padding-bottom: 24px; margin-bottom: 40px; }
  .header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .header .subtitle { font-size: 14px; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; }
  .header .date { font-size: 13px; color: #94a3b8; margin-top: 8px; }
  .confidential { display: inline-block; background: #dc2626; color: white; font-size: 10px; padding: 2px 10px; border-radius: 2px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-left: 12px; vertical-align: middle; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
  .kpi-value { font-size: 32px; font-weight: 700; }
  .kpi-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
  .kpi-red .kpi-value { color: #dc2626; }
  .kpi-orange .kpi-value { color: #f97316; }
  .kpi-yellow .kpi-value { color: #eab308; }
  .kpi-blue .kpi-value { color: #2563eb; }
  h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
  .exec-summary { font-size: 15px; line-height: 1.8; color: #334155; margin-bottom: 32px; }
  .exec-summary strong { color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
  th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
  tr:hover td { background: #f8fafc; }
  .risk-pill { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .risk-critical { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .risk-high { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
  .risk-medium { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
  .risk-low { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .recommendation { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; margin-bottom: 16px; border-radius: 0 8px 8px 0; }
  .recommendation h4 { font-size: 14px; color: #1e40af; margin-bottom: 4px; }
  .recommendation p { font-size: 13px; color: #475569; }
  .duplicate-row { background: #faf5ff; }
  .savings { color: #16a34a; font-weight: 700; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 2px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  .timeline { display: flex; gap: 0; margin-bottom: 32px; }
  .timeline-item { flex: 1; padding: 16px; position: relative; }
  .timeline-item::after { content: '→'; position: absolute; right: -8px; top: 50%; transform: translateY(-50%); color: #cbd5e1; font-size: 18px; }
  .timeline-item:last-child::after { display: none; }
  .timeline-phase { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .timeline-action { font-size: 13px; font-weight: 600; color: #1e293b; }
  .timeline-detail { font-size: 11px; color: #64748b; margin-top: 2px; }
  @media print {
    .page { padding: 40px 32px; }
    .kpi-grid { grid-template-columns: repeat(4, 1fr); }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>Shadow IT Risk Assessment <span class="confidential">Confidential</span></h1>
    <div class="subtitle">Executive Briefing — Unauthorized SaaS Application Audit</div>
    <div class="date">Prepared: ${today} | Generated by Shadow SaaS Detector</div>
  </div>

  <div class="kpi-grid">
    <div class="kpi kpi-blue">
      <div class="kpi-value">${detectedApps.length}</div>
      <div class="kpi-label">Shadow Apps</div>
    </div>
    <div class="kpi kpi-red">
      <div class="kpi-value">${critical.length + high.length}</div>
      <div class="kpi-label">High/Critical Risk</div>
    </div>
    <div class="kpi kpi-orange">
      <div class="kpi-value">$${(totalSpend * 12).toLocaleString()}</div>
      <div class="kpi-label">Annual Exposure</div>
    </div>
    <div class="kpi kpi-yellow">
      <div class="kpi-value">$${(consolidationSavings * 12).toLocaleString()}</div>
      <div class="kpi-label">Potential Savings</div>
    </div>
  </div>

  <h2>Executive Summary</h2>
  <div class="exec-summary">
    An analysis of expense records and browser activity data identified <strong>${detectedApps.length} unauthorized SaaS applications</strong> in active use across <strong>${departments.length} departments</strong> spanning <strong>${categories.length} software categories</strong>. These applications represent a combined annual expenditure of <strong>$${(totalSpend * 12).toLocaleString()}</strong> in unmanaged software spend.
    <br /><br />
    Of immediate concern: <strong>${critical.length} applications are classified as critical risk</strong> due to access to personally identifiable information (PII), credentials, or financial data. ${high.length > 0 ? `Additionally, ${high.length} applications pose high risk due to broad data access permissions.` : ''}
    <br /><br />
    ${duplicates.length > 0 ? `We identified <strong>${duplicates.length} categories with duplicate tools</strong>, indicating consolidation opportunities that could yield <strong>$${(consolidationSavings * 12).toLocaleString()}/year in savings</strong> while simultaneously reducing the attack surface.` : ''}
  </div>

  <h2>Critical & High Risk Applications</h2>
  <table>
    <thead>
      <tr><th>Application</th><th>Risk Level</th><th>Department</th><th>Monthly Cost</th><th>Data Access</th></tr>
    </thead>
    <tbody>
      ${[...critical, ...high]
        .sort((a, b) => {
          const order: Record<string, number> = { critical: 0, high: 1 };
          return (order[a.risk_level || 'high'] ?? 2) - (order[b.risk_level || 'high'] ?? 2);
        })
        .map(
          (app) => `<tr>
        <td><strong>${app.name}</strong></td>
        <td><span class="risk-pill risk-${app.risk_level}">${app.risk_level}</span></td>
        <td>${app.department || 'Unknown'}</td>
        <td>$${app.typical_price}</td>
        <td>${(app.data_permissions || []).join(', ') || 'Standard access'}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  ${
    duplicates.length > 0
      ? `<h2>Consolidation Opportunities</h2>
  <table>
    <thead>
      <tr><th>Category</th><th>Current Tools</th><th>Recommended Action</th><th>Projected Savings</th></tr>
    </thead>
    <tbody>
      ${duplicates
        .map(([cat, apps]) => {
          const sorted = [...apps].sort((a, b) => b.typical_price - a.typical_price);
          const keep = sorted[0];
          const remove = sorted.slice(1);
          const saving = remove.reduce((s, a) => s + a.typical_price, 0);
          return `<tr class="duplicate-row">
          <td><strong>${cat}</strong></td>
          <td>${apps.map((a) => a.name).join(', ')}</td>
          <td>Retain ${keep.name}, retire ${remove.map((r) => r.name).join(', ')}</td>
          <td class="savings">$${saving * 12}/year</td>
        </tr>`;
        })
        .join('')}
    </tbody>
  </table>`
      : ''
  }

  <h2>Recommended Remediation Timeline</h2>
  <div class="timeline">
    <div class="timeline-item" style="background: #fef2f2; border-radius: 8px 0 0 8px;">
      <div class="timeline-phase">Week 1-2</div>
      <div class="timeline-action">Critical Risk Remediation</div>
      <div class="timeline-detail">Revoke access to ${critical.length} critical-risk apps. Notify affected employees. Audit data exposure.</div>
    </div>
    <div class="timeline-item" style="background: #fff7ed;">
      <div class="timeline-phase">Week 3-4</div>
      <div class="timeline-action">High Risk Mitigation</div>
      <div class="timeline-detail">Address ${high.length} high-risk apps. Implement approved alternatives. Update security policies.</div>
    </div>
    <div class="timeline-item" style="background: #eff6ff;">
      <div class="timeline-phase">Month 2</div>
      <div class="timeline-action">Consolidation</div>
      <div class="timeline-detail">Consolidate ${duplicates.length} duplicate categories. Negotiate enterprise licenses. Projected savings: $${(consolidationSavings * 12).toLocaleString()}/yr.</div>
    </div>
    <div class="timeline-item" style="background: #f0fdf4; border-radius: 0 8px 8px 0;">
      <div class="timeline-phase">Ongoing</div>
      <div class="timeline-action">Continuous Monitoring</div>
      <div class="timeline-detail">Deploy Shadow SaaS Detector for continuous scanning. Monthly audit reports. Policy enforcement.</div>
    </div>
  </div>

  <h2>All Detected Applications</h2>
  <table>
    <thead>
      <tr><th>#</th><th>Application</th><th>Category</th><th>Risk</th><th>Department</th><th>Cost/mo</th></tr>
    </thead>
    <tbody>
      ${detectedApps
        .sort((a, b) => {
          const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          return (order[a.risk_level || 'low'] ?? 4) - (order[b.risk_level || 'low'] ?? 4);
        })
        .map(
          (app, i) => `<tr>
        <td>${i + 1}</td>
        <td>${app.name}</td>
        <td>${app.category}</td>
        <td><span class="risk-pill risk-${app.risk_level || 'low'}">${app.risk_level || 'low'}</span></td>
        <td>${app.department || 'Unknown'}</td>
        <td>$${app.typical_price}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    This report was generated by Shadow SaaS Detector — Enterprise Shadow IT Discovery & Compliance Platform.<br />
    Classification: CONFIDENTIAL — For authorized personnel only. ${today}
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => {
      setGenerating(false);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  if (detectedApps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h3>Executive Brief</h3>
        <p style={{ marginTop: '0.5rem' }}>Upload data from the Dashboard tab to generate a board-ready report.</p>
      </div>
    );
  }

  return (
    <div className="exec-brief-section">
      <div className="exec-brief-preview">
        <div className="exec-brief-header">
          <div>
            <h3>📋 Executive Board Report</h3>
            <p className="exec-brief-desc">
              One-click professional report ready for CTO, CFO, and compliance teams. 
              Includes risk assessment, financial impact, consolidation opportunities, and remediation timeline.
            </p>
          </div>
          <button
            className="btn btn-primary exec-generate-btn"
            onClick={generateBrief}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '📄 Generate Board Report'}
          </button>
        </div>

        {/* Report preview cards */}
        <div className="exec-preview-grid">
          <div className="exec-preview-card">
            <div className="exec-preview-icon">🎯</div>
            <div className="exec-preview-title">Risk Summary</div>
            <div className="exec-preview-detail">
              {critical.length} critical, {high.length} high-risk apps identified
            </div>
          </div>
          <div className="exec-preview-card">
            <div className="exec-preview-icon">💰</div>
            <div className="exec-preview-title">Financial Impact</div>
            <div className="exec-preview-detail">
              ${(totalSpend * 12).toLocaleString()}/yr unauthorized spend
            </div>
          </div>
          <div className="exec-preview-card">
            <div className="exec-preview-icon">🔀</div>
            <div className="exec-preview-title">Consolidation</div>
            <div className="exec-preview-detail">
              {duplicates.length} duplicate categories, ${(consolidationSavings * 12).toLocaleString()}/yr savings
            </div>
          </div>
          <div className="exec-preview-card">
            <div className="exec-preview-icon">📅</div>
            <div className="exec-preview-title">Remediation Plan</div>
            <div className="exec-preview-detail">
              4-phase timeline from critical fix to monitoring
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
