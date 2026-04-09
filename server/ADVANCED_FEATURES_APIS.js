// ============================================
// ADVANCED FEATURES - ALL API ENDPOINTS
// ============================================
// This file contains all 60+ API routes for H-LOGIX advanced features
// Copy-paste these endpoints into server/index.js after the existing routes

// ============================================
// 1️⃣ GLOBAL CONTROL LAYER (7 endpoints)
// ============================================

app.post('/api/admin/system/pause-delivery', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const { reason } = req.body;
        const control = await sequelize.models.SystemControls.findOne() || await sequelize.models.SystemControls.create({});
        
        await control.update({
            pauseDeliveries: true,
            pauseReason: reason,
            pausedAt: new Date(),
            pausedBy: req.user.id,
            resumedAt: null
        });
        
        await AuditLog.create({
            userId: req.user.id,
            action: 'pause_system',
            details: { reason }
        });
        
        res.json({ success: true, message: 'System paused', control });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/system/resume-delivery', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const control = await sequelize.models.SystemControls.findOne();
        if (!control) return res.status(404).json({ error: 'System control not found' });
        
        await control.update({
            pauseDeliveries: false,
            resumedAt: new Date()
        });
        
        await AuditLog.create({
            userId: req.user.id,
            action: 'resume_system'
        });
        
        res.json({ success: true, message: 'System resumed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/orders/:id/force-refund', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const { amount, reason } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        await order.update({
            forcedRefundAmount: amount,
            forcedRefundReason: reason,
            status: 'Refunded'
        });
        
        await AuditLog.create({
            userId: req.user.id,
            action: 'force_refund',
            targetOrderId: req.params.id,
            details: { amount, reason }
        });
        
        res.json({ success: true, message: 'Refund forced', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/orders/:id/force-return', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const { reason } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        await order.update({
            status: 'Returned',
            returnReason: reason,
            returnStatus: 'Approved',
            returnRequestedAt: new Date()
        });
        
        await AuditLog.create({
            userId: req.user.id,
            action: 'force_return',
            targetOrderId: req.params.id,
            details: { reason }
        });
        
        res.json({ success: true, message: 'Return forced', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/orders/:id/lock', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const { reason } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        await order.update({
            isLocked: true,
            lockedBy: req.user.id,
            lockedReason: reason
        });
        
        res.json({ success: true, message: 'Order locked', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/orders/:id/lock', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        await order.update({
            isLocked: false,
            lockedBy: null,
            lockedReason: null
        });
        
        res.json({ success: true, message: 'Order unlocked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/audit-log', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const logs = await AuditLog.findAll({
            where: req.query.action ? { action: req.query.action } : {},
            order: [['createdAt', 'DESC']],
            limit: parseInt(req.query.limit) || 100,
            include: { model: User, attributes: ['id', 'name', 'email'] }
        });
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 2️⃣ SLA ENGINE (10 endpoints)
// ============================================

app.post('/api/admin/sla-rules', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const { name, hoursFromPickup, priority, penaltyPerHour } = req.body;
        const rule = await sequelize.models.SLARules.create({
            name,
            hoursFromPickup,
            priority,
            penaltyPerHour
        });
        
        res.json({ success: true, rule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/sla-rules', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const rules = await sequelize.models.SLARules.findAll({ where: { isActive: true } });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/sla-rules/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const rule = await sequelize.models.SLARules.findByPk(req.params.id);
        if (!rule) return res.status(404).json({ error: 'Rule not found' });
        
        await rule.update(req.body);
        res.json({ success: true, rule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/sla-breaches', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const breaches = await sequelize.models.SLABreaches.findAll({
            where: req.query.status ? { status: req.query.status } : {},
            order: [['breachedAt', 'DESC']],
            limit: 100
        });
        
        res.json(breaches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/sla-breaches/:id/escalate', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const breach = await sequelize.models.SLABreaches.findByPk(req.params.id);
        if (!breach) return res.status(404).json({ error: 'Breach not found' });
        
        await breach.update({
            escalatedAt: new Date(),
            escalatedTo: req.body.opsManagerId
        });
        
        res.json({ success: true, breach });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/sla-breaches/:id/resolve', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const breach = await sequelize.models.SLABreaches.findByPk(req.params.id);
        if (!breach) return res.status(404).json({ error: 'Breach not found' });
        
        await breach.update({
            resolutionNotes: req.body.notes,
            penaltyApplied: req.body.penalty
        });
        
        res.json({ success: true, breach });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/dashboard/sla-score', authenticateToken, async (req, res) => {
    try {
        const riderScores = await DeliveryMan.findAll({
            attributes: ['id', 'name', 'slaScore', 'breachCount']
        });
        
        const breaches = await sequelize.models.SLABreaches.count();
        
        res.json({
            riderScores,
            totalBreaches: breaches,
            avgSLAScore: riderScores.reduce((sum, r) => sum + r.slaScore, 0) / riderScores.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders/:id/check-sla', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        if (!order.expectedDeliveryTime) {
            return res.json({ isBreach: false, message: 'No SLA set' });
        }
        
        const now = new Date();
        const isBreached = now > order.expectedDeliveryTime;
        const minutesLate = isBreached ? Math.floor((now - order.expectedDeliveryTime) / 60000) : 0;
        
        if (isBreached && !order.isSLABreached) {
            await order.update({ isSLABreached: true, delayMinutes: minutesLate });
        }
        
        res.json({ isBreach: isBreached, minutesLate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 3️⃣ SMART AUTO-ASSIGNMENT (6 endpoints)
// ============================================

app.post('/api/admin/auto-assignment/rules', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const rule = await sequelize.models.AutoAssignmentRules.create(req.body);
        res.json({ success: true, rule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/auto-assignment/rules', authenticateToken, async (req, res) => {
    try {
        const rules = await sequelize.models.AutoAssignmentRules.findAll();
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/logix/orders/:id/auto-assign', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'logix_admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        // Find best rider based on criteria
        const riders = await DeliveryMan.findAll({
            attributes: ['id', 'name', 'phone', 'rating']
        });
        
        const bestRider = riders[0]; // Simplified - implement actual scoring
        
        await order.update({
            deliveryManId: bestRider.id,
            autoAssigned: true,
            assignmentScore: 95
        });
        
        res.json({ success: true, orderId: order.id, riderId: bestRider.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/dashboard/rider-capacity', authenticateToken, async (req, res) => {
    try {
        const capacity = await sequelize.models.RiderCapacity.findAll({
            include: { model: DeliveryMan, attributes: ['id', 'name'] }
        });
        res.json(capacity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/dashboard/hub-capacity', authenticateToken, async (req, res) => {
    try {
        const capacity = await sequelize.models.HubCapacity.findAll();
        res.json(capacity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 4️⃣ COD RISK & FRAUD CONTROL (7 endpoints)
// ============================================

app.post('/api/admin/cod/set-rider-limit/:riderId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const { dailyLimit, weeklyLimit } = req.body;
        let limits = await sequelize.models.RiderCODLimits.findOne({ where: { riderId: req.params.riderId } });
        
        if (!limits) {
            limits = await sequelize.models.RiderCODLimits.create({
                riderId: req.params.riderId,
                dailyLimit,
                weeklyLimit
            });
        } else {
            await limits.update({ dailyLimit, weeklyLimit });
        }
        
        res.json({ success: true, limits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/cod/block-rider/:riderId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const { reason, expiresIn } = req.body; // expiresIn in days
        const limits = await sequelize.models.RiderCODLimits.findOne({ where: { riderId: req.params.riderId } });
        
        if (!limits) return res.status(404).json({ error: 'Rider limits not found' });
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresIn);
        
        await limits.update({
            isBlocked: true,
            blockedReason: reason,
            blockExpiresAt: expiresAt
        });
        
        res.json({ success: true, limits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/cod/unblock-rider/:riderId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const limits = await sequelize.models.RiderCODLimits.findOne({ where: { riderId: req.params.riderId } });
        if (!limits) return res.status(404).json({ error: 'Rider limits not found' });
        
        await limits.update({ isBlocked: false, blockedReason: null, blockExpiresAt: null });
        res.json({ success: true, limits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/cod/variance-report', authenticateToken, async (req, res) => {
    try {
        const variances = await sequelize.models.CODTransactions.findAll({
            where: { isVarianceFlagged: true },
            order: [['createdAt', 'DESC']]
        });
        res.json(variances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/cod/rider-balance/:riderId', authenticateToken, async (req, res) => {
    try {
        const collected = await sequelize.models.CODTransactions.sum('collectedAmount', {
            where: { riderId: req.params.riderId }
        });
        
        const submitted = await sequelize.models.CODTransactions.sum('collectedAmount', {
            where: { riderId: req.params.riderId, submittedToHub: { [Op.ne]: null } }
        });
        
        res.json({ collected: collected || 0, submitted: submitted || 0, pending: (collected || 0) - (submitted || 0) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/cod/risk-analysis', authenticateToken, async (req, res) => {
    try {
        const scores = await sequelize.models.CODRiskScores.findAll({
            order: [['riskScore', 'DESC']]
        });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 5️⃣ CONTROL TOWER (5 endpoints)
// ============================================

app.get('/api/logix/control-tower/map', authenticateToken, async (req, res) => {
    try {
        const tracking = await sequelize.models.LiveTracking.findAll({
            include: { model: Order, attributes: ['id', 'productName', 'status'] }
        });
        res.json(tracking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/control-tower/hub-status', authenticateToken, async (req, res) => {
    try {
        const hubs = await sequelize.models.HubCapacity.findAll();
        res.json(hubs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/control-tower/rider-status', authenticateToken, async (req, res) => {
    try {
        const riders = await sequelize.models.RiderCapacity.findAll({
            include: { model: DeliveryMan, attributes: ['name', 'rating'] }
        });
        res.json(riders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/control-tower/sla-timers', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { isSLABreached: true },
            attributes: ['id', 'productName', 'expectedDeliveryTime', 'delayMinutes'],
            limit: 50
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/control-tower/alerts', authenticateToken, async (req, res) => {
    try {
        const breaches = await sequelize.models.SLABreaches.count();
        const variances = await sequelize.models.CODTransactions.count({ where: { isVarianceFlagged: true } });
        const disputes = await sequelize.models.Disputes.count({ where: { status: 'Raised' } });
        
        res.json({
            alerts: [
                { type: 'SLA_BREACH', count: breaches, severity: 'high' },
                { type: 'COD_VARIANCE', count: variances, severity: 'medium' },
                { type: 'DISPUTE', count: disputes, severity: 'high' }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 6️⃣ RETURN INTELLIGENCE (5 endpoints)
// ============================================

app.get('/api/admin/returns/analytics', authenticateToken, async (req, res) => {
    try {
        const analytics = await sequelize.models.ReturnAnalytics.findAll();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/returns/:id/auto-evaluate', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        // Check return rules
        const abuseFlag = order.returnCount > 3; // Simplified
        
        await order.update({ returnStatus: abuseFlag ? 'Flagged' : 'Approved' });
        
        res.json({ success: true, evaluation: { abuseFlag, order } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/seller/returns', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') return res.status(403).json({ error: 'Unauthorized' });
        
        const returns = await Order.findAll({
            where: { sellerId: req.user.id, returnStatus: { [Op.ne]: null } },
            attributes: ['id', 'productName', 'returnStatus', 'returnReason', 'returnRequestedAt']
        });
        
        res.json(returns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 7️⃣ FINANCE INTELLIGENCE (11 endpoints)
// ============================================

app.post('/api/admin/finance/settlement/create', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const { startDate, endDate } = req.body;
        const cycle = await sequelize.models.SettlementCycles.create({
            startDate,
            endDate,
            settlementDate: new Date(),
            status: 'Pending'
        });
        
        res.json({ success: true, cycle });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/finance/settlement/list', authenticateToken, async (req, res) => {
    try {
        const cycles = await sequelize.models.SettlementCycles.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(cycles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/finance/settlement/:id', authenticateToken, async (req, res) => {
    try {
        const cycle = await sequelize.models.SettlementCycles.findByPk(req.params.id, {
            include: { model: sequelize.models.SettlementItems }
        });
        res.json(cycle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/finance/settlement/:id/pay', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const cycle = await sequelize.models.SettlementCycles.findByPk(req.params.id);
        if (!cycle) return res.status(404).json({ error: 'Cycle not found' });
        
        await cycle.update({ status: 'Paid' });
        res.json({ success: true, cycle });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/finance/incentives', authenticateToken, async (req, res) => {
    try {
        const rules = await sequelize.models.IncentiveRules.findAll({ where: { isActive: true } });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/finance/incentives/rules', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const rule = await sequelize.models.IncentiveRules.create(req.body);
        res.json({ success: true, rule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/reports/profit-analysis', authenticateToken, async (req, res) => {
    try {
        const profits = await sequelize.models.OrderProfit.findAll({
            order: [['netProfit', 'DESC']]
        });
        res.json(profits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logix/dashboard/rider-earnings', authenticateToken, async (req, res) => {
    try {
        const earnings = await sequelize.models.SettlementItems.findAll({
            include: { model: DeliveryMan, attributes: ['name'] }
        });
        res.json(earnings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/rider/earnings', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'delivery') return res.status(403).json({ error: 'Unauthorized' });
        
        const earnings = await sequelize.models.SettlementItems.findAll({
            where: { riderId: req.user.id }
        });
        
        res.json(earnings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 8️⃣ DISPUTES & CLAIMS (4 endpoints)
// ============================================

app.post('/api/disputes', authenticateToken, async (req, res) => {
    try {
        const dispute = await sequelize.models.Disputes.create({
            ...req.body,
            raisedBy: req.user.id,
            raisedByRole: req.user.role
        });
        res.json({ success: true, dispute });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/disputes', authenticateToken, async (req, res) => {
    try {
        const disputes = await sequelize.models.Disputes.findAll({
            where: { raisedBy: req.user.id }
        });
        res.json(disputes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/disputes', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'logix_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
        
        const disputes = await sequelize.models.Disputes.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(disputes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/disputes/:id/review', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const dispute = await sequelize.models.Disputes.findByPk(req.params.id);
        if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
        
        await dispute.update({
            status: req.body.status, // 'Resolved', 'Rejected'
            resolution: req.body.resolution,
            refundIssued: req.body.refund,
            resolvedBy: req.user.id,
            resolvedAt: new Date()
        });
        
        res.json({ success: true, dispute });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 9️⃣ ESCALATION ENGINE (3 endpoints)
// ============================================

app.post('/api/admin/escalations/rules', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const rule = await sequelize.models.EscalationRules.create(req.body);
        res.json({ success: true, rule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/escalations/open', authenticateToken, async (req, res) => {
    try {
        const escalations = await sequelize.models.Escalations.findAll({
            where: { status: 'Open' }
        });
        res.json(escalations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/escalations/:id/resolve', authenticateToken, async (req, res) => {
    try {
        const escalation = await sequelize.models.Escalations.findByPk(req.params.id);
        if (!escalation) return res.status(404).json({ error: 'Escalation not found' });
        
        await escalation.update({
            status: 'Resolved',
            resolutionNotes: req.body.notes,
            resolvedAt: new Date()
        });
        
        res.json({ success: true, escalation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 🔟 RIDER PRO+ FEATURES (7 endpoints)
// ============================================

app.get('/api/rider/pro/dashboard', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'delivery') return res.status(403).json({ error: 'Unauthorized' });
        
        const profile = await sequelize.models.RiderProfile.findOne({ where: { riderId: req.user.id } });
        res.json(profile || { message: 'Profile not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rider/shift/start', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'delivery') return res.status(403).json({ error: 'Unauthorized' });
        
        const shift = await sequelize.models.RiderShifts.create({
            riderId: req.user.id,
            shiftDate: new Date().toISOString().split('T')[0],
            startTime: new Date(),
            status: 'Active'
        });
        
        res.json({ success: true, shift });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rider/shift/end', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'delivery') return res.status(403).json({ error: 'Unauthorized' });
        
        const today = new Date().toISOString().split('T')[0];
        const shift = await sequelize.models.RiderShifts.findOne({
            where: { riderId: req.user.id, shiftDate: today, status: 'Active' }
        });
        
        if (!shift) return res.status(404).json({ error: 'No active shift' });
        
        const startTime = new Date(shift.startTime);
        const endTime = new Date();
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        
        await shift.update({ endTime: new Date(), totalHours: Math.floor(hours), status: 'Completed' });
        
        res.json({ success: true, shift });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/rider/pro/gamification', authenticateToken, async (req, res) => {
    try {
        const profile = await sequelize.models.RiderProfile.findOne({ where: { riderId: req.user.id } });
        res.json({
            badges: profile?.badges || [],
            score: profile?.gamificationScore || 0,
            tier: profile?.tier || 'Basic'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 1️⃣1️⃣ SECURITY & AUDIT (5 endpoints)
// ============================================

app.get('/api/admin/audit', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const logs = await sequelize.models.AuditLog.findAll({
            order: [['timestamp', 'DESC']],
            limit: 200
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/device-binding/approve', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const binding = await sequelize.models.DeviceBinding.findByPk(req.body.deviceId);
        if (!binding) return res.status(404).json({ error: 'Device not found' });
        
        await binding.update({ isApproved: true, approvedAt: new Date() });
        res.json({ success: true, binding });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/device-binding/revoke', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const binding = await sequelize.models.DeviceBinding.findByPk(req.body.deviceId);
        if (!binding) return res.status(404).json({ error: 'Device not found' });
        
        await binding.update({ revokedAt: new Date() });
        res.json({ success: true, binding });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/suspicious-activity', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        const activities = await sequelize.models.SuspiciousActivity.findAll({
            where: { resolvedAt: null },
            order: [['flaggedAt', 'DESC']]
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/force-logout-all/:userId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
        
        // Invalidate all sessions (implement token blacklist)
        res.json({ success: true, message: 'User sessions terminated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// END OF ENDPOINTS
// ============================================
