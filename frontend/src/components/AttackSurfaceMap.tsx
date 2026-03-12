import { useState, useMemo, useCallback } from 'react';
import type { DetectedApp } from '../services/api';

interface AttackSurfaceMapProps {
  detectedApps: DetectedApp[];
}

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  risk: string;
  category: string;
  price: number;
  department: string;
  permissions: string[];
  type: 'app' | 'data' | 'department';
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'data-flow' | 'department' | 'duplicate';
  risk: string;
}

const RISK_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

function getDataNodes(apps: DetectedApp[]): string[] {
  const dataSet = new Set<string>();
  for (const app of apps) {
    const perms = app.data_permissions || [];
    for (const p of perms) {
      const normalized = p.toLowerCase();
      if (normalized.includes('pii') || normalized.includes('ssn') || normalized.includes('phone') || normalized.includes('contact'))
        dataSet.add('PII');
      else if (normalized.includes('credential') || normalized.includes('password') || normalized.includes('api key'))
        dataSet.add('Credentials');
      else if (normalized.includes('financial') || normalized.includes('payroll') || normalized.includes('tax') || normalized.includes('expense') || normalized.includes('receipt'))
        dataSet.add('Financial');
      else if (normalized.includes('employee') || normalized.includes('record'))
        dataSet.add('Employee Records');
      else
        dataSet.add('Documents');
    }
    if (perms.length === 0) dataSet.add('Documents');
  }
  return Array.from(dataSet);
}

function getAppDataType(app: DetectedApp): string[] {
  const types: string[] = [];
  const perms = (app.data_permissions || []).join(' ').toLowerCase();
  if (perms.includes('pii') || perms.includes('ssn') || perms.includes('phone') || perms.includes('contact')) types.push('PII');
  if (perms.includes('credential') || perms.includes('password') || perms.includes('api key')) types.push('Credentials');
  if (perms.includes('financial') || perms.includes('payroll') || perms.includes('tax') || perms.includes('expense') || perms.includes('receipt')) types.push('Financial');
  if (perms.includes('employee') || perms.includes('record')) types.push('Employee Records');
  if (types.length === 0) types.push('Documents');
  return types;
}

export default function AttackSurfaceMap({ detectedApps }: AttackSurfaceMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'risk' | 'data-flow' | 'blast-radius'>('risk');

  const WIDTH = 900;
  const HEIGHT = 600;
  const CX = WIDTH / 2;
  const CY = HEIGHT / 2;

  const { nodes, edges } = useMemo(() => {
    const n: GraphNode[] = [];
    const e: GraphEdge[] = [];

    if (detectedApps.length === 0) return { nodes: n, edges: e };

    // Position data type nodes in inner ring
    const dataTypes = getDataNodes(detectedApps);
    const innerRadius = 100;
    dataTypes.forEach((dt, i) => {
      const angle = (2 * Math.PI * i) / dataTypes.length - Math.PI / 2;
      n.push({
        id: `data-${dt}`,
        label: dt,
        x: CX + innerRadius * Math.cos(angle),
        y: CY + innerRadius * Math.sin(angle),
        risk: dt === 'PII' || dt === 'Credentials' ? 'critical' : dt === 'Financial' ? 'high' : 'low',
        category: 'Data',
        price: 0,
        department: '',
        permissions: [],
        type: 'data',
      });
    });

    // Position app nodes in outer ring
    const outerRadius = 240;
    detectedApps.forEach((app, i) => {
      const angle = (2 * Math.PI * i) / detectedApps.length - Math.PI / 2;
      const nodeId = `app-${app.id}`;
      n.push({
        id: nodeId,
        label: app.name,
        x: CX + outerRadius * Math.cos(angle),
        y: CY + outerRadius * Math.sin(angle),
        risk: app.risk_level || 'low',
        category: app.category,
        price: app.typical_price,
        department: app.department || 'Unknown',
        permissions: app.data_permissions || [],
        type: 'app',
      });

      // Create edges from apps to data types
      const appDataTypes = getAppDataType(app);
      for (const dt of appDataTypes) {
        e.push({
          from: nodeId,
          to: `data-${dt}`,
          type: 'data-flow',
          risk: app.risk_level || 'low',
        });
      }
    });

    // Create duplicate edges between apps in same category
    const byCategory: Record<string, string[]> = {};
    detectedApps.forEach((app) => {
      if (!byCategory[app.category]) byCategory[app.category] = [];
      byCategory[app.category].push(`app-${app.id}`);
    });
    for (const cat in byCategory) {
      const ids = byCategory[cat];
      if (ids.length >= 2) {
        for (let i = 0; i < ids.length - 1; i++) {
          e.push({ from: ids[i], to: ids[i + 1], type: 'duplicate', risk: 'medium' });
        }
      }
    }

    return { nodes: n, edges: e };
  }, [detectedApps, CX, CY]);

  const isNodeHighlighted = useCallback(
    (nodeId: string) => {
      if (!hoveredNode && !selectedNode) return true;
      const active = selectedNode || hoveredNode;
      if (nodeId === active) return true;
      return edges.some(
        (e) => (e.from === active && e.to === nodeId) || (e.to === active && e.from === nodeId)
      );
    },
    [hoveredNode, selectedNode, edges]
  );

  const isEdgeHighlighted = useCallback(
    (edge: GraphEdge) => {
      if (!hoveredNode && !selectedNode) return true;
      const active = selectedNode || hoveredNode;
      return edge.from === active || edge.to === active;
    },
    [hoveredNode, selectedNode]
  );

  const activeNode = useMemo(() => {
    const id = selectedNode || hoveredNode;
    return id ? nodes.find((n) => n.id === id) : null;
  }, [selectedNode, hoveredNode, nodes]);

  const connectedApps = useMemo(() => {
    if (!activeNode) return [];
    return edges
      .filter((e) => e.from === activeNode.id || e.to === activeNode.id)
      .map((e) => {
        const targetId = e.from === activeNode.id ? e.to : e.from;
        return nodes.find((n) => n.id === targetId);
      })
      .filter(Boolean) as GraphNode[];
  }, [activeNode, edges, nodes]);

  // Stats
  const criticalPaths = edges.filter((e) => e.risk === 'critical').length;
  const dataExposures = nodes.filter((n) => n.type === 'data').length;
  const duplicateLinks = edges.filter((e) => e.type === 'duplicate').length;

  if (detectedApps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
        <h3>Attack Surface Map</h3>
        <p style={{ marginTop: '0.5rem' }}>Upload data from the Dashboard tab to visualize your attack surface.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Stats */}
      <div className="attack-map-header">
        <div className="attack-map-stats">
          <div className="attack-stat">
            <span className="attack-stat-value" style={{ color: '#dc2626' }}>{criticalPaths}</span>
            <span className="attack-stat-label">Critical Data Paths</span>
          </div>
          <div className="attack-stat">
            <span className="attack-stat-value" style={{ color: '#f97316' }}>{dataExposures}</span>
            <span className="attack-stat-label">Data Types Exposed</span>
          </div>
          <div className="attack-stat">
            <span className="attack-stat-value" style={{ color: '#eab308' }}>{duplicateLinks}</span>
            <span className="attack-stat-label">Duplicate Services</span>
          </div>
          <div className="attack-stat">
            <span className="attack-stat-value" style={{ color: '#3b82f6' }}>{detectedApps.length}</span>
            <span className="attack-stat-label">Shadow Apps</span>
          </div>
        </div>
        <div className="attack-map-controls">
          {(['risk', 'data-flow', 'blast-radius'] as const).map((mode) => (
            <button
              key={mode}
              className={`attack-mode-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'risk' ? '🎯 Risk View' : mode === 'data-flow' ? '🔀 Data Flow' : '💥 Blast Radius'}
            </button>
          ))}
        </div>
      </div>

      <div className="attack-map-container">
        {/* SVG Graph */}
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="attack-surface-svg"
          onClick={() => setSelectedNode(null)}
        >
          <defs>
            {/* Glow filters */}
            <filter id="glow-critical">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#dc2626" floodOpacity="0.6" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-high">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#f97316" floodOpacity="0.5" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-selected">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor="#3b82f6" floodOpacity="0.8" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Animated dash for data flow */}
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="0.5" />
          </pattern>
          <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" rx="12" />

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const highlighted = isEdgeHighlighted(edge);
            const color = edge.type === 'duplicate'
              ? '#a855f7'
              : RISK_COLORS[edge.risk] || '#64748b';

            return (
              <line
                key={`edge-${i}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={color}
                strokeWidth={highlighted ? (edge.risk === 'critical' ? 2.5 : 1.5) : 0.5}
                strokeOpacity={highlighted ? 0.8 : 0.1}
                strokeDasharray={edge.type === 'duplicate' ? '6,4' : viewMode === 'data-flow' ? '4,2' : 'none'}
                className={viewMode === 'data-flow' && highlighted ? 'edge-animated' : ''}
              />
            );
          })}

          {/* Blast radius circles */}
          {viewMode === 'blast-radius' && activeNode && (
            <>
              <circle cx={activeNode.x} cy={activeNode.y} r={80} fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.2)" strokeWidth="1" className="blast-ring" />
              <circle cx={activeNode.x} cy={activeNode.y} r={150} fill="rgba(220,38,38,0.04)" stroke="rgba(220,38,38,0.1)" strokeWidth="1" className="blast-ring-outer" />
            </>
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const highlighted = isNodeHighlighted(node.id);
            const isActive = node.id === (selectedNode || hoveredNode);
            const color = RISK_COLORS[node.risk] || '#64748b';
            const radius = node.type === 'data' ? 22 : isActive ? 18 : 14;
            const glowFilter = isActive
              ? 'url(#glow-selected)'
              : node.risk === 'critical'
              ? 'url(#glow-critical)'
              : node.risk === 'high'
              ? 'url(#glow-high)'
              : 'none';

            return (
              <g
                key={node.id}
                style={{
                  opacity: highlighted ? 1 : 0.15,
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node.id === selectedNode ? null : node.id);
                }}
              >
                {/* Node circle */}
                {node.type === 'data' ? (
                  <polygon
                    points={`${node.x},${node.y - radius} ${node.x + radius},${node.y} ${node.x},${node.y + radius} ${node.x - radius},${node.y}`}
                    fill={`${color}22`}
                    stroke={color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    filter={glowFilter}
                  />
                ) : (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={`${color}22`}
                    stroke={color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    filter={glowFilter}
                  />
                )}

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + radius + 14}
                  textAnchor="middle"
                  fill={highlighted ? '#f1f5f9' : '#64748b'}
                  fontSize={node.type === 'data' ? 11 : 10}
                  fontWeight={node.type === 'data' || isActive ? 600 : 400}
                >
                  {node.label.length > 14 ? node.label.slice(0, 12) + '…' : node.label}
                </text>

                {/* Risk indicator dot */}
                {node.type === 'app' && node.risk === 'critical' && (
                  <circle cx={node.x + radius - 2} cy={node.y - radius + 2} r={4} fill="#dc2626" className="pulse-dot" />
                )}
              </g>
            );
          })}

          {/* Center label */}
          <text x={CX} y={CY - 8} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight={600} letterSpacing="0.1em">
            ATTACK
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight={600} letterSpacing="0.1em">
            SURFACE
          </text>
        </svg>

        {/* Info Panel */}
        {activeNode && (
          <div className="attack-info-panel">
            <div className="attack-info-header">
              <span className={`risk-badge ${activeNode.risk}`}>{activeNode.risk}</span>
              <h3>{activeNode.label}</h3>
            </div>

            {activeNode.type === 'app' && (
              <>
                <div className="attack-info-row">
                  <span className="attack-info-label">Category</span>
                  <span>{activeNode.category}</span>
                </div>
                <div className="attack-info-row">
                  <span className="attack-info-label">Department</span>
                  <span>{activeNode.department}</span>
                </div>
                <div className="attack-info-row">
                  <span className="attack-info-label">Monthly Cost</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>${activeNode.price}/mo</span>
                </div>
                <div className="attack-info-row">
                  <span className="attack-info-label">Data Access</span>
                  <div className="attack-permissions">
                    {activeNode.permissions.map((p, i) => (
                      <span key={i} className="attack-perm-tag">{p}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeNode.type === 'data' && (
              <div className="attack-info-row">
                <span className="attack-info-label">Exposed To</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{connectedApps.length} apps</span>
              </div>
            )}

            <div className="attack-connected">
              <span className="attack-info-label">
                {activeNode.type === 'data' ? 'Apps with access' : 'Connected data types'}
              </span>
              {connectedApps.slice(0, 6).map((n) => (
                <div
                  key={n.id}
                  className="attack-connected-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(n.id);
                  }}
                >
                  <span
                    className="attack-connected-dot"
                    style={{ background: RISK_COLORS[n.risk] || '#64748b' }}
                  />
                  <span>{n.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
