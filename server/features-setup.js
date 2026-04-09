// ============================================
// FEATURE SETUP SCRIPT - Creates all new models and features
// ============================================

import { sequelize, DataTypes } from './db.js';

// 1️⃣ REVIEWS & RATINGS MODEL
export const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    orderId: {
        type: DataTypes.UUID,
        references: { model: 'Orders', key: 'id' }
    },
    rating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 5 },
        allowNull: false
    },
    title: DataTypes.STRING,
    comment: DataTypes.TEXT,
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    helpfulCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 2️⃣ NOTIFICATIONS MODEL
export const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    orderId: {
        type: DataTypes.UUID,
        references: { model: 'Orders', key: 'id' }
    },
    type: {
        type: DataTypes.ENUM(
            'order_status',
            'delivery_update',
            'promotional',
            'review_request',
            'cart_reminder',
            'price_drop',
            'back_in_stock',
            'system'
        ),
        allowNull: false
    },
    title: DataTypes.STRING,
    message: DataTypes.TEXT,
    data: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    action: DataTypes.STRING,
    actionUrl: DataTypes.STRING,
    readAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 3️⃣ INVENTORY MODEL
export const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    reserved: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    warehouseLocation: DataTypes.STRING,
    lastRestocked: DataTypes.DATE,
    reorderLevel: DataTypes.INTEGER,
    reorderQuantity: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 4️⃣ PRODUCT VARIANTS MODEL
export const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' }
    },
    name: DataTypes.STRING,
    sku: DataTypes.STRING,
    attributes: {
        type: DataTypes.JSON,
        defaultValue: {}, // e.g., { size: 'L', color: 'red' }
        comment: 'JSON object with variant attributes'
    },
    price: DataTypes.DECIMAL(10, 2),
    cost: DataTypes.DECIMAL(10, 2),
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 5️⃣ CHAT MESSAGES MODEL
export const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    conversationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    agentId: {
        type: DataTypes.UUID,
        references: { model: 'Users', key: 'id' }
    },
    message: DataTypes.TEXT,
    attachments: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'document'),
        defaultValue: 'text'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 6️⃣ SAVED CART MODEL (for abandoned cart recovery)
export const SavedCart = sequelize.define('SavedCart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    items: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of cart items'
    },
    subtotal: DataTypes.DECIMAL(10, 2),
    recoveryEmailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    expiresAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 7️⃣ GIFT CARD MODEL
export const GiftCard = sequelize.define('GiftCard', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    recipientEmail: DataTypes.STRING,
    buyerId: {
        type: DataTypes.UUID,
        references: { model: 'Users', key: 'id' }
    },
    purchasedAt: DataTypes.DATE,
    redeemedAt: DataTypes.DATE,
    redeemedBy: {
        type: DataTypes.UUID,
        references: { model: 'Users', key: 'id' }
    },
    expiresAt: DataTypes.DATE,
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 8️⃣ RETURN REQUEST MODEL
export const ReturnRequest = sequelize.define('ReturnRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Orders', key: 'id' }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    returnReason: DataTypes.STRING,
    description: DataTypes.TEXT,
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('requested', 'approved', 'rejected', 'pickup_scheduled', 'returned', 'refunded'),
        defaultValue: 'requested'
    },
    pickupDate: DataTypes.DATE,
    refundAmount: DataTypes.DECIMAL(10, 2),
    refundStatus: {
        type: DataTypes.ENUM('pending', 'processed', 'failed'),
        defaultValue: 'pending'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 9️⃣ LOYALTY TIER MODEL
export const LoyaltyTier = sequelize.define('LoyaltyTier', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    tier: {
        type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond'),
        defaultValue: 'bronze'
    },
    supercoinsMultiplier: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 1.0,
        comment: '1.0x = baseline, 1.5x = 50% bonus'
    },
    discountPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    totalSpent: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    ordersCompleted: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    tierSince: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 🔟 REFERRAL MODEL
export const Referral = sequelize.define('Referral', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    referrerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    refereeId: {
        type: DataTypes.UUID,
        references: { model: 'Users', key: 'id' }
    },
    referralCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    refereeEmail: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM('pending', 'signed_up', 'first_order', 'completed'),
        defaultValue: 'pending'
    },
    referrerBonus: DataTypes.DECIMAL(10, 2),
    refereeBonus: DataTypes.DECIMAL(10, 2),
    firstOrderAmount: DataTypes.DECIMAL(10, 2),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// Export all models
export default {
    Review,
    Notification,
    Inventory,
    ProductVariant,
    ChatMessage,
    SavedCart,
    GiftCard,
    ReturnRequest,
    LoyaltyTier,
    Referral
};
