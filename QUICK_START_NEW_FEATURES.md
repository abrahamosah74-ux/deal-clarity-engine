# ⚡ Deal Clarity - Feature Quick Start Guide

## 🚀 Getting Started with New Features

### First Time Setup
1. **Update your local copy**
   ```bash
   git pull origin main
   cd frontend && npm install --legacy-peer-deps
   ```

2. **No backend changes needed** - All endpoints are live!

3. **Access new features** from the left sidebar navigation

---

## 🎯 Feature Tour (5 Minutes)

### 1️⃣ **Kanban Pipeline** (2 min)
- Click **Pipeline** in sidebar
- Click "New Deal" to create a deal
- Drag deals between columns or use dropdown to change stage
- View total pipeline value at bottom

**Perfect for:** Sales managers monitoring progress

---

### 2️⃣ **Task Notifications** (1 min)
- Click **Notifications** in sidebar
- See today's tasks with urgency levels
- Click "Mark Done" to complete task
- Configure notification preferences

**Perfect for:** Never missing a deadline

---

### 3️⃣ **Bulk Import Contacts** (1 min)
- Click **Import/Export** in sidebar
- Download CSV template
- Fill in contact data
- Upload file and review preview
- Click "Import X Contacts"

**Perfect for:** Adding 100+ contacts at once

---

### 4️⃣ **Send Bulk Emails** (1 min)
- Click **Email** in sidebar
- Select email template or write custom
- Choose recipients (or "Select All")
- Click "Send"

**Perfect for:** Outreach campaigns

---

### 5️⃣ **Generate Reports** (1 min)
- Click **Reports** in sidebar
- Select report type and date range
- Click "Export as PDF" or "Export as CSV"

**Perfect for:** Showing results to management

---

## 📊 Common Use Cases

### Weekly Sales Review
1. Go to **Reports** → Sales Summary
2. Export as PDF
3. Share with team

**Time saved:** 30 minutes of manual reporting

---

### Monday Morning Hustle
1. Open **Notifications** → Today's Tasks
2. See what needs to happen today
3. Use **Email** template to reach out
4. Log follow-ups in **Pipeline**

**Time saved:** 15 minutes planning each day

---

### Import New Prospect List
1. Get list from marketing
2. Go to **Import/Export**
3. Upload CSV
4. Contacts now in system!

**Time saved:** 1 hour per 500 contacts

---

### Check Sales Health
1. Go to **Pipeline** (Kanban view)
2. See deal distribution across stages
3. Check **Analytics** for detailed metrics
4. Generate **Reports** for board meeting

**Time saved:** Understanding your pipeline in 5 minutes

---

## 🔥 Pro Tips

### Kanban Pipeline
- ✅ Sort deals by stage to focus your efforts
- ✅ High probability deals at top of "Negotiation" column
- ✅ Use "Clarity Score" to identify most understandable deals

### Notifications
- ✅ Check first thing in morning
- ✅ Your reminders are personal to you
- ✅ Overdue tasks appear automatically

### Contacts
- ✅ Lead Score 80+ = priority contacts
- ✅ Tags help organize by source/type
- ✅ Use Import/Export for backups

### Email
- ✅ Preview before sending to bulk list
- ✅ Use {firstName}, {lastName}, {company} for personalization
- ✅ Check success count after sending

### Reports
- ✅ PDF for printing/sharing
- ✅ CSV for further analysis in Excel
- ✅ Date range is optional (defaults to all-time)

---

## 🎓 Step-by-Step Tutorials

### Tutorial 1: Close Your First Deal Using Pipeline

**Goal:** Move a deal from Discovery to Won using Kanban

**Steps:**
1. Navigate to **Pipeline** (Kanban)
2. Click "New Deal" 
   - Name: "Tutorial Deal"
   - Amount: 10,000
   - Stage: Discovery
   - Probability: 50%
3. Click "Create"
4. Now change stage to "Demo": Select "Demo" from dropdown
5. Change stage to "Proposal": Select "Proposal" from dropdown
6. Change stage to "Won": Select "Won" from dropdown
7. ✅ Deal moved through entire pipeline!

**Result:** You've now used the Kanban board. 🎉

---

### Tutorial 2: Send Your First Email Campaign

**Goal:** Send personalized emails to 3 new contacts

**Steps:**
1. Navigate to **Email**
2. Select template: "Intro"
3. In Recipients section, check boxes for 3 contacts
4. Click "Send to 3 Contacts"
5. ✅ Emails sent!
6. Go to **Notes** to see emails logged

**Result:** Professional emails sent in under 1 minute. 🚀

---

### Tutorial 3: Import 10 Sample Contacts

**Goal:** Build your contact database quickly

**Steps:**
1. Navigate to **Import/Export**
2. Click "Download Template"
3. Edit template with 10 sample contacts:
   - Include first name, email (required)
   - Include company, job title (recommended)
4. Upload file
5. Review preview
6. Click "Import 10 Contacts"
7. ✅ Contacts imported!

**Result:** Contacts ready for outreach. 📇

---

### Tutorial 4: Run Your First Sales Report

**Goal:** Understand your pipeline health

**Steps:**
1. Navigate to **Reports**
2. Select "Sales Summary" report
3. Set date range (optional): Last 30 days
4. Click "Export as PDF"
5. ✅ PDF downloaded!
6. Open in browser/reader to view

**Result:** Professional report on your sales performance. 📈

---

## ⚙️ Configuration Guide

### Setting Up Email (Gmail)
1. Create Gmail App Password:
   - Go to myaccount.google.com
   - Security → 2-Step Verification (enable if needed)
   - App passwords → Generate for "Mail"
   - Copy password
2. Contact admin to set `EMAIL_PASS` environment variable
3. Verify: Test sending email from app

### Notification Preferences
1. Click **Notifications**
2. Scroll to "Notification Settings"
3. Check/uncheck preferences:
   - [ ] Email reminders
   - [ ] Push notifications  
   - [ ] SMS alerts
   - [ ] Daily summary
4. Click "Save Settings"

---

## 📞 Getting Help

### Quick Questions?
- Check this guide first
- Hover over icons for tooltips
- Look for blue info boxes in interface

### Something Not Working?
1. **Check connection:** Are you online?
2. **Refresh page:** Ctrl+R or Cmd+R
3. **Clear cache:** Open DevTools → Application → Clear
4. **Contact support:** support@dealclarity.com

---

## 🎁 Bonus Features

### CSV Export for Backup
- Go to **Import/Export**
- Click "Export All Contacts"
- Save file safely as backup
- Can re-import anytime

### Task Statistics
- **Notifications** page shows:
  - Total today
  - Urgent count
  - Due soon count
  - Completion rate

### Pipeline Metrics
- **Kanban** shows:
  - Deal count per stage
  - Total pipeline value
  - Win rate preview

---

## 📱 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Quick search (coming soon) |
| `Ctrl+N` | New deal (in Kanban) |
| `Escape` | Close dialogs |
| `Tab` | Navigate form fields |

---

## 🚨 Common Mistakes to Avoid

❌ **Mistake:** Uploading CSV without email column  
✅ **Fix:** Email is required - include in import

❌ **Mistake:** Sending email without selecting recipients  
✅ **Fix:** Check at least one contact checkbox first

❌ **Mistake:** Using commas in CSV without quotes  
✅ **Fix:** Quote fields with commas: `"Smith, John"`

❌ **Mistake:** Forgetting to check notification settings  
✅ **Fix:** Configure alerts before first task

---

## 🎯 Next Steps

### This Week
- [ ] Explore all 5 new features
- [ ] Import your first batch of contacts
- [ ] Send first bulk email
- [ ] Generate your first report

### This Month
- [ ] Set up notification preferences
- [ ] Move 10 deals through Kanban stages
- [ ] Export monthly report for analysis
- [ ] Invite team member to use app

### This Quarter
- [ ] Reach 500+ contacts in system
- [ ] Run 4 weekly sales reports
- [ ] Send 100+ emails via app
- [ ] Complete 200+ tasks

---

**Version:** 2.5.0  
**Last Updated:** December 17, 2025  
**Status:** Ready to Use ✅  

**Questions?** See ADVANCED_FEATURES_GUIDE.md for detailed documentation
