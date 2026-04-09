// ============================================
// ADVANCED FEATURES API ROUTES
// ============================================
// This file contains all new endpoints for:
// - Reviews & Ratings
// - Notifications
// - Inventory Management
// - Product Variants
// - Live Chat
// - Cart Recovery
// - Gift Cards
// - Returns
// - Loyalty Program
// - Referrals

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    Review, Notification, Inventory, ProductVariant,
    ChatMessage, SavedCart, GiftCard, ReturnRequest,
    LoyaltyTier, Referral, User, Order, Product
} from './db.js';

const router = express.Router();

// ============================================
// 1️⃣ REVIEWS & RATINGS ENDPOINTS
// ============================================

// Get reviews for a product
router.get('/api/products/:productId/reviews', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { productId: req.params.productId, status: 'approved' },
            include: [{ model: User, attributes: ['name', 'profilePhoto'] }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        const stats = await Review.sequelize.query(`
            SELECT 
                COUNT(*) as total,
                AVG(rating) as avgRating,
                SUM(CASE WHEN rating=5 THEN 1 ELSE 0 END) as five,
                SUM(CASE WHEN rating=4 THEN 1 ELSE 0 END) as four,
                SUM(CASE WHEN rating=3 THEN 1 ELSE 0 END) as three,
                SUM(CASE WHEN rating=2 THEN 1 ELSE 0 END) as two,
                SUM(CASE WHEN rating=1 THEN 1 ELSE 0 END) as one
            FROM Reviews WHERE productId = ?
        `, { replacements: [req.params.productId], type: 'SELECT' });

        res.json({
            reviews,
            stats: stats[0] || { total: 0, avgRating: 0 }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add review
router.post('/api/products/:productId/reviews', async (req, res) => {
    try {
        const { userId, orderId, rating, title, comment } = req.body;

        // Verify user purchased the product
        const order = await Order.findOne({
            where: { id: orderId, UserId: userId }
        });

        if (!order) {
            return res.status(403).json({ error: 'Cannot review product without purchase' });
        }

        const review = await Review.create({
            productId: req.params.productId,
            userId,
            orderId,
            rating,
            title,
            comment,
            isVerified: true,
            status: 'approved' // Auto-approve for now
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// 2️⃣ NOTIFICATIONS ENDPOINTS
// ============================================

// Get user notifications
router.get('/api/users/:userId/notifications', async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
router.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await Notification.update(
            { isRead: true, readAt: new Date() },
            { where: { id: req.params.id } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 3️⃣ INVENTORY & STOCK ENDPOINTS
// ============================================

// Get inventory
router.get('/api/inventory/:productId', async (req, res) => {
    try {
        const inventory = await Inventory.findOne({
            where: { productId: req.params.productId }
        });

        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found' });
        }

        res.json({
            productId: inventory.productId,
            available: inventory.quantity - inventory.reserved,
            total: inventory.quantity,
            reserved: inventory.reserved,
            sold: inventory.sold
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update inventory
router.put('/api/inventory/:productId', async (req, res) => {
    try {
        const { quantity, reorderLevel } = req.body;

        let inventory = await Inventory.findOne({
            where: { productId: req.params.productId }
        });

        if (!inventory) {
            inventory = await Inventory.create({
                productId: req.params.productId,
                quantity: quantity || 0,
                reorderLevel: reorderLevel || 10
            });
        } else {
            await inventory.update({ quantity, reorderLevel });
        }

        res.json(inventory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// 4️⃣ PRODUCT VARIANTS ENDPOINTS
// ============================================

// Get product variants
router.get('/api/products/:productId/variants', async (req, res) => {
    try {
        const variants = await ProductVariant.findAll({
            where: { productId: req.params.productId }
        });

        res.json(variants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add variant
router.post('/api/products/:productId/variants', async (req, res) => {
    try {
        const { name, sku, attributes, price, cost, quantity, images } = req.body;

        const variant = await ProductVariant.create({
            productId: req.params.productId,
            name,
            sku,
            attributes,
            price,
            cost,
            quantity,
            images
        });

        res.status(201).json(variant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// 5️⃣ LIVE CHAT ENDPOINTS
// ============================================

// Send chat message
router.post('/api/chat/messages', async (req, res) => {
    try {
        const { conversationId, userId, message } = req.body;

        const msg = await ChatMessage.create({
            conversationId: conversationId || uuidv4(),
            userId,
            message,
            type: 'text'
        });

        res.status(201).json(msg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get chat history
router.get('/api/chat/conversations/:conversationId', async (req, res) => {
    try {
        const messages = await ChatMessage.findAll({
            where: { conversationId: req.params.conversationId },
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 6️⃣ SAVED CART (ABANDONED CART RECOVERY)
// ============================================

// Save cart
router.post('/api/cart/save', async (req, res) => {
    try {
        const { userId, items, subtotal } = req.body;

        let savedCart = await SavedCart.findOne({ where: { userId } });

        if (savedCart) {
            await savedCart.update({ items, subtotal });
        } else {
            savedCart = await SavedCart.create({
                userId,
                items,
                subtotal,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            });
        }

        res.json(savedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get saved cart
router.get('/api/cart/saved/:userId', async (req, res) => {
    try {
        const cart = await SavedCart.findOne({
            where: { userId: req.params.userId }
        });

        res.json(cart || { items: [], subtotal: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 7️⃣ GIFT CARDS
// ============================================

// Create gift card
router.post('/api/gift-cards', async (req, res) => {
    try {
        const { amount, recipientEmail, buyerId } = req.body;

        const code = `GC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const giftCard = await GiftCard.create({
            code,
            amount,
            balance: amount,
            recipientEmail,
            buyerId,
            purchasedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        });

        res.status(201).json(giftCard);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's gift cards (purchased or redeemed)
router.get('/api/gift-cards/user/:userId', async (req, res) => {
    try {
        const giftCards = await GiftCard.findAll({
            where: {
                [Review.sequelize.Sequelize.Op.or]: [
                    { buyerId: req.params.userId },
                    { redeemedBy: req.params.userId }
                ]
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(giftCards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Redeem gift card
router.post('/api/gift-cards/redeem', async (req, res) => {
    try {
        const { code, userId } = req.body;

        const giftCard = await GiftCard.findOne({ where: { code } });

        if (!giftCard || !giftCard.isActive || giftCard.balance <= 0) {
            return res.status(400).json({ error: 'Invalid or expired gift card' });
        }

        await giftCard.update({
            balance: 0,
            redeemedAt: new Date(),
            redeemedBy: userId,
            isActive: false
        });

        // Add to user wallet
        const user = await User.findByPk(userId);
        await user.update({ wallet: (user.wallet || 0) + parseFloat(giftCard.amount) });

        res.json({
            success: true,
            amount: giftCard.amount,
            message: `₹${giftCard.amount} added to your wallet`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// 8️⃣ RETURN REQUESTS
// ============================================

// Create return request
router.post('/api/returns', async (req, res) => {
    try {
        const { orderId, userId, returnReason, description, images } = req.body;

        // Fetch user phone number if not provided
        let phone = req.body.phoneNumber;
        if (!phone && userId) {
            const user = await User.findByPk(userId);
            phone = user?.phone || 'Not provided';
        }

        const returnRequest = await ReturnRequest.create({
            orderId,
            userId,
            returnReason,
            description,
            phoneNumber: phone,
            images,
            status: 'requested'
        });

        // Create notification
        await Notification.create({
            userId,
            orderId,
            type: 'order_status',
            title: 'Return Request Submitted',
            message: 'Your return request has been submitted for review',
            action: 'view_return',
            actionUrl: `/returns/${returnRequest.id}`
        });

        res.status(201).json(returnRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get return requests
router.get('/api/returns/:userId', async (req, res) => {
    try {
        const returns = await ReturnRequest.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(returns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 9️⃣ LOYALTY TIERS
// ============================================

// Get loyalty tier
router.get('/api/loyalty/tier/:userId', async (req, res) => {
    try {
        let tier = await LoyaltyTier.findOne({
            where: { userId: req.params.userId }
        });

        if (!tier) {
            tier = await LoyaltyTier.create({
                userId: req.params.userId,
                tier: 'bronze'
            });
        }

        res.json(tier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update loyalty tier
router.put('/api/loyalty/tier/:userId', async (req, res) => {
    try {
        const { totalSpent, ordersCompleted } = req.body;

        let tier = await LoyaltyTier.findOne({
            where: { userId: req.params.userId }
        });

        if (!tier) {
            tier = await LoyaltyTier.create({
                userId: req.params.userId,
                totalSpent: totalSpent || 0,
                ordersCompleted: ordersCompleted || 0
            });
        } else {
            await tier.update({ totalSpent, ordersCompleted });
        }

        // Upgrade tier based on spending
        let tierLevel = 'bronze';
        let multiplier = 1.0;
        let discount = 0;

        if (totalSpent >= 50000) {
            tierLevel = 'diamond';
            multiplier = 2.0;
            discount = 15;
        } else if (totalSpent >= 20000) {
            tierLevel = 'platinum';
            multiplier = 1.75;
            discount = 12;
        } else if (totalSpent >= 10000) {
            tierLevel = 'gold';
            multiplier = 1.5;
            discount = 10;
        } else if (totalSpent >= 5000) {
            tierLevel = 'silver';
            multiplier = 1.25;
            discount = 5;
        }

        await tier.update({
            tier: tierLevel,
            supercoinsMultiplier: multiplier,
            discountPercentage: discount,
            tierSince: tier.tierSince || new Date()
        });

        res.json(tier);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// 🔟 REFERRALS
// ============================================

// Generate referral code
router.post('/api/referrals/generate', async (req, res) => {
    try {
        const { referrerId } = req.body;

        const code = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const referral = await Referral.create({
            referrerId,
            referralCode: code,
            referrerBonus: 200, // Default ₹200
            refereeBonus: 100 // Default ₹100
        });

        res.json({
            code,
            shareUrl: `${process.env.FRONTEND_URL}/signup?ref=${code}`,
            bonus: referral.referrerBonus
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Use referral code
router.post('/api/referrals/use', async (req, res) => {
    try {
        const { referralCode, refereeEmail, refereeId } = req.body;

        const referral = await Referral.findOne({
            where: { referralCode }
        });

        if (!referral) {
            return res.status(400).json({ error: 'Invalid referral code' });
        }

        await referral.update({
            refereeId,
            refereeEmail,
            status: 'signed_up'
        });

        // Add signup bonus to referee
        const refereeUser = await User.findByPk(refereeId);
        if (refereeUser) {
            await refereeUser.update({
                supercoins: (refereeUser.supercoins || 0) + referral.refereeBonus
            });
        }

        res.json({
            success: true,
            bonus: referral.refereeBonus,
            message: `₹${referral.refereeBonus} bonus added!`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get referral stats
router.get('/api/referrals/stats/:referrerId', async (req, res) => {
    try {
        const referrals = await Referral.findAll({
            where: { referrerId: req.params.referrerId }
        });

        const stats = {
            totalReferrals: referrals.length,
            signedUp: referrals.filter(r => r.status !== 'pending').length,
            firstOrders: referrals.filter(r => r.status === 'first_order').length,
            completed: referrals.filter(r => r.status === 'completed').length,
            totalEarnings: referrals.reduce((sum, r) => {
                if (r.status === 'completed') return sum + (r.referrerBonus || 0);
                return sum;
            }, 0)
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
