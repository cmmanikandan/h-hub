import express from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from './db.js';

const router = express.Router();
let initPromise = null;

const parseTokenUser = (req) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return null;

    try {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch {
        return null;
    }
};

router.use((req, _res, next) => {
    req.user = parseTokenUser(req);
    next();
});

const requireAuth = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

const requireRoles = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
};

const requireSelfOrRoles = (idField, ...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.includes(req.user.role)) return next();
    if (String(req.user.id) === String(req.params[idField] || req.body[idField])) return next();
    return res.status(403).json({ error: 'Forbidden' });
};

const nowIso = () => new Date().toISOString();

const parseJSON = (value, fallback = null) => {
    if (!value) return fallback;
    try {
        return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
        return fallback;
    }
};

const computeDynamicGroupPrice = ({ startPrice, minPrice, currentSize, targetSize }) => {
    const safeTarget = Math.max(1, Number(targetSize || 1));
    const ratio = Math.min(1, Math.max(0, Number(currentSize || 0) / safeTarget));
    const raw = Number(startPrice || 0) - (Number(startPrice || 0) - Number(minPrice || 0)) * ratio;
    return Math.max(Number(minPrice || 0), Number(raw.toFixed(2)));
};

const computeReturnRiskScore = ({ sizeMismatchRisk = 0, imageMismatchRisk = 0, compatibilityRisk = 0, historicalReturnRate = 0 }) => {
    const score = Math.round(
        (Number(sizeMismatchRisk) * 0.25)
        + (Number(imageMismatchRisk) * 0.25)
        + (Number(compatibilityRisk) * 0.2)
        + (Number(historicalReturnRate) * 0.3)
    );
    return Math.max(0, Math.min(100, score));
};

const getRiskLevel = (score) => {
    if (score >= 75) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
};

const computeSellerTrust = ({ onTimeDispatch = 0, complaintResolution = 0, returnHonesty = 0, packagingQuality = 0 }) => {
    const weighted = (
        Number(onTimeDispatch) * 0.35
        + Number(complaintResolution) * 0.2
        + Number(returnHonesty) * 0.25
        + Number(packagingQuality) * 0.2
    );
    return Math.round(Math.max(0, Math.min(100, weighted)));
};

const ensureInnovationTables = async () => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationGroupBuyRooms (
                roomId TEXT PRIMARY KEY,
                productId TEXT NOT NULL,
                pincode TEXT NOT NULL,
                targetSize INTEGER NOT NULL,
                currentSize INTEGER NOT NULL DEFAULT 0,
                startPrice REAL NOT NULL,
                minPrice REAL NOT NULL,
                currentPrice REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'live',
                expiresAt TEXT NOT NULL,
                createdBy TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationGroupBuyMembers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roomId TEXT NOT NULL,
                userId TEXT NOT NULL,
                userName TEXT,
                joinedAt TEXT NOT NULL,
                UNIQUE(roomId, userId)
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationDeliveryMissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                riderId TEXT NOT NULL,
                missionType TEXT NOT NULL,
                missionDate TEXT NOT NULL,
                progress INTEGER NOT NULL DEFAULT 0,
                target INTEGER NOT NULL DEFAULT 1,
                bonus REAL NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active',
                meta TEXT,
                updatedAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationReturnRiskEvents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT,
                productId TEXT NOT NULL,
                score INTEGER NOT NULL,
                riskLevel TEXT NOT NULL,
                verifiedQualityAddon INTEGER NOT NULL DEFAULT 0,
                nudges TEXT,
                createdAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationVerificationPayments (
                orderId TEXT PRIMARY KEY,
                amount REAL NOT NULL,
                paymentMode TEXT NOT NULL DEFAULT 'hold',
                status TEXT NOT NULL DEFAULT 'pending_verification',
                otpVerifiedAt TEXT,
                deliveryPhotoUrl TEXT,
                unboxingHash TEXT,
                holdReason TEXT,
                releasedAt TEXT,
                updatedAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationSellerTrustSnapshots (
                sellerId TEXT PRIMARY KEY,
                onTimeDispatch REAL NOT NULL,
                complaintResolution REAL NOT NULL,
                returnHonesty REAL NOT NULL,
                packagingQuality REAL NOT NULL,
                trustScore INTEGER NOT NULL,
                updatedAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationNegotiations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                productId TEXT NOT NULL,
                basePrice REAL NOT NULL,
                minPrice REAL NOT NULL,
                currentOffer REAL NOT NULL,
                lastUserOffer REAL,
                rounds INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active',
                updatedAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationResellListings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sellerUserId TEXT NOT NULL,
                originalOrderId TEXT NOT NULL,
                productId TEXT NOT NULL,
                pincode TEXT NOT NULL,
                price REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                verificationToken TEXT NOT NULL,
                createdAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationFamilyWallets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ownerUserId TEXT NOT NULL,
                walletName TEXT NOT NULL,
                monthlyLimit REAL NOT NULL DEFAULT 0,
                balance REAL NOT NULL DEFAULT 0,
                createdAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationFamilyWalletMembers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                walletId INTEGER NOT NULL,
                userId TEXT NOT NULL,
                role TEXT NOT NULL,
                spendCap REAL NOT NULL DEFAULT 0,
                categoryLocks TEXT,
                createdAt TEXT NOT NULL,
                UNIQUE(walletId, userId)
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationDispatchSnapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId TEXT NOT NULL,
                routeConfidence REAL NOT NULL,
                delayProbability REAL NOT NULL,
                etaMinMinutes INTEGER NOT NULL,
                etaMaxMinutes INTEGER NOT NULL,
                updatedAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationPackagingClaims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId TEXT NOT NULL,
                userId TEXT NOT NULL,
                premium REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'submitted',
                beforePhotoUrl TEXT,
                afterPhotoUrl TEXT,
                imageDiffScore REAL,
                createdAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationAuthenticityChain (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                productId TEXT NOT NULL,
                orderId TEXT,
                stage TEXT NOT NULL,
                actorId TEXT,
                eventHash TEXT NOT NULL,
                meta TEXT,
                createdAt TEXT NOT NULL
            )
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS InnovationReverseLoyaltyEvents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                eventType TEXT NOT NULL,
                points INTEGER NOT NULL,
                pincode TEXT,
                createdAt TEXT NOT NULL
            )
        `);
    })();

    return initPromise;
};

router.use(async (_req, _res, next) => {
    try {
        await ensureInnovationTables();
        next();
    } catch (error) {
        next(error);
    }
});

router.get('/api/innovations/health', async (_req, res) => {
    res.json({ status: 'ok', module: 'innovation-features-v1', timestamp: nowIso(), features: 12 });
});

router.get('/api/innovations/overview', requireRoles('admin', 'logix_admin'), async (_req, res) => {
    try {
        const datasets = [
            { key: 'group-buy-rooms', title: 'Group Buy Rooms', table: 'InnovationGroupBuyRooms', latestColumn: 'updatedAt' },
            { key: 'group-buy-members', title: 'Group Buy Members', table: 'InnovationGroupBuyMembers', latestColumn: 'joinedAt' },
            { key: 'delivery-missions', title: 'Delivery Missions', table: 'InnovationDeliveryMissions', latestColumn: 'updatedAt' },
            { key: 'return-risk-events', title: 'Return Risk Events', table: 'InnovationReturnRiskEvents', latestColumn: 'createdAt' },
            { key: 'verification-payments', title: 'Verification Payments', table: 'InnovationVerificationPayments', latestColumn: 'updatedAt' },
            { key: 'seller-trust', title: 'Seller Trust Snapshots', table: 'InnovationSellerTrustSnapshots', latestColumn: 'updatedAt' },
            { key: 'negotiations', title: 'AI Negotiations', table: 'InnovationNegotiations', latestColumn: 'updatedAt' },
            { key: 'resell-listings', title: 'Resell Listings', table: 'InnovationResellListings', latestColumn: 'createdAt' },
            { key: 'family-wallets', title: 'Family Wallets', table: 'InnovationFamilyWallets', latestColumn: 'createdAt' },
            { key: 'dispatch-snapshots', title: 'Dispatch Snapshots', table: 'InnovationDispatchSnapshots', latestColumn: 'updatedAt' },
            { key: 'packaging-claims', title: 'Packaging Claims', table: 'InnovationPackagingClaims', latestColumn: 'createdAt' },
            { key: 'authenticity-chain', title: 'Authenticity Events', table: 'InnovationAuthenticityChain', latestColumn: 'createdAt' },
            { key: 'reverse-loyalty', title: 'Reverse Loyalty Events', table: 'InnovationReverseLoyaltyEvents', latestColumn: 'createdAt' }
        ];

        const cards = await Promise.all(
            datasets.map(async (dataset) => {
                const rows = await sequelize.query(
                    `SELECT COUNT(*) as total, MAX(${dataset.latestColumn}) as latestAt FROM ${dataset.table}`,
                    { type: QueryTypes.SELECT }
                );
                const total = Number(rows[0]?.total || 0);
                return {
                    key: dataset.key,
                    title: dataset.title,
                    total,
                    latestAt: rows[0]?.latestAt || null
                };
            })
        );

        const totalEvents = cards.reduce((sum, card) => sum + Number(card.total || 0), 0);
        const latestAt = cards
            .map((card) => card.latestAt)
            .filter(Boolean)
            .sort()
            .slice(-1)[0] || null;

        res.json({
            success: true,
            generatedAt: nowIso(),
            summary: {
                modules: cards.length,
                totalEvents,
                latestAt
            },
            cards
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/group-buy/rooms', requireAuth, async (req, res) => {
    try {
        const { roomId, productId, pincode, targetSize = 10, startPrice, minPrice, expiresAt, createdBy } = req.body;
        if (!roomId || !productId || !pincode || startPrice == null || minPrice == null) {
            return res.status(400).json({ error: 'roomId, productId, pincode, startPrice, minPrice are required' });
        }

        const now = nowIso();
        const exp = expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await sequelize.query(
            `INSERT INTO InnovationGroupBuyRooms (roomId, productId, pincode, targetSize, currentSize, startPrice, minPrice, currentPrice, status, expiresAt, createdBy, createdAt, updatedAt)
             VALUES (:roomId, :productId, :pincode, :targetSize, 0, :startPrice, :minPrice, :startPrice, 'live', :expiresAt, :createdBy, :createdAt, :updatedAt)`,
            {
                replacements: { roomId, productId, pincode, targetSize, startPrice, minPrice, expiresAt: exp, createdBy: createdBy || null, createdAt: now, updatedAt: now },
                type: QueryTypes.INSERT
            }
        );

        res.status(201).json({ success: true, roomId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/api/innovations/group-buy/rooms', requireAuth, async (req, res) => {
    try {
        const { pincode, productId } = req.query;
        const where = [];
        const replacements = {};

        if (pincode) {
            where.push('pincode = :pincode');
            replacements.pincode = pincode;
        }
        if (productId) {
            where.push('productId = :productId');
            replacements.productId = productId;
        }
        where.push("status = 'live'");

        const rows = await sequelize.query(
            `SELECT * FROM InnovationGroupBuyRooms WHERE ${where.join(' AND ')} ORDER BY createdAt DESC`,
            { replacements, type: QueryTypes.SELECT }
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/group-buy/rooms/:roomId/join', requireAuth, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId, userName } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const rooms = await sequelize.query(
            `SELECT * FROM InnovationGroupBuyRooms WHERE roomId = :roomId`,
            { replacements: { roomId }, type: QueryTypes.SELECT }
        );
        const room = rooms[0];
        if (!room) return res.status(404).json({ error: 'Room not found' });
        if (room.status !== 'live') return res.status(400).json({ error: 'Room is not live' });

        await sequelize.query(
            `INSERT OR IGNORE INTO InnovationGroupBuyMembers (roomId, userId, userName, joinedAt)
             VALUES (:roomId, :userId, :userName, :joinedAt)`,
            { replacements: { roomId, userId, userName: userName || null, joinedAt: nowIso() }, type: QueryTypes.INSERT }
        );

        const counts = await sequelize.query(
            `SELECT COUNT(*) as total FROM InnovationGroupBuyMembers WHERE roomId = :roomId`,
            { replacements: { roomId }, type: QueryTypes.SELECT }
        );

        const currentSize = Number(counts[0]?.total || 0);
        const currentPrice = computeDynamicGroupPrice({
            startPrice: room.startPrice,
            minPrice: room.minPrice,
            currentSize,
            targetSize: room.targetSize
        });

        const nextStatus = currentSize >= Number(room.targetSize) ? 'locked' : 'live';
        await sequelize.query(
            `UPDATE InnovationGroupBuyRooms
             SET currentSize = :currentSize, currentPrice = :currentPrice, status = :status, updatedAt = :updatedAt
             WHERE roomId = :roomId`,
            { replacements: { roomId, currentSize, currentPrice, status: nextStatus, updatedAt: nowIso() }, type: QueryTypes.UPDATE }
        );

        res.json({ success: true, roomId, currentSize, currentPrice, status: nextStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/delivery-missions/progress', requireRoles('delivery', 'admin'), async (req, res) => {
    try {
        const { riderId, missionType, increment = 1, target = 10, baseBonus = 100, savingsFactor = 1 } = req.body;
        if (!riderId || !missionType) return res.status(400).json({ error: 'riderId and missionType are required' });

        const missionDate = new Date().toISOString().slice(0, 10);
        const rows = await sequelize.query(
            `SELECT * FROM InnovationDeliveryMissions WHERE riderId = :riderId AND missionType = :missionType AND missionDate = :missionDate LIMIT 1`,
            { replacements: { riderId, missionType, missionDate }, type: QueryTypes.SELECT }
        );

        const dynamicBonus = Number(baseBonus) * Number(savingsFactor || 1);
        if (!rows.length) {
            await sequelize.query(
                `INSERT INTO InnovationDeliveryMissions (riderId, missionType, missionDate, progress, target, bonus, status, meta, updatedAt)
                 VALUES (:riderId, :missionType, :missionDate, :progress, :target, :bonus, 'active', :meta, :updatedAt)`,
                {
                    replacements: {
                        riderId,
                        missionType,
                        missionDate,
                        progress: increment,
                        target,
                        bonus: dynamicBonus,
                        meta: JSON.stringify({ savingsFactor }),
                        updatedAt: nowIso()
                    },
                    type: QueryTypes.INSERT
                }
            );
        } else {
            const mission = rows[0];
            const progress = Number(mission.progress || 0) + Number(increment || 0);
            const status = progress >= Number(mission.target) ? 'completed' : 'active';
            await sequelize.query(
                `UPDATE InnovationDeliveryMissions SET progress = :progress, status = :status, bonus = :bonus, updatedAt = :updatedAt WHERE id = :id`,
                { replacements: { id: mission.id, progress, status, bonus: dynamicBonus, updatedAt: nowIso() }, type: QueryTypes.UPDATE }
            );
        }

        const latest = await sequelize.query(
            `SELECT * FROM InnovationDeliveryMissions WHERE riderId = :riderId AND missionType = :missionType AND missionDate = :missionDate LIMIT 1`,
            { replacements: { riderId, missionType, missionDate }, type: QueryTypes.SELECT }
        );
        res.json({ success: true, mission: latest[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/innovations/delivery-missions/:riderId', requireSelfOrRoles('riderId', 'admin', 'delivery'), async (req, res) => {
    try {
        const missions = await sequelize.query(
            `SELECT * FROM InnovationDeliveryMissions WHERE riderId = :riderId ORDER BY missionDate DESC, updatedAt DESC`,
            { replacements: { riderId: req.params.riderId }, type: QueryTypes.SELECT }
        );
        res.json(missions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/return-risk/score', requireAuth, async (req, res) => {
    try {
        const {
            userId,
            productId,
            sizeMismatchRisk = 20,
            imageMismatchRisk = 20,
            compatibilityRisk = 20,
            historicalReturnRate = 20,
            verifiedQualityAddon = false
        } = req.body;

        if (!productId) return res.status(400).json({ error: 'productId is required' });

        const score = computeReturnRiskScore({ sizeMismatchRisk, imageMismatchRisk, compatibilityRisk, historicalReturnRate });
        const riskLevel = getRiskLevel(score);
        const nudges = [];

        if (Number(sizeMismatchRisk) >= 50) nudges.push('Use size-guide and compare measurements.');
        if (Number(imageMismatchRisk) >= 50) nudges.push('Inspect all product photos and zoom previews.');
        if (Number(compatibilityRisk) >= 50) nudges.push('Confirm model compatibility before ordering.');
        if (riskLevel === 'high') nudges.push('Recommended: add Verified Quality inspection at checkout.');

        await sequelize.query(
            `INSERT INTO InnovationReturnRiskEvents (userId, productId, score, riskLevel, verifiedQualityAddon, nudges, createdAt)
             VALUES (:userId, :productId, :score, :riskLevel, :verifiedQualityAddon, :nudges, :createdAt)`,
            {
                replacements: {
                    userId: userId || null,
                    productId,
                    score,
                    riskLevel,
                    verifiedQualityAddon: verifiedQualityAddon ? 1 : 0,
                    nudges: JSON.stringify(nudges),
                    createdAt: nowIso()
                },
                type: QueryTypes.INSERT
            }
        );

        res.json({ score, riskLevel, nudges, verifiedQualityAddon: !!verifiedQualityAddon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/verification-payment/hold', requireAuth, async (req, res) => {
    try {
        const { orderId, amount, holdReason = 'Pending OTP + delivery proof verification' } = req.body;
        if (!orderId || amount == null) return res.status(400).json({ error: 'orderId and amount are required' });

        const existing = await sequelize.query(
            `SELECT orderId FROM InnovationVerificationPayments WHERE orderId = :orderId`,
            { replacements: { orderId }, type: QueryTypes.SELECT }
        );

        if (existing.length) {
            await sequelize.query(
                `UPDATE InnovationVerificationPayments
                 SET amount = :amount, status = 'pending_verification', holdReason = :holdReason, updatedAt = :updatedAt
                 WHERE orderId = :orderId`,
                { replacements: { orderId, amount, holdReason, updatedAt: nowIso() }, type: QueryTypes.UPDATE }
            );
        } else {
            await sequelize.query(
                `INSERT INTO InnovationVerificationPayments (orderId, amount, paymentMode, status, holdReason, updatedAt)
                 VALUES (:orderId, :amount, 'hold', 'pending_verification', :holdReason, :updatedAt)`,
                { replacements: { orderId, amount, holdReason, updatedAt: nowIso() }, type: QueryTypes.INSERT }
            );
        }

        res.json({ success: true, orderId, status: 'pending_verification' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/verification-payment/:orderId/verify-otp', requireAuth, async (req, res) => {
    try {
        await sequelize.query(
            `UPDATE InnovationVerificationPayments SET otpVerifiedAt = :otpVerifiedAt, updatedAt = :updatedAt WHERE orderId = :orderId`,
            { replacements: { orderId: req.params.orderId, otpVerifiedAt: nowIso(), updatedAt: nowIso() }, type: QueryTypes.UPDATE }
        );
        res.json({ success: true, orderId: req.params.orderId, otpVerified: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/verification-payment/:orderId/upload-proof', requireAuth, async (req, res) => {
    try {
        const { deliveryPhotoUrl, unboxingHash = null } = req.body;
        await sequelize.query(
            `UPDATE InnovationVerificationPayments
             SET deliveryPhotoUrl = :deliveryPhotoUrl, unboxingHash = :unboxingHash, updatedAt = :updatedAt
             WHERE orderId = :orderId`,
            {
                replacements: {
                    orderId: req.params.orderId,
                    deliveryPhotoUrl: deliveryPhotoUrl || null,
                    unboxingHash,
                    updatedAt: nowIso()
                },
                type: QueryTypes.UPDATE
            }
        );
        res.json({ success: true, orderId: req.params.orderId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/verification-payment/:orderId/release', requireRoles('admin', 'logix_admin'), async (req, res) => {
    try {
        await sequelize.query(
            `UPDATE InnovationVerificationPayments
             SET status = 'released', releasedAt = :releasedAt, holdReason = NULL, updatedAt = :updatedAt
             WHERE orderId = :orderId`,
            { replacements: { orderId: req.params.orderId, releasedAt: nowIso(), updatedAt: nowIso() }, type: QueryTypes.UPDATE }
        );
        res.json({ success: true, orderId: req.params.orderId, status: 'released' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/seller-trust/recompute/:sellerId', requireRoles('admin'), async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { onTimeDispatch = 80, complaintResolution = 80, returnHonesty = 80, packagingQuality = 80 } = req.body;

        const trustScore = computeSellerTrust({ onTimeDispatch, complaintResolution, returnHonesty, packagingQuality });
        const existing = await sequelize.query(
            `SELECT sellerId FROM InnovationSellerTrustSnapshots WHERE sellerId = :sellerId`,
            { replacements: { sellerId }, type: QueryTypes.SELECT }
        );

        if (existing.length) {
            await sequelize.query(
                `UPDATE InnovationSellerTrustSnapshots
                 SET onTimeDispatch = :onTimeDispatch, complaintResolution = :complaintResolution, returnHonesty = :returnHonesty,
                     packagingQuality = :packagingQuality, trustScore = :trustScore, updatedAt = :updatedAt
                 WHERE sellerId = :sellerId`,
                {
                    replacements: { sellerId, onTimeDispatch, complaintResolution, returnHonesty, packagingQuality, trustScore, updatedAt: nowIso() },
                    type: QueryTypes.UPDATE
                }
            );
        } else {
            await sequelize.query(
                `INSERT INTO InnovationSellerTrustSnapshots
                 (sellerId, onTimeDispatch, complaintResolution, returnHonesty, packagingQuality, trustScore, updatedAt)
                 VALUES (:sellerId, :onTimeDispatch, :complaintResolution, :returnHonesty, :packagingQuality, :trustScore, :updatedAt)`,
                {
                    replacements: { sellerId, onTimeDispatch, complaintResolution, returnHonesty, packagingQuality, trustScore, updatedAt: nowIso() },
                    type: QueryTypes.INSERT
                }
            );
        }

        res.json({ success: true, sellerId, trustScore });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/innovations/seller-trust/:sellerId', requireSelfOrRoles('sellerId', 'admin', 'seller'), async (req, res) => {
    try {
        const rows = await sequelize.query(
            `SELECT * FROM InnovationSellerTrustSnapshots WHERE sellerId = :sellerId`,
            { replacements: { sellerId: req.params.sellerId }, type: QueryTypes.SELECT }
        );
        if (!rows.length) return res.status(404).json({ error: 'Seller trust snapshot not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/ai-negotiation/start', requireRoles('user', 'seller', 'admin'), async (req, res) => {
    try {
        const { userId, productId, basePrice, minPrice } = req.body;
        if (!userId || !productId || basePrice == null || minPrice == null) {
            return res.status(400).json({ error: 'userId, productId, basePrice, minPrice are required' });
        }

        await sequelize.query(
            `INSERT INTO InnovationNegotiations (userId, productId, basePrice, minPrice, currentOffer, rounds, status, updatedAt)
             VALUES (:userId, :productId, :basePrice, :minPrice, :currentOffer, 0, 'active', :updatedAt)`,
            {
                replacements: { userId, productId, basePrice, minPrice, currentOffer: basePrice, updatedAt: nowIso() },
                type: QueryTypes.INSERT
            }
        );

        const negotiation = await sequelize.query(
            `SELECT * FROM InnovationNegotiations WHERE userId = :userId AND productId = :productId ORDER BY id DESC LIMIT 1`,
            { replacements: { userId, productId }, type: QueryTypes.SELECT }
        );

        res.status(201).json({ success: true, negotiation: negotiation[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/ai-negotiation/:id/counter', requireRoles('user', 'seller', 'admin'), async (req, res) => {
    try {
        const { userOffer } = req.body;
        const rows = await sequelize.query(
            `SELECT * FROM InnovationNegotiations WHERE id = :id`,
            { replacements: { id: req.params.id }, type: QueryTypes.SELECT }
        );

        const n = rows[0];
        if (!n) return res.status(404).json({ error: 'Negotiation not found' });
        if (n.status !== 'active') return res.status(400).json({ error: 'Negotiation is closed' });

        const safeUserOffer = Number(userOffer || 0);
        const rounds = Number(n.rounds || 0) + 1;
        const targetStep = Math.max(1, (Number(n.basePrice) - Number(n.minPrice)) * 0.12);
        const nextOffer = Math.max(Number(n.minPrice), Number((Math.max(safeUserOffer, Number(n.minPrice)) + targetStep).toFixed(2)));
        const status = safeUserOffer >= nextOffer || safeUserOffer <= Number(n.minPrice) ? 'deal' : (rounds >= 6 ? 'expired' : 'active');

        await sequelize.query(
            `UPDATE InnovationNegotiations
             SET currentOffer = :currentOffer, lastUserOffer = :lastUserOffer, rounds = :rounds, status = :status, updatedAt = :updatedAt
             WHERE id = :id`,
            { replacements: { id: req.params.id, currentOffer: nextOffer, lastUserOffer: safeUserOffer, rounds, status, updatedAt: nowIso() }, type: QueryTypes.UPDATE }
        );

        res.json({ success: true, negotiationId: Number(req.params.id), aiCounterOffer: nextOffer, rounds, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/resell/listings', requireAuth, async (req, res) => {
    try {
        const { sellerUserId, originalOrderId, productId, pincode, price } = req.body;
        if (!sellerUserId || !originalOrderId || !productId || !pincode || price == null) {
            return res.status(400).json({ error: 'sellerUserId, originalOrderId, productId, pincode, price are required' });
        }

        const verificationToken = `RESALE-${originalOrderId}-${Date.now()}`;
        await sequelize.query(
            `INSERT INTO InnovationResellListings
             (sellerUserId, originalOrderId, productId, pincode, price, status, verificationToken, createdAt)
             VALUES (:sellerUserId, :originalOrderId, :productId, :pincode, :price, 'active', :verificationToken, :createdAt)`,
            { replacements: { sellerUserId, originalOrderId, productId, pincode, price, verificationToken, createdAt: nowIso() }, type: QueryTypes.INSERT }
        );

        res.status(201).json({ success: true, verificationToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/innovations/resell/listings', requireAuth, async (req, res) => {
    try {
        const { pincode } = req.query;
        const rows = await sequelize.query(
            `SELECT * FROM InnovationResellListings WHERE status = 'active' ${pincode ? 'AND pincode = :pincode' : ''} ORDER BY createdAt DESC`,
            { replacements: pincode ? { pincode } : {}, type: QueryTypes.SELECT }
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/family-wallets', requireRoles('user', 'admin'), async (req, res) => {
    try {
        const { ownerUserId, walletName, monthlyLimit = 0, balance = 0 } = req.body;
        if (!ownerUserId || !walletName) return res.status(400).json({ error: 'ownerUserId and walletName are required' });

        await sequelize.query(
            `INSERT INTO InnovationFamilyWallets (ownerUserId, walletName, monthlyLimit, balance, createdAt)
             VALUES (:ownerUserId, :walletName, :monthlyLimit, :balance, :createdAt)`,
            { replacements: { ownerUserId, walletName, monthlyLimit, balance, createdAt: nowIso() }, type: QueryTypes.INSERT }
        );

        const created = await sequelize.query(
            `SELECT * FROM InnovationFamilyWallets WHERE ownerUserId = :ownerUserId ORDER BY id DESC LIMIT 1`,
            { replacements: { ownerUserId }, type: QueryTypes.SELECT }
        );
        res.status(201).json(created[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/family-wallets/:walletId/members', requireRoles('user', 'admin'), async (req, res) => {
    try {
        const { userId, role = 'member', spendCap = 0, categoryLocks = [] } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        await sequelize.query(
            `INSERT OR REPLACE INTO InnovationFamilyWalletMembers
             (id, walletId, userId, role, spendCap, categoryLocks, createdAt)
             VALUES (
                COALESCE((SELECT id FROM InnovationFamilyWalletMembers WHERE walletId = :walletId AND userId = :userId), NULL),
                :walletId, :userId, :role, :spendCap, :categoryLocks, :createdAt
             )`,
            {
                replacements: {
                    walletId: Number(req.params.walletId),
                    userId,
                    role,
                    spendCap,
                    categoryLocks: JSON.stringify(categoryLocks),
                    createdAt: nowIso()
                },
                type: QueryTypes.INSERT
            }
        );

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/family-wallets/:walletId/spend-request', requireRoles('user', 'admin'), async (req, res) => {
    try {
        const { userId, amount, category = '' } = req.body;
        if (!userId || amount == null) return res.status(400).json({ error: 'userId and amount are required' });

        const wallets = await sequelize.query(
            `SELECT * FROM InnovationFamilyWallets WHERE id = :walletId`,
            { replacements: { walletId: Number(req.params.walletId) }, type: QueryTypes.SELECT }
        );
        const wallet = wallets[0];
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        const members = await sequelize.query(
            `SELECT * FROM InnovationFamilyWalletMembers WHERE walletId = :walletId AND userId = :userId`,
            { replacements: { walletId: Number(req.params.walletId), userId }, type: QueryTypes.SELECT }
        );
        const member = members[0];
        if (!member) return res.status(403).json({ error: 'User not linked to this wallet' });

        const locks = parseJSON(member.categoryLocks, []);
        if (category && locks.includes(category)) {
            return res.status(403).json({ approved: false, reason: `Category '${category}' is locked for this member` });
        }

        if (Number(member.spendCap || 0) > 0 && Number(amount) > Number(member.spendCap)) {
            return res.status(403).json({ approved: false, reason: 'Amount exceeds member spend cap' });
        }

        if (Number(wallet.balance || 0) < Number(amount)) {
            return res.status(403).json({ approved: false, reason: 'Insufficient family wallet balance' });
        }

        await sequelize.query(
            `UPDATE InnovationFamilyWallets SET balance = :newBalance WHERE id = :walletId`,
            { replacements: { walletId: Number(req.params.walletId), newBalance: Number(wallet.balance) - Number(amount) }, type: QueryTypes.UPDATE }
        );

        res.json({ approved: true, remainingBalance: Number(wallet.balance) - Number(amount) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/dispatch-map/upsert', requireRoles('delivery', 'admin'), async (req, res) => {
    try {
        const { orderId, routeConfidence = 80, delayProbability = 20, etaMinMinutes = 20, etaMaxMinutes = 40 } = req.body;
        if (!orderId) return res.status(400).json({ error: 'orderId is required' });

        await sequelize.query(
            `INSERT INTO InnovationDispatchSnapshots (orderId, routeConfidence, delayProbability, etaMinMinutes, etaMaxMinutes, updatedAt)
             VALUES (:orderId, :routeConfidence, :delayProbability, :etaMinMinutes, :etaMaxMinutes, :updatedAt)`,
            { replacements: { orderId, routeConfidence, delayProbability, etaMinMinutes, etaMaxMinutes, updatedAt: nowIso() }, type: QueryTypes.INSERT }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/innovations/dispatch-map/:orderId', requireAuth, async (req, res) => {
    try {
        const rows = await sequelize.query(
            `SELECT * FROM InnovationDispatchSnapshots WHERE orderId = :orderId ORDER BY updatedAt DESC LIMIT 1`,
            { replacements: { orderId: req.params.orderId }, type: QueryTypes.SELECT }
        );
        if (!rows.length) return res.status(404).json({ error: 'Dispatch snapshot not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/packaging-insurance/quote', requireAuth, async (req, res) => {
    try {
        const { orderAmount } = req.body;
        const amount = Number(orderAmount || 0);
        if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Valid orderAmount is required' });

        const premium = Math.max(5, Math.min(299, Number((amount * 0.008).toFixed(2))));
        res.json({ premium, coverage: amount, rule: '0.8% premium (min 5, max 299)' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/packaging-insurance/claim', requireAuth, async (req, res) => {
    try {
        const { orderId, userId, premium, beforePhotoUrl, afterPhotoUrl } = req.body;
        if (!orderId || !userId || premium == null) {
            return res.status(400).json({ error: 'orderId, userId and premium are required' });
        }

        const imageDiffScore = Number((Math.random() * 100).toFixed(2));
        const status = imageDiffScore >= 45 ? 'approved' : 'manual_review';

        await sequelize.query(
            `INSERT INTO InnovationPackagingClaims
             (orderId, userId, premium, status, beforePhotoUrl, afterPhotoUrl, imageDiffScore, createdAt)
             VALUES (:orderId, :userId, :premium, :status, :beforePhotoUrl, :afterPhotoUrl, :imageDiffScore, :createdAt)`,
            {
                replacements: { orderId, userId, premium, status, beforePhotoUrl: beforePhotoUrl || null, afterPhotoUrl: afterPhotoUrl || null, imageDiffScore, createdAt: nowIso() },
                type: QueryTypes.INSERT
            }
        );

        res.status(201).json({ success: true, status, imageDiffScore });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/authenticity/record', requireRoles('seller', 'admin', 'delivery'), async (req, res) => {
    try {
        const { productId, orderId = null, stage, actorId = null, eventHash, meta = {} } = req.body;
        if (!productId || !stage || !eventHash) return res.status(400).json({ error: 'productId, stage and eventHash are required' });

        await sequelize.query(
            `INSERT INTO InnovationAuthenticityChain (productId, orderId, stage, actorId, eventHash, meta, createdAt)
             VALUES (:productId, :orderId, :stage, :actorId, :eventHash, :meta, :createdAt)`,
            { replacements: { productId, orderId, stage, actorId, eventHash, meta: JSON.stringify(meta), createdAt: nowIso() }, type: QueryTypes.INSERT }
        );

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/innovations/authenticity/:productId', requireAuth, async (req, res) => {
    try {
        const events = await sequelize.query(
            `SELECT * FROM InnovationAuthenticityChain WHERE productId = :productId ORDER BY createdAt ASC`,
            { replacements: { productId: req.params.productId }, type: QueryTypes.SELECT }
        );
        const normalized = events.map((event) => ({ ...event, meta: parseJSON(event.meta, {}) }));
        res.json(normalized);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/innovations/reverse-loyalty/award', requireAuth, async (req, res) => {
    try {
        const { userId, eventType, pincode = null } = req.body;
        if (!userId || !eventType) return res.status(400).json({ error: 'userId and eventType are required' });

        const eventPointMap = {
            low_return_behavior: 35,
            green_delivery_slot: 20,
            reusable_packaging_return: 40,
            verified_honest_review: 15,
            community_resell: 25
        };

        const points = eventPointMap[eventType] || 10;
        await sequelize.query(
            `INSERT INTO InnovationReverseLoyaltyEvents (userId, eventType, points, pincode, createdAt)
             VALUES (:userId, :eventType, :points, :pincode, :createdAt)`,
            { replacements: { userId, eventType, points, pincode, createdAt: nowIso() }, type: QueryTypes.INSERT }
        );

        const total = await sequelize.query(
            `SELECT COALESCE(SUM(points), 0) as totalPoints FROM InnovationReverseLoyaltyEvents WHERE userId = :userId`,
            { replacements: { userId }, type: QueryTypes.SELECT }
        );

        res.json({ success: true, pointsAwarded: points, totalPoints: Number(total[0]?.totalPoints || 0) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/innovations/reverse-loyalty/:userId', requireSelfOrRoles('userId', 'admin'), async (req, res) => {
    try {
        const events = await sequelize.query(
            `SELECT * FROM InnovationReverseLoyaltyEvents WHERE userId = :userId ORDER BY createdAt DESC`,
            { replacements: { userId: req.params.userId }, type: QueryTypes.SELECT }
        );

        const totalPoints = events.reduce((sum, event) => sum + Number(event.points || 0), 0);
        res.json({ totalPoints, events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.use((error, _req, res, _next) => {
    console.error('Innovation router error:', error);
    res.status(500).json({ error: 'Innovation feature module failed', detail: error.message });
});

export default router;
