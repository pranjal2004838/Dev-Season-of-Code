import { useState, useEffect, useCallback } from 'react';
import { uploadFiles, type DetectedApp } from '../services/api';
import PlaybookModal from '../components/PlaybookModal';
import Simulator from '../components/Simulator';
import { showToast } from '../components/Toast';

type DemoStep =
  | 'intro'
  | 'uploading'
  | 'dashboard'
  | 'playbook-open'
  | 'playbook-revoked'
  | 'simulator'
  | 'done';

export default function DemoStory() {
  const [step, setStep] = useState<DemoStep>('intro');
  const [detectedApps, setDetectedApps] = useState<DetectedApp[]>([]);
  const [revokedApps, setRevokedApps] = useState<Set<string | number>>(new Set());
  const [selectedApp, setSelectedApp] = useState<DetectedApp | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);

  const runUpload = useCallback(async () => {
    setStep('uploading');
    showToast('Uploading demo data...', 'info');
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

      const result = await uploadFiles(expFile, brFile);
      setDetectedApps(result.detectedApps);
      setStep('dashboard');
      showToast(`Found ${result.totalApps} shadow SaaS apps!`, 'success');
    } catch (err) {
      showToast('Demo upload failed. Start backend and try again.', 'error');
      console.error(err);
      setStep('intro');
    }
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!autoPlay) return;
    let timer: ReturnType<typeof setTimeout>;

    if (step === 'dashboard' && detectedApps.length > 0) {
      timer = setTimeout(() => {
        // Find high-risk app (Recruiting Bot)
        const highRisk = detectedApps.find(
          (a) => a.risk_level === 'critical' || a.name.includes('Recruiting')
        ) || detectedApps[0];
        setSelectedApp(highRisk);
        setStep('playbook-open');
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [autoPlay, step, detectedApps]);

  const narrativeText: Record<DemoStep, string> = {
    intro: "Meet Emma, IT Manager at GrowthLabs. She suspects employees are using unauthorized SaaS tools, costing the company $500+/month and exposing sensitive data. Let's help her find out.",
    uploading: "Emma uploads her company's expense reports and browser history data...",
    dashboard: "The Shadow SaaS Detector reveals hidden applications across departments. Notice the risk levels and monthly costs. Let's investigate the high-risk app.",
    'playbook-open': "Emma opens the Playbook for the high-risk app. She can see evidence, data permissions, and generate a revoke email — all in DEMO MODE.",
    'playbook-revoked': "Access has been simulated as revoked! The audit trail is logged. Emma can undo within 30 seconds if needed.",
    simulator: "Now Emma uses the Savings Simulator to see how much GrowthLabs could save by consolidating duplicate tools across categories.",
    done: "Emma has a complete picture: $500+/month in shadow SaaS, critical security risks identified, and a clear path to savings. Ready for the board meeting! 🎉",
  };

  return (
    <div>
      {/* Story Narrative Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '0.75rem',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem', fontWeight: 600 }}>
              📖 Emma's Story — {step.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {narrativeText[step]}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {step === 'intro' && (
              <>
                <button className="btn btn-primary btn-sm" onClick={runUpload}>
                  ▶ Start Demo
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setAutoPlay(true); runUpload(); }}
                >
                  ⏩ Auto Play
                </button>
              </>
            )}

            {step === 'dashboard' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const risk = detectedApps.find(
                    (a) => a.risk_level === 'critical' || a.name.includes('Recruiting')
                  ) || detectedApps[0];
                  setSelectedApp(risk);
                  setStep('playbook-open');
                }}
              >
                🛡️ Open Playbook
              </button>
            )}

            {(step === 'playbook-revoked' || step === 'playbook-open') && !selectedApp && (
              <button className="btn btn-primary btn-sm" onClick={() => setStep('simulator')}>
                💰 Open Simulator
              </button>
            )}

            {step === 'simulator' && (
              <button className="btn btn-primary btn-sm" onClick={() => setStep('done')}>
                ✅ Wrap Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Uploading State */}
      {step === 'uploading' && (
        <div className="loading">
          <div className="spinner" />
        </div>
      )}

      {/* Dashboard View */}
      {(step === 'dashboard' || step === 'playbook-open' || step === 'playbook-revoked') &&
        detectedApps.length > 0 && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Apps</div>
                <div className="stat-value text-accent">{detectedApps.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Monthly Spend</div>
                <div className="stat-value text-warning">
                  ${detectedApps.reduce((s, a) => s + a.typical_price, 0)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">High Risk</div>
                <div className="stat-value text-danger">
                  {detectedApps.filter((a) => a.risk_level === 'high' || a.risk_level === 'critical').length}
                </div>
              </div>
            </div>

            <div className="apps-grid">
              {detectedApps.map((app) => (
                <div
                  key={app.id}
                  className={`app-card ${revokedApps.has(app.id) ? 'revoked' : ''}`}
                >
                  <div className="app-card-header">
                    <h3>{app.name}</h3>
                    <span className={`risk-badge ${app.risk_level || 'low'}`}>
                      {app.risk_level || 'unknown'}
                    </span>
                  </div>
                  <div className="app-card-meta">
                    <span>📁 {app.category}</span>
                    {app.employee && <span>👤 {app.employee}</span>}
                  </div>
                  <div className="app-card-price">${app.typical_price}/mo</div>
                  <div className="app-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setSelectedApp(app); setStep('playbook-open'); }}
                      disabled={revokedApps.has(app.id)}
                    >
                      🛡️ Playbook
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      {/* Simulator View */}
      {(step === 'simulator' || step === 'done') && detectedApps.length > 0 && (
        <Simulator detectedApps={detectedApps} />
      )}

      {/* Done */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '2rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3>Demo Complete!</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Shadow SaaS Detector identified unauthorized apps, revoked access (demo), and calculated potential savings.
          </p>
        </div>
      )}

      {/* Playbook Modal */}
      {selectedApp && (
        <PlaybookModal
          app={selectedApp}
          onClose={() => {
            setSelectedApp(null);
            if (step === 'playbook-open') setStep('playbook-revoked');
          }}
          onRevoked={(appId) => {
            setRevokedApps((prev) => new Set(prev).add(appId));
            setStep('playbook-revoked');
          }}
          onUndone={(appId) => {
            setRevokedApps((prev) => {
              const next = new Set(prev);
              next.delete(appId);
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
