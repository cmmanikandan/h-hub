# 🚀 H-LOGIX Quick Access Guide

**Last Updated**: February 7, 2025  
**Build Status**: ✅ PRODUCTION READY

---

## 🎯 Fast Navigation

### **For Admins (H-HUB)**

| What You Want | Go To | Route |
|---|---|---|
| Pause all deliveries | System Controls | `/admin/control-panel` |
| Force refund/return | System Controls | `/admin/control-panel` |
| Create SLA rules | Admin Control Panel | `/admin/control-panel` |
| Track settlements | Finance Dashboard | `/admin/finance` |
| Review disputes | Dispute Manager | `/admin/disputes` |
| Check escalations | Escalation Manager | `/admin/escalations` |
| Analyze returns | Return Analytics | `/admin/returns` |
| Approve devices | Security Dashboard | `/admin/security` |
| Monitor COD risks | COD Risk | `/admin/cod-risk` |

### **For Ops/Logix Teams**

| What You Want | Go To | Route |
|---|---|---|
| Live operations | Control Tower | `/logix/control-tower` |
| Monitor riders | Control Tower | `/logix/control-tower` |
| Check hub load | Control Tower | `/logix/control-tower` |
| SLA timers | Control Tower | `/logix/control-tower` |
| COD variance | COD Dashboard | `/logix/cod-risk` |

### **For Riders**

| What You Want | Go To | Route |
|---|---|---|
| Earnings tracking | Pro+ Dashboard | `/delivery/pro-dashboard` |
| Shift management | Pro+ Dashboard | `/delivery/pro-dashboard` |
| Badges/gamification | Pro+ Dashboard | `/delivery/pro-dashboard` |
| Performance metrics | Pro+ Dashboard | `/delivery/pro-dashboard` |

---

## 💾 Database Tables Cheat Sheet

### **Core Control Tables**
```
SystemControls       - System pause/resume state
AdminActions         - Audit trail of admin actions
AuditLog             - Security event logging
```

### **SLA & Service Level**
```
SLARules             - SLA configuration
SLABreaches          - SLA violation tracking
```

### **Assignment & Capacity**
```
AutoAssignmentRules  - Rider assignment rules
RiderCapacity        - Current rider load
HubCapacity          - Hub congestion level
LiveTracking         - GPS coordinates
```

### **COD & Fraud**
```
CODTransactions      - COD money tracking
RiderCODLimits       - Per-rider limits
CODRiskScores        - Fraud risk scores
```

### **Financial**
```
SettlementCycles     - Payment cycles
SettlementItems      - Individual transactions
OrderProfit          - Profit per order
IncentiveRules       - Bonus rules
PenaltyRules         - Penalty rules
```

### **Operations**
```
Disputes             - Customer claims
Escalations          - Escalated issues
ReturnAnalytics      - Return statistics
ReturnRules          - Return policies
```

### **Security**
```
DeviceBinding        - Device authentication
SuspiciousActivity   - Anomaly detection
```

### **Rider Profile**
```
RiderProfile         - Rider data
RiderShifts          - Shift history
RiderOfflineMode     - Offline capability
```

---

## 📡 API Endpoints by Category

### **Global Control** (7 endpoints)
```
POST    /api/admin/system/pause-delivery          - Pause all deliveries
POST    /api/admin/system/resume-delivery         - Resume deliveries
POST    /api/admin/system/force-refund            - Refund any order
POST    /api/admin/system/force-return            - Return any order
POST    /api/admin/system/lock-order              - Lock critical order
POST    /api/admin/system/unlock-order            - Unlock order
GET     /api/admin/audit-log                      - View admin actions
```

### **SLA Management** (10 endpoints)
```
GET     /api/admin/sla-rules                      - List SLA rules
POST    /api/admin/sla-rules                      - Create SLA rule
PUT     /api/admin/sla-rules/:id                  - Update SLA rule
DELETE  /api/admin/sla-rules/:id                  - Delete SLA rule
GET     /api/admin/sla-breaches                   - List breaches
POST    /api/admin/sla-escalate                   - Escalate breach
GET     /api/admin/sla-scores                     - Rider SLA scores
GET     /api/admin/sla-analytics                  - SLA analytics
```

### **COD Management** (7 endpoints)
```
GET     /api/logix/cod/variance-report            - Variance report
GET     /api/admin/cod/rider-limits               - List rider limits
POST    /api/admin/cod/set-rider-limit            - Set daily limit
PUT     /api/admin/cod/block-rider                - Block/unblock rider
GET     /api/admin/cod/risk-analysis              - Risk scoring
GET     /api/logix/cod/variance-history           - Variance trends
```

### **Control Tower** (5 endpoints)
```
GET     /api/logix/control-tower/map              - Active deliveries
GET     /api/logix/control-tower/hub-status       - Hub load metrics
GET     /api/logix/control-tower/rider-status     - Rider capacity
GET     /api/logix/control-tower/sla-timers       - SLA countdown timers
GET     /api/logix/control-tower/alerts           - Critical alerts
```

### **Finance** (9 endpoints)
```
GET     /api/admin/finance/settlement/list        - View settlements
POST    /api/admin/finance/settlement/create      - Create cycle
GET     /api/admin/reports/profit-analysis        - Profit by category
GET     /api/rider/earnings                       - Rider earnings
POST    /api/admin/finance/incentives             - Add incentive
POST    /api/admin/finance/penalties              - Add penalty
GET     /api/admin/finance/settlement/items       - Settlement items
```

### **Disputes** (4 endpoints)
```
POST    /api/disputes                             - Raise dispute
GET     /api/disputes                             - My disputes
GET     /api/admin/disputes                       - All disputes
PATCH   /api/admin/disputes/:id/review            - Resolve dispute
```

### **Escalations** (3 endpoints)
```
GET     /api/admin/escalations/open               - Open escalations
PATCH   /api/admin/escalations/:id/resolve        - Resolve escalation
CRUD    /api/admin/escalation-rules               - Manage escalation rules
```

### **Rider Pro+** (5 endpoints)
```
POST    /api/rider/shift/start                    - Start shift
POST    /api/rider/shift/end                      - End shift
GET     /api/rider/earnings                       - Earnings summary
GET     /api/rider/pro/gamification               - Badges & achievements
GET     /api/rider/pro/dashboard                  - Full dashboard data
```

### **Security** (5 endpoints)
```
GET     /api/admin/audit                          - Audit logs
CRUD    /api/admin/device-binding                 - Device management
POST    /api/admin/device-binding/approve         - Approve device
GET     /api/admin/suspicious-activity            - Suspicious events
POST    /api/admin/force-logout-all               - Emergency logout
```

### **Returns** (5 endpoints)
```
GET     /api/admin/returns/analytics              - Return stats
GET     /api/admin/returns/seller-heatmap         - Seller return rate
GET     /api/admin/returns/reasons                - Return reasons
GET     /api/admin/returns/quality-scores         - Quality metrics
GET     /api/seller/returns                       - Seller view
```

---

## 🔌 How to Make API Calls

### **From Any Component**
```javascript
import api from '../utils/api';

// GET request
const response = await api.get('/api/admin/disputes');

// POST request
const response = await api.post('/api/disputes', {
  orderId: 'ORD123',
  reason: 'Wrong item received'
});

// With authentication
const token = localStorage.getItem('token');
const response = await api.get('/api/admin/disputes', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### **Error Handling**
```javascript
try {
  const data = await api.get('/api/endpoint');
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error.message);
  alert('❌ Operation failed');
}
```

---

## 🎨 UI Component Structure

### **Common Patterns Used**

```javascript
// Stats Grid
<div style={statsGrid}>
  {stats.map(stat => (
    <div style={statCard}>...</div>
  ))}
</div>

// Filter Bar
<div style={filterBar}>
  {filters.map(f => (
    <button onClick={() => setFilter(f)}>...</button>
  ))}
</div>

// Data Table
<div style={tableContainer}>
  <div style={tableHeader}>...</div>
  {data.map(item => (
    <div style={tableRow}>...</div>
  ))}
</div>

// Modal Dialog
{selected && (
  <div style={modal}>
    <div style={modalContent}>...</div>
  </div>
)}
```

---

## 🎬 Dashboard Features Summary

### **ControlTower.jsx** (440 lines)
**Real-time operations monitoring for Ops teams**
- Live delivery map with GPS coordinates
- Hub congestion indicators (Low/Medium/High/Critical)
- Rider capacity with progress bars
- SLA breach countdown timers
- Critical alerts notification system
- 5-second auto-refresh

**Key Features**:
- 4-tab interface (Map, Hubs, Riders, SLA)
- Color-coded status badges
- Live metrics updating

---

### **AdminControlPanel.jsx** (380 lines)
**System-wide control and SLA management**
- Global pause/resume delivery system
- Force refund/return/lock order buttons
- Create SLA rules with form
- SLA rules CRUD table
- Audit log viewer with timestamps
- Color-coded action history

**Key Features**:
- 3-tab interface (System, SLA, Audit)
- Emergency action cards
- Rules management table

---

### **FinanceIntelligence.jsx** (450 lines)
**Financial tracking and profit analysis**
- Total sales, charges, profit metrics
- Settlement cycle management
- Profit breakdown by category
- Monthly revenue trend chart
- Incentive and penalty tracking
- Create new settlement cycles

**Key Features**:
- 4-tab interface (Overview, Settlements, Profit, Incentives)
- Real-time metrics
- Profit visualization

---

### **DisputeManager.jsx** (350 lines)
**Dispute resolution workflow**
- List all disputes with filtering
- Dispute detail modal
- Evidence review section
- Resolution decision form
- Refund processing
- Status tracking

**Key Features**:
- Dispute type icons and badges
- Priority/severity indicators
- Resolution workflow

---

### **EscalationManagement.jsx** (380 lines)
**Priority escalation handling**
- Open escalations timeline
- Escalation ladder visualization (L1→L2→L3→L4)
- Current owner assignment
- Time-in-queue tracking
- Resolution assignment form

**Key Features**:
- Visual escalation levels
- Priority coloring
- Team assignment

---

### **RiderProDashboard.jsx** (420 lines)
**Rider premium features and earnings**
- Weekly/monthly/lifetime earnings
- Shift start/end controls
- Recent shift history with stats
- Gamification badges display
- Performance metrics (rating, completion, cancellation)
- Earnings trend chart

**Key Features**:
- 3-tab interface (Overview, Shifts, Badges)
- Shift management buttons
- Achievement tracking

---

### **CODRiskDashboard.jsx** (400 lines)
**Cash-on-Delivery fraud control**
- Variance summary (total, recovered, lost)
- Rider COD limits management
- Edit daily/monthly limits
- Block/unblock riders
- Risk scoring with color indicators
- Variance trend chart

**Key Features**:
- Rider limits table
- Risk score visualization
- Variance history graph

---

### **ReturnAnalyticsDashboard.jsx** (430 lines)
**Return tracking and quality metrics**
- Total returns and rate metrics
- Seller performance heatmap
- Return reasons breakdown chart
- Quality scoring distribution
- Seller detail modal
- Return reason visualization

**Key Features**:
- Seller heatmap with color coding
- Quality scoring system
- Reason analytics

---

### **SecurityAuditDashboard.jsx** (410 lines)
**Security and device management**
- Pending device approvals
- Suspicious activity log
- Device approval/rejection form
- Activity detail modal
- Force logout all capability
- Audit log table

**Key Features**:
- Device binding workflow
- Suspicious activity review
- Emergency security controls

---

## 🔐 Authentication Details

### **Token Format**
```json
{
  "userId": "USER123",
  "role": "admin",
  "iat": 1707296400,
  "exp": 1707382800
}
```

### **Using Token**
```javascript
// Login returns token
const { token } = await login('email@example.com', 'password');
localStorage.setItem('token', token);

// Use in requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### **Protected Routes**
- `/admin/*` - Requires `role === 'admin'`
- `/logix/*` - Requires `role === 'logix_admin'`
- `/delivery/*` - Requires `role === 'delivery'`
- `/seller/*` - Requires `role === 'seller'`

---

## 📋 Common Tasks

### **Task: Pause All Deliveries**
```javascript
// Button click
const handlePause = async () => {
  const token = localStorage.getItem('token');
  await api.post('/api/admin/system/pause-delivery', {
    reason: 'Technical issue'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  alert('✅ All deliveries paused');
};
```

### **Task: Create SLA Rule**
```javascript
const handleCreateSLARule = async () => {
  const token = localStorage.getItem('token');
  await api.post('/api/admin/sla-rules', {
    name: 'Same-Day Delivery',
    hoursFromPickup: 24,
    penaltyPerHour: 100
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

### **Task: Block a Rider (COD)**
```javascript
const handleBlockRider = async (riderId) => {
  const token = localStorage.getItem('token');
  await api.put('/api/admin/cod/block-rider', {
    riderId,
    status: 'blocked'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

### **Task: Resolve Dispute**
```javascript
const handleResolveDispute = async (disputeId) => {
  const token = localStorage.getItem('token');
  await api.patch(`/api/admin/disputes/${disputeId}/review`, {
    status: 'Resolved',
    refund: 500,
    resolution: 'Refund issued'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

---

## 🎓 Component Template

### **Basic Dashboard Structure**
```jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const MyDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/endpoint', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setData(res.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      {/* Header */}
      <h1>Dashboard Title</h1>

      {/* Stats */}
      <div style={statsGrid}>
        {/* Stat cards */}
      </div>

      {/* Content */}
      {loading ? <div>Loading...</div> : (
        <div>
          {data.map(item => (
            <div key={item.id}>...</div>
          ))}
        </div>
      )}
    </div>
  );
};

const container = { maxWidth: '1200px', margin: '0 auto', padding: '2rem' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' };

export default MyDashboard;
```

---

## 📞 Troubleshooting

### **Error: 401 Unauthorized**
- Token expired → Login again
- Invalid token → Clear localStorage, login
- No token → Check localStorage.getItem('token')

### **Error: 403 Forbidden**
- Wrong role → Check user.role matches required role
- Missing permission → Contact admin

### **Error: Connection refused**
- Backend not running → Run `npm start` in server folder
- Wrong port → Check localhost:5000

### **Dashboard not loading**
- Route not found → Check `/admin/*` routes in App.jsx
- Component error → Check browser console for errors
- API endpoint doesn't exist → Check endpoint spelling

---

## 🔄 Workflow Examples

### **Complete Dispute Resolution**
```
1. View disputes → /admin/disputes
2. Click dispute → Open modal
3. Review reason & evidence
4. Make decision (Resolve/Reject/Escalate)
5. Enter refund amount (if applicable)
6. Add resolution notes
7. Click "Apply Resolution"
8. Dispute marked as resolved
```

### **Complete Rider COD Blocking**
```
1. Go to COD Risk → /admin/cod-risk
2. View rider COD limits
3. Click "Block" button
4. System blocks rider from all COD orders
5. Rider appears in "Blocked" status
6. Can click "Unblock" to restore
```

### **Complete Escalation**
```
1. View escalations → /admin/escalations
2. Click escalation → Open modal
3. Review escalation ladder
4. Assign to team member
5. Add resolution notes
6. Click "Resolve"
7. Escalation moves to closed
```

---

## 📊 Performance Tips

1. **API Caching**: Use `useEffect` dependencies to avoid unnecessary API calls
2. **Virtual Scrolling**: For large lists, consider virtual scrolling library
3. **Image Optimization**: Compress images before upload
4. **Lazy Loading**: Load dashboards on-demand
5. **State Management**: Keep state minimal, fetch when needed

---

## 🚀 Deployment Commands

### **Start Everything**
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
npm run dev
```

### **Production Build**
```bash
npm run build
npm run preview
```

### **Database Backup**
```bash
cp server/database.sqlite server/database.sqlite.backup
```

---

## 📚 Documentation Files

- `ADVANCED_FEATURES_COMPLETE_BUILD.md` - Complete feature list
- `ADVANCED_FEATURES_APIS.md` - Detailed API documentation
- `TEST_CREDENTIALS.md` - Login credentials for testing
- `DATABASE_SCHEMA_AND_APIS.md` - Original schema design

---

## ✨ Quick Tips

- 🔐 Always check token before API call
- 📱 Mobile responsive - all dashboards work on mobile
- ♿ Accessible color contrast - WCAG compliant
- 🎯 Consistent UI patterns across all dashboards
- 🚀 Real-time updates without WebSocket (polling every 5s)
- 📊 Charts use simple divs (no external chart library)
- 🎨 CSS variables for theme consistency

---

**Happy Building! 🎉**

For issues or questions, refer to specific dashboard implementation files or backend endpoint documentation.
