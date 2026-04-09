import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Upload,
    Store,
    BarChart3 as BarChart,
    Plus,
    Download,
    Eye,
    Edit,
    Trash2,
    AlertCircle,
    FileText,
    Settings,
    Palmtree,
    TrendingUp,
    Users,
    DollarSign,
    Search,
    Filter,
    Clock,
    LayoutDashboard,
    ShoppingCart,
    Wallet,
    Power,
    Globe,
    X,
    ChevronRight,
    Truck,
    ArrowLeft,
    Bell,
    BellDot,
    MapPin,
    Check,
    Calendar, // Added Calendar icon
    Menu
} from 'lucide-react';
import SmartCalendar from '../components/SmartCalendar'; // Import Calendar Component
import AIImageEditor from '../components/AIImageEditor'; // Import AI Image Editor
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusPopup from '../components/StatusPopup';

const SellerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalSales: 0,
        netProfit: 0,
        totalPackingCost: 0,
        totalShippingCost: 0
    });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vacationMode, setVacationMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [salesReport, setSalesReport] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [availableDeliveryMen, setAvailableDeliveryMen] = useState([]);
    const [selectedDeliveryMan, setSelectedDeliveryMan] = useState('');
    const [financeData, setFinanceData] = useState({
        wallet: 0,
        lifetimeEarnings: 0,
        pendingSettlements: 0,
        transactions: []
    });
    const [categories, setCategories] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        sellerPrice: '',
        packingCost: '',
        shippingCost: '',
        description: '',
        category: '',
        stock: '',
        images: [] // Changed to array for multiple images
    });
    const [previewPrice, setPreviewPrice] = useState(null);
    const [popup, setPopup] = useState({ show: false, type: 'success', title: '', message: '', onAction: null });

    // Seller Settings
    const [sellerSettings, setSellerSettings] = useState({
        packingCostType: 'percent', // 'percent' or 'fixed'
        defaultPackingPercent: 2,
        defaultPackingFixed: 20,
        shippingCostType: 'percent', // 'percent' or 'fixed'
        defaultShippingPercent: 5,
        defaultShippingFixed: 50
    });

    // AI Image Editor states
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [imageFileToEdit, setImageFileToEdit] = useState(null);
    const [isEditingProductImage, setIsEditingProductImage] = useState(false);

    // Mobile Responsiveness
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setShowSidebar(true);
            else setShowSidebar(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showStatus = (type, message, title = '', onAction = null) => {
        setPopup({ show: true, type, title, message, onAction });
    };

    const confirmAction = (msg, action, title = 'Are you sure?', type = 'confirm') => {
        setPopup({
            show: true,
            type: type,
            title: title,
            message: msg,
            onAction: () => {
                action();
                setPopup(prev => ({ ...prev, show: false }));
            }
        });
    };

    useEffect(() => {
        if (user?.id) {
            fetchSellerData();
            fetchNotifications();
            fetchCategories();
            fetchDeliveryMen();
        }
    }, [user?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showProductModal && newProduct.sellerPrice) {
                calculatePreview(newProduct);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [newProduct.sellerPrice, newProduct.packingCost, newProduct.shippingCost, showProductModal, sellerSettings]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showEditModal && editingProduct?.sellerPrice) {
                calculatePreview(editingProduct);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [editingProduct?.sellerPrice, editingProduct?.packingCost, editingProduct?.shippingCost, showEditModal, sellerSettings]);

    const calculatePreview = async (p) => {
        try {
            const sellerPrice = parseFloat(p.sellerPrice) || 0;

            // Use manual values if provided, otherwise use defaults based on type (percent or fixed)
            const packingCost = p.packingCost
                ? parseFloat(p.packingCost)
                : (sellerSettings.packingCostType === 'percent'
                    ? (sellerPrice * sellerSettings.defaultPackingPercent / 100)
                    : sellerSettings.defaultPackingFixed);

            const shippingCost = p.shippingCost
                ? parseFloat(p.shippingCost)
                : (sellerSettings.shippingCostType === 'percent'
                    ? (sellerPrice * sellerSettings.defaultShippingPercent / 100)
                    : sellerSettings.defaultShippingFixed);

            const res = await api.post('/utils/calculate-price', {
                sellerPrice: p.sellerPrice,
                packingCost: packingCost,
                shippingCost: shippingCost
            });
            setPreviewPrice(res.data);
        } catch (err) {
            console.error('Preview calc failed');
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications?role=seller&userId=${user.id}`);
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
            // Set default category if not set
            if (res.data && res.data.length > 0 && !newProduct.category) {
                setNewProduct(prev => ({ ...prev, category: res.data[0].name }));
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setCategories([]);
        }
    };

    const fetchDeliveryMen = async () => {
        try {
            const res = await api.get('/admin/delivery');
            setAvailableDeliveryMen(res.data);
        } catch (error) {
            console.error('Failed to fetch delivery men');
        }
    };

    const fetchSellerData = async () => {
        try {
            console.log('=== FETCH SELLER DATA START ===');
            console.log('User ID:', user.id);
            console.log('User object:', user);

            const [statsRes, productsRes, ordersRes, earningsRes] = await Promise.all([
                api.get(`/seller/stats/${user.id}`).catch(err => {
                    console.error('Stats fetch error:', err.response?.status, err.response?.data);
                    return { data: { totalProducts: 0, totalOrders: 0, totalSales: 0 } };
                }),
                api.get(`/seller/products/${user.id}`).catch(err => {
                    console.error('Products fetch error:', err.response?.status, err.response?.data);
                    return { data: [] };
                }),
                api.get(`/seller/orders/${user.id}`).catch(err => {
                    console.error('Orders fetch error:', err.response?.status, err.response?.data);
                    return { data: [] };
                }),
                api.get(`/seller/earnings/${user.id}`).catch(err => {
                    console.error('Earnings fetch error:', err.response?.status, err.response?.data);
                    return { data: { netProfit: 0 } };
                })
            ]);

            console.log('Products response:', productsRes.data);
            console.log('Orders response:', ordersRes.data);
            console.log('Stats response:', statsRes.data);

            setStats({
                ...statsRes.data,
                netProfit: earningsRes?.data?.netProfit || 0,
                totalPackingCost: statsRes.data.totalPackingCost || 0,
                totalShippingCost: statsRes.data.totalShippingCost || 0
            });
            setProducts(productsRes.data || []);
            setOrders(ordersRes.data || []);

            console.log('Seller data fetch complete');
        } catch (error) {
            console.error('Failed to fetch seller data:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file, isEdit = false) => {
        // Open AI Image Editor instead of directly uploading
        setImageFileToEdit(file);
        setIsEditingProductImage(isEdit);
        setShowImageEditor(true);
    };

    const handleMultipleImageUpload = async (files, isEdit = false) => {
        // Process multiple files
        for (let i = 0; i < files.length; i++) {
            handleImageUpload(files[i], isEdit);
        }
    };

    // AI Auto Description Generator
    const generateAIDescription = (productName, category) => {
        const templates = {
            Electronics: [
                {
                    intro: `Experience next-generation technology with the ${productName}. Engineered for excellence and designed for the modern digital lifestyle.`,
                    features: [
                        'Advanced processor technology for lightning-fast performance',
                        'Premium build quality with durable materials',
                        'Intuitive user interface for seamless operation',
                        'Energy-efficient design with extended battery life',
                        'Multi-functional capabilities for enhanced productivity',
                        'Smart connectivity options (WiFi, Bluetooth, USB-C)',
                        'Compact and portable form factor'
                    ],
                    specs: [
                        'Latest generation chipset',
                        'High-resolution display technology',
                        'Precision-engineered components',
                        'Enhanced security features',
                        'Universal compatibility'
                    ],
                    conclusion: 'Perfect for professionals, students, and tech enthusiasts seeking reliable performance and cutting-edge features.'
                },
                {
                    intro: `Discover innovation redefined with ${productName}. This premium electronic device combines sophisticated engineering with user-friendly design.`,
                    features: [
                        'State-of-the-art technology integration',
                        'Crystal-clear visual and audio output',
                        'Ergonomic design for comfortable extended use',
                        'Smart power management system',
                        'Robust construction for longevity',
                        'One-touch controls for easy operation',
                        'Sleek modern aesthetics'
                    ],
                    specs: [
                        'High-performance processing unit',
                        'Premium quality sensors',
                        'Advanced cooling system',
                        'Multi-layer protection',
                        'Industry-leading warranty'
                    ],
                    conclusion: 'Ideal for anyone looking to upgrade their tech arsenal with a device that delivers exceptional value and performance.'
                }
            ],
            Fashion: [
                {
                    intro: `Elevate your wardrobe with ${productName}. A perfect blend of contemporary style and timeless elegance.`,
                    features: [
                        'Premium quality fabric with superior comfort',
                        'Meticulous craftsmanship and attention to detail',
                        'Versatile design suitable for multiple occasions',
                        'Breathable and lightweight material',
                        'Color-fast and fade-resistant',
                        'Easy care and maintenance',
                        'Perfect fit with flexible sizing'
                    ],
                    specs: [
                        'High-grade textile composition',
                        'Reinforced stitching for durability',
                        'Wrinkle-resistant treatment',
                        'Machine washable',
                        'Available in multiple color options'
                    ],
                    conclusion: 'Essential fashion piece for those who value quality, comfort, and style in their everyday wardrobe.'
                },
                {
                    intro: `Make a lasting impression with ${productName}. Designed for the fashion-forward individual who demands excellence.`,
                    features: [
                        'Luxurious fabric blend for ultimate comfort',
                        'Modern cut with flattering silhouette',
                        'Sophisticated color palette',
                        'Season-versatile design',
                        'Enhanced durability for long-term wear',
                        'Eco-friendly and sustainable materials',
                        'Designer-inspired aesthetics'
                    ],
                    specs: [
                        'Premium thread count',
                        'Certified quality materials',
                        'Professional tailoring',
                        'UV-resistant fabrics',
                        'Size chart for perfect fit'
                    ],
                    conclusion: 'Your go-to choice for creating memorable outfits that transition seamlessly from day to night.'
                }
            ],
            'Home & Kitchen': [
                {
                    intro: `Transform your living space with ${productName}. Expertly designed to enhance functionality while adding aesthetic appeal to your home.`,
                    features: [
                        'Space-efficient design for optimal usage',
                        'Durable construction with premium materials',
                        'Easy to clean and maintain',
                        'Versatile functionality for daily needs',
                        'Modern aesthetics complement any decor',
                        'Safe and non-toxic materials',
                        'Lightweight yet sturdy build'
                    ],
                    specs: [
                        'High-quality food-grade materials',
                        'Heat-resistant up to 200°C',
                        'Dishwasher safe components',
                        'Rust and corrosion resistant',
                        'Eco-friendly manufacturing'
                    ],
                    conclusion: 'Essential addition to any modern home seeking to combine practicality with contemporary design.'
                },
                {
                    intro: `Upgrade your home experience with ${productName}. Thoughtfully crafted to make everyday tasks simpler and more enjoyable.`,
                    features: [
                        'Innovative design for enhanced usability',
                        'Multi-purpose functionality',
                        'Elegant finish in neutral tones',
                        'Compact storage when not in use',
                        'Built to last with warranty coverage',
                        'User-friendly operation',
                        'Matches various interior styles'
                    ],
                    specs: [
                        'Premium grade construction',
                        'Certified safety standards',
                        'Antimicrobial surface treatment',
                        'Impact-resistant design',
                        'BPA-free materials'
                    ],
                    conclusion: 'Perfect for homeowners who appreciate quality, functionality, and timeless design in their daily essentials.'
                }
            ],
            Sports: [
                {
                    intro: `Achieve peak performance with ${productName}. Scientifically designed to support your fitness journey and athletic goals.`,
                    features: [
                        'Ergonomic design for optimal comfort during workouts',
                        'High-performance materials that resist wear',
                        'Moisture-wicking technology keeps you dry',
                        'Flexible construction for full range of motion',
                        'Anti-slip features for enhanced safety',
                        'Lightweight yet durable build',
                        'Suitable for indoor and outdoor activities'
                    ],
                    specs: [
                        'Reinforced stress points',
                        'Breathable mesh ventilation',
                        'Quick-dry fabric technology',
                        'UV protection coating',
                        'Tested for extreme conditions'
                    ],
                    conclusion: 'Essential gear for athletes, fitness enthusiasts, and anyone committed to an active, healthy lifestyle.'
                },
                {
                    intro: `Power your training with ${productName}. Engineered with cutting-edge sports science to maximize your athletic potential.`,
                    features: [
                        'Professional-grade quality and construction',
                        'Adaptive fit technology for personalized comfort',
                        'Shock-absorption for joint protection',
                        'Temperature-regulating materials',
                        'Odor-resistant antimicrobial treatment',
                        'Reflective elements for low-light visibility',
                        'Easy to clean and quick to dry'
                    ],
                    specs: [
                        'High-performance polymer blend',
                        'Multi-layer cushioning system',
                        'Compression support zones',
                        'Sweat-activated cooling',
                        'Eco-conscious production'
                    ],
                    conclusion: 'The perfect companion for serious athletes and fitness lovers who demand the best from their equipment.'
                }
            ],
            Books: [
                {
                    intro: `Embark on a captivating journey with ${productName}. A masterfully crafted literary work that enlightens, entertains, and inspires.`,
                    features: [
                        'Engaging narrative with compelling storytelling',
                        'Well-researched content with authentic insights',
                        'Thought-provoking themes and perspectives',
                        'Accessible writing style for diverse readers',
                        'Rich character development and plot',
                        'Educational value with entertainment',
                        'High-quality print on premium paper'
                    ],
                    specs: [
                        'Comprehensive chapter organization',
                        'Detailed index and references',
                        'Durable binding for long-term use',
                        'Clear typography for easy reading',
                        'Author credentials and expertise'
                    ],
                    conclusion: 'A must-read for book lovers, students, and anyone seeking knowledge, inspiration, or pure reading pleasure.'
                },
                {
                    intro: `Expand your intellectual horizons with ${productName}. This exceptional book delivers profound insights wrapped in engaging prose.`,
                    features: [
                        'Comprehensive coverage of subject matter',
                        'Expert analysis and unique perspectives',
                        'Practical applications and real-world examples',
                        'Beautifully illustrated with diagrams/images',
                        'Suitable for academic and casual reading',
                        'Updated information and latest research',
                        'Glossary and additional resources included'
                    ],
                    specs: [
                        'Premium quality paper stock',
                        'Professional editing and proofreading',
                        'Hard/soft cover options available',
                        'Multiple format editions',
                        'ISBN certified publication'
                    ],
                    conclusion: 'Perfect for curious minds, lifelong learners, and anyone passionate about expanding their knowledge base.'
                }
            ],
            Beauty: [
                {
                    intro: `Unveil your natural radiance with ${productName}. A premium beauty solution formulated with science-backed ingredients for visible results.`,
                    features: [
                        'Dermatologically tested and clinically proven',
                        'Infused with natural botanical extracts',
                        'Suitable for all skin types and tones',
                        'Paraben-free and cruelty-free formula',
                        'Lightweight, non-greasy application',
                        'Long-lasting hydration and nourishment',
                        'Pleasant fragrance from natural essences'
                    ],
                    specs: [
                        'Hypoallergenic formulation',
                        'pH-balanced for skin compatibility',
                        'Vitamin-enriched complex',
                        'SPF protection (if applicable)',
                        'Certified organic ingredients'
                    ],
                    conclusion: 'Your daily beauty essential for maintaining healthy, glowing skin with professional-quality care at home.'
                },
                {
                    intro: `Experience luxury skincare with ${productName}. Expertly crafted to deliver spa-quality results in the comfort of your home.`,
                    features: [
                        'Advanced anti-aging properties',
                        'Deep penetrating moisture technology',
                        'Visible results within regular use',
                        'Non-comedogenic (won\'t clog pores)',
                        'Antioxidant-rich protective formula',
                        'Gentle enough for sensitive skin',
                        'Elegant packaging for premium experience'
                    ],
                    specs: [
                        'Medical-grade active ingredients',
                        'Preservative-free formulation',
                        'Allergy-tested certification',
                        'Extended shelf life stability',
                        'Recyclable packaging'
                    ],
                    conclusion: 'Ideal for beauty enthusiasts seeking professional-grade skincare that combines nature and science for optimal results.'
                }
            ]
        };

        const categoryTemplates = templates[category] || templates.Electronics;
        const randomTemplate = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];

        // Format the description with proper structure
        let description = `${randomTemplate.intro}\n\n`;
        description += `Key features:\n`;
        randomTemplate.features.forEach(feature => {
            description += `- ${feature}\n`;
        });
        description += `\nSpecifications:\n`;
        randomTemplate.specs.forEach(spec => {
            description += `- ${spec}\n`;
        });
        description += `\n${randomTemplate.conclusion}`;

        // Keep output simple and readable.
        description = description
            .replace(/\bpremium\b/gi, 'high-quality')
            .replace(/\bcutting-edge\b/gi, 'advanced')
            .replace(/\bnext-generation\b/gi, 'modern')
            .replace(/\bstate-of-the-art\b/gi, 'advanced');

        return description;
    };

    const handleAutoGenerateDescription = (isEdit = false) => {
        const productName = isEdit ? editingProduct.name : newProduct.name;
        const category = isEdit ? editingProduct.category : newProduct.category;

        if (!productName || !productName.trim()) {
            showStatus('warning', 'Please enter product name first', 'Name Required');
            return;
        }

        const description = generateAIDescription(productName, category);

        if (isEdit) {
            setEditingProduct({ ...editingProduct, description });
        } else {
            setNewProduct({ ...newProduct, description });
        }

        showStatus('success', 'Description generated successfully.', 'Description Ready');
    };

    const handleSaveEditedImage = async (editedFile) => {
        try {
            const formData = new FormData();
            formData.append('file', editedFile);

            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = response.data.url;

            if (isEditingProductImage && editingProduct) {
                // Add to editing product's images array
                setEditingProduct({
                    ...editingProduct,
                    images: [...(editingProduct.images || [editingProduct.image || editingProduct.img].filter(Boolean)), imageUrl]
                });
            } else if (isEditingProductImage) {
                // This shouldn't happen but keep for safety
                setEditingProduct({ ...editingProduct, images: [imageUrl] });
            } else {
                // Add to new product's images array
                setNewProduct({
                    ...newProduct,
                    images: [...newProduct.images, imageUrl]
                });
            }

            setShowImageEditor(false);
            setImageFileToEdit(null);
            showStatus('success', 'Image uploaded successfully', 'Upload Complete');

            return imageUrl;
        } catch (error) {
            console.error('Failed to upload image:', error);
            showStatus('failed', 'Failed to upload image', 'Upload Error');
            return null;
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                category: newProduct.category,
                cat: newProduct.category,
                stock: parseInt(newProduct.stock),
                sellerPrice: parseFloat(newProduct.sellerPrice),
                packingCost: newProduct.packingCost ? parseFloat(newProduct.packingCost) : undefined,
                shippingCost: newProduct.shippingCost ? parseFloat(newProduct.shippingCost) : undefined,
                image: newProduct.images[0] || '',
                img: newProduct.images[0] || '',
                images: newProduct.images,
                sellerId: user.id
            };

            await api.post('/products', productData);
            showStatus('success', 'Product created successfully!', 'Successfull');
            setShowProductModal(false);
            setNewProduct({ name: '', sellerPrice: '', description: '', category: categories[0]?.name || '', stock: '', images: [] });
            fetchSellerData();
        } catch (error) {
            console.error('Failed to create product:', error);
            const errorMsg = error.response?.data?.error || error.message;
            showStatus('failed', 'Error creating product: ' + errorMsg, 'Failed');
        }
    };

    const handleEditProduct = (product) => {
        console.log('=== EDIT PRODUCT CLICKED ===');
        console.log('Full product object:', product);
        console.log('Product ID:', product?.id);
        console.log('Product name:', product?.name);
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                name: editingProduct.name,
                description: editingProduct.description,
                category: editingProduct.category,
                cat: editingProduct.category,
                stock: parseInt(editingProduct.stock) || 0,
                sellerPrice: parseFloat(editingProduct.sellerPrice) || 0,
                packingCost: editingProduct.packingCost ? parseFloat(editingProduct.packingCost) : undefined,
                shippingCost: editingProduct.shippingCost ? parseFloat(editingProduct.shippingCost) : undefined,
                image: editingProduct.images?.[0] || editingProduct.image || editingProduct.img || '',
                img: editingProduct.images?.[0] || editingProduct.image || editingProduct.img || '',
                images: editingProduct.images || [editingProduct.image || editingProduct.img].filter(Boolean)
            };

            console.log('=== UPDATE PRODUCT DEBUG ===');
            console.log('Product ID:', editingProduct.id);
            console.log('API URL:', `/products/${editingProduct.id}`);
            console.log('Product Data:', productData);

            const response = await api.put(`/products/${editingProduct.id}`, productData);
            console.log('✅ Update successful:', response.data);

            showStatus('changed', 'Product updated successfully!', 'Changed');
            setShowEditModal(false);
            setEditingProduct(null);
            fetchSellerData();
        } catch (error) {
            console.error('Failed to update product:', error);
            console.error('Error details:', error.response?.data);
            showStatus('failed', 'Error updating product: ' + (error.response?.data?.error || error.message), 'Failed');
        }
    };

    const handleDeleteProduct = async (productId) => {
        confirmAction('This product will be removed from your catalog and the shop. This cannot be undone.', async () => {
            try {
                await api.delete(`/products/${productId}`);
                showStatus('success', 'Product deleted successfully!', 'Deleted');
                fetchSellerData();
            } catch (error) {
                console.error('Failed to delete product:', error);
                showStatus('failed', 'Failed to delete product', 'Failed');
            }
        }, 'Delete Product?', 'delete');
    };

    const handleImportProducts = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                // Split by newline and remove empty lines
                const rows = text.split(/\r?\n/).filter(row => row.trim().length > 0).slice(1);

                const productsToImport = [];
                const errors = [];

                rows.forEach((row, index) => {
                    // Regex to split by comma but ignore commas inside double quotes
                    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

                    if (!cols || cols.length < 2) {
                        return; // Skip empty or invalid rows
                    }

                    // Clean quotes from values
                    const clean = (val) => val ? val.replace(/^"|"$/g, '').trim() : '';

                    const name = clean(cols[0]);
                    const priceStr = clean(cols[1]);
                    const description = clean(cols[2]);
                    const category = clean(cols[3]);
                    const stockStr = clean(cols[4]);
                    const image = clean(cols[5]);

                    const price = parseFloat(priceStr);
                    const stock = parseInt(stockStr);

                    if (!name || isNaN(price)) {
                        errors.push(`Row ${index + 2}: Invalid Name or Price`);
                        return;
                    }

                    productsToImport.push({
                        name,
                        price,
                        description: description || '',
                        category: category || 'Uncategorized',
                        stock: isNaN(stock) ? 0 : stock,
                        image: image || '',
                        sellerId: user.id,
                        rating: 0,
                        reviews: 0
                    });
                });

                if (errors.length > 0) {
                    showStatus('warning', `Some rows were skipped due to errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`, 'Import Warning');
                }

                if (productsToImport.length === 0) {
                    showStatus('info', 'No valid products found to import.', 'Import Info');
                    return;
                }

                let successCount = 0;
                for (const product of productsToImport) {
                    try {
                        await api.post('/products', product);
                        successCount++;
                    } catch (err) {
                        console.error('Failed to import product:', product.name, err);
                    }
                }

                showStatus('success', `Successfully imported ${successCount} products!`, 'Import Complete');
                setShowImportModal(false);
                fetchSellerData();
            } catch (error) {
                console.error('Import failed:', error);
                showStatus('failed', 'Failed to import products: ' + error.message, 'Import Failed');
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const csvContent = `Name,Price,Description,Category,Stock,Image URL\nSample Product,999,Product description here,${categories[0]?.name || 'Mobiles'},50,https://example.com/image.jpg\n`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_import_template.csv';
        a.click();
    };

    const fetchSalesReport = async () => {
        try {
            const res = await api.get(`/seller/sales-report/${user.id}`);
            setSalesReport(res.data);
        } catch (error) {
            console.error('Failed to fetch sales report:', error);
        }
    };

    const fetchFinanceData = async () => {
        try {
            const res = await api.get(`/seller/finance/${user.id}`);
            setFinanceData(res.data);
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        }
    };

    const exportSalesReport = () => {
        const headers = ['Date', 'Product', 'Quantity', 'Amount', 'Customer'];
        const rows = salesReport.map(sale => [
            new Date(sale.date).toLocaleDateString(),
            sale.productName,
            sale.quantity,
            `₹${sale.amount}`,
            sale.customerName
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleStatusUpdate = async (orderId, newStatus, riderId = null, options = {}) => {
        try {
            const payload = { status: newStatus, riderId, ...options };
            await api.put(`/orders/${orderId}/status`, payload);
            // Refresh orders
            fetchSellerData();
            showStatus('success', `Order marked as ${newStatus}`, 'Order Update');
        } catch (error) {
            console.error('Failed to update status:', error);
            showStatus('failed', 'Failed to update status', 'Order Update Failed');
        }
    };

    const printInvoice = (order) => {
        const invoiceWindow = window.open('', '_blank');
        invoiceWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${order.id}</title>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
                        .invoice-details { text-align: right; }
                        .bill-to { margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; border-bottom: 2px solid #eee; padding: 10px; }
                        td { padding: 10px; border-bottom: 1px solid #eee; }
                        .total { text-align: right; font-size: 20px; font-weight: bold; }
                        .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Merchant Hub</div>
                        <div class="invoice-details">
                            <h1>INVOICE</h1>
                            <p>Invoice #: INV-${order.id.slice(0, 8)}</p>
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="bill-to">
                        <h3>Bill To:</h3>
                        <p><strong>${order.user?.name || 'Customer'}</strong></p>
                        <p>${order.user?.email || ''}</p>
                        <p>${order.user?.phone || ''}</p>
                        <p>${order.address || 'Address not available'}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${order.productName}</td>
                                <td>${order.quantity || 1}</td>
                                <td>₹${(order.totalAmount / (order.quantity || 1)).toLocaleString()}</td>
                                <td>₹${order.totalAmount?.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total">
                        Total Amount: ₹${order.totalAmount?.toLocaleString()}
                    </div>

                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                    </div>
                </body>
            </html>
        `);
        invoiceWindow.document.close();
        // invoiceWindow.print();
    };

    const printLabel = (order) => {
        const labelWindow = window.open('', '_blank', 'width=500,height=700');
        labelWindow.document.write(`
            <html>
                <head>
                    <title>Shipping Label</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; border: 4px solid #000; height: 95vh; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
                        .header { text-align: center; border-bottom: 4px solid #000; padding-bottom: 10px; }
                        .bold { font-weight: bold; }
                        .big { font-size: 24px; }
                        .section { margin: 15px 0; }
                        .barcode { 
                             background: repeating-linear-gradient(
                                 to right,
                                 #000 0,
                                 #000 10px,
                                 #fff 10px,
                                 #fff 20px
                             );
                             height: 60px;
                             width: 80%;
                             margin: 20px auto;
                         }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="bold" style="font-size: 30px;">EXPRESS</div>
                        <div>Wt: 0.5kg</div>
                    </div>

                    <div class="section">
                        <div class="bold">FROM:</div>
                        <div>Merchant Hub Fulfillment</div>
                        <div>Bangalore, KA 560001</div>
                    </div>

                    <div class="section" style="border: 4px solid #000; padding: 20px;">
                        <div class="bold">SHIP TO:</div>
                        <div class="big">${order.user?.name || 'Customer'}</div>
                        <div>${order.address || 'Address not available'}</div>
                        <div class="bold" style="margin-top: 10px;">Ph: ${order.user?.phone || 'N/A'}</div>
                    </div>

                    <div class="section" style="text-align: center;">
                        <div class="bold">TRACKING #: ${order.id.split('-')[0].toUpperCase()}</div>
                        <div class="barcode"></div> 
                        <div>ORDER: #${order.id.slice(0, 8)}</div>
                    </div>
                </body>
            </html>
        `);
        labelWindow.document.close();
        // labelWindow.print();
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
    );

    return (
        <div style={dashboardContainer}>
            <style>{`
                aside::-webkit-scrollbar {
                    width: 8px;
                }
                aside::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                aside::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.4);
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                aside::-webkit-scrollbar-thumb:hover {
                    background: rgba(59, 130, 246, 0.7);
                }
            `}</style>
            {/* Dark Sidebar */}
            <aside style={{
                ...sidebar,
                position: isMobile ? 'fixed' : 'relative',
                transform: isMobile && !showSidebar ? 'translateX(-100%)' : 'none',
                zIndex: 200,
                width: isMobile ? '280px' : '280px',
                boxShadow: isMobile && showSidebar ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={logoWrapper}>
                    <div style={logoIcon}><Store size={24} color="#fff" /></div>
                    <span style={logoText}>Merchant Hub</span>
                    {isMobile && (
                        <button onClick={() => setShowSidebar(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div style={navSection}>
                    <span style={navLabel}>MAIN CONTROL</span>
                    <div style={navGroup}>
                        <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? activeNav : navBtn}><LayoutDashboard size={18} /> Overview</button>
                        <button onClick={() => setActiveTab('inventory')} style={activeTab === 'inventory' ? activeNav : navBtn}><Package size={18} /> Inventory</button>
                    </div>
                </div>

                <div style={navSection}>
                    <span style={navLabel}>SALES & LOGISTICS</span>
                    <div style={navGroup}>
                        <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? activeNav : navBtn}><ShoppingCart size={18} /> Orders</button>
                        <button onClick={() => { setActiveTab('business_calendar'); fetchSalesReport(); }} style={activeTab === 'business_calendar' ? activeNav : navBtn}><Calendar size={18} /> Business Calendar</button>
                        <button onClick={() => { setActiveTab('sales'); fetchSalesReport(); }} style={activeTab === 'sales' ? activeNav : navBtn}><BarChart size={18} /> Sales Report</button>
                        <button onClick={() => { setActiveTab('finance'); fetchFinanceData(); }} style={activeTab === 'finance' ? activeNav : navBtn}><Wallet size={18} /> Earnings</button>
                    </div>
                </div>

                <div style={navSection}>
                    <span style={navLabel}>CONFIGURATION</span>
                    <div style={navGroup}>
                        <button onClick={() => setActiveTab('settings')} style={activeTab === 'settings' ? activeNav : navBtn}><Settings size={18} /> Settings</button>
                    </div>
                </div>

                <div style={sidebarFooter}>
                    <div style={profileInSidebar}>
                        <div style={userAvatarMini}>{user?.name?.charAt(0) || 'M'}</div>
                        <div style={profileInfo}>
                            <span style={{ ...profName, color: '#fff' }}>{user?.name || 'Merchant'}</span>
                            <span style={{ ...profRole, color: '#94a3b8' }}>Verified Seller</span>
                        </div>
                    </div>
                    <button style={logoutBtnSidebar} onClick={logout}>
                        <Power size={16} /> Logout
                    </button>
                    <button onClick={() => navigate('/')} style={backToHubBtn}><ArrowLeft size={16} /> Return to Hub</button>
                </div>
            </aside>

            {/* Main Content Area */}
            {/* Main Content Area */}
            {isMobile && showSidebar && (
                <div onClick={() => setShowSidebar(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(2px)' }} />
            )}

            <main style={content}>
                <header style={{ ...topBar, padding: isMobile ? '0 1rem' : '0 3rem' }}>
                    <div style={topBarLeft}>
                        {isMobile && (
                            <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', color: '#1e293b' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        <div style={searchWrapper}>
                            <Search size={18} color="#64748b" />
                            <input placeholder="Search products, orders..." style={sInput} />
                        </div>
                    </div>
                    <div style={topBarRight}>
                        <div style={vacationToggle} onClick={() => setVacationMode(!vacationMode)}>
                            <Palmtree size={20} color={vacationMode ? '#f59e0b' : '#64748b'} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Vacation</span>
                            <div style={{ ...tSwitch, background: vacationMode ? '#f59e0b' : '#e2e8f0' }}>
                                <motion.div animate={{ x: vacationMode ? 20 : 0 }} style={tDot} />
                            </div>
                        </div>
                        <div style={vDivider} />
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowNotifications(!showNotifications)} style={topNavBtn}>
                                {notifications.some(n => !n.isRead) ? <BellDot size={18} color="#ef4444" /> : <Bell size={18} />}
                            </button>
                            {showNotifications && (
                                <div style={notificationPanel}>
                                    <div style={notifHeader}>Merchant Alerts</div>
                                    <div style={notifList}>
                                        {notifications.length === 0 ? <div style={pNoNotif}>No new notifications.</div> : notifications.map(n => (
                                            <div key={n.id} style={{ ...notifItem, opacity: n.isRead ? 0.6 : 1 }}>
                                                <div style={notifTitle}>{n.title}</div>
                                                <div style={notifMsg}>{n.message}</div>
                                                <div style={notifTime}>{new Date(n.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={vDivider} />
                        <button onClick={() => navigate('/')} style={topNavBtn}>
                            <Globe size={18} />
                            <span>View Store</span>
                        </button>
                        <div style={vDivider} />
                        <div style={sellerBadge}>SELLER</div>
                    </div>
                </header>

                <div style={scrollArea}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h1 style={contentTitle}>Market Performance</h1>
                                        <p style={contentSubtitle}>Visual and numerical insights for your storefront.</p>
                                    </div>
                                    <button style={saasAddBtn} onClick={() => setActiveTab('inventory')}><Plus size={16} /> Add Product</button>
                                </div>

                                <div style={{ ...statsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)' }}>
                                    {[
                                        { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, trend: '+12%', icon: <DollarSign />, color: '#10b981' },
                                        { label: 'Net Profit', value: `₹${stats.netProfit.toLocaleString()}`, trend: '+5%', icon: <TrendingUp />, color: '#6366f1' },
                                        { label: 'Total Orders', value: stats.totalOrders, trend: '+18%', icon: <Package />, color: '#ec4899' },
                                        { label: 'Live Products', value: products.filter(p => p.isApproved).length, trend: 'In Shop', icon: <Store />, color: '#10b981' },
                                        { label: 'Pending Approval', value: products.filter(p => !p.isApproved).length, trend: 'Admin Review', icon: <Clock />, color: '#f59e0b' },
                                    ].map((s, i) => (
                                        <div key={i} style={saasStatCard}>
                                            <div style={statHeader}>
                                                <div style={{ ...statIconBox, color: s.color }}>{s.icon}</div>
                                                <div style={statTrend}>{s.trend}</div>
                                            </div>
                                            <div style={statContent}>
                                                <span style={statLabel}>{s.label}</span>
                                                <span style={statValue}>{s.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ ...doubleGrid, gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr' }}>
                                    <div style={chartCard}>
                                        <h3 style={cardTitle}>Sales Velocity</h3>
                                        <div style={{ width: '100%', height: '200px', minHeight: '200px' }}>
                                            <ResponsiveContainer width="99%" height="100%">
                                                <AreaChart data={[
                                                    { name: 'Mon', sales: 400 },
                                                    { name: 'Tue', sales: 300 },
                                                    { name: 'Wed', sales: 600 },
                                                    { name: 'Thu', sales: 800 },
                                                    { name: 'Fri', sales: 500 },
                                                    { name: 'Sat', sales: 900 },
                                                    { name: 'Sun', sales: 1100 },
                                                ]}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div style={chartCard}>
                                        <h3 style={cardTitle}>Quick Shortcuts</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <button style={actionBtn} onClick={() => setActiveTab('inventory')}><Package size={18} /> Update Stock Level</button>
                                            <button style={actionBtn}><Download size={18} /> Export Sales Report</button>
                                            <button style={actionBtn} onClick={() => setActiveTab('finance')}><Wallet size={18} /> Payout Settings</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'inventory' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Inventory Management</h3>
                                        <p style={contentSubtitle}>Monitor stock levels and edit product details.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setShowImportModal(true)} style={{ ...saasAddBtn, background: '#10b981' }}><Upload size={16} /> Import Products</button>
                                        <button onClick={() => setShowProductModal(true)} style={saasAddBtn}><Plus size={16} /> New Product</button>
                                    </div>
                                </div>

                                <div style={tableCard}>
                                    <table style={saasTable}>
                                        <thead>
                                            <tr>
                                                <th style={th}>Product Details</th>
                                                <th style={th}>Inventory</th>
                                                <th style={th}>My Earning</th>
                                                <th style={th}>Final Price</th>
                                                <th style={th}>Visibility</th>
                                                <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ ...td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                                        <Package size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                                                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Products Yet</div>
                                                        <div style={{ fontSize: '0.9rem' }}>Click "New Product" to add your first item</div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map(p => (
                                                    <tr key={p.id} style={tRow}>
                                                        <td style={td}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={userAvatarMini}>{p.name[0]}</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.name}</span>
                                                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>#SKU-{p.id.toString().slice(-6)}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={td}>
                                                            <span style={{ fontWeight: 700, color: p.stock < 10 ? '#ef4444' : '#1e293b' }}>{p.stock} units</span>
                                                        </td>
                                                        <td style={td}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: 800 }}>₹{((p.sellerPrice || 0) + (p.packingCost || 0) + (p.shippingCost || 0)).toLocaleString()}</span>
                                                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Payout (Base+Logistics)</span>
                                                            </div>
                                                        </td>
                                                        <td style={td}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: 800, color: '#6366f1' }}>₹{p.platformPrice?.toLocaleString() || p.price?.toLocaleString()}</span>
                                                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Customer Price</span>
                                                            </div>
                                                        </td>
                                                        <td style={td}>
                                                            {!p.isApproved ? (
                                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' }}>
                                                                    <Clock size={12} /> PENDING APPROVAL
                                                                </div>
                                                            ) : p.status === 'Needs Fix' ? (
                                                                <div
                                                                    onClick={() => showStatus('warning', 'Pricing Violation: Enhance margin > 5%', 'Action Required')}
                                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, background: '#fffbeb', color: '#d97706', cursor: 'pointer', border: '1px solid #fcd34d' }}
                                                                >
                                                                    <AlertCircle size={12} /> NEEDS FIX
                                                                </div>
                                                            ) : p.status === 'Pending' ? (
                                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                                                    <Clock size={12} /> REVIEWING
                                                                </div>
                                                            ) : (
                                                                <span style={{ ...activeBadge, background: '#f0fdf4', color: '#166534' }}>LIVE</span>
                                                            )}
                                                        </td>
                                                        <td style={{ ...td, textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                <button onClick={() => handleEditProduct(p)} style={miniAction}><Edit size={14} color="#6366f1" /></button>
                                                                <button onClick={() => handleDeleteProduct(p.id)} style={{ ...miniAction, borderColor: '#fee2e2' }}><Trash2 size={14} color="#ef4444" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'orders' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Incoming Orders</h3>
                                        <p style={contentSubtitle}>Fulfill customer requests and track shipment status.</p>
                                    </div>
                                </div>
                                {orders.length === 0 ? (
                                    <div style={emptyState}>
                                        <ShoppingCart size={48} color="#94a3b8" />
                                        <h3 style={{ marginTop: '1rem', color: '#1e293b' }}>No active orders</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>When customers buy your products, they will appear here.</p>
                                    </div>
                                ) : (
                                    <div style={tableCard}>
                                        <table style={saasTable}>
                                            <thead>
                                                <tr>
                                                    <th style={th}>Order ID</th>
                                                    <th style={th}>Product</th>
                                                    <th style={th}>Customer</th>
                                                    <th style={th}>Amount</th>
                                                    <th style={th}>Status</th>
                                                    <th style={th}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order.id} style={tRow}>
                                                        <td style={td}>#{order.id.slice(0, 8)}</td>
                                                        <td style={td}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <img src={order.productImage || 'https://via.placeholder.com/40'} alt={order.productName} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                <span style={{ fontWeight: 700 }}>{order.productName}</span>
                                                            </div>
                                                        </td>
                                                        <td style={td}>{order.user?.name || 'Customer'}</td>
                                                        <td style={td}>₹{order.totalAmount?.toLocaleString()}</td>
                                                        <td style={td}>
                                                            <span style={{
                                                                ...activeBadge,
                                                                background: order.status === 'Delivered' ? '#f0fdf4' : order.status === 'Packed' ? '#e0e7ff' : order.status === 'Processing' ? '#fef3c7' : '#fee2e2',
                                                                color: order.status === 'Delivered' ? '#166534' : order.status === 'Packed' ? '#4338ca' : order.status === 'Processing' ? '#92400e' : '#991b1b'
                                                            }}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td style={td}>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    onClick={() => setViewingOrder(order)}
                                                                    style={{ ...miniAction, border: 'none', background: 'transparent' }}
                                                                    title="View Details"
                                                                >
                                                                    <ChevronRight size={20} color="#64748b" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'business_calendar' && (
                            <motion.div key="biz-calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <h2 style={contentTitle}>Business Calendar</h2>
                                    <p style={contentSubtitle}>Monitor daily sales performance and order volume.</p>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <SmartCalendar
                                        title="Sales & Order Activity"
                                        data={orders.reduce((acc, order) => {
                                            const date = new Date(order.createdAt).toISOString().split('T')[0];
                                            if (!acc[date]) acc[date] = { count: 0, sales: 0, items: 0 };
                                            acc[date].count += 1;
                                            acc[date].sales += order.totalAmount || 0;
                                            acc[date].items += order.quantity || 1;
                                            return acc;
                                        }, {})}
                                        renderCellContent={(data) => (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e293b' }}>{data.count} Orders</span>
                                                <span style={{ fontSize: '0.6rem', color: '#6366f1' }}>₹{data.sales.toLocaleString()}</span>
                                            </div>
                                        )}
                                        onDateClick={(date, data) => {
                                            if (data) {
                                                showStatus('success', `Sales: ₹${data.sales.toLocaleString()}, Items: ${data.items}`, `${date}: ${data.count} Orders`);
                                            } else {
                                                showStatus('info', 'No sales activity recorded.', date);
                                            }
                                        }}
                                    />
                                </div>

                                <div style={{ marginTop: '2rem', background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Monthly Performance Trend</h3>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={Object.entries(orders.reduce((acc, order) => {
                                                const date = new Date(order.createdAt).toISOString().split('T')[0];
                                                if (!acc[date]) acc[date] = { date: date.slice(5), orders: 0, sales: 0 };
                                                acc[date].orders += 1;
                                                acc[date].sales += order.totalAmount;
                                                return acc;
                                            }, {})).map(([k, v]) => v).sort((a, b) => a.date.localeCompare(b.date))}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{ background: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ color: '#1e293b', fontWeight: 700 }}
                                                />
                                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'sales' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Sales Report</h3>
                                        <p style={contentSubtitle}>Detailed breakdown of your sales performance.</p>
                                    </div>
                                    <button onClick={exportSalesReport} style={{ ...saasAddBtn, background: '#10b981' }}><Download size={16} /> Export Report</button>
                                </div>

                                <div style={tableCard}>
                                    <table style={saasTable}>
                                        <thead>
                                            <tr>
                                                <th style={th}>Date</th>
                                                <th style={th}>Product</th>
                                                <th style={th}>Quantity</th>
                                                <th style={th}>Amount</th>
                                                <th style={th}>Customer</th>
                                                <th style={th}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesReport.length > 0 ? salesReport.map((sale, idx) => (
                                                <tr key={idx} style={tRow}>
                                                    <td style={td}>{new Date(sale.date).toLocaleDateString()}</td>
                                                    <td style={td}>{sale.productName}</td>
                                                    <td style={td}>{sale.quantity}</td>
                                                    <td style={td}>₹{sale.amount.toLocaleString()}</td>
                                                    <td style={td}>{sale.customerName}</td>
                                                    <td style={td}><span style={{ ...activeBadge, background: '#f0fdf4', color: '#166534' }}>PAID</span></td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="6" style={{ ...td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                                        No sales data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'finance' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Financial Hub</h3>
                                        <p style={contentSubtitle}>Track your earnings, settlements, and payouts.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button style={saasAddBtn} onClick={() => showStatus('success', 'Payout request sent!', 'Request Sent')}><Wallet size={16} /> Request Withdrawal</button>
                                    </div>
                                </div>

                                <div style={{ ...statsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)' }}>
                                    {[
                                        { label: 'Available Balance', value: `₹${financeData.wallet?.toLocaleString()}`, trend: 'Unlocked', icon: <Wallet />, color: '#10b981' },
                                        { label: 'Pending Settlement', value: `₹${financeData.pendingSettlements?.toLocaleString()}`, trend: 'Awaiting Delivery', icon: <Clock />, color: '#f59e0b' },
                                        { label: 'Lifetime Earnings', value: `₹${financeData.lifetimeEarnings?.toLocaleString()}`, trend: 'Gross Revenue', icon: <TrendingUp />, color: '#6366f1' },
                                        { label: 'Total Sales', value: stats.totalSales.toLocaleString(), trend: 'All Time', icon: <ShoppingCart />, color: '#3b82f6' },
                                    ].map((s, i) => (
                                        <div key={i} style={saasStatCard}>
                                            <div style={statHeader}>
                                                <div style={{ ...statIconBox, color: s.color }}>{s.icon}</div>
                                                <div style={{ ...statTrend, background: s.color + '15', color: s.color }}>{s.trend}</div>
                                            </div>
                                            <div style={statContent}>
                                                <span style={statLabel}>{s.label}</span>
                                                <span style={statValue}>{s.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ ...statsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', marginTop: '1.5rem' }}>
                                    {[
                                        { label: 'Packing Cost', value: `₹${stats.totalPackingCost?.toLocaleString()}`, trend: 'Operational expense', icon: <Package />, color: '#6366f1' },
                                        { label: 'Shipping Cost', value: `₹${stats.totalShippingCost?.toLocaleString()}`, trend: 'Logistics expense', icon: <Truck />, color: '#10b981' },
                                    ].map((s, i) => (
                                        <div key={i} style={saasStatCard}>
                                            <div style={statHeader}>
                                                <div style={{ ...statIconBox, color: s.color }}>{s.icon}</div>
                                                <div style={{ ...statTrend, background: s.color + '15', color: s.color }}>{s.trend}</div>
                                            </div>
                                            <div style={statContent}>
                                                <span style={statLabel}>{s.label}</span>
                                                <span style={statValue}>{s.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={tableCard}>
                                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Earning Transactions</h3>
                                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                            <span>Showing all settled funds</span>
                                        </div>
                                    </div>
                                    <table style={saasTable}>
                                        <thead>
                                            <tr>
                                                <th style={th}>Date</th>
                                                <th style={th}>Description</th>
                                                <th style={th}>Order Details</th>
                                                <th style={th}>Net Earning</th>
                                                <th style={th}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {financeData.transactions.length === 0 ? (
                                                <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No transactions found yet. Keep selling!</td></tr>
                                            ) : financeData.transactions.map((tx, idx) => (
                                                <tr key={idx} style={tRow}>
                                                    <td style={td}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                    <td style={td}>
                                                        <div style={{ fontWeight: 700 }}>{tx.description}</div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>#{tx.orderId}</div>
                                                    </td>
                                                    <td style={td}>
                                                        <div style={{ fontSize: '0.85rem' }}>{tx.Order?.productName || 'Order Payout'}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Order Value: ₹{tx.Order?.totalAmount?.toLocaleString()}</div>
                                                    </td>
                                                    <td style={{ ...td, color: '#10b981', fontWeight: 900 }}>+₹{tx.netProfit.toLocaleString()}</td>
                                                    <td style={td}><span style={{ ...activeBadge, background: '#f0fdf4', color: '#166534' }}>SETTLED</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={pane}>
                                <div style={adminPageHeader}>
                                    <div style={headerInfo}>
                                        <h3 style={contentTitle}>Seller Settings</h3>
                                        <p style={contentSubtitle}>Configure default pricing percentages for your products.</p>
                                    </div>
                                    <button
                                        style={saasAddBtn}
                                        onClick={() => {
                                            showStatus('success', 'Settings saved successfully!', 'Settings Updated');
                                            // Here you could add API call to save settings
                                        }}
                                    >
                                        <Check size={16} /> Save Settings
                                    </button>
                                </div>

                                <div style={{ maxWidth: '800px' }}>
                                    <div style={{ ...tableCard, padding: '2rem' }}>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                                Default Cost Percentages
                                            </h4>
                                            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                                                Set default percentages for packing and shipping costs. These will be automatically calculated based on your product's seller price. You can override these values for individual products.
                                            </p>
                                        </div>

                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <div style={formGroup}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <label style={formLabel}>
                                                        Default Packing Cost
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSellerSettings({ ...sellerSettings, packingCostType: 'percent' })}
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                background: sellerSettings.packingCostType === 'percent' ? '#6366f1' : '#e2e8f0',
                                                                color: sellerSettings.packingCostType === 'percent' ? '#fff' : '#64748b',
                                                                transition: 'all 0.3s'
                                                            }}
                                                        >
                                                            % Percentage
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSellerSettings({ ...sellerSettings, packingCostType: 'fixed' })}
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                background: sellerSettings.packingCostType === 'fixed' ? '#6366f1' : '#e2e8f0',
                                                                color: sellerSettings.packingCostType === 'fixed' ? '#fff' : '#64748b',
                                                                transition: 'all 0.3s'
                                                            }}
                                                        >
                                                            ₹ Fixed Amount
                                                        </button>
                                                    </div>
                                                </div>

                                                {sellerSettings.packingCostType === 'percent' ? (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.1"
                                                                value={sellerSettings.defaultPackingPercent}
                                                                onChange={(e) => setSellerSettings({
                                                                    ...sellerSettings,
                                                                    defaultPackingPercent: parseFloat(e.target.value) || 0
                                                                })}
                                                                style={{
                                                                    ...formInput,
                                                                    flex: 1,
                                                                    fontSize: '1.1rem',
                                                                    fontWeight: 700,
                                                                    borderColor: '#6366f1'
                                                                }}
                                                                placeholder="2"
                                                            />
                                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1', minWidth: '40px' }}>
                                                                {sellerSettings.defaultPackingPercent}%
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            marginTop: '0.75rem',
                                                            padding: '0.75rem',
                                                            background: '#f8fafc',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            color: '#475569'
                                                        }}>
                                                            <strong>Example:</strong> For a product priced at ₹1,000, packing cost will be <strong style={{ color: '#6366f1' }}>₹{(1000 * sellerSettings.defaultPackingPercent / 100).toFixed(2)}</strong>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1' }}>₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={sellerSettings.defaultPackingFixed}
                                                                onChange={(e) => setSellerSettings({
                                                                    ...sellerSettings,
                                                                    defaultPackingFixed: parseFloat(e.target.value) || 0
                                                                })}
                                                                style={{
                                                                    ...formInput,
                                                                    flex: 1,
                                                                    fontSize: '1.1rem',
                                                                    fontWeight: 700,
                                                                    borderColor: '#6366f1'
                                                                }}
                                                                placeholder="20"
                                                            />
                                                        </div>
                                                        <div style={{
                                                            marginTop: '0.75rem',
                                                            padding: '0.75rem',
                                                            background: '#f8fafc',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            color: '#475569'
                                                        }}>
                                                            <strong>Example:</strong> For any product, packing cost will be <strong style={{ color: '#6366f1' }}>₹{sellerSettings.defaultPackingFixed.toFixed(2)}</strong>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div style={formGroup}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <label style={formLabel}>
                                                        Default Shipping Cost
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSellerSettings({ ...sellerSettings, shippingCostType: 'percent' })}
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                background: sellerSettings.shippingCostType === 'percent' ? '#10b981' : '#e2e8f0',
                                                                color: sellerSettings.shippingCostType === 'percent' ? '#fff' : '#64748b',
                                                                transition: 'all 0.3s'
                                                            }}
                                                        >
                                                            % Percentage
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSellerSettings({ ...sellerSettings, shippingCostType: 'fixed' })}
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                background: sellerSettings.shippingCostType === 'fixed' ? '#10b981' : '#e2e8f0',
                                                                color: sellerSettings.shippingCostType === 'fixed' ? '#fff' : '#64748b',
                                                                transition: 'all 0.3s'
                                                            }}
                                                        >
                                                            ₹ Fixed Amount
                                                        </button>
                                                    </div>
                                                </div>

                                                {sellerSettings.shippingCostType === 'percent' ? (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.1"
                                                                value={sellerSettings.defaultShippingPercent}
                                                                onChange={(e) => setSellerSettings({
                                                                    ...sellerSettings,
                                                                    defaultShippingPercent: parseFloat(e.target.value) || 0
                                                                })}
                                                                style={{
                                                                    ...formInput,
                                                                    flex: 1,
                                                                    fontSize: '1.1rem',
                                                                    fontWeight: 700,
                                                                    borderColor: '#10b981'
                                                                }}
                                                                placeholder="5"
                                                            />
                                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', minWidth: '40px' }}>
                                                                {sellerSettings.defaultShippingPercent}%
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            marginTop: '0.75rem',
                                                            padding: '0.75rem',
                                                            background: '#f0fdf4',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            color: '#166534'
                                                        }}>
                                                            <strong>Example:</strong> For a product priced at ₹1,000, shipping cost will be <strong style={{ color: '#10b981' }}>₹{(1000 * sellerSettings.defaultShippingPercent / 100).toFixed(2)}</strong>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={sellerSettings.defaultShippingFixed}
                                                                onChange={(e) => setSellerSettings({
                                                                    ...sellerSettings,
                                                                    defaultShippingFixed: parseFloat(e.target.value) || 0
                                                                })}
                                                                style={{
                                                                    ...formInput,
                                                                    flex: 1,
                                                                    fontSize: '1.1rem',
                                                                    fontWeight: 700,
                                                                    borderColor: '#10b981'
                                                                }}
                                                                placeholder="50"
                                                            />
                                                        </div>
                                                        <div style={{
                                                            marginTop: '0.75rem',
                                                            padding: '0.75rem',
                                                            background: '#f0fdf4',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            color: '#166534'
                                                        }}>
                                                            <strong>Example:</strong> For any product, shipping cost will be <strong style={{ color: '#10b981' }}>₹{sellerSettings.defaultShippingFixed.toFixed(2)}</strong>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: '2rem',
                                            padding: '1.25rem',
                                            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e7ff'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                                <AlertCircle size={24} color="#6366f1" style={{ flexShrink: 0 }} />
                                                <div>
                                                    <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                                        How Default Costs Work
                                                    </h5>
                                                    <ul style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.8', paddingLeft: '1.25rem', margin: 0 }}>
                                                        <li><strong>Percentage Mode:</strong> Costs are calculated as a percentage of your seller price (e.g., 2% of ₹1,000 = ₹20)</li>
                                                        <li><strong>Fixed Amount Mode:</strong> Same cost applies to all products regardless of price (e.g., always ₹20)</li>
                                                        <li>These defaults are automatically applied when you create a new product</li>
                                                        <li>You can override these values for any individual product in the product form</li>
                                                        <li>Leave product-specific fields empty to use these default settings</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sample Calculation Card */}
                                    <div style={{ ...tableCard, padding: '2rem', marginTop: '1.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>
                                            Full Price Calculation Example
                                        </h4>
                                        <div style={{
                                            padding: '1.5rem',
                                            background: '#f8fafc',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1' }}>
                                                <span style={{ color: '#64748b' }}>Seller Price (Base):</span>
                                                <span style={{ fontWeight: 700, color: '#1e293b' }}>₹1,000.00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1' }}>
                                                <span style={{ color: '#64748b' }}>Packing ({sellerSettings.defaultPackingPercent}%):</span>
                                                <span style={{ fontWeight: 700, color: '#6366f1' }}>₹{(1000 * sellerSettings.defaultPackingPercent / 100).toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1' }}>
                                                <span style={{ color: '#64748b' }}>Shipping ({sellerSettings.defaultShippingPercent}%):</span>
                                                <span style={{ fontWeight: 700, color: '#10b981' }}>₹{(1000 * sellerSettings.defaultShippingPercent / 100).toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Total Base Cost:</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6' }}>
                                                    ₹{(1000 + (1000 * sellerSettings.defaultPackingPercent / 100) + (1000 * sellerSettings.defaultShippingPercent / 100)).toFixed(2)}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #cbd5e1', fontSize: '0.8rem', color: '#64748b' }}>
                                                <em>Note: Final customer price will include platform fees, GST, and admin margins as per platform policies.</em>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* New Product Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay} onClick={() => setShowProductModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={modalContent} onClick={(e) => e.stopPropagation()}>
                            <div style={modalHeader}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>Add New Product</h3>
                                <button onClick={() => setShowProductModal(false)} style={closeBtn}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateProduct} style={modalBody}>
                                <div style={formGroup}>
                                    <label style={formLabel}>Product Name</label>
                                    <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} style={formInput} placeholder="Enter product name" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Base Seller Price (₹)</label>
                                        <input required type="number" value={newProduct.sellerPrice} onChange={(e) => setNewProduct({ ...newProduct, sellerPrice: e.target.value })} style={{ ...formInput, fontWeight: 700, borderColor: '#6366f1' }} placeholder="Your base price" />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Stock Quantity</label>
                                        <input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} style={formInput} placeholder="0" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={formGroup}>
                                        <label style={formLabel}>
                                            Packing Cost (₹)
                                            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6366f1', marginLeft: '0.5rem' }}>
                                                Default: {sellerSettings.packingCostType === 'percent' ? `${sellerSettings.defaultPackingPercent}%` : `₹${sellerSettings.defaultPackingFixed}`}
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={newProduct.packingCost}
                                            onChange={(e) => setNewProduct({ ...newProduct, packingCost: e.target.value })}
                                            style={formInput}
                                            placeholder={`Optional override (auto: ₹${sellerSettings.packingCostType === 'percent'
                                                ? (parseFloat(newProduct.sellerPrice || 0) * sellerSettings.defaultPackingPercent / 100).toFixed(2)
                                                : sellerSettings.defaultPackingFixed.toFixed(2)
                                                })`}
                                        />
                                        {!newProduct.packingCost && newProduct.sellerPrice && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6366f1' }}>
                                                ✓ Using default {sellerSettings.packingCostType === 'percent'
                                                    ? `${sellerSettings.defaultPackingPercent}% = ₹${(parseFloat(newProduct.sellerPrice) * sellerSettings.defaultPackingPercent / 100).toFixed(2)}`
                                                    : `₹${sellerSettings.defaultPackingFixed}`
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>
                                            Shipping Cost (₹)
                                            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#10b981', marginLeft: '0.5rem' }}>
                                                Default: {sellerSettings.shippingCostType === 'percent' ? `${sellerSettings.defaultShippingPercent}%` : `₹${sellerSettings.defaultShippingFixed}`}
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={newProduct.shippingCost}
                                            onChange={(e) => setNewProduct({ ...newProduct, shippingCost: e.target.value })}
                                            style={formInput}
                                            placeholder={`Optional override (auto: ₹${sellerSettings.shippingCostType === 'percent'
                                                ? (parseFloat(newProduct.sellerPrice || 0) * sellerSettings.defaultShippingPercent / 100).toFixed(2)
                                                : sellerSettings.defaultShippingFixed.toFixed(2)
                                                })`}
                                        />
                                        {!newProduct.shippingCost && newProduct.sellerPrice && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#10b981' }}>
                                                ✓ Using default {sellerSettings.shippingCostType === 'percent'
                                                    ? `${sellerSettings.defaultShippingPercent}% = ₹${(parseFloat(newProduct.sellerPrice) * sellerSettings.defaultShippingPercent / 100).toFixed(2)}`
                                                    : `₹${sellerSettings.defaultShippingFixed}`
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {previewPrice && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={pricePreviewCard}>
                                        <div style={previewTitle}>Price Breakdown (Customer View)</div>
                                        <div style={previewRow}>
                                            <span>Base + Logistics:</span>
                                            <span>₹{((parseFloat(newProduct.sellerPrice || 0)) + (previewPrice.packingCost) + (previewPrice.shippingCost)).toFixed(2)}</span>
                                        </div>
                                        <div style={previewRow}>
                                            <span>GST ({previewPrice.gstPercentage}%):</span>
                                            <span>₹{(previewPrice.platformPrice - (parseFloat(newProduct.sellerPrice || 0)) - previewPrice.packingCost - previewPrice.shippingCost - previewPrice.adminProfit - previewPrice.adsCost).toFixed(2)}</span>
                                        </div>
                                        <div style={previewTotalRow}>
                                            <span>Final Platform Price:</span>
                                            <span style={finalPriceText}>₹{previewPrice.platformPrice}</span>
                                        </div>
                                    </motion.div>
                                )}
                                <div style={formGroup}>
                                    <label style={formLabel}>Category</label>
                                    <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} style={formInput}>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={formGroup}>
                                    <label style={formLabel}>
                                        Description
                                        <button
                                            type="button"
                                            onClick={() => handleAutoGenerateDescription(false)}
                                            style={{
                                                marginLeft: '1rem',
                                                padding: '0.35rem 0.75rem',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'scale(1.05)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'scale(1)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            Generate description
                                        </button>
                                    </label>
                                    <textarea required value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} style={{ ...formInput, minHeight: '100px', resize: 'vertical' }} placeholder="Product description..." />
                                </div>
                                <div style={formGroup}>
                                    <label style={formLabel}>Product Images (Multiple)</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files.length > 0) {
                                                    Array.from(e.target.files).forEach(file => {
                                                        handleImageUpload(file, false);
                                                    });
                                                }
                                            }}
                                            style={{ ...formInput, flex: 1 }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>{newProduct.images.length} uploaded</span>
                                    </div>
                                    <input
                                        type="text"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const url = e.target.value.trim();
                                                if (url) {
                                                    setNewProduct({
                                                        ...newProduct,
                                                        images: [...newProduct.images, url]
                                                    });
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                        style={formInput}
                                        placeholder="Paste image URL and press Enter to add"
                                    />
                                    {newProduct.images.length > 0 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>Uploaded Images ({newProduct.images.length}):</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                                                {newProduct.images.map((img, index) => (
                                                    <div key={index} style={{ position: 'relative', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                                                        <img
                                                            src={img}
                                                            alt={`Product ${index + 1}`}
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12"%3EError%3C/text%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProduct({
                                                                ...newProduct,
                                                                images: newProduct.images.filter((_, i) => i !== index)
                                                            })}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '4px',
                                                                right: '4px',
                                                                background: 'rgba(239, 68, 68, 0.9)',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                color: 'white',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                        {index === 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '4px',
                                                                left: '4px',
                                                                background: 'rgba(99, 102, 241, 0.9)',
                                                                color: 'white',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                padding: '2px 6px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                Main
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" onClick={() => setShowProductModal(false)} style={cancelBtn}>Cancel</button>
                                    <button type="submit" style={submitBtn}>Create Product</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Product Modal */}
            <AnimatePresence>
                {showEditModal && editingProduct && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay} onClick={() => setShowEditModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={modalContent} onClick={(e) => e.stopPropagation()}>
                            <div style={modalHeader}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>Edit Product</h3>
                                <button onClick={() => setShowEditModal(false)} style={closeBtn}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleUpdateProduct} style={modalBody}>
                                <div style={formGroup}>
                                    <label style={formLabel}>Product Name</label>
                                    <input required type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} style={formInput} placeholder="Enter product name" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Base Seller Price (₹)</label>
                                        <input required type="number" value={editingProduct.sellerPrice} onChange={(e) => setEditingProduct({ ...editingProduct, sellerPrice: e.target.value })} style={{ ...formInput, fontWeight: 700, borderColor: '#6366f1' }} placeholder="Your base price" />
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>Stock Quantity</label>
                                        <input required type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} style={formInput} placeholder="0" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={formGroup}>
                                        <label style={formLabel}>
                                            Packing Cost (₹)
                                            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6366f1', marginLeft: '0.5rem' }}>
                                                Default: {sellerSettings.packingCostType === 'percent' ? `${sellerSettings.defaultPackingPercent}%` : `₹${sellerSettings.defaultPackingFixed}`}
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={editingProduct.packingCost || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, packingCost: e.target.value })}
                                            style={formInput}
                                            placeholder={`Optional override (auto: ₹${sellerSettings.packingCostType === 'percent'
                                                ? (parseFloat(editingProduct.sellerPrice || 0) * sellerSettings.defaultPackingPercent / 100).toFixed(2)
                                                : sellerSettings.defaultPackingFixed.toFixed(2)
                                                })`}
                                        />
                                        {!editingProduct.packingCost && editingProduct.sellerPrice && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6366f1' }}>
                                                ✓ Using default {sellerSettings.packingCostType === 'percent'
                                                    ? `${sellerSettings.defaultPackingPercent}% = ₹${(parseFloat(editingProduct.sellerPrice) * sellerSettings.defaultPackingPercent / 100).toFixed(2)}`
                                                    : `₹${sellerSettings.defaultPackingFixed}`
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <div style={formGroup}>
                                        <label style={formLabel}>
                                            Shipping Cost (₹)
                                            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#10b981', marginLeft: '0.5rem' }}>
                                                Default: {sellerSettings.shippingCostType === 'percent' ? `${sellerSettings.defaultShippingPercent}%` : `₹${sellerSettings.defaultShippingFixed}`}
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={editingProduct.shippingCost || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, shippingCost: e.target.value })}
                                            style={formInput}
                                            placeholder={`Optional override (auto: ₹${sellerSettings.shippingCostType === 'percent'
                                                ? (parseFloat(editingProduct.sellerPrice || 0) * sellerSettings.defaultShippingPercent / 100).toFixed(2)
                                                : sellerSettings.defaultShippingFixed.toFixed(2)
                                                })`}
                                        />
                                        {!editingProduct.shippingCost && editingProduct.sellerPrice && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#10b981' }}>
                                                ✓ Using default {sellerSettings.shippingCostType === 'percent'
                                                    ? `${sellerSettings.defaultShippingPercent}% = ₹${(parseFloat(editingProduct.sellerPrice) * sellerSettings.defaultShippingPercent / 100).toFixed(2)}`
                                                    : `₹${sellerSettings.defaultShippingFixed}`
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {previewPrice && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={pricePreviewCard}>
                                        <div style={previewTitle}>Revised Price Breakdown</div>
                                        <div style={previewRow}>
                                            <span>Base + Logistics:</span>
                                            <span>₹{((parseFloat(editingProduct.sellerPrice || 0)) + (previewPrice.packingCost) + (previewPrice.shippingCost)).toFixed(2)}</span>
                                        </div>
                                        <div style={previewTotalRow}>
                                            <span>Final Platform Price:</span>
                                            <span style={finalPriceText}>₹{previewPrice.platformPrice}</span>
                                        </div>
                                    </motion.div>
                                )}
                                <div style={formGroup}>
                                    <label style={formLabel}>Category</label>
                                    <select value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} style={formInput}>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={formGroup}>
                                    <label style={formLabel}>
                                        Description
                                        <button
                                            type="button"
                                            onClick={() => handleAutoGenerateDescription(true)}
                                            style={{
                                                marginLeft: '1rem',
                                                padding: '0.35rem 0.75rem',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'scale(1.05)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'scale(1)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            Generate description
                                        </button>
                                    </label>
                                    <textarea required value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} style={{ ...formInput, minHeight: '100px', resize: 'vertical' }} placeholder="Product description..." />
                                </div>
                                <div style={formGroup}>
                                    <label style={formLabel}>Product Images (Multiple)</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files.length > 0) {
                                                    Array.from(e.target.files).forEach(file => {
                                                        handleImageUpload(file, true);
                                                    });
                                                }
                                            }}
                                            style={{ ...formInput, flex: 1 }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>
                                            {(editingProduct.images || [editingProduct.image].filter(Boolean)).length} uploaded
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const url = e.target.value.trim();
                                                if (url) {
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        images: [...(editingProduct.images || [editingProduct.image].filter(Boolean)), url]
                                                    });
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                        style={formInput}
                                        placeholder="Paste image URL and press Enter to add"
                                    />
                                    {(editingProduct.images || [editingProduct.image].filter(Boolean)).length > 0 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>
                                                Uploaded Images ({(editingProduct.images || [editingProduct.image].filter(Boolean)).length}):
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                                                {(editingProduct.images || [editingProduct.image].filter(Boolean)).map((img, index) => (
                                                    <div key={index} style={{ position: 'relative', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                                                        <img
                                                            src={img}
                                                            alt={`Product ${index + 1}`}
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12"%3EError%3C/text%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const currentImages = editingProduct.images || [editingProduct.image].filter(Boolean);
                                                                setEditingProduct({
                                                                    ...editingProduct,
                                                                    images: currentImages.filter((_, i) => i !== index)
                                                                });
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '4px',
                                                                right: '4px',
                                                                background: 'rgba(239, 68, 68, 0.9)',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                color: 'white',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                        {index === 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '4px',
                                                                left: '4px',
                                                                background: 'rgba(99, 102, 241, 0.9)',
                                                                color: 'white',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                padding: '2px 6px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                Main
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" onClick={() => handleDeleteProduct(editingProduct.id)} style={{ ...cancelBtn, color: '#ef4444', borderColor: '#ef4444' }}>Delete Product</button>
                                    <button type="button" onClick={() => setShowEditModal(false)} style={cancelBtn}>Cancel</button>
                                    <button type="submit" style={submitBtn}>Update Product</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Import Products Modal */}
            <AnimatePresence>
                {showImportModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay} onClick={() => setShowImportModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={modalContent} onClick={(e) => e.stopPropagation()}>
                            <div style={modalHeader}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>Import Products</h3>
                                <button onClick={() => setShowImportModal(false)} style={closeBtn}><X size={20} /></button>
                            </div>
                            <div style={modalBody}>
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Upload size={48} color="#3b82f6" style={{ margin: '0 auto' }} />
                                    <h4 style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Upload CSV File</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        Upload a CSV file with your product data
                                    </p>
                                    <button onClick={downloadTemplate} style={{ ...actionBtn, margin: '1rem auto', justifyContent: 'center' }}>
                                        <Download size={18} /> Download Template
                                    </button>
                                    <input type="file" accept=".csv" onChange={handleImportProducts} style={{ marginTop: '1rem' }} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Image Editor Modal */}
            <AnimatePresence>
                {showImageEditor && imageFileToEdit && (
                    <AIImageEditor
                        file={imageFileToEdit}
                        onSave={handleSaveEditedImage}
                        onCancel={() => {
                            setShowImageEditor(false);
                            setImageFileToEdit(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Order Details Modal */}
            <AnimatePresence>
                {viewingOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay} onClick={() => setViewingOrder(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ ...modalContent, maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
                            <div style={modalHeader}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>Order #{viewingOrder.id.slice(0, 8)}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Placed on {new Date(viewingOrder.createdAt).toLocaleString()}</p>
                                </div>
                                <button onClick={() => setViewingOrder(null)} style={closeBtn}><X size={20} /></button>
                            </div>

                            <div style={modalBody}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                                    {/* Product Details, Payment Info */}
                                    <div>
                                        <h4 style={sectionTitle}>Product Details</h4>
                                        <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                            <img src={viewingOrder.productImage || 'https://via.placeholder.com/80'} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{viewingOrder.productName}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Qty: <span style={{ fontWeight: 700, color: '#1e293b' }}>{viewingOrder.quantity || 1}</span></div>
                                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Price: <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{(viewingOrder.totalAmount / (viewingOrder.quantity || 1)).toLocaleString()}</span></div>
                                            </div>
                                        </div>

                                        <h4 style={{ ...sectionTitle, marginTop: '2rem' }}>Payment Info</h4>
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: '#64748b' }}>Subtotal</span>
                                                <span style={{ fontWeight: 600 }}>₹{viewingOrder.totalAmount?.toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: '#64748b' }}>Shipping</span>
                                                <span style={{ fontWeight: 600, color: '#10b981' }}>Free</span>
                                            </div>
                                            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 800 }}>Total Earned</span>
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981' }}>₹{viewingOrder.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer & Shipping, Actions */}
                                    <div>
                                        <h4 style={sectionTitle}>Customer & Shipping</h4>
                                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 800 }}>
                                                    {viewingOrder.user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700 }}>{viewingOrder.user?.name || 'Guest User'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{viewingOrder.user?.email}</div>
                                                </div>
                                            </div>

                                            <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
                                                <MapPin size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                                                {viewingOrder.address || 'No address provided'}
                                            </div>

                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                Phone: <span style={{ fontWeight: 400 }}>{viewingOrder.user?.phone || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '2rem' }}>
                                            <h4 style={sectionTitle}>Actions</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {viewingOrder.status === 'Processing' && (
                                                    <button onClick={() => { handleStatusUpdate(viewingOrder.id, 'Packed'); setViewingOrder({ ...viewingOrder, status: 'Packed' }); }} style={{ ...saasAddBtn, width: '100%', justifyContent: 'center' }}>
                                                        <Package size={18} /> Accept & Pack Order
                                                    </button>
                                                )}

                                                {viewingOrder.status === 'Packed' && (
                                                    <>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                            <button onClick={() => printInvoice(viewingOrder)} style={{ ...miniAction, width: '100%', justifyContent: 'center', padding: '0.75rem', gap: '0.5rem' }}><FileText size={16} /> Invoice</button>
                                                            <button onClick={() => printLabel(viewingOrder)} style={{ ...miniAction, width: '100%', justifyContent: 'center', padding: '0.75rem', gap: '0.5rem' }}><Package size={16} /> Label</button>
                                                        </div>

                                                        {/* Send to H-Logix for Delivery Assignment */}
                                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#0369a1' }}>
                                                                <Truck size={20} />
                                                                <label style={{ fontSize: '0.875rem', fontWeight: 800 }}>Handover to H-Logix</label>
                                                            </div>
                                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                                                                ✓ Order is packed and ready<br />
                                                                ✓ H-Logix will assign delivery partner<br />
                                                                ✓ Admin can also assign if needed
                                                            </p>
                                                            <button
                                                                onClick={() => {
                                                                    confirmAction(
                                                                        'Send this order to H-Logix for delivery partner assignment?',
                                                                        () => {
                                                                            handleStatusUpdate(viewingOrder.id, 'Packed', null, { readyForLogix: true });
                                                                            setViewingOrder({ ...viewingOrder, readyForLogix: true });
                                                                            showStatus('success', 'Order is now visible to H-Logix for delivery assignment', 'Sent to H-Logix');
                                                                        },
                                                                        'Send to H-Logix',
                                                                        'confirm'
                                                                    );
                                                                }}
                                                                style={{ ...saasAddBtn, width: '100%', background: 'linear-gradient(90deg, #0ea5e9, #0284c7)', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 700, padding: '0.9rem' }}
                                                            >
                                                                <Truck size={18} /> Send to H-Logix for Delivery
                                                            </button>
                                                        </div>
                                                    </>
                                                )}

                                                {viewingOrder.status === 'Shipped' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                            <button onClick={() => printInvoice(viewingOrder)} style={{ ...miniAction, width: '100%', justifyContent: 'center', padding: '0.75rem', gap: '0.5rem' }}><FileText size={16} /> Invoice</button>
                                                            <button onClick={() => printLabel(viewingOrder)} style={{ ...miniAction, width: '100%', justifyContent: 'center', padding: '0.75rem', gap: '0.5rem' }}><Package size={16} /> Label</button>
                                                        </div>
                                                        <div style={{ padding: '1rem', background: '#f0fdf4', color: '#166534', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                                                            <Check size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                                            Order Shipped
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Image Editor Modal */}
            <AnimatePresence>
                {showImageEditor && imageFileToEdit && (
                    <AIImageEditor
                        file={imageFileToEdit}
                        onSave={handleSaveEditedImage}
                        onCancel={() => {
                            setShowImageEditor(false);
                            setImageFileToEdit(null);
                        }}
                    />
                )}
            </AnimatePresence>

            <StatusPopup
                show={popup.show}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onAction={popup.onAction}
                onClose={() => setPopup(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

// Styles (Matching Admin Dashboard)
const dashboardContainer = { display: 'flex', minHeight: '100dvh', width: '100%', background: '#f8fafc', overflow: 'hidden' };
const sidebar = { width: '280px', background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' };
const logoWrapper = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', paddingLeft: '0.5rem' };
const logoIcon = { width: '42px', height: '42px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)' };
const logoText = { color: '#fff', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' };
const navSection = { marginBottom: '2rem' };
const navLabel = { fontSize: '0.65rem', fontWeight: 800, color: '#475569', letterSpacing: '0.1em', marginBottom: '1rem', display: 'block', paddingLeft: '0.75rem' };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '0.35rem' };
const navBtn = { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.25rem', background: 'none', border: 'none', borderRadius: '16px', textAlign: 'left', fontWeight: 600, color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', width: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
const activeNav = { ...navBtn, background: 'rgba(59, 130, 246, 0.15)', color: '#fff', fontWeight: 700, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.2)' };
const sidebarFooter = { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' };
const profileInSidebar = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.75rem' };
const userAvatarMini = { width: '36px', height: '36px', borderRadius: '12px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' };
const profileInfo = { display: 'flex', flexDirection: 'column' };
const profName = { fontSize: '0.85rem', fontWeight: 800 };
const profRole = { fontSize: '0.7rem', fontWeight: 600 };
const logoutBtnSidebar = { ...navBtn, color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' };
const backToHubBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: '#94a3b8' };
const content = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' };
const topBar = { height: '80px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', flexShrink: 0 };
const topBarLeft = { display: 'flex', alignItems: 'center', gap: '1rem' };
const topBarRight = { display: 'flex', alignItems: 'center', gap: '1.5rem' };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '12px', width: '300px' };
const sInput = { background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', color: '#1e293b', width: '100%' };
const topNavBtn = { display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#3b82f6', fontWeight: 800, fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '10px' };
const vDivider = { width: '1px', height: '24px', background: '#e2e8f0' };
const sellerBadge = { background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px', border: '1px solid rgba(168, 85, 247, 0.2)' };
const scrollArea = { flex: 1, overflowY: 'auto', padding: '2rem 3rem' };
const pane = { display: 'flex', flexDirection: 'column' };
const adminPageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' };
const headerInfo = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const contentTitle = { fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' };
const contentSubtitle = { fontSize: '0.95rem', color: '#64748b', fontWeight: 500 };
const saasAddBtn = { background: '#3b82f6', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' };
const saasStatCard = { background: '#ffffff', padding: '2.25rem', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', cursor: 'pointer' };
const statHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const statIconBox = { width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statTrend = { fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', background: '#f0fdf4', padding: '0.4rem 0.8rem', borderRadius: '10px' };
const statContent = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const statLabel = { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' };
const statValue = { fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' };
const doubleGrid = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' };
const chartCard = { background: '#ffffff', padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)' };
const cardTitle = { fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '2.5rem', letterSpacing: '-0.3px' };
const summaryItem = { display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' };
const actionBtn = { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', color: '#334155', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left', marginBottom: '0.5rem' };
const tableCard = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' };
const saasTable = { width: '100%', borderCollapse: 'collapse' };
const th = { background: '#f8fafc', padding: '1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textAlign: 'left', textTransform: 'uppercase' };
const td = { padding: '1.25rem', fontSize: '0.9rem', color: '#1e293b' };
const tRow = { borderBottom: '1px solid #f1f5f9' };
const activeBadge = { padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 };
const miniAction = { width: '32px', height: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const vacationToggle = { display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' };
const tSwitch = { width: '40px', height: '20px', borderRadius: '50px', padding: '2px', transition: 'all 0.3s' };
const tDot = { width: '16px', height: '16px', background: 'white', borderRadius: '50%' };
const emptyState = { padding: '6rem 0', textAlign: 'center', color: '#94a3b8' };

// Notifications
const notificationPanel = { position: 'absolute', top: '100%', right: 0, width: '300px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', zIndex: 1000, marginTop: '10px', overflow: 'hidden' };
const notifHeader = { padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', background: '#f8fafc' };
const notifList = { maxHeight: '350px', overflowY: 'auto' };
const notifItem = { padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' };
const notifTitle = { fontWeight: 700, fontSize: '0.8rem', color: '#1e293b' };
const notifMsg = { fontSize: '0.7rem', color: '#64748b' };
const notifTime = { fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.4rem' };
const pNoNotif = { padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' };

// Modal Styles
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modalContent = { background: '#fff', borderRadius: '24px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };
const modalHeader = { padding: '2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const modalBody = { padding: '2rem' };
const formGroup = { marginBottom: '1.5rem' };
const formLabel = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' };
const formInput = { width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' };
const cancelBtn = { flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' };
const submitBtn = { flex: 1, padding: '0.875rem', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)' };
const imagePreviewContainer = { marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const imagePreview = { width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '0.5rem' };
const imagePreviewError = { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#fff', borderRadius: '8px' };

const sectionTitle = { fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' };

const finalPriceText = {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#1e293b'
};

const pricePreviewCard = {
    background: 'rgba(99, 102, 241, 0.05)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginTop: '1.5rem',
    marginBottom: '1rem'
};

const previewTitle = {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem'
};

const previewRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '0.4rem'
};

const previewTotalRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px dashed rgba(99, 102, 241, 0.3)'
};

export default SellerDashboard;
