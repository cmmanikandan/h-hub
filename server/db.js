import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQLITE_DB_PATH = path.join(__dirname, 'hub_db.sqlite');

// ============================================
// 1️⃣ DATABASE CONNECTION SETUP
// ============================================

const isMySQL = process.env.DB_DIALECT === 'mysql';

// Initialize Sequelize with proper error handling
export const sequelize = isMySQL
    ? new Sequelize(
        process.env.DB_NAME || 'hub_db',
        process.env.DB_USER || 'root',
        process.env.DB_PASS || 'CMMANI02',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    )
    : new Sequelize({
        dialect: 'sqlite',
        storage: SQLITE_DB_PATH,
        logging: false,
        pool: {
            max: 1,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        dialectOptions: {
            busyTimeout: 30000
        },
        retry: {
            max: 3,
            timeout: 30000
        }
    });

// ============================================
// RETRY LOGIC FOR DATABASE OPERATIONS
// ============================================

/**
 * Retry wrapper for database operations that might fail due to SQLITE_BUSY
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds (will use exponential backoff)
 * @returns {Promise} - Result of the operation
 */
export const withRetry = async (operation, maxRetries = 5, baseDelay = 100) => {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            const isBusyError = error.message && (
                error.message.includes('SQLITE_BUSY') ||
                error.message.includes('database is locked')
            );

            if (!isBusyError || attempt === maxRetries - 1) {
                throw error;
            }

            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
            console.log(`⏳ Database busy, retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
};

// ============================================
// 2️⃣ USER MODEL (NORMALIZED SCHEMA)
// ============================================

export const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique user identifier'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'Email already registered'
        },
        validate: {
            isEmail: {
                msg: 'Must be a valid email address'
            }
        },
        comment: 'User email (unique, used for login)'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Hashed password (bcrypt)'
    },
    role: {
        type: DataTypes.ENUM('user', 'seller', 'admin', 'delivery', 'logix_admin'),
        defaultValue: 'user',
        comment: 'User role for access control'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Full name of the user'
    },
    wallet: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        comment: 'Wallet balance'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Contact phone number'
    },
    gender: {
        type: DataTypes.STRING,
        defaultValue: 'Not Set',
        comment: 'User gender'
    },
    dob: {
        type: DataTypes.STRING,
        defaultValue: 'Not Set',
        comment: 'Date of birth'
    },
    altPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Alternate phone number'
    },
    pan: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'PAN card number'
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User city'
    },
    district: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User district'
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User state'
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'User pincode'
    },
    supercoins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Supercoins balance (Cashback)'
    },
    wishlist: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            try {
                const rawValue = this.getDataValue('wishlist');
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) { return []; }
        },
        set(value) {
            this.setDataValue('wishlist', JSON.stringify(value));
        },
        comment: 'Array of product IDs in wishlist'
    },
    transactions: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            try {
                const rawValue = this.getDataValue('transactions');
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) { return []; }
        },
        set(value) {
            this.setDataValue('transactions', JSON.stringify(value));
        },
        comment: 'Array of wallet transactions'
    },
    supercoinHistory: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            try {
                const rawValue = this.getDataValue('supercoinHistory');
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) { return []; }
        },
        set(value) {
            this.setDataValue('supercoinHistory', JSON.stringify(value));
        },
        comment: 'Array of supercoin history logs'
    },
    paymentPinHash: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Hashed payment PIN for wallet transfers'
    },
    pinAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Failed PIN attempts count'
    },
    pinLockedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'PIN lockout timestamp'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Account active status'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last login timestamp'
    },
    aadharPhoto: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL/Path to Aadhar document'
    },
    licensePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL/Path to Driving License'
    },
    profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL/Path to User Photo'
    },
    vehicleType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'bike'
    },
    vehicleNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serviceZones: {
        type: DataTypes.TEXT,
        defaultValue: '[]'
    },
    fuelRatePerKm: {
        type: DataTypes.FLOAT,
        defaultValue: 5.50
    },
    deliveryPartnerStatus: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Verification status for professionals'
    },
    pendingBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        comment: 'Amount for delivered orders not yet settled'
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    indexes: [
        {
            unique: true,
            fields: ['email']
        }
    ]
});

// ============================================
// 3️⃣ ADDRESS MODEL (NORMALIZED)
// ============================================

export const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'HOME'
    },
    name: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.TEXT
    },
    district: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    pincode: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    UserId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

// User & Address Associations
User.hasMany(Address, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'UserId' });


// ============================================
// 4️⃣ PRODUCT MODEL
// ============================================

export const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    originalPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    cat: {
        type: DataTypes.STRING
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    badge: {
        type: DataTypes.STRING
    },
    brand: {
        type: DataTypes.STRING
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT
    },
    img: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING
    },
    images: {
        type: DataTypes.TEXT,
        get() {
            try {
                const rawValue = this.getDataValue('images');
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) { return []; }
        },
        set(value) {
            this.setDataValue('images', JSON.stringify(value));
        }
    },
    colors: {
        type: DataTypes.TEXT,
        get() {
            try {
                const rawValue = this.getDataValue('colors');
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) { return []; }
        },
        set(value) {
            this.setDataValue('colors', JSON.stringify(value));
        }
    },
    sizes: {
        type: DataTypes.TEXT,
        get() {
            try {
                const rawValue = this.getDataValue('sizes');
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) { return []; }
        },
        set(value) {
            this.setDataValue('sizes', JSON.stringify(value));
        }
    },
    reviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // 🆕 Automated Pricing & Profit Breakdown
    sellerPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Base price set by seller (protected)'
    },
    platformPrice: {
        type: DataTypes.FLOAT,
        comment: 'Final price shown to customer'
    },
    adminProfit: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    packingCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    adsCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    gstPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
});

// ============================================
// 5️⃣ ORDER MODEL
// ============================================

export const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productName: {
        type: DataTypes.STRING
    },
    productImage: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Processing'
    },
    readyForLogix: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    logixHandoverAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    totalAmount: {
        type: DataTypes.FLOAT
    },
    address: {
        type: DataTypes.TEXT
    },
    date: {
        type: DataTypes.STRING,
        defaultValue: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'COD'
    },
    paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    isExpress: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    expressCharge: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    taxAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sellerId: {
        type: DataTypes.UUID
    },
    deliveryManId: {
        type: DataTypes.UUID
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ratingProduct: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ratingDelivery: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    feedbackComment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    coupon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    settlementStatus: {
        type: DataTypes.ENUM('Pending', 'Completed'),
        defaultValue: 'Pending'
    },
    packingCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    adsCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    deliveryCharge: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    adminBonus: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        comment: 'Additional bonus given to delivery person by admin'
    },
    gstPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    gstAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sellerAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    adminProfit: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    deliveryAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    distance: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    fuelCharge: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    codClaimedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    rawPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    roundedPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    superCoinsRedeemed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    superCoinsFromRounding: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    superCoinsFromOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalSuperCoins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    deliveryPhoto: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Photo of delivered package (open box verification)'
    },
    paymentChangedAtDelivery: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether payment method was changed at delivery time'
    },
    paymentCollectedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of delivery person who collected payment'
    },
    assignedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When delivery was assigned to delivery person'
    },
    expectedCompletionTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Expected completion time (evening deadline)'
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When delivery was actually completed'
    },
    codSubmissionStatus: {
        type: DataTypes.ENUM('Pending', 'Submitted', 'Verified', 'Disputed', 'SentToHub'),
        defaultValue: 'Pending'
    },
    codSubmittedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    codVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    codSentToHubAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    codSentToHub: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether COD has been sent to H-HUB admin'
    },
    fuelRateAtAssignment: {
        type: DataTypes.FLOAT,
        defaultValue: 5.50
    },
    isFined: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether delivery person was fined for late delivery'
    },
    fineAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        comment: 'Amount of fine for late delivery'
    },
    fineReason: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reason for fine (e.g., "Late delivery past evening deadline")'
    },
    returnStatus: {
        type: DataTypes.ENUM('Pending Approval', 'Approved', 'Rejected', 'Refunded'),
        allowNull: true,
        comment: 'Return request status'
    },
    returnReason: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reason for return (e.g., defective, wrong-item, different, damaged, not-needed, other)'
    },
    returnCondition: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Product condition (unused, used-good, used-fair, damaged, missing-parts)'
    },
    returnComment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional comments about the return'
    },
    returnRequestedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When return was requested'
    },
    refundAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        comment: 'Refund amount after return approval'
    },
    refundStatus: {
        type: DataTypes.ENUM('Pending', 'Processed', 'Cancelled'),
        defaultValue: 'Pending',
        comment: 'Refund processing status'
    },
    refundProcessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When refund was processed'
    }
}, {
    timestamps: true,
    updatedAt: false
});

// ============================================
// 6️⃣ CATEGORY MODEL
// ============================================

export const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// ============================================
// 7️⃣ OFFER & COUPON MODELS
// ============================================

export const Offer = sequelize.define('Offer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    discountType: {
        type: DataTypes.ENUM('flat', 'percentage'),
        defaultValue: 'percentage'
    },
    discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    validFrom: {
        type: DataTypes.DATE
    },
    validTo: {
        type: DataTypes.DATE
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    type: {
        type: DataTypes.ENUM('platform', 'category', 'product'),
        defaultValue: 'platform'
    }
});

export const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountType: {
        type: DataTypes.ENUM('flat', 'percentage'),
        defaultValue: 'flat'
    },
    discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    minOrderAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// ============================================
// 8️⃣ SYSTEM SETTINGS & LOGS
// ============================================

export const PlatformSetting = sequelize.define('PlatformSetting', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    value: {
        type: DataTypes.TEXT
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'string'
    }
});

export const ProfitRule = sequelize.define('ProfitRule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    minSellerPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    maxSellerPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    profitPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    minProfitAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    maxProfitCap: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

export const SuperCoinRule = sequelize.define('SuperCoinRule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    minOrderAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    maxOrderAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    rewardPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

export const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    action: {
        type: DataTypes.STRING
    },
    details: {
        type: DataTypes.TEXT
    },
    performedBy: {
        type: DataTypes.STRING
    }
});

export const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('info', 'success', 'warning', 'error'), defaultValue: 'info' },
    role: { type: DataTypes.STRING, comment: 'Target role for the notification (admin, seller, delivery, or userId)' },
    userId: { type: DataTypes.UUID, allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

// ============================================
// 9️⃣ PROFIT MANAGEMENT MODEL (MANDATORY MODULE)
// ============================================

export const ProfitTransaction = sequelize.define('ProfitTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('seller', 'admin', 'delivery'),
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true // NULL for system admin platform profit
    },
    grossAmount: {
        type: DataTypes.FLOAT,
        comment: 'Market price of product'
    },
    discountedPrice: {
        type: DataTypes.FLOAT,
        comment: 'Price after offer'
    },
    commission: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        comment: '10% Platform fee'
    },
    deliveryCharge: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    netProfit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Actual earning for the role'
    },
    description: {
        type: DataTypes.STRING
    }
});

// ============================================
// 10️⃣ REVIEW MODEL
// ============================================

export const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// ============================================
// 9️⃣ RELATIONSHIPS (FOREIGN KEYS)
// ============================================

User.hasMany(Address, { onDelete: 'CASCADE' });
Address.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User, { as: 'user' });

Category.hasMany(Product);
Product.belongsTo(Category);

User.hasMany(Product, { as: 'SellerProducts', foreignKey: 'sellerId' });
Product.belongsTo(User, { as: 'Seller', foreignKey: 'sellerId' });
Order.belongsTo(User, { as: 'Seller', foreignKey: 'sellerId' });
Order.belongsTo(User, { as: 'DeliveryMan', foreignKey: 'deliveryManId' });

Order.hasMany(ProfitTransaction, { foreignKey: 'orderId' });
ProfitTransaction.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Review);
Review.belongsTo(User);

Product.hasMany(Review);
Review.belongsTo(Product);

// ============================================
// 7️⃣ DATABASE INITIALIZATION & CONNECTION
// ============================================

export const initDB = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log(`✅ Database Connection Successful (${isMySQL ? 'MySQL' : 'SQLite'})`);

        // Enable WAL mode for SQLite to improve concurrency
        if (!isMySQL) {
            await sequelize.query('PRAGMA journal_mode = WAL;');
            await sequelize.query('PRAGMA busy_timeout = 30000;');
            await sequelize.query('PRAGMA synchronous = NORMAL;');
            console.log('✅ SQLite WAL mode enabled for better concurrency');
        }

        // Sync models one by one to find the culprit
        console.log('🔄 Synchronizing database tables...');

        // Try a regular sync first (creates missing tables)
        await sequelize.sync();
        console.log('✅ Basic sync complete (tables created)');

        // Recover from partial schema drift when alter sync fails on legacy SQLite backups.
        if (!isMySQL) {
            try {
                const [orderColumns] = await sequelize.query("PRAGMA table_info('Orders');");
                const hasSuperCoinsRedeemed = Array.isArray(orderColumns)
                    && orderColumns.some((col) => col.name === 'superCoinsRedeemed');

                if (!hasSuperCoinsRedeemed) {
                    await sequelize.query('ALTER TABLE Orders ADD COLUMN superCoinsRedeemed INTEGER DEFAULT 0;');
                    console.log('✅ Added missing Orders.superCoinsRedeemed column');
                }

                const [returnColumns] = await sequelize.query("PRAGMA table_info('ReturnRequests');");
                const returnColumnNames = new Set(
                    Array.isArray(returnColumns) ? returnColumns.map((col) => col.name) : []
                );

                const returnColumnFixes = [
                    { name: 'phoneNumber', sql: 'ALTER TABLE ReturnRequests ADD COLUMN phoneNumber VARCHAR(255);' },
                    { name: 'images', sql: "ALTER TABLE ReturnRequests ADD COLUMN images TEXT DEFAULT '[]';" },
                    { name: 'pickupDate', sql: 'ALTER TABLE ReturnRequests ADD COLUMN pickupDate DATETIME;' },
                    { name: 'deliveryPartnerId', sql: 'ALTER TABLE ReturnRequests ADD COLUMN deliveryPartnerId UUID;' },
                    { name: 'refundAmount', sql: 'ALTER TABLE ReturnRequests ADD COLUMN refundAmount DECIMAL(10,2);' },
                    { name: 'refundStatus', sql: "ALTER TABLE ReturnRequests ADD COLUMN refundStatus TEXT DEFAULT 'pending';" },
                    { name: 'adminNotes', sql: 'ALTER TABLE ReturnRequests ADD COLUMN adminNotes TEXT;' }
                ];

                for (const fix of returnColumnFixes) {
                    if (!returnColumnNames.has(fix.name)) {
                        await sequelize.query(fix.sql);
                        console.log(`✅ Added missing ReturnRequests.${fix.name} column`);
                    }
                }
            } catch (schemaFixError) {
                console.warn('⚠️ SQLite schema recovery warning:', schemaFixError.message);
            }
        }

        // Try alter sync for schema changes
        try {
            await sequelize.sync({ alter: true });
            console.log(`✅ Database Models Synchronized (alter: true)`);
        } catch (alterError) {
            console.error('⚠️ Alter Sync Failed (non-critical if schema is mostly okay):', alterError.message);
        }

        // Backfill historical orders that were saved without sellerId.
        try {
            await sequelize.query(`
                UPDATE Orders
                SET sellerId = (
                    SELECT sellerId
                    FROM Products
                    WHERE Products.id = Orders.productId
                )
                WHERE (sellerId IS NULL OR sellerId = '')
                  AND productId IS NOT NULL;
            `);
        } catch (backfillError) {
            console.warn('⚠️ SellerId backfill warning:', backfillError.message);
        }

        console.log(`📊 Tables: Users, Addresses, Products, Orders, Categories, Offers, Coupons, Settings, Logs, Reviews`);
        return true;
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        console.error(error); // Log full error trace
        return false;
    }
};

// ============================================
// 8️⃣ ADVANCED FEATURES MODELS (NEW TABLES)
// ============================================

export const SystemControls = sequelize.define('SystemControls', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pauseDeliveries: { type: DataTypes.BOOLEAN, defaultValue: false },
    pauseReason: DataTypes.STRING,
    pausedAt: DataTypes.DATE,
    pausedBy: DataTypes.UUID,
    resumedAt: DataTypes.DATE
});

export const AdminActions = sequelize.define('AdminActions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    adminId: DataTypes.UUID,
    action: DataTypes.STRING,
    targetOrderId: DataTypes.UUID,
    reason: DataTypes.STRING,
    details: DataTypes.JSON,
    ipAddress: DataTypes.STRING,
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export const SLARules = sequelize.define('SLARules', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    hoursFromPickup: DataTypes.INTEGER,
    priority: DataTypes.INTEGER,
    penaltyPerHour: DataTypes.FLOAT,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const SLABreaches = sequelize.define('SLABreaches', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: DataTypes.UUID,
    ruleId: DataTypes.UUID,
    breachedAt: DataTypes.DATE,
    hoursLate: DataTypes.INTEGER,
    delayReason: DataTypes.STRING,
    escalatedAt: DataTypes.DATE,
    escalatedTo: DataTypes.UUID,
    resolutionNotes: DataTypes.TEXT,
    penaltyApplied: DataTypes.FLOAT
});

export const AutoAssignmentRules = sequelize.define('AutoAssignmentRules', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    criteria: DataTypes.JSON,
    priority: DataTypes.INTEGER
});

export const RiderCapacity = sequelize.define('RiderCapacity', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    riderId: { type: DataTypes.UUID, unique: true },
    maxCapacity: DataTypes.INTEGER,
    currentLoad: DataTypes.INTEGER,
    activeOrderCount: DataTypes.INTEGER,
    isOnDuty: { type: DataTypes.BOOLEAN, defaultValue: false },
    shiftStart: DataTypes.DATE,
    shiftEnd: DataTypes.DATE,
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export const HubCapacity = sequelize.define('HubCapacity', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    hubId: { type: DataTypes.UUID, unique: true },
    maxCapacity: DataTypes.INTEGER,
    currentLoad: DataTypes.INTEGER,
    activeOrders: DataTypes.INTEGER,
    pendingPickup: DataTypes.INTEGER,
    pendingReturn: DataTypes.INTEGER,
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export const CODTransactions = sequelize.define('CODTransactions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: DataTypes.UUID,
    riderId: DataTypes.UUID,
    expectedAmount: DataTypes.FLOAT,
    collectedAmount: DataTypes.FLOAT,
    varianceAmount: DataTypes.FLOAT,
    isVarianceFlagged: { type: DataTypes.BOOLEAN, defaultValue: false },
    submittedToHub: DataTypes.DATE,
    verifiedByHub: DataTypes.DATE,
    verifiedBy: DataTypes.UUID,
    status: { type: DataTypes.ENUM('Pending', 'Submitted', 'Verified', 'Disputed', 'Resolved'), defaultValue: 'Pending' }
});

export const Wallet = sequelize.define('Wallet', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ownerId: DataTypes.UUID,
    ownerRole: DataTypes.ENUM('user', 'delivery', 'logix_admin', 'admin', 'system'),
    type: DataTypes.ENUM('USER', 'DELIVERY_COD', 'LOGIX_CENTRAL', 'HUB_ADMIN'),
    balance: { type: DataTypes.FLOAT, defaultValue: 0 },
    lockedBalance: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.ENUM('Active', 'Suspended'), defaultValue: 'Active' }
});

export const WalletTransaction = sequelize.define('WalletTransaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fromWalletId: DataTypes.UUID,
    toWalletId: DataTypes.UUID,
    amount: { type: DataTypes.FLOAT, defaultValue: 0 },
    type: DataTypes.ENUM('COD_COLLECTED', 'COD_CONVERT', 'LOGIX_SETTLEMENT', 'ADMIN_DISTRIBUTION', 'USER_TRANSFER'),
    status: { type: DataTypes.ENUM('Pending', 'Completed', 'Failed'), defaultValue: 'Completed' },
    reference: DataTypes.STRING,
    pinVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    metadata: DataTypes.JSON
});

export const RiderCODLimits = sequelize.define('RiderCODLimits', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    riderId: { type: DataTypes.UUID, unique: true },
    dailyLimit: { type: DataTypes.FLOAT, defaultValue: 50000 },
    weeklyLimit: { type: DataTypes.FLOAT, defaultValue: 300000 },
    dailyCollected: { type: DataTypes.FLOAT, defaultValue: 0 },
    weeklyCollected: { type: DataTypes.FLOAT, defaultValue: 0 },
    isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    blockedReason: DataTypes.STRING,
    blockExpiresAt: DataTypes.DATE,
    varianceCount: DataTypes.INTEGER,
    lastVarianceAt: DataTypes.DATE
});

export const CODRiskScores = sequelize.define('CODRiskScores', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    riderId: { type: DataTypes.UUID, unique: true },
    riskScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    varianceFrequency: { type: DataTypes.FLOAT, defaultValue: 0 },
    avgVarianceAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export const LiveTracking = sequelize.define('LiveTracking', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: DataTypes.UUID,
    riderId: DataTypes.UUID,
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    speed: DataTypes.INTEGER,
    accuracy: DataTypes.INTEGER,
    status: DataTypes.STRING,
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

export const HubLoad = sequelize.define('HubLoad', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    hubId: DataTypes.UUID,
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    orderCount: DataTypes.INTEGER,
    congestionLevel: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    avgProcessingTime: DataTypes.INTEGER
});

export const ReturnAnalytics = sequelize.define('ReturnAnalytics', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sellerId: DataTypes.UUID,
    returnRate: { type: DataTypes.FLOAT, defaultValue: 0 },
    topReturnReason: DataTypes.STRING,
    qualityScore: { type: DataTypes.FLOAT, defaultValue: 0 },
    trendPeriod: DataTypes.DATE
});

export const ReturnRules = sequelize.define('ReturnRules', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    condition: DataTypes.JSON,
    action: DataTypes.ENUM('AutoReject', 'FlagReview', 'Alert'),
    reason: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const SettlementCycles = sequelize.define('SettlementCycles', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cycleNumber: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    settlementDate: DataTypes.DATE,
    status: { type: DataTypes.ENUM('Pending', 'Processed', 'Verified', 'Paid'), defaultValue: 'Pending' },
    totalAmount: { type: DataTypes.FLOAT, defaultValue: 0 }
});

export const SettlementItems = sequelize.define('SettlementItems', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    settlementCycleId: DataTypes.UUID,
    riderId: DataTypes.UUID,
    baseEarnings: { type: DataTypes.FLOAT, defaultValue: 0 },
    incentives: { type: DataTypes.FLOAT, defaultValue: 0 },
    penalties: { type: DataTypes.FLOAT, defaultValue: 0 },
    netAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    daysWorked: DataTypes.INTEGER,
    avgRating: { type: DataTypes.FLOAT, defaultValue: 0 }
});

export const IncentiveRules = sequelize.define('IncentiveRules', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    condition: DataTypes.JSON,
    bonusAmount: DataTypes.FLOAT,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const PenaltyRules = sequelize.define('PenaltyRules', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
    condition: DataTypes.JSON,
    penaltyAmount: DataTypes.FLOAT,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const OrderProfit = sequelize.define('OrderProfit', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: { type: DataTypes.UUID, unique: true },
    revenue: { type: DataTypes.FLOAT, defaultValue: 0 },
    riderCost: { type: DataTypes.FLOAT, defaultValue: 0 },
    hubCost: { type: DataTypes.FLOAT, defaultValue: 0 },
    platformCost: { type: DataTypes.FLOAT, defaultValue: 0 },
    netProfit: { type: DataTypes.FLOAT, defaultValue: 0 },
    marginPercentage: { type: DataTypes.FLOAT, defaultValue: 0 }
});

export const Disputes = sequelize.define('Disputes', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    disputeType: DataTypes.ENUM('COD_Mismatch', 'Damage_Claim', 'Fake_Delivery', 'Return_Abuse', 'Other'),
    orderId: DataTypes.UUID,
    raisedBy: DataTypes.UUID,
    raisedByRole: DataTypes.STRING,
    reason: DataTypes.TEXT,
    evidence: DataTypes.JSON,
    status: { type: DataTypes.ENUM('Raised', 'Under_Review', 'Resolved', 'Escalated'), defaultValue: 'Raised' },
    resolution: DataTypes.TEXT,
    resolvedAt: DataTypes.DATE,
    resolvedBy: DataTypes.UUID,
    refundIssued: { type: DataTypes.FLOAT, defaultValue: 0 }
});

export const EscalationRules = sequelize.define('EscalationRules', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    trigger: DataTypes.STRING,
    escalateToRole: DataTypes.STRING,
    escalationLevel: DataTypes.INTEGER,
    maxRetries: DataTypes.INTEGER,
    priority: DataTypes.INTEGER,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const Escalations = sequelize.define('Escalations', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: DataTypes.UUID,
    ruleId: DataTypes.UUID,
    escalationLevel: DataTypes.INTEGER,
    escalatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    escalatedBy: DataTypes.UUID,
    assignedTo: DataTypes.UUID,
    status: { type: DataTypes.ENUM('Open', 'In_Progress', 'Resolved'), defaultValue: 'Open' },
    resolutionNotes: DataTypes.TEXT,
    resolvedAt: DataTypes.DATE
});

export const RiderProfile = sequelize.define('RiderProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    riderId: { type: DataTypes.UUID, unique: true },
    tier: { type: DataTypes.ENUM('Basic', 'Pro', 'Pro+'), defaultValue: 'Basic' },
    totalDeliveries: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalEarnings: { type: DataTypes.FLOAT, defaultValue: 0 },
    avgRating: { type: DataTypes.FLOAT, defaultValue: 0 },
    badges: DataTypes.JSON,
    gamificationScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastActiveAt: DataTypes.DATE
});

export const RiderShifts = sequelize.define('RiderShifts', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    riderId: DataTypes.UUID,
    shiftDate: DataTypes.DATE,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    breakStart: DataTypes.DATE,
    breakEnd: DataTypes.DATE,
    totalHours: DataTypes.INTEGER,
    ordersCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
    earnings: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.ENUM('Active', 'Completed', 'Cancelled'), defaultValue: 'Active' }
});

export const RiderOfflineMode = sequelize.define('RiderOfflineMode', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    riderId: { type: DataTypes.UUID, unique: true },
    offlineOrders: DataTypes.JSON,
    lastSyncedAt: DataTypes.DATE,
    canWorkOffline: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export const DeviceBinding = sequelize.define('DeviceBinding', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: DataTypes.UUID,
    deviceId: DataTypes.STRING,
    deviceName: DataTypes.STRING,
    osType: DataTypes.STRING,
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    approvedAt: DataTypes.DATE,
    lastUsedAt: DataTypes.DATE,
    revokedAt: DataTypes.DATE
});

// ============================================
// 🔟 ADVANCED FEATURES MODELS (v2.0)
// ============================================

// 3. INVENTORY (NEW MODEL)
export const Inventory = sequelize.define('Inventory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    productId: { type: DataTypes.UUID, allowNull: false, unique: true },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    reserved: { type: DataTypes.INTEGER, defaultValue: 0 },
    sold: { type: DataTypes.INTEGER, defaultValue: 0 },
    warehouseLocation: DataTypes.STRING,
    lastRestocked: DataTypes.DATE,
    reorderLevel: DataTypes.INTEGER,
    reorderQuantity: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 4. PRODUCT VARIANTS
export const ProductVariant = sequelize.define('ProductVariant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    productId: { type: DataTypes.UUID, allowNull: false },
    name: DataTypes.STRING,
    sku: { type: DataTypes.STRING, unique: true },
    attributes: { type: DataTypes.JSON, defaultValue: {} },
    price: DataTypes.DECIMAL(10, 2),
    cost: DataTypes.DECIMAL(10, 2),
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    images: { type: DataTypes.JSON, defaultValue: [] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 5. CHAT MESSAGES
export const ChatMessage = sequelize.define('ChatMessage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversationId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    agentId: DataTypes.UUID,
    message: DataTypes.TEXT,
    attachments: { type: DataTypes.JSON, defaultValue: [] },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    type: { type: DataTypes.ENUM('text', 'image', 'document'), defaultValue: 'text' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 6. SAVED CART (Abandoned Cart Recovery)
export const SavedCart = sequelize.define('SavedCart', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    items: { type: DataTypes.JSON, defaultValue: [] },
    subtotal: DataTypes.DECIMAL(10, 2),
    recoveryEmailSent: { type: DataTypes.BOOLEAN, defaultValue: false },
    expiresAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 7. GIFT CARDS
export const GiftCard = sequelize.define('GiftCard', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING, unique: true, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    recipientEmail: DataTypes.STRING,
    buyerId: DataTypes.UUID,
    purchasedAt: DataTypes.DATE,
    redeemedAt: DataTypes.DATE,
    redeemedBy: DataTypes.UUID,
    expiresAt: DataTypes.DATE,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 8. RETURN REQUESTS
export const ReturnRequest = sequelize.define('ReturnRequest', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    returnReason: DataTypes.STRING,
    description: DataTypes.TEXT,
    phoneNumber: { type: DataTypes.STRING, allowNull: true },
    images: { type: DataTypes.JSON, defaultValue: [] },
    status: { type: DataTypes.ENUM('requested', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'returned', 'refunded'), defaultValue: 'requested' },
    pickupDate: DataTypes.DATE,
    deliveryPartnerId: DataTypes.UUID,
    refundAmount: DataTypes.DECIMAL(10, 2),
    refundStatus: { type: DataTypes.ENUM('pending', 'seller_paid', 'processed', 'failed'), defaultValue: 'pending' },
    adminNotes: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// Return Request associations
Order.hasMany(ReturnRequest, { foreignKey: 'orderId' });
ReturnRequest.belongsTo(Order, { as: 'Order', foreignKey: 'orderId' });
User.hasMany(ReturnRequest, { as: 'Returns', foreignKey: 'userId' });
ReturnRequest.belongsTo(User, { as: 'User', foreignKey: 'userId' });
ReturnRequest.belongsTo(User, { as: 'DeliveryPartner', foreignKey: 'deliveryPartnerId' });

// 9. LOYALTY TIERS
export const LoyaltyTier = sequelize.define('LoyaltyTier', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    tier: { type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond'), defaultValue: 'bronze' },
    supercoinsMultiplier: { type: DataTypes.DECIMAL(2, 1), defaultValue: 1.0 },
    discountPercentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    totalSpent: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    ordersCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
    tierSince: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

// 10. REFERRALS
export const Referral = sequelize.define('Referral', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    referrerId: { type: DataTypes.UUID, allowNull: false },
    refereeId: DataTypes.UUID,
    referralCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    refereeEmail: DataTypes.STRING,
    status: { type: DataTypes.ENUM('pending', 'signed_up', 'first_order', 'completed'), defaultValue: 'pending' },
    referrerBonus: DataTypes.DECIMAL(10, 2),
    refereeBonus: DataTypes.DECIMAL(10, 2),
    firstOrderAmount: DataTypes.DECIMAL(10, 2),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
});

export const SuspiciousActivity = sequelize.define('SuspiciousActivity', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: DataTypes.UUID,
    activityType: DataTypes.STRING,
    details: DataTypes.TEXT,
    flaggedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    resolvedAt: DataTypes.DATE,
    resolvedBy: DataTypes.UUID
});

// ============================================
// 9️⃣ HELPER FUNCTIONS FOR DEBUGGING
// ============================================

export const debugDB = {
    // Get all users (for debugging only)
    async getAllUsers() {
        try {
            const users = await User.findAll({
                attributes: ['id', 'email', 'name', 'role', 'createdAt']
            });
            console.table(users.map(u => u.toJSON()));
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    },

    // Check if email exists
    async checkEmail(email) {
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        console.log(`Email ${email}: ${user ? 'EXISTS' : 'NOT FOUND'}`);
        return !!user;
    },

    // Get user count
    async getUserCount() {
        const count = await User.count();
        console.log(`Total Users: ${count}`);
        return count;
    }
};

export default sequelize;
