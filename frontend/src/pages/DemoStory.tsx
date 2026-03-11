import { useState, useEffect, useCallback } from 'react';
import { uploadFiles, type DetectedApp } from '../services/api';
import PlaybookModal from '../components/PlaybookModal';
import Simulator from '../components/Simulator';
import { showToast } from '../components/Toast';

type DemoStep =
  | 'problem'
  | 'investigation'
  | 'uploading'
  | 'scanning'
  | 'findings'
  | 'risk-breakdown'
  | 'case-study'
  | 'consolidation'
  | 'cost-savings'
  | 'conclusion';

export default function DemoStory() {
  const [step, setStep] = useState<DemoStep>('problem');
  const [detectedApps, setDetectedApps] = useState<DetectedApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<DetectedApp | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);

  const runUpload = useCallback(async () => {
    setStep('uploading');
    setProgress(20);
    showToast('Analyzing expense reports and browser history...', 'info');
    try {
      // Fetch demo files from test_data
      const [expRes, brRes] = await Promise.all([
        fetch('/test_data/expenses.csv'),
        fetch('/test_data/browser_history.json'),
      ]);
      const expBlob = await expRes.blob();
      const brBlob = await brRes.blob();
      const expFile = new File([expBlob], 'expenses.csv', { type: 'text/csv' });
      const brFile = new File([brBlob], 'browser_history.json', { type: 'application/json' });

      // Simulate scanning progress
      setStep('scanning');
      for (let i = 30; i <= 90; i += 20) {
        await new Promise((r) => setTimeout(r, 300));
        setProgress(i);
      }

      const result = await uploadFiles(expFile, brFile);
      setDetectedApps(result.detectedApps);
      setProgress(100);
      setStep('findings');
      showToast(`Found ${result.totalApps} unauthorized SaaS applications!`, 'success');
    } catch (err) {
      showToast('Demo upload failed. Ensure backend is running.', 'error');
      console.error(err);
      setStep('problem');
    }
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!autoPlay) return;
    let timer: ReturnType<typeof setTimeout>;

    if (step === 'findings' && detectedApps.length > 0) {
      timer = setTimeout(() => setStep('risk-breakdown'), 3000);
    } else if (step === 'risk-breakdown') {
      timer = setTimeout(() => setStep('case-study'), 3000);
    } else if (step === 'case-study') {
      timer = setTimeout(() => setStep('consolidation'), 3000);
    } else if (step === 'consolidation') {
      timer = setTimeout(() => setStep('cost-savings'), 3000);
    } else if (step === 'cost-savings') {
      timer = setTimeout(() => setStep('conclusion'), 3000);
    }

    return () => clearTimeout(timer);
  }, [autoPlay, step, detectedApps]);

  // Company context for the story
  const companyContext = {
    name: 'GrowthLabs',
    employees: 150,
    budget: '$50K/month',
    department: 'Engineering',
  };

  const criticalRisks = detectedApps.filter((a) => a.risk_level === 'critical');
  const highRisks = detectedApps.filter((a) => a.risk_level === 'high');
  const totalSpend = detectedApps.reduce((sum, app) => sum + app.typical_price, 0);
  const potentialSavings = Math.round((totalSpend / 1005) * 500); // Scale based on demo
  const complianceAtRisk = detectedApps.filter((a) => a.permissions?.includes('PII') || a.permissions?.includes('SSN')).length;

  const narrativeText: Record<DemoStep, { title: string; desc: string }> = {
    problem: {
      title: '🏢 The Problem: Shadow IT at GrowthLabs',
      desc: 'Emma is the IT Manager at GrowthLabs, a 150-person SaaS startup. For months, her CFO has complained about unexplained software expenses. IT has no visibility into unauthorized tools. Developers use their own CI/CD tools. Design uses unlicensed subscriptions. Finance has shadow expense tools. Risk: $1000+/month wasted + potential data breaches.',
    },
    investigation: {
      title: '🔍 The Investigation Begins',
      desc: "Emma collects two data sources: expense reports (what was actually purchased) and browser history (what employees actually visited). She doesn't need to ask permission or deploy agents—just load the data and let Shadow SaaS Detector find patterns.",
    },
    uploading: {
      title: '📤 Uploading Organization Data',
      desc: 'Emma uploads expense reports and browser history. The detector begins cross-referencing against a database of 100+ known SaaS apps.',
    },
    scanning: {
      title: '⚡ Scanning & Detecting Patterns',
      desc: 'The engine is analyzing patterns across all departments, matching apps to risk levels based on data permissions and compliance exposure.',
    },
    findings: {
      title: '💥 Findings: 35 Unauthorized Apps Detected',
      desc: `Across ${detectedApps.length} detected applications costing $${totalSpend}/month, with ${criticalRisks.length} critical-risk apps and ${highRisks.length} high-risk apps. ${complianceAtRisk} apps have access to PII/SSN—a compliance violation waiting to happen.`,
    },
    'risk-breakdown': {
      title: '🛡️ Risk Assessment Deep Dive',
      desc: 'Each app is scored by: (1) Data access permissions (PII, SSN, financial records), (2) Compliance violations (GDPR, CCPA), (3) Industry-standard risk database. Critical apps get visual warnings.',
    },
    'case-study': {
      title: '🎯 Case Study: The Recruiting Bot Incident',
      desc: "Recruiting Bot was discovered with SSN access—employees' Social Security Numbers stored insecurely in an unauthorized tool. Emma didn't know it was being used. This is exactly the kind of breach that creates headlines.",
    },
    consolidation: {
      title: '🔀 Smart Consolidation: Removing Duplicates',
      desc: `The detector identifies duplicate tools across departments: 3 different design tools, 4 project management systems, 2 password managers. By consolidating to approved vendors, GrowthLabs can reduce monthly spend while improving security.`,
    },
    'cost-savings': {
      title: '💰 Cost Savings Simulator',
      desc: `Emma uses the simulator to explore what-if scenarios. Revoking unused apps and consolidating duplicates could save $${potentialSavings}+/year while eliminating compliance risks.`,
    },
    conclusion: {
      title: '✅ Outcome: Full Visibility & Control',
      desc: 'Emma now has: (1) Complete shadow IT inventory, (2) Risk scores for each app, (3) Consolidation recommendations, (4) Audit trail for compliance, (5) Data for executive presentation. She can make informed decisions backed by data.',
    },
  };

  return (
    <div>
      {/* Main Story Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>
              👩‍💼 Emma's Audit Story
            </div>
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              {narrativeText[step].title}
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
              {narrativeText[step].desc}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
            {step === 'problem' && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => { setAutoPlay(false); setStep('investigation'); }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  👉 Next Step
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setAutoPlay(true); setStep('investigation'); }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  ⏩ Autoplay
                </button>
              </>
            )}
            {step === 'investigation' && (
              <button className="btn btn-primary" onClick={runUpload} style={{ whiteSpace: 'nowrap' }}>
                📤 Start Detection
              </button>
            )}
            {(step === 'uploading' || step === 'scanning') && (
              <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
                {step === 'uploading' ? 'Uploading...' : 'Scanning...'}
              </div>
            )}
            {step === 'findings' && (
              <button className="btn btn-primary" onClick={() => setStep('risk-breakdown')} style={{ whiteSpace: 'nowrap' }}>
                📊 View Breakdown
              </button>
            )}
            {step === 'risk-breakdown' && (
              <button className="btn btn-primary" onClick={() => setStep('case-study')} style={{ whiteSpace: 'nowrap' }}>
                🎯 View Case Study
              </button>
            )}
            {step === 'case-study' && (
              <button className="btn btn-primary" onClick={() => setStep('consolidation')} style={{ whiteSpace: 'nowrap' }}>
                🔀 Consolidation
              </button>
            )}
            {step === 'consolidation' && (
              <button className="btn btn-primary" onClick={() => setStep('cost-savings')} style={{ whiteSpace: 'nowrap' }}>
                💰 See Savings
              </button>
            )}
            {step === 'cost-savings' && (
              <button className="btn btn-primary" onClick={() => setStep('conclusion')} style={{ whiteSpace: 'nowrap' }}>
                ✅ Conclusion
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(step === 'uploading' || step === 'scanning') && (
          <div style={{ marginTop: '1rem' }}>
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '999px',
                height: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(90deg, var(--accent), var(--success))',
                  height: '100%',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
              {progress}% Complete
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Problem Overview */}
      {step === 'problem' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 600 }}>Company Size</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{companyContext.employees} employees</div>
          </div>
          <div
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'rgb(139,92,246)', textTransform: 'uppercase', fontWeight: 600 }}>Software Budget</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{companyContext.budget}</div>
          </div>
          <div
            style={{
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'rgb(220,38,38)', textTransform: 'uppercase', fontWeight: 600 }}>Problem</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem' }}>$1000+/mo wasted</div>
          </div>
        </div>
      )}

      {/* Step 3-4: Uploading & Scanning */}
      {(step === 'uploading' || step === 'scanning') && (
        <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>📊</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {step === 'uploading'
              ? 'Emma uploads 2 months of expense reports and browser history...'
              : 'The detector is cross-referencing against 100+ SaaS apps...'}
          </div>
        </div>
      )}

      {/* Step 5: Findings */}
      {step === 'findings' && detectedApps.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '2px solid var(--accent)',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{detectedApps.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Unauthorized Apps</div>
          </div>
          <div
            style={{
              background: 'rgba(220,38,38,0.1)',
              border: '2px solid rgb(220,38,38)',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'rgb(220,38,38)' }}>${totalSpend}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Monthly Spend</div>
          </div>
          <div
            style={{
              background: 'rgba(245,157,11,0.1)',
              border: '2px solid rgb(245,157,11)',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'rgb(245,157,11)' }}>{criticalRisks.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Critical Risk</div>
          </div>
          <div
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '2px solid rgb(34,197,94)',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'rgb(34,197,94)' }}>{complianceAtRisk}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>PII/SSN Exposed</div>
          </div>
        </div>
      )}

      {/* Step 6: Risk Breakdown */}
      {step === 'risk-breakdown' && detectedApps.length > 0 && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>🛡️ Apps by Risk Level</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                { level: 'Critical', count: detectedApps.filter((a) => a.risk_level === 'critical').length, color: '#dc2626' },
                { level: 'High', count: detectedApps.filter((a) => a.risk_level === 'high').length, color: '#f97316' },
                { level: 'Medium', count: detectedApps.filter((a) => a.risk_level === 'medium').length, color: '#eab308' },
                { level: 'Low', count: detectedApps.filter((a) => a.risk_level === 'low').length, color: '#22c55e' },
              ].map((item) => (
                <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      background: item.color,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.95rem', flex: 1 }}>{item.level}</span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 Top 5 Most Expensive Apps</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {detectedApps.sort((a, b) => b.typical_price - a.typical_price).slice(0, 5).map((app) => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.375rem', fontSize: '0.9rem' }}>
                  <span>{app.name}</span>
                  <span style={{ fontWeight: 700, color: 'rgb(245,157,11)' }}>${app.typical_price}/mo</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Step 7: Case Study */}
      {step === 'case-study' && detectedApps.length > 0 && (
        <>
          {criticalRisks.length > 0 && (
            <div
              style={{
                background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgb(220,38,38)' }}>Critical Risk Example</h3>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    {criticalRisks[0].name} has access to sensitive employee data. This tool was signed up without IT approval, creating both a data breach risk and potential compliance violation.
                  </p>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(220,38,38,0.5)',
                      borderRadius: '0.375rem',
                      padding: '0.75rem',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <strong>Permissions:</strong> {criticalRisks[0].permissions?.join(', ') || 'Database access, API keys, User records'}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <p>
              This is the kind of shadow IT that leads to headlines: "Company exposes SSNs in unauthorized SaaS tool." Emma now has the evidence to act decisively. She can generate an audit report, notify the employee, and revoke access—all tracked and documented.
            </p>
          </div>
        </>
      )}

      {/* Step 8: Consolidation */}
      {step === 'consolidation' && detectedApps.length > 0 && (
        <div
          style={{
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>🎯 Consolidation Opportunities</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { category: 'Design Tools', apps: detectedApps.filter((a) => a.category === 'Design').length, savings: '$240/mo' },
              { category: 'Project Management', apps: detectedApps.filter((a) => a.category === 'Project Management').length, savings: '$180/mo' },
              { category: 'AI & Writing', apps: detectedApps.filter((a) => a.category === 'AI Tools').length, savings: '$150/mo' },
            ].map((item) => (
              <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.375rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.category}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.apps} different tools detected</div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgb(34,197,94)' }}>{item.savings}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 9: Cost Savings Simulation */}
      {(step === 'cost-savings' || step === 'conclusion') && detectedApps.length > 0 && (
        <>
          {step === 'cost-savings' && <Simulator detectedApps={detectedApps} />}
        </>
      )}

      {/* Step 10: Conclusion */}
      {step === 'conclusion' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ marginBottom: '1rem' }}>Demo Complete!</h2>
          <div
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              Emma now has complete visibility into shadow IT at {companyContext.name}. She can: <br />
              <strong>✓</strong> Identify all unauthorized apps<br />
              <strong>✓</strong> Assess security & compliance risks<br />
              <strong>✓</strong> Find consolidation opportunities<br />
              <strong>✓</strong> Calculate savings and ROI<br />
              <strong>✓</strong> Generate audit reports for compliance<br />
              <strong>✓</strong> Make data-driven decisions backed by evidence
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setStep('problem')}>
            🔄 Run Demo Again
          </button>
        </div>
      )}
    </div>
  );
}
