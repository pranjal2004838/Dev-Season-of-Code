import { useState, useEffect } from 'react';
import type { DetectedApp } from '../services/api';

interface ThreatTickerProps {
  detectedApps: DetectedApp[];
}

const THREAT_MESSAGES = (app: DetectedApp): string[] => {
  const msgs: string[] = [];
  if (app.risk_level === 'critical') msgs.push(`🚨 CRITICAL: ${app.name} has access to sensitive data`);
  if (app.risk_level === 'high') msgs.push(`⚠️ HIGH RISK: ${app.name} detected in ${app.department || 'unknown'} dept`);
  if (app.data_permissions?.includes('pii')) msgs.push(`🔐 PII EXPOSURE: ${app.name} accesses personal identifiable information`);
  if (app.data_permissions?.includes('bank_info')) msgs.push(`💳 FINANCIAL RISK: ${app.name} has bank data access`);
  if (app.data_permissions?.includes('ssn')) msgs.push(`🆔 SSN EXPOSURE: ${app.name} stores social security numbers`);
  if (app.data_permissions?.includes('passwords') || app.data_permissions?.includes('secrets')) msgs.push(`🔑 CREDENTIAL RISK: ${app.name} manages passwords/secrets`);
  if (msgs.length === 0) msgs.push(`📡 DETECTED: ${app.name} ($${app.typical_price}/mo) — ${app.category}`);
  return msgs;
};

export default function ThreatTicker({ detectedApps }: ThreatTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Generate all threat messages
  const allMessages = detectedApps.flatMap(THREAT_MESSAGES);

  useEffect(() => {
    if (allMessages.length <= 1) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % allMessages.length);
        setIsVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [allMessages.length]);

  if (detectedApps.length === 0 || allMessages.length === 0) return null;

  const highRisk = detectedApps.filter(a => a.risk_level === 'critical' || a.risk_level === 'high').length;

  return (
    <div className="threat-ticker" data-testid="threat-ticker">
      <div className="ticker-status">
        <span className="ticker-pulse" />
        <span className="ticker-label">LIVE THREAT FEED</span>
        <span className="ticker-count">{highRisk} alerts</span>
      </div>
      <div className={`ticker-message ${isVisible ? 'visible' : 'hidden'}`}>
        {allMessages[currentIndex]}
      </div>
    </div>
  );
}
