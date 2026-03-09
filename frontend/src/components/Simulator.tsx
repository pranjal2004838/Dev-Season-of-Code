import { useState, useEffect, useRef } from 'react';
import {
  simulateSavings,
  type DetectedApp,
  type SimulationResult,
} from '../services/api';

interface SimulatorProps {
  detectedApps: DetectedApp[];
}

export default function Simulator({ detectedApps }: SimulatorProps) {
  // Group apps by category
  const categories: Record<string, DetectedApp[]> = {};
  for (const app of detectedApps) {
    if (!categories[app.category]) {
      categories[app.category] = [];
    }
    // Deduplicate by name within category
    if (!categories[app.category].some((a) => a.name === app.name)) {
      categories[app.category].push(app);
    }
  }

  // Only show categories with multiple apps (consolidation opportunity)
  const consolidatable = Object.entries(categories).filter(([, apps]) => apps.length > 1);

  const [keepMap, setKeepMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [cat, apps] of consolidatable) {
      initial[cat] = apps[0].name;
    }
    return initial;
  });

  const [adoption, setAdoption] = useState(80);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayMonthlySavings, setDisplayMonthlySavings] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Animate number transition
  useEffect(() => {
    if (!result) return;
    const target = result.monthlySavings;
    const start = displayMonthlySavings;
    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayMonthlySavings(Math.round((start + (target - start) * eased) * 100) / 100);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.monthlySavings]);

  // Recalculate when keepMap or adoption changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (detectedApps.length === 0) return;
      setLoading(true);
      try {
        const res = await simulateSavings(detectedApps, keepMap, adoption / 100);
        setResult(res);
      } catch (err) {
        console.error('Savings simulation error:', err);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [detectedApps, keepMap, adoption]);

  const handleKeepChange = (category: string, appName: string) => {
    setKeepMap((prev) => ({ ...prev, [category]: appName }));
  };

  if (detectedApps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        <p>Upload data first to see savings simulation.</p>
      </div>
    );
  }

  return (
    <div data-testid="simulator">
      <div className="section-header">
        <h2>💰 Savings Simulator</h2>
        {loading && <div className="spinner" style={{ width: '1rem', height: '1rem' }} />}
      </div>

      <div className="simulator-container">
        {/* Left Panel: Category Selection */}
        <div className="simulator-panel">
          <h3>Choose Apps to Keep per Category</h3>

          {consolidatable.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No duplicate categories found. All apps are unique.
            </p>
          ) : (
            consolidatable.map(([category, apps]) => (
              <div key={category} className="category-group">
                <h4>{category} ({apps.length} apps)</h4>
                {apps.map((app) => (
                  <label key={app.name} className="radio-item">
                    <input
                      type="radio"
                      name={`keep-${category}`}
                      checked={keepMap[category] === app.name}
                      onChange={() => handleKeepChange(category, app.name)}
                    />
                    <span>{app.name}</span>
                    <span className="price">${app.typical_price}/mo</span>
                  </label>
                ))}
              </div>
            ))
          )}

          {/* Adoption Slider */}
          <div className="slider-container">
            <label>
              <span>Adoption Rate</span>
              <span>{adoption}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={adoption}
              onChange={(e) => setAdoption(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>0% — No change</span>
              <span>100% — Full adoption</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="simulator-panel">
          <h3>Projected Savings</h3>

          <div className="savings-display">
            <div className="savings-label">Monthly Savings</div>
            <div className="savings-amount" data-testid="monthly-savings">
              ${displayMonthlySavings.toFixed(2)}
            </div>
            <div className="savings-annual">
              Annual: <strong>${result ? result.annualSavings.toFixed(2) : '0.00'}</strong>
            </div>
          </div>

          {/* Breakdown Table */}
          {result && result.breakdown.length > 0 && (
            <table className="breakdown-table" data-testid="breakdown-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Keep</th>
                  <th>Remove</th>
                  <th>Save</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.category}>
                    <td>{row.category}</td>
                    <td style={{ color: 'var(--success)' }}>{row.keptApp}</td>
                    <td>{row.removedApps.join(', ')}</td>
                    <td className="saved-amount">${row.saved.toFixed(2)}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
