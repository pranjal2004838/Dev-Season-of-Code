# 🔍 Shadow SaaS Detector - Complete Hackathon Project Guide

You have all the information to build a winning hackathon project. Here's your quick reference.

---

## 📚 DOCUMENTATION FILES IN THIS REPO

1. **PROJECT_BRIEF.md** ← START HERE
   - Real-life example (Emma's story)
   - Complete problem explanation
   - What the final product looks like
   - Why this will win

2. **TECH_SETUP.md** ← Read next
   - Technology explanations (what each tool does)
   - Installation instructions
   - File structure
   - Sample code snippets

3. **8_DAY_ROADMAP.md** ← Follow this day-by-day
   - Exact breakdown: hour-by-hour
   - What to code each day
   - Code snippets for each feature
   - Deployment instructions

4. **test_data/** ← Use to test
   - expenses.csv (sample spending data)
   - browser_history.json (sample browser history)
   - roster.csv (sample company roster)

---

## ⚡ QUICK START (If You Know the Idea, Read This)

### The Problem
Startups lose $300-500/month to unauthorized SaaS tools employees use without approval:
- John secretly uses Copper CRM ($50/month)
- Sarah uses Figma ($120/month) instead of team plan
- Marketing uses 3 different AI tools ($150/month)
- HR tool has access to employee phone numbers (SECURITY RISK)

**Result:** Money wasted, data exposed, compliance violated.

### The Solution
Users upload:
- Expense reports (CSV)
- Browser history (JSON)  
- OAuth apps list (JSON)

Your tool detects:
- What unauthorized SaaS is being used
- Which ones are risky (data permissions)
- Duplicate tools (consolidation opportunity)
- How much money to save

Users get:
- Beautiful dashboard with risk scores
- Recommendations (block, consolidate, approve)
- PDF report showing savings opportunity
- Department-level breakdown

### Tech Stack
```
Frontend:  React.js (UI, file upload, dashboard)
Backend:   Node.js + Express (processing, detection)
Database:  JSON file (SaaS app database)
Deploy:    Vercel (frontend), Heroku (backend)
```

### 8-Day Timeline
```
Day 1: Setup + Database (8h)
Day 2: Upload Form UI (8h)
Day 3: Detection Engine (8h)
Day 4: Recommendations (8h)
Day 5: Dashboard UI (8h)
Day 6: Export + Polish (8h)
Day 7: Demo + Docs (8h)
Day 8: Deploy + Submit (8h)
─────────────────────────────
Total: 64 hours → Hackathon Win!
```

---

## 🚀 HOW TO WIN

### 1. **Judges Care About (in order):**
1. **Does it solve a real problem?** YES - Emma's problem is real for 100K+ IT managers
2. **Does it work end-to-end?** YES - Upload file → See results → Download report
3. **Is it polished?** YES - Beautiful UI + no bugs
4. **Is it marketable?** YES - $50-100/month SaaS for SMBs
5. **Is code quality good?** YES - Clean, documented, easy to understand

### 2. **How to Stand Out:**
- ✅ Focus on depth, not breadth (perfect for one use case)
- ✅ Show real impact (demo saves $320/month)
- ✅ Tell a story (Emma's problem → your solution → her savings)
- ✅ Polish the UI (beautiful = memorable)
- ✅ Make demo 2-3 minutes (not longer)

### 3. **Don't Waste Time On:**
- ❌ AI/ML (judges don't care, complex to build)
- ❌ Perfect database (JSON file is enough)
- ❌ User authentication (not needed for MVP)
- ❌ Mobile app (web is enough)
- ❌ Complex architecture (simple = better)

---

## 📋 BEFORE YOU START

### Prerequisites (Stuff to Know)
- [ ] Basic JavaScript (variables, functions, loops)
- [ ] HTML/CSS basics (forms, styling)
- [ ] Git/GitHub (to submit code)
- [ ] Terminal commands (npm, node, git)

**Don't know these?** YouTube 2-hour courses exist for each. You have 8 days.

### Tools to Install
- [ ] Node.js (includes npm)
- [ ] Code editor (VS Code) ✓ You have this
- [ ] Git command line
- [ ] GitHub account (free)
- [ ] Heroku account (free tier)
- [ ] Vercel account (free tier)

### Test Data Ready
I've created sample files for you:
```
test_data/
├── expenses.csv         (13 rows, expense report)
├── browser_history.json (18 entries, browser history)
└── roster.csv           (10 employees)
```
Use these to test without real company data.

---

## 🎯 EXECUTION PLAN

### Week Structure (If you have 8 days)
```
Day 1-2: Build foundation (setup + upload)
Day 3-5: Build logic (detection + UI)
Day 6-7: Polish + demo
Day 8: Deploy + submit

Each day: 8 hours focused work
Take breaks, stay hydrated, celebrate wins!
```

### Daily Checklist Template
```
Day N:
[ ] Read hour-by-hour plan in 8_DAY_ROADMAP.md
[ ] Code each hour step
[ ] Test at end of day
[ ] Git commit with message
[ ] Note any blockers
```

---

## 💻 GETTING STARTED NOW

### Step 1: Read the Full Brief (15 min)
Open PROJECT_BRIEF.md in your editor and read the Emma's story section.

### Step 2: Understand the Tech (30 min)
Read TECH_SETUP.md to learn what each technology does.

### Step 3: Follow Day 1 Instructions (8 hours)
Open 8_DAY_ROADMAP.md and follow the Day 1 section exactly.

### Step 4: Use Sample Data to Test (During coding)
The test_data/ folder has ready-to-use sample CSV/JSON files.

---

## 🔑 KEY SUCCESS FACTORS

### 1. **Keep It Simple**
- Don't add ML, blockchain, cryptocurrencies
- Pattern matching + rule engine = winner
- Focus on UX/story, not complexity

### 2. **Demo Everything Visually**
Judges watch videos. Make yours:
- Beautiful (good colors, fonts, layout)
- Clear (pain → solution path)
- Concise (2-3 minutes only)

### 3. **Polish the UI**
Spend 6-8 hours on design.
- Consistent colors (check out Tailwind CSS)
- Clear labels and icons
- Mobile responsive
- Fast (no 10-second loads)

### 4. **Write Great Documentation**
Judges read READMEs.
Include: Problem, Solution, Tech Stack, How to Run, Features

### 5. **Show Metrics**
Judges love numbers:
- "Saves $300-800/month"
- "Detects 500+ SaaS apps"
- "Identifies high-risk data access"

---

## ✅ SUBMISSION CHECKLIST (Day 8)

Before clicking submit:

**Code:**
- [ ] GitHub repo has clean code
- [ ] README is complete
- [ ] No broken code

**Deployment:**
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Heroku
- [ ] Both URLs work

**Demo:**
- [ ] Video recorded (2-3 min)
- [ ] Uploaded to YouTube

**Submission Form:**
- [ ] Project title filled
- [ ] Problem statement clear
- [ ] All URLs work
- [ ] Screenshot included

---

## 📖 READING ORDER

If this is your first time:
1. **PROJECT_BRIEF.md** (understand the problem)
2. **This page** (overview)
3. **TECH_SETUP.md** (tech basics)
4. **8_DAY_ROADMAP.md** (start building)
5. **test_data/** (for testing)

**Estimated time to understand: 2 hours**  
**Estimated time to build: 64 hours (8 days)**  
**Estimated prize: $750-2,000**  

Ready? Let's build! 🚀