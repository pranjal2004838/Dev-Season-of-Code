import { useState, useRef } from 'react';
import { uploadFiles, type DetectedApp } from '../services/api';
import PlaybookModal from './PlaybookModal';
import { showToast } from './Toast';

interface DashboardProps {
  detectedApps: DetectedApp[];
  setDetectedApps: (apps: DetectedApp[]) => void;
  revokedApps: Set<string | number>;
  setRevokedApps: React.Dispatch<React.SetStateAction<Set<string | number>>>;
}

export default function Dashboard({
  detectedApps,
  setDetectedApps,
  revokedApps,
  setRevokedApps,
}: DashboardProps) {
  const [expensesFile, setExpensesFile] = useState<File | null>(null);
  const [browserFile, setBrowserFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<DetectedApp | null>(null);
  const expRef = useRef<HTMLInputElement>(null);
  const brRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!expensesFile && !browserFile) {
      showToast('Please select at least one file', 'error');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFiles(expensesFile, browserFile);
      setDetectedApps(res.detectedApps);
      showToast(`Detected ${res.totalApps} shadow SaaS apps!`, 'success');
    } catch (err) {
      showToast('Upload failed. Check your files and try again.', 'error');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRevoked = (appId: string | number, _revokeId: string) => {
    setRevokedApps((prev) => new Set(prev).add(appId));
  };

  const handleUndone = (appId: string | number) => {
    setRevokedApps((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      return next;
    });
  };

  const totalSpend = detectedApps.reduce((s, a) => s + a.typical_price, 0);
  const highRiskCount = detectedApps.filter(
    (a) => a.risk_level === 'high' || a.risk_level === 'critical'
  ).length;

  return (
    <div>
      {/* Upload Section */}
      {detectedApps.length === 0 && (
        <div className="upload-section" data-testid="upload-section">
          <h2>📂 Upload Company Data</h2>
          <p>Upload expense reports and browser history to detect shadow SaaS</p>
          <div className="upload-controls">
            <div className="file-input-wrapper">
              <input
                ref={expRef}
                type="file"
                accept=".csv"
                id="expenses-file"
                data-testid="expenses-input"
                onChange={(e) => setExpensesFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="expenses-file" className="file-label">
                📄 {expensesFile ? <span className="file-name">{expensesFile.name}</span> : 'Expenses CSV'}
              </label>
            </div>

            <div className="file-input-wrapper">
              <input
                ref={brRef}
                type="file"
                accept=".json"
                id="browser-file"
                data-testid="browser-input"
                onChange={(e) => setBrowserFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="browser-file" className="file-label">
                🌐 {browserFile ? <span className="file-name">{browserFile.name}</span> : 'Browser History JSON'}
              </label>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading || (!expensesFile && !browserFile)}
              data-testid="upload-btn"
            >
              {uploading ? '🔍 Analyzing...' : '🚀 Detect Shadow SaaS'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {detectedApps.length > 0 && (
        <>
          <div className="stats-grid" data-testid="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Apps Detected</div>
              <div className="stat-value text-accent">{detectedApps.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Monthly Spend</div>
              <div className="stat-value text-warning">${totalSpend}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">High Risk</div>
              <div className="stat-value text-danger">{highRiskCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Categories</div>
              <div className="stat-value text-success">
                {new Set(detectedApps.map((a) => a.category)).size}
              </div>
            </div>
          </div>

          {/* App Cards */}
          <div className="section-header">
            <h2>🔍 Detected Shadow SaaS</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setDetectedApps([]);
                setRevokedApps(new Set());
                if (expRef.current) expRef.current.value = '';
                if (brRef.current) brRef.current.value = '';
                setExpensesFile(null);
                setBrowserFile(null);
              }}
            >
              ↻ Reset
            </button>
          </div>

          <div className="apps-grid" data-testid="apps-grid">
            {detectedApps.map((app) => (
              <div
                key={app.id}
                className={`app-card ${revokedApps.has(app.id) ? 'revoked' : ''}`}
                data-testid={`app-card-${app.id}`}
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
                  {app.department && <span>🏢 {app.department}</span>}
                </div>

                <div className="app-card-price">${app.typical_price}/mo</div>

                {app.data_permissions && app.data_permissions.length > 0 && (
                  <div className="permissions-list" style={{ marginBottom: '0.75rem' }}>
                    {app.data_permissions.map((p) => (
                      <span key={p} className="permission-tag">{p}</span>
                    ))}
                  </div>
                )}

                <div className="app-card-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedApp(app)}
                    data-testid={`playbook-btn-${app.id}`}
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

      {/* Playbook Modal */}
      {selectedApp && (
        <PlaybookModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onRevoked={handleRevoked}
          onUndone={handleUndone}
        />
      )}
    </div>
  );
}
