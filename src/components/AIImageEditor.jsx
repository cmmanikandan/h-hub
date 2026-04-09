import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Wand2,
    Crop,
    RotateCw,
    ZoomIn,
    ZoomOut,
    Sparkles,
    Sun,
    Moon,
    Contrast,
    Droplet,
    Scissors,
    Download,
    Check,
    Loader,
    Filter,
    Shuffle,
    Palette,
    Maximize2,
    Image as ImageIcon,
    Minimize2,
    Square,
    Layers,
    Focus,
    Aperture,
    Thermometer,
    Circle,
    Undo2,
    Redo2
} from 'lucide-react';

const AIImageEditor = ({ file, onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [editing, setEditing] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Edit controls
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [cropMode, setCropMode] = useState(false);

    // Advanced controls
    const [blur, setBlur] = useState(0);
    const [sharpen, setSharpen] = useState(0);
    const [hue, setHue] = useState(0);
    const [temperature, setTemperature] = useState(0);
    const [tint, setTint] = useState(0);
    const [vignette, setVignette] = useState(0);
    const [shadows, setShadows] = useState(0);
    const [highlights, setHighlights] = useState(0);
    const [exposure, setExposure] = useState(0);

    // Filter presets
    const [activeFilter, setActiveFilter] = useState('none');

    // Aspect ratio
    const [aspectRatio, setAspectRatio] = useState('original');

    // History for undo/redo
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // AI features
    const [autoEnhanced, setAutoEnhanced] = useState(false);
    const [activeTab, setActiveTab] = useState('ai'); // ai, adjust, filters, advanced

    useEffect(() => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    drawImage(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }, [file]);

    useEffect(() => {
        if (image) {
            drawImage(image);
        }
    }, [brightness, contrast, saturation, rotation, zoom, blur, sharpen, hue, temperature, tint, vignette, shadows, highlights, exposure, activeFilter, aspectRatio]);

    const drawImage = (img) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');

        // Calculate dimensions based on aspect ratio
        let width = img.width;
        let height = img.height;

        // Apply aspect ratio if selected
        if (aspectRatio !== 'original') {
            const ratios = {
                'square': 1,
                'portrait': 3 / 4,
                'landscape': 4 / 3,
                'product': 1 // Square is best for product cards
            };

            const targetRatio = ratios[aspectRatio] || (width / height);
            const currentRatio = width / height;

            if (currentRatio > targetRatio) {
                width = height * targetRatio;
            } else {
                height = width / targetRatio;
            }
        }

        // Set canvas size
        const maxWidth = 800;
        const maxHeight = 600;

        // Scale to fit
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Build filter string with all effects
        let filterString = `brightness(${brightness + exposure}%) contrast(${contrast}%) saturate(${saturation}%)`;

        if (blur > 0) filterString += ` blur(${blur}px)`;
        if (hue !== 0) filterString += ` hue-rotate(${hue}deg)`;

        // Apply filter presets
        if (activeFilter !== 'none') {
            filterString = applyFilterPreset(activeFilter, filterString);
        }

        ctx.filter = filterString;

        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();

        // Apply advanced effects (temperature, vignette, etc.)
        applyAdvancedEffects(ctx, canvas.width, canvas.height);
    };

    const applyFilterPreset = (filter, baseFilter) => {
        const presets = {
            'grayscale': baseFilter + ' grayscale(100%)',
            'sepia': baseFilter + ' sepia(100%)',
            'vintage': baseFilter + ' sepia(50%) contrast(110%) saturate(90%)',
            'cool': baseFilter + ' hue-rotate(180deg) saturate(120%)',
            'warm': baseFilter + ' sepia(30%) saturate(130%)',
            'dramatic': baseFilter + ' contrast(150%) saturate(80%)',
            'vivid': baseFilter + ' saturate(150%) contrast(110%)',
            'noir': baseFilter + ' grayscale(100%) contrast(130%)'
        };
        return presets[filter] || baseFilter;
    };

    const applyAdvancedEffects = (ctx, width, height) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Apply temperature (warm/cool tones)
        if (temperature !== 0) {
            for (let i = 0; i < data.length; i += 4) {
                data[i] += temperature; // Red
                data[i + 2] -= temperature; // Blue
            }
        }

        // Apply tint (green/magenta)
        if (tint !== 0) {
            for (let i = 0; i < data.length; i += 4) {
                data[i + 1] += tint; // Green
            }
        }

        // Apply shadows and highlights
        if (shadows !== 0 || highlights !== 0) {
            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

                if (brightness < 128 && shadows !== 0) {
                    // Adjust shadows
                    const factor = 1 + (shadows / 100);
                    data[i] = Math.min(255, data[i] * factor);
                    data[i + 1] = Math.min(255, data[i + 1] * factor);
                    data[i + 2] = Math.min(255, data[i + 2] * factor);
                } else if (brightness >= 128 && highlights !== 0) {
                    // Adjust highlights
                    const factor = 1 + (highlights / 100);
                    data[i] = Math.min(255, data[i] * factor);
                    data[i + 1] = Math.min(255, data[i + 1] * factor);
                    data[i + 2] = Math.min(255, data[i + 2] * factor);
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Apply vignette effect
        if (vignette > 0) {
            const gradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 2
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
    };

    const handleAutoEnhance = () => {
        setProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            // AI auto-adjustments
            setBrightness(110);
            setContrast(115);
            setSaturation(105);
            setAutoEnhanced(true);
            setProcessing(false);
        }, 1000);
    };

    const handleHDEnhancement = () => {
        setProcessing(true);

        setTimeout(() => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // HD Enhancement: Increase sharpness and clarity
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Sharpening filter (HD effect)
            const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
            const side = Math.round(Math.sqrt(weights.length));
            const halfSide = Math.floor(side / 2);

            const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const sw = src.width;
            const sh = src.height;
            const w = sw;
            const h = sh;
            const output = ctx.createImageData(w, h);
            const dst = output.data;

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const sy = y;
                    const sx = x;
                    const dstOff = (y * w + x) * 4;
                    let r = 0, g = 0, b = 0;

                    for (let cy = 0; cy < side; cy++) {
                        for (let cx = 0; cx < side; cx++) {
                            const scy = sy + cy - halfSide;
                            const scx = sx + cx - halfSide;
                            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                const srcOff = (scy * sw + scx) * 4;
                                const wt = weights[cy * side + cx];
                                r += src.data[srcOff] * wt;
                                g += src.data[srcOff + 1] * wt;
                                b += src.data[srcOff + 2] * wt;
                            }
                        }
                    }
                    dst[dstOff] = Math.max(0, Math.min(255, r));
                    dst[dstOff + 1] = Math.max(0, Math.min(255, g));
                    dst[dstOff + 2] = Math.max(0, Math.min(255, b));
                    dst[dstOff + 3] = src.data[dstOff + 3];
                }
            }

            ctx.putImageData(output, 0, 0);

            // HD adjustments
            setSharpen(15);
            setContrast(120);
            setBrightness(105);
            setProcessing(false);
        }, 2000);
    };

    const handle4KEnhancement = () => {
        setProcessing(true);

        setTimeout(() => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // 4K Enhancement: Ultra sharpness and clarity
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Ultra sharpening (4K effect)
            const weights = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
            const side = Math.round(Math.sqrt(weights.length));
            const halfSide = Math.floor(side / 2);

            const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const sw = src.width;
            const sh = src.height;
            const w = sw;
            const h = sh;
            const output = ctx.createImageData(w, h);
            const dst = output.data;

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const sy = y;
                    const sx = x;
                    const dstOff = (y * w + x) * 4;
                    let r = 0, g = 0, b = 0;

                    for (let cy = 0; cy < side; cy++) {
                        for (let cx = 0; cx < side; cx++) {
                            const scy = sy + cy - halfSide;
                            const scx = sx + cx - halfSide;
                            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                const srcOff = (scy * sw + scx) * 4;
                                const wt = weights[cy * side + cx];
                                r += src.data[srcOff] * wt;
                                g += src.data[srcOff + 1] * wt;
                                b += src.data[srcOff + 2] * wt;
                            }
                        }
                    }
                    dst[dstOff] = Math.max(0, Math.min(255, r));
                    dst[dstOff + 1] = Math.max(0, Math.min(255, g));
                    dst[dstOff + 2] = Math.max(0, Math.min(255, b));
                    dst[dstOff + 3] = src.data[dstOff + 3];
                }
            }

            ctx.putImageData(output, 0, 0);

            // 4K ultra adjustments
            setSharpen(25);
            setContrast(125);
            setBrightness(108);
            setSaturation(110);
            setHighlights(20);
            setProcessing(false);
        }, 3000);
    };

    const handleRemoveBackground = () => {
        setProcessing(true);

        // Simulate AI background removal
        setTimeout(() => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Simple background removal effect (simplified)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Apply a simple threshold-based background removal
            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

                // If pixel is very bright (likely background), make it transparent
                if (brightness > 240) {
                    data[i + 3] = 0; // Set alpha to 0
                }
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessing(false);
        }, 1500);
    };

    const handleSmartCrop = () => {
        setProcessing(true);

        // Simulate AI smart crop for product card
        setTimeout(() => {
            setAspectRatio('product');
            setZoom(1.15);
            setProcessing(false);
        }, 800);
    };

    const handleProductOptimize = () => {
        setProcessing(true);

        // AI optimization specifically for product cards
        setTimeout(() => {
            setBrightness(110);
            setContrast(115);
            setSaturation(105);
            setSharpen(15);
            setAspectRatio('product');
            setActiveFilter('none');
            setAutoEnhanced(true);
            setProcessing(false);
        }, 1200);
    };

    const handleUpscale = () => {
        setProcessing(true);

        // Simulate AI upscaling
        setTimeout(() => {
            setZoom(Math.min(zoom * 1.5, 3));
            setSharpen(20);
            setProcessing(false);
        }, 1500);
    };

    const handleAutoEditAll = () => {
        setProcessing(true);

        // AI automatically applies all enhancements for product images
        setTimeout(() => {
            // Basic adjustments
            setBrightness(112);
            setContrast(118);
            setSaturation(108);
            setExposure(5);

            // Advanced adjustments
            setSharpen(18);
            setShadows(10);
            setHighlights(-5);
            setTemperature(3);
            setVignette(8);

            // Set optimal aspect ratio for product
            setAspectRatio('product');
            setZoom(1.1);

            // Clear any filters
            setActiveFilter('none');

            setAutoEnhanced(true);
            setProcessing(false);

            // Show success message
            saveToHistory();
        }, 2000);
    };

    const applyFilter = (filterName) => {
        setActiveFilter(filterName);
        // Save to history
        saveToHistory();
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleReset = () => {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setRotation(0);
        setZoom(1);
        setBlur(0);
        setSharpen(0);
        setHue(0);
        setTemperature(0);
        setTint(0);
        setVignette(0);
        setShadows(0);
        setHighlights(0);
        setExposure(0);
        setActiveFilter('none');
        setAspectRatio('original');
        setAutoEnhanced(false);
    };

    const saveToHistory = () => {
        const currentState = {
            brightness, contrast, saturation, rotation, zoom,
            blur, sharpen, hue, temperature, tint, vignette,
            shadows, highlights, exposure, activeFilter, aspectRatio
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const previousState = history[historyIndex - 1];
            applyHistoryState(previousState);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            applyHistoryState(nextState);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const applyHistoryState = (state) => {
        setBrightness(state.brightness);
        setContrast(state.contrast);
        setSaturation(state.saturation);
        setRotation(state.rotation);
        setZoom(state.zoom);
        setBlur(state.blur);
        setSharpen(state.sharpen);
        setHue(state.hue);
        setTemperature(state.temperature);
        setTint(state.tint);
        setVignette(state.vignette);
        setShadows(state.shadows);
        setHighlights(state.highlights);
        setExposure(state.exposure);
        setActiveFilter(state.activeFilter);
        setAspectRatio(state.aspectRatio);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            const editedFile = new File([blob], file.name, { type: 'image/png' });
            onSave(editedFile);
        }, 'image/png');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={overlay}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={modal}
            >
                {/* Header */}
                <div style={header}>
                    <div style={headerContent}>
                        <Sparkles size={24} color="#6366f1" />
                        <h2 style={title}>AI Image Editor Pro</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={handleAutoEditAll}
                            disabled={processing}
                            style={{
                                ...autoEditButton,
                                opacity: processing ? 0.7 : 1,
                                cursor: processing ? 'not-allowed' : 'pointer'
                            }}
                            title="AI Auto Edit - Automatically enhance image"
                        >
                            {processing ? (
                                <>
                                    <Loader size={18} className="spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    <span>AI Auto Edit</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleHDEnhancement}
                            disabled={processing}
                            style={{
                                padding: '0.6rem 1rem',
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                                opacity: processing ? 0.7 : 1
                            }}
                            title="HD Enhancement - Sharpen and enhance image quality"
                            onMouseEnter={(e) => {
                                if (!processing) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                            }}
                        >
                            <Sparkles size={18} />
                            <span>HD</span>
                        </button>
                        <button
                            onClick={handle4KEnhancement}
                            disabled={processing}
                            style={{
                                padding: '0.6rem 1rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                opacity: processing ? 0.7 : 1
                            }}
                            title="4K Enhancement - Ultra sharpness and maximum quality"
                            onMouseEnter={(e) => {
                                if (!processing) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                            }}
                        >
                            <ImageIcon size={18} />
                            <span>4K</span>
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
                        <button
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            style={{ ...iconBtn, opacity: historyIndex <= 0 ? 0.5 : 1 }}
                            title="Undo"
                        >
                            <Undo2 size={18} />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            style={{ ...iconBtn, opacity: historyIndex >= history.length - 1 ? 0.5 : 1 }}
                            title="Redo"
                        >
                            <Redo2 size={18} />
                        </button>
                        <button onClick={onCancel} style={closeBtn}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div style={canvasContainer}>
                    <canvas ref={canvasRef} style={canvas} />
                    {processing && (
                        <div style={processingOverlay}>
                            <div style={processingContent}>
                                <Loader size={48} color="#6366f1" className="spin" />
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '1rem' }}>
                                    AI is enhancing your image...
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                                    Applying professional adjustments
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div style={tabContainer}>
                    <button
                        onClick={() => setActiveTab('ai')}
                        style={activeTab === 'ai' ? activeTabBtn : tabBtn}
                    >
                        <Sparkles size={16} />
                        <span>AI Features</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('adjust')}
                        style={activeTab === 'adjust' ? activeTabBtn : tabBtn}
                    >
                        <Sun size={16} />
                        <span>Adjustments</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('filters')}
                        style={activeTab === 'filters' ? activeTabBtn : tabBtn}
                    >
                        <Filter size={16} />
                        <span>Filters</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('advanced')}
                        style={activeTab === 'advanced' ? activeTabBtn : tabBtn}
                    >
                        <Palette size={16} />
                        <span>Advanced</span>
                    </button>
                </div>

                {/* AI Features Tab */}
                {activeTab === 'ai' && (
                    <div style={section}>
                        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Sparkles size={24} color="#fff" />
                                <h3 style={{ ...sectionTitle, color: '#fff', marginBottom: 0 }}>✨ One-Click Magic</h3>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Transform your photos instantly with AI-powered enhancements
                            </p>
                            <button
                                onClick={handleAutoEnhance}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: autoEnhanced ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                                }}
                                disabled={processing}
                                onMouseEnter={(e) => {
                                    if (!processing && !autoEnhanced) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!autoEnhanced) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {processing ? <Loader size={24} className="spin" /> : autoEnhanced ? <Check size={24} /> : <Wand2 size={24} />}
                                <span>{processing ? 'Enhancing...' : autoEnhanced ? 'Enhanced! ✓' : 'Auto Enhance Photo'}</span>
                            </button>
                        </div>

                        <h3 style={sectionTitle}>🎨 Quick Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                            <button
                                onClick={handleProductOptimize}
                                style={{
                                    ...aiBtn,
                                    background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                    flexDirection: 'column',
                                    padding: '1.25rem',
                                    gap: '0.75rem'
                                }}
                                disabled={processing}
                            >
                                {processing ? <Loader size={24} className="spin" /> : <ImageIcon size={24} />}
                                <span style={{ fontSize: '0.85rem' }}>Product Ready</span>
                            </button>
                            <button
                                onClick={handleRemoveBackground}
                                style={{
                                    ...aiBtn,
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                    flexDirection: 'column',
                                    padding: '1.25rem',
                                    gap: '0.75rem'
                                }}
                                disabled={processing}
                            >
                                {processing ? <Loader size={24} className="spin" /> : <Scissors size={24} />}
                                <span style={{ fontSize: '0.85rem' }}>Remove BG</span>
                            </button>
                            <button
                                onClick={handleSmartCrop}
                                style={{
                                    ...aiBtn,
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                    flexDirection: 'column',
                                    padding: '1.25rem',
                                    gap: '0.75rem'
                                }}
                                disabled={processing}
                            >
                                {processing ? <Loader size={24} className="spin" /> : <Crop size={24} />}
                                <span style={{ fontSize: '0.85rem' }}>Smart Crop</span>
                            </button>
                            <button
                                onClick={handleUpscale}
                                style={{
                                    ...aiBtn,
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    flexDirection: 'column',
                                    padding: '1.25rem',
                                    gap: '0.75rem'
                                }}
                                disabled={processing}
                            >
                                {processing ? <Loader size={24} className="spin" /> : <Maximize2 size={24} />}
                                <span style={{ fontSize: '0.85rem' }}>HD Upscale</span>
                            </button>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ ...sectionTitle, fontSize: '0.9rem', marginBottom: '0.75rem' }}>📐 Aspect Ratio</h4>
                            <div style={aspectRatioButtons}>
                                {[
                                    { id: 'original', label: 'Original', icon: <Maximize2 size={14} /> },
                                    { id: 'square', label: 'Square 1:1', icon: <Square size={14} /> },
                                    { id: 'product', label: 'Product', icon: <ImageIcon size={14} /> },
                                    { id: 'portrait', label: 'Portrait', icon: <Minimize2 size={14} /> },
                                    { id: 'landscape', label: 'Landscape', icon: <Layers size={14} /> }
                                ].map(ratio => (
                                    <button
                                        key={ratio.id}
                                        onClick={() => setAspectRatio(ratio.id)}
                                        style={aspectRatio === ratio.id ? activeAspectBtn : aspectBtn}
                                    >
                                        {ratio.icon}
                                        <span>{ratio.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Adjustments Tab */}
                {activeTab === 'adjust' && (
                    <div style={section}>
                        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Sun size={20} color="#fff" />
                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                                Tip: Use sliders for precise control or try Auto Enhance for instant results
                            </span>
                        </div>

                        <h3 style={sectionTitle}>✨ Basic Adjustments</h3>
                        <div style={controls}>
                            <div style={control}>
                                <div style={controlHeader}>
                                    <Sun size={18} />
                                    <span>Brightness</span>
                                    <span style={value}>{brightness}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={brightness}
                                    onChange={(e) => setBrightness(e.target.value)}
                                    style={slider}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <button onClick={() => setBrightness(80)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Dark</button>
                                    <button onClick={() => setBrightness(100)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Normal</button>
                                    <button onClick={() => setBrightness(130)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Bright</button>
                                </div>
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Contrast size={18} />
                                    <span>Contrast</span>
                                    <span style={value}>{contrast}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={contrast}
                                    onChange={(e) => setContrast(e.target.value)}
                                    style={slider}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <button onClick={() => setContrast(80)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Soft</button>
                                    <button onClick={() => setContrast(100)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Normal</button>
                                    <button onClick={() => setContrast(130)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Strong</button>
                                </div>
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Droplet size={18} />
                                    <span>Saturation</span>
                                    <span style={value}>{saturation}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={saturation}
                                    onChange={(e) => setSaturation(e.target.value)}
                                    style={slider}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <button onClick={() => setSaturation(0)} style={{ ...quickBtn, fontSize: '0.7rem' }}>B&W</button>
                                    <button onClick={() => setSaturation(100)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Normal</button>
                                    <button onClick={() => setSaturation(150)} style={{ ...quickBtn, fontSize: '0.7rem' }}>Vibrant</button>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ ...sectionTitle, marginTop: '1.5rem' }}>⚡ Fine Tuning</h3>
                        <div style={controls}>
                            <div style={control}>
                                <div style={controlHeader}>
                                    <Focus size={18} />
                                    <span>Sharpness</span>
                                    <span style={value}>{sharpen}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sharpen}
                                    onChange={(e) => setSharpen(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Aperture size={18} />
                                    <span>Blur</span>
                                    <span style={value}>{blur}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={blur}
                                    onChange={(e) => setBlur(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>
                        </div>

                        {/* Transform Controls */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ ...sectionTitle, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🔄 Transform</h4>
                            <div style={transformButtons}>
                                <button onClick={handleRotate} style={{ ...transformBtn, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none' }}>
                                    <RotateCw size={18} />
                                    <span>Rotate 90°</span>
                                </button>
                            </div>
                        </div>

                        {/* Zoom Controls */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h4 style={{ ...sectionTitle, fontSize: '0.9rem', margin: 0 }}>Zoom Level</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1', background: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '8px' }}>
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setZoom(1)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.7rem',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                            color: '#64748b'
                                        }}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                            <div style={transformButtons}>
                                <button
                                    onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                                    style={transformBtn}
                                    disabled={zoom <= 0.5}
                                >
                                    <ZoomOut size={18} />
                                    <span>Zoom Out</span>
                                </button>
                                <button
                                    onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
                                    style={transformBtn}
                                    disabled={zoom >= 3}
                                >
                                    <ZoomIn size={18} />
                                    <span>Zoom In</span>
                                </button>
                            </div>
                            <div style={{ marginTop: '0.75rem' }}>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => setZoom(0.5)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.7rem',
                                        background: zoom === 0.5 ? '#6366f1' : '#f8fafc',
                                        color: zoom === 0.5 ? '#fff' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    50%
                                </button>
                                <button
                                    onClick={() => setZoom(0.75)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.7rem',
                                        background: zoom === 0.75 ? '#6366f1' : '#f8fafc',
                                        color: zoom === 0.75 ? '#fff' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    75%
                                </button>
                                <button
                                    onClick={() => setZoom(1)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.7rem',
                                        background: zoom === 1 ? '#6366f1' : '#f8fafc',
                                        color: zoom === 1 ? '#fff' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    100%
                                </button>
                                <button
                                    onClick={() => setZoom(1.5)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.7rem',
                                        background: zoom === 1.5 ? '#6366f1' : '#f8fafc',
                                        color: zoom === 1.5 ? '#fff' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    150%
                                </button>
                                <button
                                    onClick={() => setZoom(2)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.7rem',
                                        background: zoom === 2 ? '#6366f1' : '#f8fafc',
                                        color: zoom === 2 ? '#fff' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    200%
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Tab */}
                {activeTab === 'filters' && (
                    <div style={section}>
                        <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Filter size={20} color="#fff" />
                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                                Apply professional filters with one click
                            </span>
                        </div>

                        <h3 style={sectionTitle}>🎨 Popular Filters</h3>
                        <div style={filterGrid}>
                            {[
                                { id: 'none', label: '✨ Original', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                                { id: 'grayscale', label: '⚫ B&W', gradient: 'linear-gradient(135deg, #000 0%, #999 100%)' },
                                { id: 'sepia', label: '📜 Sepia', gradient: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)' },
                                { id: 'vintage', label: '📸 Vintage', gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 100%)' },
                                { id: 'cool', label: '❄️ Cool', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                                { id: 'warm', label: '🔥 Warm', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
                                { id: 'dramatic', label: '⚡ Dramatic', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
                                { id: 'vivid', label: '🌈 Vivid', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                                { id: 'noir', label: '🎬 Noir', gradient: 'linear-gradient(135deg, #000 0%, #434343 100%)' }
                            ].map(filter => (
                                <motion.button
                                    key={filter.id}
                                    onClick={() => applyFilter(filter.id)}
                                    style={{
                                        ...filterCard,
                                        border: activeFilter === filter.id ? '3px solid #6366f1' : '2px solid var(--glass-border)',
                                        boxShadow: activeFilter === filter.id ? '0 8px 20px rgba(99, 102, 241, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div style={{ ...filterPreview, background: filter.gradient }}>
                                        {activeFilter === filter.id && (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px' }}>
                                                <Check size={32} color="#fff" />
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ ...filterLabel, fontWeight: activeFilter === filter.id ? 800 : 600 }}>{filter.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                    <div style={section}>
                        <h3 style={sectionTitle}>Advanced Color & Effects</h3>
                        <div style={controls}>
                            <div style={control}>
                                <div style={controlHeader}>
                                    <Palette size={16} />
                                    <span>Hue Shift</span>
                                    <span style={value}>{hue}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={hue}
                                    onChange={(e) => setHue(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Thermometer size={16} />
                                    <span>Temperature</span>
                                    <span style={value}>{temperature > 0 ? 'Warm +' : temperature < 0 ? 'Cool ' : ''}{temperature}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Droplet size={16} />
                                    <span>Tint</span>
                                    <span style={value}>{tint > 0 ? 'Green +' : tint < 0 ? 'Magenta ' : ''}{Math.abs(tint)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={tint}
                                    onChange={(e) => setTint(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Moon size={16} />
                                    <span>Shadows</span>
                                    <span style={value}>{shadows > 0 ? '+' : ''}{shadows}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={shadows}
                                    onChange={(e) => setShadows(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Sun size={16} />
                                    <span>Highlights</span>
                                    <span style={value}>{highlights > 0 ? '+' : ''}{highlights}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={highlights}
                                    onChange={(e) => setHighlights(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>

                            <div style={control}>
                                <div style={controlHeader}>
                                    <Circle size={16} />
                                    <span>Vignette</span>
                                    <span style={value}>{vignette}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={vignette}
                                    onChange={(e) => setVignette(parseFloat(e.target.value))}
                                    style={slider}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={footer}>
                    <button onClick={handleReset} style={resetBtn}>
                        Reset All
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onCancel} style={cancelBtn}>
                            Cancel
                        </button>
                        <button onClick={handleSave} style={saveBtn} disabled={processing}>
                            <Check size={18} />
                            Save & Upload
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Styles
const overlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem'
};

const modal = {
    background: 'var(--glass)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
};

const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--glass-border)'
};

const headerContent = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
};

const title = {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: 'var(--text-main)',
    margin: 0
};

const closeBtn = {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.3s'
};

const iconBtn = {
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const canvasContainer = {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    minHeight: '400px'
};

const canvas = {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
};

const section = {
    padding: '1.5rem 2rem',
    borderTop: '1px solid var(--glass-border)'
};

const sectionTitle = {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '1rem'
};

const aiButtons = {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
};

const aiBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.9rem'
};

const aiBtnActive = {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
};

const controls = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
};

const control = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
};

const controlHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontWeight: 600
};

const value = {
    marginLeft: 'auto',
    color: 'var(--primary)',
    fontWeight: 700
};

const quickBtn = {
    padding: '0.4rem 0.75rem',
    fontSize: '0.7rem',
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    color: 'var(--text-main)',
    transition: 'all 0.2s'
};

const slider = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: 'var(--glass-border)',
    cursor: 'pointer'
};

const transformButtons = {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
};

const transformBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.9rem'
};

const footer = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1.5rem 2rem',
    borderTop: '1px solid var(--glass-border)'
};

const resetBtn = {
    padding: '0.75rem 1.5rem',
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s'
};

const cancelBtn = {
    padding: '0.75rem 1.5rem',
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s'
};

const saveBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 2rem',
    background: 'var(--primary)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s'
};

// New styles for tabs and advanced features
const tabContainer = {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem 2rem',
    borderTop: '1px solid var(--glass-border)',
    background: 'var(--bg-secondary)',
    overflowX: 'auto'
};

const tabBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap'
};

const activeTabBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
};

const filterGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '1rem'
};

const filterCard = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'var(--glass)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s'
};

const filterPreview = {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
};

const filterLabel = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    textAlign: 'center'
};

const aspectRatioButtons = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
};

const aspectBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1rem',
    background: 'var(--glass)',
    border: '2px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-main)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.85rem'
};

const activeAspectBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: '2px solid #10b981',
    borderRadius: '10px',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.85rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
};

const autoEditButton = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '0.95rem',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
    animation: 'pulse 2s ease-in-out infinite'
};

const processingOverlay = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    zIndex: 10
};

const processingContent = {
    textAlign: 'center',
    padding: '2rem'
};

export default AIImageEditor;
