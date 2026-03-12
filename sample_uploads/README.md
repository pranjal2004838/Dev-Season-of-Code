# Sample Upload Files for Testing

These files can be uploaded to the Shadow SaaS Detector to manually test detection.

## How to use

1. Go to the **Dashboard** tab
2. Click **"Or upload files manually"**
3. Upload `sample_expenses.csv` as the Expense CSV
4. Upload `sample_browser_history.json` as the Browser History JSON
5. The app will detect ~25-30 shadow SaaS applications

## Files

| File | Description | Expected Detections |
|------|-------------|-------------------|
| `sample_expenses.csv` | 25 expense entries from 6 employees across 6 departments | ~15 SaaS apps from expenses |
| `sample_browser_history.json` | 30 browser history entries covering popular SaaS tools | ~25 SaaS apps from browsing |

## What to expect

After uploading, you should see:
- **25-30+ detected shadow SaaS apps** across categories like CRM, Design, AI, DevOps, HR
- **Risk levels** from Low to Critical
- **Monthly spend** of ~$1,000+
- **Duplicate tools** in categories like CRM (Copper + Pipedrive + Salesforce) and Project Management (Trello + Asana + Monday.com)
