export interface DetectedApp {
  id: number | string;
  name: string;
  category: string;
  typical_price: number;
  risk_level?: string;
  employee?: string;
  department?: string;
  evidence?: string[];
  data_permissions?: string[];
}

export interface SavingsBreakdown {
  category: string;
  keptApp: string;
  removedApps: string[];
  saved: number;
}

export interface SimulationResult {
  monthlySavings: number;
  annualSavings: number;
  breakdown: SavingsBreakdown[];
}

export function simulateSavings(
  detectedApps: DetectedApp[],
  keepMap: Record<string, string>,
  adoption: number = 1.0
): SimulationResult {
  // Group apps by category
  const categories: Record<string, DetectedApp[]> = {};
  for (const app of detectedApps) {
    if (!categories[app.category]) {
      categories[app.category] = [];
    }
    categories[app.category].push(app);
  }

  const breakdown: SavingsBreakdown[] = [];
  let totalMonthlySavings = 0;

  for (const [category, apps] of Object.entries(categories)) {
    if (apps.length <= 1) continue; // No consolidation possible

    const keptAppName = keepMap[category] || apps[0].name;
    const removedApps: string[] = [];
    let categorySaved = 0;

    // Deduplicate by app name to avoid counting the same app twice
    const uniqueApps = new Map<string, DetectedApp>();
    for (const app of apps) {
      if (!uniqueApps.has(app.name)) {
        uniqueApps.set(app.name, app);
      }
    }

    for (const [name, app] of uniqueApps) {
      if (name !== keptAppName) {
        removedApps.push(name);
        categorySaved += app.typical_price;
      }
    }

    if (removedApps.length > 0) {
      breakdown.push({
        category,
        keptApp: keptAppName,
        removedApps,
        saved: Math.round(categorySaved * adoption * 100) / 100,
      });
      totalMonthlySavings += categorySaved;
    }
  }

  const adjustedMonthly = Math.round(totalMonthlySavings * adoption * 100) / 100;

  return {
    monthlySavings: adjustedMonthly,
    annualSavings: Math.round(adjustedMonthly * 12 * 100) / 100,
    breakdown,
  };
}
