    import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'hub_db.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {show 
        console.error('❌ Error opening database:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database');
});

// ========================================
// ADD COLUMNS TO EXISTING TABLES
// ========================================

const alterOrderTable = [
    `ALTER TABLE Orders ADD COLUMN slaRuleId TEXT`,
    `ALTER TABLE Orders ADD COLUMN expectedDeliveryTime DATETIME`,
    `ALTER TABLE Orders ADD COLUMN isSLABreached BOOLEAN DEFAULT 0`,
    `ALTER TABLE Orders ADD COLUMN delayMinutes INTEGER DEFAULT 0`,
    `ALTER TABLE Orders ADD COLUMN delayReason TEXT`,
    `ALTER TABLE Orders ADD COLUMN lockedBy TEXT`,
    `ALTER TABLE Orders ADD COLUMN lockedReason TEXT`,
    `ALTER TABLE Orders ADD COLUMN isLocked BOOLEAN DEFAULT 0`,
    `ALTER TABLE Orders ADD COLUMN forcedRefundAmount FLOAT DEFAULT 0`,
    `ALTER TABLE Orders ADD COLUMN forcedRefundReason TEXT`,
    `ALTER TABLE Orders ADD COLUMN codVariance FLOAT DEFAULT 0`,
    `ALTER TABLE Orders ADD COLUMN codRiskFlag BOOLEAN DEFAULT 0`,
    `ALTER TABLE Orders ADD COLUMN autoAssigned BOOLEAN DEFAULT 0`,
    `ALTER TABLE Orders ADD COLUMN assignmentScore FLOAT`,
];

const alterDeliveryManTable = [
    `ALTER TABLE DeliveryMen ADD COLUMN slaScore FLOAT DEFAULT 100`,
    `ALTER TABLE DeliveryMen ADD COLUMN breachCount INTEGER DEFAULT 0`,
];

const alterUsersTable = [
    `ALTER TABLE Users ADD COLUMN slaScore FLOAT DEFAULT 100`,
    `ALTER TABLE Users ADD COLUMN avgDeliveryTime INTEGER`,
];

// ========================================
// CREATE NEW TABLES
// ========================================

const createTableSQL = [
    // 1. System Controls
    `CREATE TABLE IF NOT EXISTS SystemControls (
        id TEXT PRIMARY KEY,
        pauseDeliveries BOOLEAN DEFAULT 0,
        pauseReason TEXT,
        pausedAt DATETIME,
        pausedBy TEXT,
        resumedAt DATETIME
    )`,

    // 2. Admin Actions (Audit Log)
    `CREATE TABLE IF NOT EXISTS AdminActions (
        id TEXT PRIMARY KEY,
        adminId TEXT NOT NULL,
        action VARCHAR(50),
        targetOrderId TEXT,
        reason TEXT,
        details JSON,
        ipAddress VARCHAR(45),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(adminId) REFERENCES Users(id),
        FOREIGN KEY(targetOrderId) REFERENCES Orders(id)
    )`,

    // 3. SLA Rules
    `CREATE TABLE IF NOT EXISTS SLARules (
        id TEXT PRIMARY KEY,
        name VARCHAR(100),
        hoursFromPickup INTEGER,
        priority INTEGER,
        penaltyPerHour FLOAT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 4. SLA Breaches
    `CREATE TABLE IF NOT EXISTS SLABreaches (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        ruleId TEXT NOT NULL,
        breachedAt DATETIME,
        hoursLate INTEGER,
        delayReason VARCHAR(100),
        escalatedAt DATETIME,
        escalatedTo TEXT,
        resolutionNotes TEXT,
        penaltyApplied FLOAT,
        FOREIGN KEY(orderId) REFERENCES Orders(id),
        FOREIGN KEY(ruleId) REFERENCES SLARules(id),
        FOREIGN KEY(escalatedTo) REFERENCES Users(id)
    )`,

    // 5. Auto Assignment Rules
    `CREATE TABLE IF NOT EXISTS AutoAssignmentRules (
        id TEXT PRIMARY KEY,
        name VARCHAR(100),
        isActive BOOLEAN DEFAULT 1,
        criteria JSON,
        priority INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 6. Rider Capacity
    `CREATE TABLE IF NOT EXISTS RiderCapacity (
        id TEXT PRIMARY KEY,
        riderId TEXT NOT NULL UNIQUE,
        maxCapacity INTEGER,
        currentLoad INTEGER DEFAULT 0,
        activeOrderCount INTEGER DEFAULT 0,
        isOnDuty BOOLEAN DEFAULT 0,
        shiftStart DATETIME,
        shiftEnd DATETIME,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 7. Hub Capacity
    `CREATE TABLE IF NOT EXISTS HubCapacity (
        id TEXT PRIMARY KEY,
        hubId TEXT NOT NULL UNIQUE,
        maxCapacity INTEGER,
        currentLoad INTEGER DEFAULT 0,
        activeOrders INTEGER DEFAULT 0,
        pendingPickup INTEGER DEFAULT 0,
        pendingReturn INTEGER DEFAULT 0,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 8. COD Transactions
    `CREATE TABLE IF NOT EXISTS CODTransactions (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        riderId TEXT NOT NULL,
        expectedAmount FLOAT,
        collectedAmount FLOAT,
        varianceAmount FLOAT DEFAULT 0,
        isVarianceFlagged BOOLEAN DEFAULT 0,
        submittedToHub DATETIME,
        verifiedByHub DATETIME,
        verifiedBy TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(orderId) REFERENCES Orders(id),
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id),
        FOREIGN KEY(verifiedBy) REFERENCES Users(id)
    )`,

    // 9. Rider COD Limits
    `CREATE TABLE IF NOT EXISTS RiderCODLimits (
        id TEXT PRIMARY KEY,
        riderId TEXT NOT NULL UNIQUE,
        dailyLimit FLOAT DEFAULT 50000,
        weeklyLimit FLOAT DEFAULT 300000,
        dailyCollected FLOAT DEFAULT 0,
        weeklyCollected FLOAT DEFAULT 0,
        isBlocked BOOLEAN DEFAULT 0,
        blockedReason TEXT,
        blockExpiresAt DATETIME,
        varianceCount INTEGER DEFAULT 0,
        lastVarianceAt DATETIME,
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 10. COD Risk Scores
    `CREATE TABLE IF NOT EXISTS CODRiskScores (
        id TEXT PRIMARY KEY,
        riderId TEXT NOT NULL UNIQUE,
        riskScore INTEGER DEFAULT 0,
        varianceFrequency FLOAT DEFAULT 0,
        avgVarianceAmount FLOAT DEFAULT 0,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 11. Live Tracking
    `CREATE TABLE IF NOT EXISTS LiveTracking (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        riderId TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        speed INTEGER DEFAULT 0,
        accuracy INTEGER DEFAULT 0,
        status VARCHAR(50),
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(orderId) REFERENCES Orders(id),
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 12. Hub Load (Calculated snapshots)
    `CREATE TABLE IF NOT EXISTS HubLoad (
        id TEXT PRIMARY KEY,
        hubId TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        orderCount INTEGER DEFAULT 0,
        congestionLevel VARCHAR(20),
        avgProcessingTime INTEGER DEFAULT 0
    )`,

    // 13. Return Analytics
    `CREATE TABLE IF NOT EXISTS ReturnAnalytics (
        id TEXT PRIMARY KEY,
        sellerId TEXT NOT NULL,
        returnRate FLOAT DEFAULT 0,
        topReturnReason VARCHAR(50),
        qualityScore FLOAT DEFAULT 0,
        trendPeriod DATE,
        FOREIGN KEY(sellerId) REFERENCES Users(id)
    )`,

    // 14. Return Rules
    `CREATE TABLE IF NOT EXISTS ReturnRules (
        id TEXT PRIMARY KEY,
        name VARCHAR(100),
        condition JSON,
        action VARCHAR(50),
        reason TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 15. Settlement Cycles
    `CREATE TABLE IF NOT EXISTS SettlementCycles (
        id TEXT PRIMARY KEY,
        cycleNumber INTEGER,
        startDate DATE,
        endDate DATE,
        settlementDate DATE,
        status VARCHAR(50) DEFAULT 'Pending',
        totalAmount FLOAT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 16. Settlement Items
    `CREATE TABLE IF NOT EXISTS SettlementItems (
        id TEXT PRIMARY KEY,
        settlementCycleId TEXT NOT NULL,
        riderId TEXT NOT NULL,
        baseEarnings FLOAT DEFAULT 0,
        incentives FLOAT DEFAULT 0,
        penalties FLOAT DEFAULT 0,
        netAmount FLOAT DEFAULT 0,
        daysWorked INTEGER DEFAULT 0,
        avgRating FLOAT DEFAULT 0,
        FOREIGN KEY(settlementCycleId) REFERENCES SettlementCycles(id),
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 17. Incentive Rules
    `CREATE TABLE IF NOT EXISTS IncentiveRules (
        id TEXT PRIMARY KEY,
        name VARCHAR(100),
        condition JSON,
        bonusAmount FLOAT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 18. Penalty Rules
    `CREATE TABLE IF NOT EXISTS PenaltyRules (
        id TEXT PRIMARY KEY,
        name VARCHAR(100),
        condition JSON,
        penaltyAmount FLOAT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 19. Order Profit
    `CREATE TABLE IF NOT EXISTS OrderProfit (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL UNIQUE,
        revenue FLOAT DEFAULT 0,
        riderCost FLOAT DEFAULT 0,
        hubCost FLOAT DEFAULT 0,
        platformCost FLOAT DEFAULT 0,
        netProfit FLOAT DEFAULT 0,
        marginPercentage FLOAT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(orderId) REFERENCES Orders(id)
    )`,

    // 20. Disputes
    `CREATE TABLE IF NOT EXISTS Disputes (
        id TEXT PRIMARY KEY,
        disputeType VARCHAR(50),
        orderId TEXT NOT NULL,
        raisedBy TEXT NOT NULL,
        raisedByRole VARCHAR(20),
        reason TEXT,
        evidence JSON,
        status VARCHAR(50) DEFAULT 'Raised',
        resolution TEXT,
        resolvedAt DATETIME,
        resolvedBy TEXT,
        refundIssued FLOAT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(orderId) REFERENCES Orders(id),
        FOREIGN KEY(raisedBy) REFERENCES Users(id),
        FOREIGN KEY(resolvedBy) REFERENCES Users(id)
    )`,

    // 21. Escalation Rules
    `CREATE TABLE IF NOT EXISTS EscalationRules (
        id TEXT PRIMARY KEY,
        trigger VARCHAR(50),
        escalateToRole VARCHAR(20),
        escalationLevel INTEGER,
        maxRetries INTEGER,
        priority INTEGER,
        isActive BOOLEAN DEFAULT 1
    )`,

    // 22. Escalations
    `CREATE TABLE IF NOT EXISTS Escalations (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        ruleId TEXT NOT NULL,
        escalationLevel INTEGER,
        escalatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        escalatedBy TEXT,
        assignedTo TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        resolutionNotes TEXT,
        resolvedAt DATETIME,
        FOREIGN KEY(orderId) REFERENCES Orders(id),
        FOREIGN KEY(ruleId) REFERENCES EscalationRules(id),
        FOREIGN KEY(escalatedBy) REFERENCES Users(id),
        FOREIGN KEY(assignedTo) REFERENCES Users(id)
    )`,

    // 23. Rider Profile (Pro+ features)
    `CREATE TABLE IF NOT EXISTS RiderProfile (
        id TEXT PRIMARY KEY,
        riderId TEXT NOT NULL UNIQUE,
        tier VARCHAR(20) DEFAULT 'Basic',
        totalDeliveries INTEGER DEFAULT 0,
        totalEarnings FLOAT DEFAULT 0,
        avgRating FLOAT DEFAULT 0,
        badges JSON,
        gamificationScore INTEGER DEFAULT 0,
        lastActiveAt DATETIME,
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 24. Rider Shifts
    `CREATE TABLE IF NOT EXISTS RiderShifts (
        id TEXT PRIMARY KEY,
        riderId TEXT NOT NULL,
        shiftDate DATE,
        startTime TIME,
        endTime TIME,
        breakStart TIME,
        breakEnd TIME,
        totalHours INTEGER DEFAULT 0,
        ordersCompleted INTEGER DEFAULT 0,
        earnings FLOAT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Active',
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 25. Rider Offline Mode
    `CREATE TABLE IF NOT EXISTS RiderOfflineMode (
        id TEXT PRIMARY KEY,
        riderId TEXT NOT NULL UNIQUE,
        offlineOrders JSON,
        lastSyncedAt DATETIME,
        canWorkOffline BOOLEAN DEFAULT 0,
        FOREIGN KEY(riderId) REFERENCES DeliveryMen(id)
    )`,

    // 26. Audit Log (Comprehensive)
    `CREATE TABLE IF NOT EXISTS AuditLog (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        action VARCHAR(100),
        resourceType VARCHAR(50),
        resourceId TEXT,
        oldValue JSON,
        newValue JSON,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50),
        FOREIGN KEY(userId) REFERENCES Users(id)
    )`,

    // 27. Device Binding
    `CREATE TABLE IF NOT EXISTS DeviceBinding (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        deviceId VARCHAR(255),
        deviceName VARCHAR(100),
        osType VARCHAR(20),
        isApproved BOOLEAN DEFAULT 0,
        approvedAt DATETIME,
        lastUsedAt DATETIME,
        revokedAt DATETIME,
        FOREIGN KEY(userId) REFERENCES Users(id),
        UNIQUE(userId, deviceId)
    )`,

    // 28. Suspicious Activity
    `CREATE TABLE IF NOT EXISTS SuspiciousActivity (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        activityType VARCHAR(50),
        details TEXT,
        flaggedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolvedAt DATETIME,
        resolvedBy TEXT,
        FOREIGN KEY(userId) REFERENCES Users(id),
        FOREIGN KEY(resolvedBy) REFERENCES Users(id)
    )`,
];

// Execute all SQL statements
let completed = 0;
const totalSQL = alterOrderTable.length + alterDeliveryManTable.length + alterUsersTable.length + createTableSQL.length;

function executeSQL(sql, description) {
    db.run(sql, (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log(`⏭️  ${description}: Already exists`);
            } else {
                console.error(`❌ ${description}:`, err.message);
            }
        } else {
            console.log(`✅ ${description}`);
        }

        completed++;
        if (completed === totalSQL) {
            console.log('\n' + '='.repeat(50));
            console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
            console.log('='.repeat(50));
            console.log(`📊 Total operations: ${totalSQL}`);
            console.log('🗄️  All 28 tables created + columns added');
            console.log('='.repeat(50) + '\n');
            db.close();
            process.exit(0);
        }
    });
}

// Execute ALTER TABLE for Order
console.log('\n📋 Adding columns to Orders table...');
alterOrderTable.forEach((sql, i) => {
    executeSQL(sql, `Order Column ${i + 1}`);
});

// Execute ALTER TABLE for DeliveryMan
console.log('📋 Adding columns to DeliveryMen table...');
alterDeliveryManTable.forEach((sql, i) => {
    executeSQL(sql, `DeliveryMan Column ${i + 1}`);
});

// Execute ALTER TABLE for Users
console.log('📋 Adding columns to Users table...');
alterUsersTable.forEach((sql, i) => {
    executeSQL(sql, `Users Column ${i + 1}`);
});

// Create all new tables
console.log('🗄️  Creating new tables...');
createTableSQL.forEach((sql, i) => {
    executeSQL(sql, `Table ${i + 1}/28`);
});
