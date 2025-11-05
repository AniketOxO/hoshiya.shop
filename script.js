// Global Variables
let cart = [];
let products = [];
let currentFilter = 'all';
// Use nullable min/max for default show-all behavior
let currentFacets = { minPrice: null, maxPrice: null, inStock: false, minRating: 0, sort: 'pop' };
let isLoading = false;
let isDarkMode = false;
let currentProductInModal = null;
let soundEnabled = false;
let currentOptions = { size: null, qty: 1 };
// Record boot timestamp to respect loader minimum display duration
const __APP_BOOT_TS__ = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

// Measure scrollbar width and expose as CSS var so header can account for it
function setScrollbarGap(){
    try{
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.msOverflowStyle = 'scrollbar'; // needed for some browsers
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);
        const inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);
        const gap = outer.offsetWidth - inner.offsetWidth;
        document.documentElement.style.setProperty('--scrollbar-gap', gap ? gap + 'px' : '0px');
        outer.parentNode.removeChild(outer);
    }catch(e){ document.documentElement.style.setProperty('--scrollbar-gap','0px'); }
}
// Configure a real form endpoint for contact submissions. Example: 'https://formspree.io/f/xxxxxx'
// It can be provided via a <meta name="form-endpoint" content="..."> tag or overridden here.
let FORMSPREE_ENDPOINT = '';
try {
    const metaEndpoint = document.querySelector('meta[name="form-endpoint"]')?.getAttribute('content') || '';
    if (metaEndpoint) {
        FORMSPREE_ENDPOINT = metaEndpoint;
    }
    // Also expose on window for data-endpoint fallback chain
    window.FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT;
} catch {}

// Sample Product Data
const sampleProducts = [
    { id: 1, name: "Naruto Sticker Pack", price: 199.99, originalPrice: 249.99, category: "stickers", emoji: "🏷️", imageSrc: "images/narutostickerpack.png", description: "Glossy vinyl sticker pack inspired by Naruto — 10 unique shinobi decals", rating: 4.6, inStock: true, badge: "Best Seller" },
    { id: 2, name: "Sasuke Bobble Head", price: 129.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/sasukebobblehead.png", description: "Chibi-style Sasuke bobble head with detailed hair and outfit", rating: 4.3, inStock: true, badge: "New" },
    { id: 3, name: "Sasuke Sticker Pack", price: 299.99, originalPrice: 399.99, category: "stickers", emoji: "🏷️", imageSrc: "images/sasukestickerpack.png", description: "Matte finish sticker pack featuring lightning and cool-toned designs", rating: 4.8, inStock: false },
    { id: 4, name: "Sakura Bobble Head", price: 159.99, originalPrice: null, category: "bobble", emoji: "😀", imageSrc: "images/sakurabobblehead.png", description: "Adorable Sakura bobble head with pastel palette and glossy finish", rating: 4.1, inStock: true, badge: "Limited" },
    { id: 5, name: "Sakura Sticker Pack", price: 89.99, originalPrice: 129.99, category: "stickers", emoji: "🏷️", imageSrc: "images/sakurastickerpack.png", description: "Pink-themed vinyl stickers with punchy ink outlines and petals", rating: 4.4, inStock: true },
    { id: 6, name: "Luffy Bobble Head", price: 49.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/luffybobblehead.png", description: "Straw-hat pirate bobble head with playful grin and stand", rating: 4.0, inStock: true },
    { id: 7, name: "Luffy Sticker Pack", price: 79.99, originalPrice: 99.99, category: "stickers", emoji: "🏷️", imageSrc: "images/luffystickerpack.png", description: "High-contrast sticker set with nautical motifs and pirate vibes", rating: 4.2, inStock: true },
    { id: 8, name: "Goku Bobble Head", price: 89.99, originalPrice: null, category: "bobble", emoji: "😀", imageSrc: "images/gokubobblehead.png", description: "Spiky-haired hero bobble head posed mid-power-up", rating: 4.7, inStock: true },
    { id: 9, name: "Goku Sticker Pack", price: 59.99, originalPrice: 79.99, category: "stickers", emoji: "🏷️", imageSrc: "images/gokustickerpack.png", description: "Energy-charged sticker pack with bold, dynamic poses", rating: 3.9, inStock: true },
    { id: 10, name: "Tanjiro Bobble Head", price: 139.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/tanjirobobblehead.png", description: "Demon-slaying hero bobble head with patterned haori", rating: 4.5, inStock: false },
    { id: 11, name: "Tanjiro Sticker Pack", price: 799.99, originalPrice: 899.99, category: "stickers", emoji: "🏷️", imageSrc: "images/tanjirostickerpack.png", description: "Green-checkered aesthetic sticker pack with sword effects", rating: 4.9, inStock: true, badge: "Best Seller" },
    { id: 12, name: "Mikasa Bobble Head", price: 69.99, originalPrice: null, category: "bobble", emoji: "😀", imageSrc: "images/mikasabobblehead.png", description: "Cool-headed warrior bobble head with scarf and stand", rating: 4.1, inStock: true },
    // Anime merch samples
    { id: 101, name: "Itachi Sticker Pack", price: 14.99, originalPrice: null, category: "stickers", emoji: "🏷️", imageSrc: "images/itachistickerpack.png", description: "Dark-themed vinyl stickers with red cloud motifs (10 pcs)", rating: 4.7, inStock: true, badge: "New" },
    { id: 103, name: "Naruto Bobble Head", price: 24.99, originalPrice: 29.99, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/narutobobblehead.png", description: "Chibi Naruto bobble head with iconic orange fit", rating: 4.4, inStock: true },
    { id: 104, name: "Levi Action Figure", price: 39.99, originalPrice: 49.99, category: "figures", emoji: "🗡️", imageSrc: "images/Levi Ackerman Action Figure.png", description: "Poseable elite captain action figure with twin blades and cape", rating: 4.8, inStock: true, badge: "Best Seller" },
    { id: 105, name: "Mikasa Graphic Tee", price: 19.99, originalPrice: null, category: "tees", emoji: "👕", imageSrc: "images/Mikasa Tee 1.png", fullImageSrc: "images/mikasa Tee 2.png", description: "Soft cotton graphic tee with scarf motif and survey wings", rating: 4.5, inStock: true },
    { id: 106, name: "Goku Action Figure", price: 49.99, originalPrice: 59.99, category: "figures", emoji: "🗡️", imageSrc: "images/Goku Action Figure.png", description: "Poseable hero action figure with interchangeable hands", rating: 4.7, inStock: true, badge: "New" },
    { id: 107, name: "Naruto Action Figure", price: 44.99, originalPrice: 54.99, category: "figures", emoji: "🗡️", imageSrc: "images/Naruto Action Figure.png", description: "Dynamic pose action figure with kunai accessory", rating: 4.6, inStock: true },
    { id: 108, name: "Goku Graphic Tee", price: 21.99, originalPrice: null, category: "tees", emoji: "👕", imageSrc: "images/goku tee 1.png", fullImageSrc: "images/goku tee 2.png", description: "Bold graphic tee with lightning aura print", rating: 4.4, inStock: true },
    { id: 109, name: "Naruto Graphic Tee", price: 22.99, originalPrice: null, category: "tees", emoji: "👕", imageSrc: "images/Naruto tee.png", /* showcase */ fullImageSrc: "images/naruto tee 2.png", description: "Orange-accent graphic tee with leaf village crest", rating: 4.5, inStock: true },
    { id: 110, name: "Ezy x Hushiyo Graphic Tee", price: 24.99, originalPrice: null, category: "tees", emoji: "👕", imageSrc: "images/Ezy x Hushiyo 1.png", fullImageSrc: "images/Ezy x Hushiyo  2.png", description: "Limited collab tee by Ezy x Hushiyo", rating: 4.6, inStock: true, badge: "New" },
    { id: 111, name: "Ulquiorra Cifer Hoodie", price: 49.99, originalPrice: 59.99, category: "tees", emoji: "🧥", imageSrc: "images/Ulquiorra Cifer hoodie 1.png", fullImageSrc: "images/Ulquiorra Cifer hoodie 2.png", description: "Premium zip hoodie inspired by Ulquiorra Cifer", rating: 4.7, inStock: true, badge: "New" },
    { id: 112, name: "Luffy's Jolly Roger Full-Sleeve Polo Shirt", price: 1999, originalPrice: null, category: "tees", emoji: "👕", imageSrc: "images/Luffy's Jolly Roger Full-Sleeve Polo Shirt 1.png", fullImageSrc: "images/Luffy's Jolly Roger Full-Sleeve Polo Shirt 2.png", description: "Full-sleeve polo with Jolly Roger insignia and manga-style detailing", rating: 4.6, inStock: true, badge: "New" },
    { id: 113, name: "Trafalgar Law's Heart Pirates Full-Sleeve Polo Shirt", price: 1999, originalPrice: null, category: "tees", emoji: "👕", imageSrc: "images/Trafalgar Law's Heart Pirates Full-Sleeve Polo Shirt.png", fullImageSrc: "images/Trafalgar Law's Heart Pirates Full-Sleeve Polo Shirt 2.png", description: "Full-sleeve polo with Heart Pirates insignia and clean monochrome aesthetic", rating: 4.6, inStock: true, badge: "New" },
    { id: 114, name: "Itachi's Crimson Crow Full-Zip Hoodie", price: 2499, originalPrice: 2999, category: "tees", emoji: "🧥", imageSrc: "images/Itachi's Crimson Crow Full-Zip Hoodie 1.png", fullImageSrc: "images/Itachi's Crimson Crow Full-Zip Hoodie  2.png", description: "Premium full-zip hoodie with crimson crow motif and Akatsuki-inspired accents", rating: 4.8, inStock: true, badge: "Limited" },
    // Newly added bobble heads from images folder
    { id: 201, name: "Hoshiya Bobble Head", price: 34.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/hoshiyabobblehead.png", description: "Exclusive Hoshiya bobble head with signature style", rating: 4.6, inStock: true },
    { id: 202, name: "Hoshiya Bobble Head — Beach", price: 36.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/hoshiyabobbleheadbeach.png", description: "Beach vibes edition with sunny palette", rating: 4.5, inStock: true },
    { id: 203, name: "Hoshiya Bobble Head — Beach Chill", price: 36.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/hoshiyabobbleheadbeachchill.png", description: "Chill at the shore edition", rating: 4.5, inStock: true },
    { id: 204, name: "Hoshiya Bobble Head — Mud Fun", price: 36.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/hoshiyabobbleheadmudfun.png", description: "Muddy fun limited variant", rating: 4.4, inStock: true, badge: "Limited" },
    { id: 205, name: "Kpop Hunter Bobble Head", price: 32.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/kpophunterobblehead.png", description: "K-pop inspired hunter bobble head", rating: 4.3, inStock: true },
    { id: 206, name: "Kpop Hunter Bobble Head 2", price: 33.99, originalPrice: null, category: "bobble", emoji: "🧑‍🎤", imageSrc: "images/kpophunterbobblehead2.png", description: "Second edition hunter bobble head", rating: 4.3, inStock: true }
];

function deriveBadges(p){
    const badges = [];
    if (p.badge) badges.push(p.badge);
    if (p.originalPrice && p.price < p.originalPrice) badges.push('Sale');
    if (!p.inStock) badges.push('Sold Out');
    return badges;
}

// DOM Elements (some will be retrieved inside DOMContentLoaded for timing)
const productGrid = document.getElementById('product-grid');
const filterTabs = document.querySelectorAll('.filter-tab');
const loadMoreBtn = document.getElementById('load-more-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');
// Quick View removed: no modal instance
const themeToggle = document.getElementById('theme-toggle');
const clickSound = document.getElementById('click-sound');
const cartSound = document.getElementById('cart-sound');

// START LOADING ANIMATION IMMEDIATELY (before DOMContentLoaded)
(function initLoadingAnimation() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    
    const skip = loadingScreen.querySelector('.loader-skip');
    const percentEl = document.getElementById('loader-percent');
    const fillEl = document.getElementById('loader-fill');
    const statusEl = document.getElementById('loader-status');
    const hide = () => loadingScreen.classList.add('hidden');
    const minMeta = document.querySelector('meta[name="loader-min"]');
    const minMs = Math.max(0, parseInt((minMeta && minMeta.getAttribute('content')) || '1500', 10) || 0);
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const elapsed = Math.max(0, now - __APP_BOOT_TS__);
    const initialDelay = Math.max(0, minMs - elapsed);
    let timer = setTimeout(hide, initialDelay);

    // Trigger a subtle shake after the ink swipe finishes (~1s after start)
    setTimeout(() => {
        const tc = document.querySelector('.title-card');
        if (tc) tc.classList.add('shake');
    }, 1000);

    // Progress animation (independent of real load — purely cosmetic)
    let p = 0; 
    const statuses = ['Warming ink…','Drawing panels…','Adding speed lines…','Final touches…'];
    const tick = () => {
        p = Math.min(100, p + Math.random()*14 + 6);
        if (percentEl) percentEl.textContent = `${Math.round(p)}%`;
        if (fillEl) fillEl.style.width = `${Math.min(100,p)}%`;
        if (statusEl){
            if (p < 30) statusEl.textContent = statuses[0];
            else if (p < 55) statusEl.textContent = statuses[1];
            else if (p < 80) statusEl.textContent = statuses[2];
            else statusEl.textContent = statuses[3];
        }
        if (p < 96) progTimer = setTimeout(tick, 280);
    };
    let progTimer = setTimeout(tick, 200);
    const clearProg = () => { if (progTimer) { clearTimeout(progTimer); progTimer = null; } };
    
    if (skip) {
        skip.addEventListener('click', () => { 
            if (timer) { clearTimeout(timer); } 
            clearProg(); 
            hide(); 
        });
    }
    
    // On full load, still respect the remaining time to meet the minimum
    window.addEventListener('load', () => {
        if (timer) { clearTimeout(timer); }
        const now2 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const elapsed2 = Math.max(0, now2 - __APP_BOOT_TS__);
        const remaining = Math.max(0, minMs - elapsed2);
        timer = setTimeout(() => {
            // Begin lift handoff slightly before fade
            const ls = document.getElementById('loading-screen');
            if (ls) ls.classList.add('lift');
            setTimeout(() => { clearProg(); hide(); }, 260);
        }, remaining);
    }, { once: true });
})();

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Ensure CSS has an accurate scrollbar gap to avoid header clipping
    try{ setScrollbarGap(); }catch{}
    window.addEventListener('resize', () => { try{ setScrollbarGap(); }catch{} });
    // Initialize auth UI first so header shows correct state
    try { setupAuthUI(); } catch {}
    // Load theme preference
    loadThemePreference();
    // Load sound preference
    loadSoundPreference();
    
    // Wire newsletter forms (on all pages that include them)
    try { initNewsletterSubscription(); } catch {}

    // If navigated from search with a specific product id, focus it
    try {
        const params = new URLSearchParams(window.location.search || '');
        const pid = parseInt(params.get('pid')||'', 10);
        if (!isNaN(pid)) {
            // Ensure products are rendered first if we're on products.html
            const grid = document.getElementById('product-grid');
            if (grid) {
                // Wait a tick to allow any initial rendering
                setTimeout(() => {
                    const card = document.querySelector(`.product-card[data-id="${pid}"]`);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        card.classList.add('highlight-pulse');
                        setTimeout(()=> card.classList.remove('highlight-pulse'), 1600);
                    }
                }, 100);
            }
        }
    } catch {}
    
    // Initialize products
    products = [...sampleProducts];
    // Auto-append additional sticker products if image files are present.
    // This lets you drop more sticker pack images into /images and see cards without hand-editing JS.
    try {
        const EXTRA_STICKERS = [
            // Add filenames here as needed; if you define window.EXTRA_STICKERS elsewhere, it will extend this list.
            // Existing sticker packs in images/ (use exact filenames with spaces/case):
            'images/attack on titan sticker pack.png',
            'images/demon slayer stickerpack.png',
            'images/One piece stickerpack.png',
            'images/uchichastickerpack.png',
            'images/hoshiyabeachystickerpack.png',
            'images/hoshiyacomfortstickerpack.png'
        ];
        const extras = (window.EXTRA_STICKERS || []).concat(EXTRA_STICKERS);
        const haveName = (n)=> products.some(p=>p.name.toLowerCase()===n.toLowerCase());
        const makeName = (file)=>{
            const base = file.split('/').pop().replace(/\.(png|jpe?g|webp|svg)$/i,'');
            // Normalize common patterns and separators
            let norm = base
                .replace(/[-_]+/g,' ')                 // dashes/underscores to spaces
                .replace(/onepiece/gi,'one piece')
                .replace(/demonslayer/gi,'demon slayer')
                .replace(/attackontitan/gi,'attack on titan')
                .replace(/stickerpack/gi,'sticker pack')     // joinword -> phrase
                .replace(/beachy/gi,'beach');                // prefer "Beach"
            // Insert missing spaces before certain tokens when concatenated
            norm = norm
                .replace(/([a-z])sticker/gi,'$1 sticker')
                .replace(/([a-z])pack\b/gi,'$1 pack')
                .replace(/([a-z])(beach)\b/gi,'$1 beach')
                .replace(/([a-z])(comfort)\b/gi,'$1 comfort')
                .replace(/\s{2,}/g,' ')                     // collapse extra spaces
                .trim();
            // turn tokens into Title Case
            const words = norm.replace(/([a-z])([A-Z])/g,'$1 $2').split(' ');
            return words.map(w=> w.length? (w[0].toUpperCase()+w.slice(1)) : w).join(' ');
        };
        let nextId = Math.max(...products.map(p=>p.id)) + 1;
        extras.forEach(file=>{
            // Only append if file likely exists and we don't already have this product name
            const name = makeName(file);
            if (!haveName(name)){
                products.push({
                    id: nextId++,
                    name,
                    price: 14.99,
                    originalPrice: null,
                    category: 'stickers',
                    emoji: '🏷️',
                    imageSrc: file,
                    description: 'Vinyl sticker pack',
                    rating: 4.5,
                    inStock: true
                });
            }
        });
    } catch {}
    // Auto-append additional Action Figure products from images/ (uses a curated filename list)
    try {
        const EXTRA_FIGURES = [
            'images/Goku Action Figure.png',
            'images/Luffy Action Figure.png',
            'images/Levi Ackerman Action Figure.png',
            'images/Arachne Action Figure.png',
            'images/Alucard Action Figure.png',
            'images/Ulquiorra Cifer Action Figure.png',
            'images/Shishio Makoto Action figure.png',
            'images/Sakura Action Figure.png',
            'images/One-Punch Man Action FIgure.png',
            'images/Obito Uchicha Action Figure.png',
            'images/Naruto Action Figure.png',
            'images/Muzan Kibutsuji Action Figure.png',
            'images/Meowth Action Figure.png',
            'images/Lust Action Figure.png'
        ];
        const extrasF = (window.EXTRA_FIGURES || []).concat(EXTRA_FIGURES);
        const haveNameF = (n)=> products.some(p=>p.name.toLowerCase()===n.toLowerCase());
        const makeFigureName = (file)=>{
            const base = file.split('/').pop().replace(/\.(png|jpe?g|webp|svg)$/i,'');
            let norm = base
                .replace(/[-_]+/g,' ')                 // dashes/underscores to spaces
                .replace(/one\s*[- ]?punch/gi,'One Punch')
                .replace(/action\s*figure/gi,'Action Figure');
            norm = norm.replace(/\s{2,}/g,' ').trim();
            const words = norm.replace(/([a-z])([A-Z])/g,'$1 $2').split(' ');
            return words.map(w=> w.length? (w[0].toUpperCase()+w.slice(1)) : w).join(' ');
        };
        let nextIdF = Math.max(...products.map(p=>p.id)) + 1;
        extrasF.forEach(file=>{
            const name = makeFigureName(file);
            if (!haveNameF(name)){
                products.push({
                    id: nextIdF++,
                    name,
                    price: 49.99,
                    originalPrice: 59.99,
                    category: 'figures',
                    emoji: '🗡️',
                    imageSrc: file,
                    description: 'Poseable action figure with detailed sculpt and accessories',
                    rating: 4.6,
                    inStock: true
                });
            }
        });
    } catch {}
    // Normalize: ensure any product with name containing "Action Figure" is in figures
    try {
        products.forEach(p => {
            if (/action\s*figure/i.test(p.name || '') && p.category !== 'figures') {
                p.category = 'figures';
            }
        });
    } catch {}
    // Load cart from storage
    try{ const saved = localStorage.getItem('hoshiya_cart'); if (saved) cart = JSON.parse(saved) || []; }catch{}
    // Adjust pricing for bobble heads to INR within 250–300 and mark currency
    try {
        const specials = [
            { key: 'naruto',  price: 279 },
            { key: 'goku',    price: 289 },
            { key: 'tanjiro', price: 299 },
            { key: 'sasuke',  price: 269 },
            { key: 'mikasa',  price: 259 },
            { key: 'sakura',  price: 275 }
        ];
        const tiers = [549, 599, 649];
        products.forEach(p => {
            if (p.category === 'bobble') {
                p.currency = 'INR';
                const name = (p.name || '').toLowerCase();
                const spec = specials.find(s => name.includes(s.key));
                if (spec) {
                    p.price = spec.price; // 250–300 band for specified characters
                    p.originalPrice = Math.max((p.originalPrice || 0), p.price + 60);
                } else {
                    // rotate through tiers for variety among remaining bobble heads
                    const tier = tiers[p.id % tiers.length];
                    p.price = tier;
                    p.originalPrice = Math.max((p.originalPrice || 0), p.price + 100);
                }
            }
        });
    } catch {}

    // Set Action Figures to uneven prices between ₹1,500–₹3,000 (deterministic per item)
    try {
        const figurePrices = [1500, 1599, 1699, 1799, 1899, 1999, 2099, 2199, 2299, 2399, 2499, 2599, 2699, 2799, 2899, 2999, 3000];
        const hash = (s) => { let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return Math.abs(h); };
        products.forEach(p => {
            if (p.category === 'figures') {
                p.currency = 'INR';
                const key = (p.name || String(p.id));
                const idx = hash(key) % figurePrices.length;
                p.price = figurePrices[idx];
                p.originalPrice = null; // clean price presentation
            }
        });
    } catch {}

    // Set Sticker Stash to uneven prices between ₹150–₹200 (deterministic per item)
    try {
        const priceCandidates = [150, 159, 169, 175, 179, 185, 189, 195, 199, 200];
        const hash = (s) => {
            let h = 0; for (let i=0; i<s.length; i++){ h = ((h<<5) - h) + s.charCodeAt(i); h |= 0; }
            return Math.abs(h);
        };
        products.forEach(p => {
            if (p.category === 'stickers') {
                p.currency = 'INR';
                const key = (p.name || String(p.id));
                const idx = hash(key) % priceCandidates.length;
                p.price = priceCandidates[idx];
                p.originalPrice = null; // clean price (no strike-through)
            }
        });
    } catch {}

    // Set Tees prices: ₹1,500–₹2,000 uneven; Ezy x Hushiyo collab at ₹3,000
    try {
        const teePrices = [1500, 1599, 1699, 1799, 1899, 1999, 2000];
        const hash = (s) => { let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return Math.abs(h); };
        products.forEach(p => {
            if (p.category === 'tees') {
                p.currency = 'INR';
                const name = (p.name || '').toLowerCase();
                if (name.includes('ezy') && name.includes('hushiyo')) {
                    p.price = 3000;
                } else {
                    const idx = hash(p.name || String(p.id)) % teePrices.length;
                    p.price = teePrices[idx];
                }
                p.originalPrice = null;
            }
        });
    } catch {}

    renderProducts();
    updateCartUI();

    // Add event listeners
    setupEventListeners();
    
    // Add scroll animations
    setupScrollAnimations();

    // Newsletter form
    setupNewsletterForm();
    
    // Initialize enhanced features
    setupEnhancedFeatures();
    
    // Setup search
    setupSearch();

    // Enhance About hero bubble (carousel, copy, controls)
    setupAboutBubble();

    // Contact form setup
    setupContactForm();

    // Wire checkout button (requires login)
    const coBtn = document.getElementById('cart-checkout-btn');
    if (coBtn) {
        coBtn.addEventListener('click', () => {
            // Persist cart and navigate
            persistCart();
            const u = getCurrentUser();
            if (!u) {
                const next = encodeURIComponent('checkout.html');
                window.location.href = `login.html?next=${next}`;
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }

    // Preferences: reduce motion + cursor
    try {
        const rm = (localStorage.getItem('reduceMotion') === 'true');
        document.body.classList.toggle('reduce-motion', rm);
        const cursorPref = localStorage.getItem('cursorEnabled');
        const cursorOn = (cursorPref === null) ? true : (cursorPref === 'true');
        if (cursorOn) { try { setupCustomCursor(); } catch {} }
        setupPreferenceToggles();
    } catch {}
    // Facet controls
    const priceRange = document.getElementById('price-range');       // max slider (fallback single)
    const priceMinRange = document.getElementById('price-range-min'); // optional min slider
    const priceMaxEl = document.getElementById('price-max');
    const priceMinEl = document.getElementById('price-min');
    const stockCb = document.getElementById('facet-stock');
    const ratingSel = document.getElementById('facet-rating');
    const sortSel = document.getElementById('facet-sort');
    // Dynamically size slider(s) to max product price and default to show-all (no bounds)
    if (priceRange){
        try {
            const prices = products.map(p => Number(p.price) || 0);
            const dynMax = Math.max(0, Math.ceil(Math.max(...prices)));
            // Initialize sliders
            priceRange.min = '0';
            priceRange.max = String(dynMax || 1000);
            priceRange.value = String(dynMax || 1000);
            if (priceMaxEl) priceMaxEl.textContent = priceRange.value;
            if (priceMinEl) priceMinEl.textContent = '0';
            if (priceMinRange){
                priceMinRange.min = '0';
                priceMinRange.max = String(dynMax || 1000);
                priceMinRange.value = '0';
            }
            // Reset bounds to no-limit by default
            currentFacets.minPrice = null;
            currentFacets.maxPrice = null;
            // Listeners
            priceRange.addEventListener('input', ()=>{
                const dynMaxNow = Number(priceRange.max) || dynMax || 1000;
                let vMax = parseInt(priceRange.value, 10);
                if (isNaN(vMax)) vMax = dynMaxNow;
                // Treat full span as no upper bound
                currentFacets.maxPrice = (vMax >= dynMaxNow) ? null : vMax;
                if (priceMaxEl) priceMaxEl.textContent = String(vMax);
                if (priceMinRange){
                    let vMin = parseInt(priceMinRange.value, 10);
                    if (isNaN(vMin)) vMin = 0;
                    if (vMin > vMax){ vMin = vMax; priceMinRange.value = String(vMin); if (priceMinEl) priceMinEl.textContent = String(vMin); currentFacets.minPrice = vMin <= 0 ? null : vMin; }
                }
                filterProducts(currentFilter);
            });
            if (priceMinRange){
                priceMinRange.addEventListener('input', ()=>{
                    const dynMaxNow = Number(priceRange.max) || dynMax || 1000;
                    let vMin = parseInt(priceMinRange.value, 10);
                    if (isNaN(vMin)) vMin = 0;
                    let vMax = parseInt(priceRange.value, 10);
                    if (isNaN(vMax)) vMax = dynMaxNow;
                    if (vMin > vMax){ vMin = vMax; priceMinRange.value = String(vMin); }
                    currentFacets.minPrice = (vMin <= 0) ? null : vMin;
                    if (priceMinEl) priceMinEl.textContent = String(vMin);
                    filterProducts(currentFilter);
                });
            }
        } catch {}
    }
    if (stockCb){ stockCb.addEventListener('change', ()=>{ currentFacets.inStock = !!stockCb.checked; filterProducts(currentFilter); }); }
    if (ratingSel){ ratingSel.addEventListener('change', ()=>{ currentFacets.minRating=parseFloat(ratingSel.value)||0; filterProducts(currentFilter); }); }
    if (sortSel){ sortSel.addEventListener('change', ()=>{ currentFacets.sort=sortSel.value; filterProducts(currentFilter); }); }

    // Initialize wish and carousels after first render
    syncWishlistButtons();
    syncCompareButtons();
    updateCompareCount();
    refreshCarousels();
    // Start auto-rotation for Trending after initial render
    try { startTrendingRotation(); } catch {}
    // Lazy-load category tile media and inject structured data
    try { lazyLoadTiles(); } catch {}
    try { injectStructuredData(); } catch {}
    
        // Home-only featured picks
        try { renderFeaturedPicks(); } catch {}
});

// Event Listeners Setup
function setupEventListeners() {
    // Filter tabs
    if (filterTabs && filterTabs.length) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.dataset.filter;
                setActiveFilter(filter);
                filterProducts(filter);
                if (filter==='all'){ renderBreadcrumbs([]); renderCategoryHero(null); }
                else { renderBreadcrumbs([{key:'home',label:'Home'},{key:filter,label:CATEGORY_META[filter]?.title||filter}]); renderCategoryHero(filter); }
            });
        });
    }

// Breadcrumbs & Category Hero utilities
const CATEGORY_META={
    electronics:{ title:'Electronics', sub:'Power up your gear and go ⚡', emoji:'🔌' },
    fashion:{ title:'Fashion', sub:'Styles that level up your fit ✨', emoji:'👗' },
    home:{ title:'Home', sub:'Cozy essentials for every room 🏠', emoji:'🛋️' },
    sports:{ title:'Sports', sub:'Get moving with pro-grade gear 🏅', emoji:'🏃' },
    stickers:{ title:'Sticker Stash', sub:'Vinyl & holographic packs ✨', emoji:'🏷️', artImage: 'images/hoshiyalogo.png' },
    bobble:{ title:'Bobble Head', sub:'Collectible chibi desk buddies 😀', emoji:'🧑‍🎤', artImage: 'images/hoshiyalogo.png' },
    figures:{ title:'Action Figure', sub:'Poseable heroes & villains ⚔️', emoji:'🗡️', artImage: 'images/hoshiyalogo.png' },
    tees:{ title:'Tees', sub:'Graphic anime t‑shirts 👕', emoji:'👕', artImage: 'images/hoshiyalogo.png' }
};
function renderBreadcrumbs(path){ const el=document.getElementById('breadcrumbs'); if(!el) return; if(!path||!path.length){ el.classList.add('hidden'); el.innerHTML=''; return; } const html = path.map((p,i)=> i<path.length-1? `<a href="#" data-crumb="${p.key}">${p.label}</a>` : `<span class="crumb-current">${p.label}</span>`).join(' <span class="crumb-sep">›</span> '); el.innerHTML=html; el.classList.remove('hidden'); el.querySelectorAll('[data-crumb]').forEach(a=>{ a.addEventListener('click', (e)=>{ e.preventDefault(); const key=a.getAttribute('data-crumb'); if(key==='home'){ setActiveFilter('all'); filterProducts('all'); renderBreadcrumbs([]); renderCategoryHero(null); } else { setActiveFilter(key); filterProducts(key); renderBreadcrumbs([{key:'home',label:'Home'},{key, label:CATEGORY_META[key]?.title||key}]); renderCategoryHero(key); } }); }); }
function renderCategoryHero(cat){
    const box=document.getElementById('category-hero');
    if(!box) return;
    if(!cat||cat==='all'){
        box.classList.add('hidden');
        box.innerHTML='';
        return;
    }
    const m=CATEGORY_META[cat]||{title:cat,sub:'',emoji:'🛍️'};
    const art = m.artImage ? `<img src="${m.artImage}" alt="${m.title}">` : (m.emoji||'🛍️');
    box.innerHTML = `<div><div class="ch-title">${m.title}</div><div class="ch-sub">${m.sub}</div><div class="ch-tag">#${cat}</div></div><div class="ch-art">${art}</div>`;
    box.classList.remove('hidden');
}

    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Enhanced Features Setup
function setupEnhancedFeatures() {
    // Add click sound to all buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .btn, .filter-tab, .nav-link')) {
            playSound('click');
        }
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-star');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.2);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Add hover effects to product cards
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.product-card')) {
            e.target.closest('.product-card').style.transform = 'translateY(-5px) scale(1.02)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.product-card')) {
            e.target.closest('.product-card').style.transform = 'translateY(0) scale(1)';
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Toggle cart with 'C' key
        if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.altKey) {
            const activeElement = document.activeElement;
            if (!activeElement || activeElement.tagName !== 'INPUT') {
                toggleCart();
            }
        }
        // Toggle theme with 'T' key
        if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.altKey) {
            const activeElement = document.activeElement;
            if (!activeElement || activeElement.tagName !== 'INPUT') {
                toggleTheme();
            }
        }
        // Close overlays with Escape (cart only; Quick View removed)
        if (e.key === 'Escape') {
            if (cartSidebar.classList.contains('open')) {
                toggleCart();
            }
        }
    });
}

// Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                // For collab cards, switch to in-view for unique reveal
                if (entry.target.classList.contains('collab-card')) {
                    entry.target.classList.add('in-view');
                }
            }
        });
    }, observerOptions);

    // Observe product cards and feature panels
    document.querySelectorAll('.product-card, .feature-panel, .testimonial-card, .collab-card').forEach(el => {
        observer.observe(el);
    });
}

// Newsletter Form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('.newsletter-input').value;
            if (email) {
                showNotification('Thanks for subscribing! 📧', 'success');
                e.target.reset();
            }
        });
    }
}

// Contact form
function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (form.querySelector('#c-name')?.value || '').trim();
        const email = (form.querySelector('#c-email')?.value || '').trim();
        const topic = form.querySelector('#c-topic')?.value || '';
        const message = (form.querySelector('#c-message')?.value || '').trim();
        const honeypot = (form.querySelector('input[name="_gotcha"]')?.value || '').trim();
        if (honeypot) return; // ignore bots
        if (!name || !email || !topic || !message) {
            showNotification('Please fill out all fields.', 'error');
            return;
        }
        const endpoint = form.dataset.endpoint || window.FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT;
        const submitBtn = form.querySelector('button[type="submit"]');
        const restore = submitBtn ? submitBtn.innerHTML : null;
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Sending…</span>'; }

    const payload = { name, email, topic, message, _subject: `Hoshiya Contact · ${topic}`, _replyto: email };

        const after = (ok, msg) => {
            if (submitBtn && restore) { submitBtn.disabled = false; submitBtn.innerHTML = restore; }
            showNotification(msg, ok ? 'success' : 'error');
            if (ok) form.reset();
        };

        if (endpoint) {
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(async (res) => {
                if (res.ok) return after(true, 'Message sent! We will reply within 24 hours. ✉️');
                let err = 'Failed to send. Please try again.';
                try { const j = await res.json(); if (j?.errors?.length) err = j.errors.map(e=>e.message).join(', '); } catch {}
                return after(false, err);
            })
            .catch(() => after(false, 'Network error. Please try again.'));
        } else {
            // Fallback demo mode
            after(true, 'Message sent (demo). Configure Formspree for live delivery.');
        }
    });
    // Extras: Copy email
    document.querySelectorAll('.copy-email-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const email = btn.dataset.email || btn.previousElementSibling?.textContent?.trim();
            try { await navigator.clipboard.writeText(email); showNotification('Email copied 📋', 'success'); }
            catch { showNotification('Copy failed', 'error'); }
        });
    });
}

// About page: hero bubble carousel and copy
function setupAboutBubble(){
    const bubble = document.querySelector('.about-hero .about-bubble');
    const textEl = bubble ? bubble.querySelector('.hero-subtitle') : null;
    const controls = document.querySelector('.bubble-controls');
    if (!bubble || !textEl || !controls) return; // only on about page

    const messages = [
        'Born at the intersection of modern ecommerce and Japanese manga artistry. We build playful, bold shopping experiences with crisp black-and-white ink lines, dynamic panels, and expressive micro-interactions.',
        'We obsess over clarity, contrast, and motion—because every click should feel like turning a page.',
        'Fast, lightweight, and accessible by design. No bloat, just delight.',
        'From panel grids to halftone textures: a visual language that makes shopping fun again.'
    ];

    let index = 0;
    let timer = null;

    // build dots
    controls.innerHTML = messages.map((_, i) => `<button type="button" aria-label="Show message ${i+1}" data-i="${i}"></button>`).join('');
    const dots = Array.from(controls.querySelectorAll('button'));

    // ink swipe layer
    let ink = bubble.querySelector('.ink-swipe');
    if (!ink){
        ink = document.createElement('div');
        ink.className = 'ink-swipe';
        bubble.appendChild(ink);
    }

    function render(i, dir = 'right'){
        const next = (i + messages.length) % messages.length;
        if (next === index && textEl.textContent) return;
        // animate current out
        textEl.classList.remove('in-right-start','in-left-start','in-end');
        textEl.classList.add(dir === 'right' ? 'out-left' : 'out-right');

        // run ink swipe
        ink.classList.remove('run-right','run-left');
        // force reflow to restart animation reliably
        void ink.offsetWidth;
        ink.classList.add(dir === 'right' ? 'run-right' : 'run-left');

        setTimeout(() => {
            // place next offscreen then slide in
            textEl.textContent = messages[next];
            textEl.classList.remove('out-left','out-right');
            textEl.classList.add(dir === 'right' ? 'in-right-start' : 'in-left-start');
            // next tick to transition to end
            requestAnimationFrame(()=>{
                textEl.classList.add('in-end');
            });
            index = next;
            dots.forEach((d, di)=>d.classList.toggle('active', di===index));
        }, 140);
    }

    function start(){ stop(); timer = setInterval(()=>render(index+1), 5000); }
    function stop(){ if (timer) { clearInterval(timer); timer=null; } }

    dots.forEach(d=>{
        d.addEventListener('click', ()=>{
            const target = parseInt(d.dataset.i,10);
            const dir = target > index ? 'right' : 'left';
            render(target, dir);
            start();
        });
    });

    // keyboard left/right when bubble focused
    bubble.setAttribute('tabindex','0');
    bubble.addEventListener('keydown', (e)=>{
        if (e.key === 'ArrowRight') { render(index+1, 'right'); start(); }
        if (e.key === 'ArrowLeft') { render(index-1, 'left'); start(); }
    });

    // pause on hover
    bubble.addEventListener('mouseenter', stop);
    bubble.addEventListener('mouseleave', start);

    // copy button
    const copyBtn = bubble.querySelector('.bubble-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', async ()=>{
            try {
                await navigator.clipboard.writeText(textEl.textContent.trim());
                showNotification('Copied to clipboard 📋', 'success');
            } catch {
                showNotification('Copy failed', 'error');
            }
        });
    }

    // init
    render(0, 'right'); start();
}

// Product Rendering
function renderProducts(productsToRender = products) {
    if (!productGrid) return;

    const productsHTML = productsToRender.map(product => createProductCard(product)).join('');
    productGrid.innerHTML = productsHTML;

    // Re-observe new product cards for animations
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.add('slide-up');
    });
    // Sync states for wishlist and compare buttons after re-render
    syncWishlistButtons();
    if (typeof syncCompareButtons === 'function') syncCompareButtons();
}

// Featured picks renderer (home only)
function renderFeaturedPicks(){
    const mount = document.getElementById('featured-grid');
    if (!mount) return; // only on home
    // Pick 4 from the live products (fallback to samples): prioritize high rating and in stock
    const source = (products && products.length) ? products : sampleProducts;
    const pick = [...source]
        .filter(p=>p.inStock)
        .sort((a,b)=> (b.rating||0) - (a.rating||0))
        .slice(0,4);
    // Ensure products array has items so createProductCard works uniformly
    if (!products || products.length === 0) { products = [...sampleProducts]; }
    mount.innerHTML = pick.map(p=>createProductCard(p)).join('');
    // Sync wishlist/compare states for these cards
    syncWishlistButtons();
    if (typeof syncCompareButtons === 'function') syncCompareButtons();
}

function stars(r){
    const full = Math.round(r*2)/2; // nearest .5
    let s = '';
    for (let i=1;i<=5;i++){ s += i<=Math.floor(full) ? '★' : (i-0.5===full? '☆' : '☆'); }
    return s;
}

// Newsletter subscription
function initNewsletterSubscription(){
    const forms = document.querySelectorAll('.newsletter-form');
    if (!forms.length) return;

    const getMeta = (name)=> document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
    const getEmailJsConfig = () => {
        const cfg = {
            pub: getMeta('emailjs-public-key') || localStorage.getItem('hoshiya_emailjs_pub') || '',
            service: getMeta('emailjs-service') || localStorage.getItem('hoshiya_emailjs_service') || '',
            template: getMeta('emailjs-template') || localStorage.getItem('hoshiya_emailjs_template') || ''
        };
        // Cache to localStorage for other pages that may not include the meta
        try {
            if (getMeta('emailjs-public-key')) localStorage.setItem('hoshiya_emailjs_pub', cfg.pub);
            if (getMeta('emailjs-service')) localStorage.setItem('hoshiya_emailjs_service', cfg.service);
            if (getMeta('emailjs-template')) localStorage.setItem('hoshiya_emailjs_template', cfg.template);
        } catch {}
        return cfg;
    };
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = form.querySelector('.newsletter-input') || form.querySelector('input[type="email"]');
            if (!input) return;
            const email = (input.value||'').trim();
            const isValid = /^\S+@\S+\.\S+$/.test(email);
            if (!isValid){
                input.style.boxShadow = '0 0 0 3px #e00, 4px 4px 0 0 var(--primary-black)';
                input.focus();
                return;
            }
            input.style.boxShadow = '4px 4px 0 0 var(--primary-black)';

            // Determine endpoint: prefer dedicated newsletter meta, then global form endpoint
            const newsletterEndpoint = document.querySelector('meta[name="newsletter-endpoint"]')?.getAttribute('content') || '';
            const endpoint = newsletterEndpoint || (typeof FORMSPREE_ENDPOINT !== 'undefined' ? FORMSPREE_ENDPOINT : '');

            let sent = false;
            // Try HTTP endpoint first
            if (endpoint){
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ type: 'newsletter', email, ts: Date.now(), page: location.href })
                    });
                    sent = res.ok;
                } catch {}
            }

            // Optional: EmailJS fallback if configured via meta tags or cached in localStorage
            if (!sent) {
                const { pub, service, template } = getEmailJsConfig();
                if (pub && service && template){
                    try {
                        // Load EmailJS SDK on demand
                        await new Promise((resolve, reject) => {
                            if (window.emailjs) return resolve();
                            const s = document.createElement('script');
                            s.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
                            s.onload = () => resolve(); s.onerror = reject; document.head.appendChild(s);
                        });
                        window.emailjs.init(pub);
                        const params = {
                            // Common param names; map generously to improve template compatibility
                            to_email: email,
                            user_email: email,
                            reply_to: email,
                            subject: 'Welcome to Hoshiya',
                            message: 'Thanks for subscribing! You\'ll be the first to hear about manga-style drops.'
                        };
                        const res = await window.emailjs.send(service, template, params);
                        if (res && (res.status === 200 || res.text === 'OK')) {
                            sent = true;
                        } else {
                            console.error('EmailJS send returned non-OK response:', res);
                        }
                    } catch (err) {
                        console.error('EmailJS send failed:', err);
                    }
                }
            }

            if (sent){
                try { localStorage.setItem('hoshiya_newsletter', email); } catch {}
                const wrap = form.closest('.newsletter-content') || form.parentElement;
                if (wrap){
                    wrap.innerHTML = '<h3>Welcome to Hoshiya!</h3><p style="margin-top:8px;color:#444">Check your inbox for a welcome message. スパムフォルダもご確認ください。</p>';
                }
            } else {
                // Gentle message, but highlight configuration steps in console for the site owner
                try { localStorage.setItem('hoshiya_newsletter', email); } catch {}
                const note = document.createElement('div');
                note.style = 'margin-top:10px;color:#b00;font-weight:800';
                note.textContent = 'We could not send the welcome email right now. Please try again later.';
                form.appendChild(note);
                console.warn('Newsletter email not sent. Ensure EmailJS meta keys are set, the template\'s To field is {{to_email}}, Allowed Origins includes your site, and your email provider didn\'t block the mail.');
            }
        });
    });
}

// Currency formatter
function formatPrice(val, currency){
    try {
        if (currency === 'INR') {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    } catch {
        // Fallback
        return (currency === 'INR' ? `₹${Math.round(val)}` : `$${val}`);
    }
}

function isSizeCategory(cat){ return cat === 'fashion' || cat === 'tees'; }

function createProductCard(product) {
    const originalPriceHTML = product.originalPrice 
        ? `<span class="original-price">${formatPrice(product.originalPrice, product.currency)}</span>` 
        : '';
    const badgeHTML = deriveBadges(product).map(b=>`<div class="badge ${b.toLowerCase().replace(/\s+/g,'')}">${b}</div>`).join('');
    const stockText = product.inStock ? '' : '<div style="color:#b00;font-weight:800;margin:6px 0">Sold Out</div>';
    const ratingHTML = `<div style="font-size:12px;color:#555">${stars(product.rating||0)} <strong>${(product.rating||0).toFixed(1)}</strong></div>`;

    // Build image media with optional hover-secondary image. Prefer explicit hoverImageSrc, fallback to fullImageSrc.
    const secondarySrc = product.hoverImageSrc || product.fullImageSrc || null;
    const hasImage = !!product.imageSrc;
    const hasSecondary = !!(hasImage && secondarySrc);
    const mediaHTML = hasImage
        ? (hasSecondary
            ? `<img class="img-primary" src="${product.imageSrc}" alt="${product.name}" loading="lazy" decoding="async"><img class="img-secondary" src="${secondarySrc}" alt="${product.name} — alternate view" loading="lazy" decoding="async">`
            : `<img src="${product.imageSrc}" alt="${product.name}" loading="lazy" decoding="async">`)
        : (product.emoji||'🛍️');
    const isSticker = product.category === 'stickers';
    const bgVar = (isSticker && product.imageSrc) ? `--thumb: url('${(product.imageSrc||'').replace(/'/g, "\\'")}');` : '';
    const containerStyle = `cursor: pointer;${bgVar? ' '+bgVar: ''}`;
    return `
        <div class="product-card" data-category="${product.category}" data-id="${product.id}" id="product-${product.id}">
            ${badgeHTML}
            <button class="wish-btn" aria-label="Add to wishlist" data-id="${product.id}">❤</button>
            <div class="product-image${hasSecondary ? ' hover-enabled' : ''}" role="button" tabindex="0" aria-label="View full image ${product.name}" onclick="viewProductMedia(${product.id})" onkeydown="if(event.key==='Enter' || event.key===' '){event.preventDefault(); viewProductMedia(${product.id});}" style="${containerStyle}">
                ${mediaHTML}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${formatPrice(product.price, product.currency)}
                    ${originalPriceHTML}
                </div>
                ${ratingHTML}
                ${stockText}
                <div class="product-actions">
                    <button class="btn btn-outline btn-small" onclick="addToCart(${product.id})">
                        <span>Add to Cart</span>
                        <div class="btn-effect"></div>
                    </button>
                    <button class="btn btn-primary btn-small" onclick="buyNow(${product.id})">
                        <span>Buy Now</span>
                        <div class="btn-effect"></div>
                    </button>
                    <button class="btn btn-outline btn-small compare-btn" data-id="${product.id}" onclick="toggleCompareItem(${product.id})">
                        <span>Compare</span>
                    </button>
                </div>
                <div class="quick-add">
                    ${isSizeCategory(product.category) ? `<div class="size-grid">${['XS','S','M','L','XL'].map(s=>`<button type="button" class="size-pill" data-size="${s}" onclick="this.parentNode.querySelectorAll('.size-pill').forEach(el=>el.classList.remove('active')); this.classList.add('active'); this.closest('.product-card').dataset.size='${s}';">${s}</button>`).join('')}</div>` : ''}
                    <div class="qty-row"><div class="option-label">Quantity</div><input class="qty-input" type="number" min="1" max="10" value="1" oninput="this.value=Math.max(1,Math.min(10,parseInt(this.value||'1',10)))" /></div>
                    <button class="btn btn-outline btn-small" onclick="(function(btn){ const card=btn.closest('.product-card'); const qty=parseInt(card.querySelector('.qty-input').value||'1',10)||1; const size=card.dataset.size||null; addToCart(${product.id},{qty, size}); })(this)"><span>Quick Add</span></button>
                </div>
                
            </div>
        </div>
    `;
}

// Filter Functions
function setActiveFilter(filter) {
    filterTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        }
    });
    currentFilter = filter;
}

function filterProducts(filter) {
    let list = filter === 'all' ? [...products] : products.filter(p=>p.category===filter);
    // Facets
    if (currentFacets.minPrice != null) list = list.filter(p => p.price >= currentFacets.minPrice);
    if (currentFacets.maxPrice != null) list = list.filter(p => p.price <= currentFacets.maxPrice);
    if (currentFacets.inStock) list = list.filter(p=>p.inStock);
    if ((currentFacets.minRating||0) > 0) list = list.filter(p => (p.rating||0) >= currentFacets.minRating);
    // Sort
    const s = currentFacets.sort;
    if (s==='price-asc') list.sort((a,b)=>a.price-b.price);
    else if (s==='price-desc') list.sort((a,b)=>b.price-a.price);
    else if (s==='rating-desc') list.sort((a,b)=>(b.rating||0)-(a.rating||0));
    else if (s==='newest') list.sort((a,b)=>b.id-a.id);
    else if (s==='pop') list.sort((a,b)=>((getPopularity(b))-(getPopularity(a))));
    renderProducts(list);
}

function loadMoreProducts() {
    if (isLoading) return;
    
    isLoading = true;
    loadMoreBtn.innerHTML = '<span>Loading...</span>';
    
    // Simulate loading delay
    setTimeout(() => {
        // In a real app, this would fetch more products from an API
        const moreProducts = generateMoreProducts();
        products.push(...moreProducts);
        filterProducts(currentFilter);
        
        loadMoreBtn.innerHTML = '<span>Load More Products</span><div class="btn-effect"></div>';
        isLoading = false;
    }, 1000);
}

function generateMoreProducts() {
    const categories = ['electronics', 'fashion', 'home', 'sports'];
    const names = ['Premium Item', 'Deluxe Product', 'Pro Edition', 'Elite Version'];
    const emojis = ['🎯', '⭐', '🚀', '💎', '🏆', '🎨'];
    
    return Array.from({ length: 4 }, (_, i) => ({
        id: products.length + i + 1,
        name: `${names[i % names.length]} ${products.length + i + 1}`,
        price: Math.floor(Math.random() * 200) + 50,
        originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 300) + 100 : null,
        category: categories[Math.floor(Math.random() * categories.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        description: "Amazing product with great features and incredible quality",
        rating: (Math.random()*2)+3,
        inStock: Math.random()>0.2
    }));
}

// Wishlist & Compare
const WISHLIST_KEY='hoshiya_wishlist';
const COMPARE_KEY='hoshiya_compare';
function getLS(key,def){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):def; }catch{ return def; } }
function setLS(key,val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }
function toggleWishlist(id){ const w=getLS(WISHLIST_KEY,[]); const i=w.indexOf(id); if(i>-1) w.splice(i,1); else w.push(id); setLS(WISHLIST_KEY,w); syncWishlistButtons(); showNotification(i>-1?'Removed from wishlist ♥':'Added to wishlist ♥','success'); }
function syncWishlistButtons(){ const w=getLS(WISHLIST_KEY,[]); document.querySelectorAll('.wish-btn').forEach(b=>{ const id=parseInt(b.dataset.id,10); b.classList.toggle('active', w.includes(id)); b.onclick=()=>toggleWishlist(id); }); }

// Compare helpers
function getCompare(){ return getLS(COMPARE_KEY,[]); }
function saveCompare(list){ setLS(COMPARE_KEY, list); updateCompareCount(); }
function updateCompareCount(){ const el=document.getElementById('compare-count'); if(!el) return; const cnt=(getLS(COMPARE_KEY,[])||[]).length; el.textContent=cnt; }
function toggleCompareItem(id){ const list=getCompare(); const i=list.indexOf(id); if(i>-1) list.splice(i,1); else list.push(id); saveCompare(list); syncCompareButtons(); renderCompare(); showNotification(i>-1?'Removed from compare':'Added to compare','success'); }
function syncCompareButtons(){ const list=getCompare(); document.querySelectorAll('.compare-btn').forEach(b=>{ const id=parseInt(b.dataset.id,10); b.classList.toggle('active', list.includes(id)); }); updateCompareCount(); }
function toggleCompare(){ const drawer=document.getElementById('compare-drawer'); if(!drawer) return; const isOpen=drawer.classList.contains('open'); if(isOpen){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); } else { drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); renderCompare(); } }
function renderCompare(){
    const mount=document.getElementById('compare-content');
    if(!mount) return;
    const ids=getCompare();
    if(ids.length===0){
        mount.innerHTML='<p>Add items to compare using the Compare button on product cards.</p>';
        return;
    }
    const items=ids.map(id=>products.find(p=>p.id===id)).filter(Boolean);
    // Columns: blank corner + one column per product with emoji and name in the header
    const headCells=['<th></th>', ...items.map(p=>`<th><div style="display:flex;align-items:center;gap:8px;justify-content:center;font-weight:900"><span style="font-size:20px">${p.emoji||'🛍️'}</span><span>${p.name}</span></div></th>`)].join('');
    const row = (label, render) => `<tr><td style="font-weight:800">${label}</td>${items.map(render).join('')}</tr>`;
    const table=`<table class="compare-table"><thead><tr>${headCells}</tr></thead><tbody>
        ${row('Price', p=>`<td>${formatPrice(p.price, p.currency)}</td>`) }
        ${row('Rating', p=>`<td>${(p.rating||0).toFixed(1)} ★</td>`) }
        ${row('Category', p=>`<td>${p.category}</td>`) }
        ${row('Stock', p=>`<td>${p.inStock?'In stock':'Sold out'}</td>`) }
        ${row('Actions', p=>`<td><button class="btn btn-outline btn-small" onclick="toggleCompareItem(${p.id})">Remove</button></td>`) }
    </tbody></table>`;
    mount.innerHTML=table;
}

// Trending & Recently Viewed
const RECENT_KEY='hoshiya_recent';
const POP_KEY='hoshiya_pop';
function recordView(id){ const r=getLS(RECENT_KEY,[]); const idx=r.indexOf(id); if(idx>-1) r.splice(idx,1); r.unshift(id); if(r.length>12) r.pop(); setLS(RECENT_KEY,r); // bump popularity
    const pop=getLS(POP_KEY,{}); pop[id]=(pop[id]||0)+1; setLS(POP_KEY,pop);
}
function getPopularity(p){ const pop=getLS(POP_KEY,{}); return pop[p.id]||0; }
function renderCarousel(ids, wrapId){ const wrap=document.getElementById(wrapId); if(!wrap) return; const list=ids.map(id=>products.find(p=>p.id===id)).filter(Boolean); wrap.innerHTML=list.map(p=>createProductCard(p)).join(''); }
function refreshCarousels(){
    // Build an initial trending set that always includes new items too
    const pool = buildTrendingPool();
    const trending = pool.slice(0, 8);
    renderCarousel(trending,'trending-wrap');
    const recent=getLS(RECENT_KEY,[]).slice(0,8);
    renderCarousel(recent,'recent-wrap');
    syncWishlistButtons(); syncCompareButtons();
}

// Build a large mixed pool for Trending rotation (unique IDs):
//  - New badge first
//  - Newest by ID
//  - Most popular (based on interactions)
//  - Top rated
//  - Random fill as last resort
function buildTrendingPool(){
    const popMap = getLS(POP_KEY,{});
    const byNewBadge = products
        .filter(p=>/new/i.test(String(p.badge||'')))
        .sort((a,b)=> (b.id||0) - (a.id||0))
        .map(p=>p.id);
    const byNewest = [...products]
        .sort((a,b)=> (b.id||0) - (a.id||0))
        .slice(0, 16)
        .map(p=>p.id);
    const byPopular = Object.entries(popMap)
        .sort((a,b)=> (b[1]||0) - (a[1]||0))
        .map(([id])=>parseInt(id,10))
        .slice(0, 20);
    const byTopRated = [...products]
        .sort((a,b)=> (b.rating||0) - (a.rating||0))
        .slice(0, 20)
        .map(p=>p.id);
    // Combine with priority and remove duplicates
    const combined = [...byNewBadge, ...byNewest, ...byPopular, ...byTopRated];
    const seen = new Set();
    let pool = [];
    for (const id of combined){ if (!seen.has(id)){ seen.add(id); pool.push(id); } }
    // If still small, add a few randoms
    if (pool.length < 24){
        const rest = products.map(p=>p.id).filter(id=>!seen.has(id));
        for(let i=rest.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [rest[i],rest[j]]=[rest[j],rest[i]]; }
        pool = pool.concat(rest.slice(0, 24 - pool.length));
    }
    // Prefer in-stock where possible without dropping too many
    const inStockFirst = pool.filter(id=>{ const p=products.find(x=>x.id===id); return p && p.inStock; });
    const outOfStock = pool.filter(id=>!inStockFirst.includes(id));
    const finalPool = inStockFirst.concat(outOfStock).slice(0, 32);
    return finalPool;
}

// Live Trending: rotate every 10 seconds
let trendingTimer = null;
let trendingOffset = 0;
function startTrendingRotation(){
    const wrap = document.getElementById('trending-wrap');
    if (!wrap) return;
    stopTrendingRotation();
    const interval = 30000; // 30s
    trendingTimer = setInterval(()=>{
        if (document.hidden) return; // pause when not visible
        // Build a comprehensive pool that includes new items too
        const pool = buildTrendingPool();
        if (!pool.length) return;
        // Compute a new window by advancing a global offset
        const step = 2; // rotate 2 forward each tick
        trendingOffset = (trendingOffset + step) % pool.length;
        const nextIds = [];
        for (let i=0;i<8;i++){ nextIds.push(pool[(trendingOffset + i) % pool.length]); }
        // Fade out then swap then fade in
        wrap.classList.add('rotating');
        setTimeout(()=>{
            renderCarousel(nextIds, 'trending-wrap');
            syncWishlistButtons();
            syncCompareButtons();
            wrap.classList.remove('rotating');
        }, 260);
    }, interval);
}
function stopTrendingRotation(){ if (trendingTimer){ clearInterval(trendingTimer); trendingTimer=null; } }
document.addEventListener('visibilitychange', ()=>{ if (document.hidden) stopTrendingRotation(); else startTrendingRotation(); });

// Cart Functions
function addToCart(productId, options = {}) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const needsSize = isSizeCategory(product.category);
    const size = options.size || null;
    let qty = parseInt(options.qty, 10);
    if (isNaN(qty) || qty < 1) qty = 1;

    // If fashion item and no size provided, ask user to pick size on the card
    if (needsSize && !size) { showNotification('Please select a size using Quick Add on the card.', 'info'); return; }

    const key = `${productId}::${size || '-'}`;
    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty, size, key });
    }

    updateCartUI();
    showNotification(`${product.name}${size ? ` (Size ${size})` : ''} added to cart! 🛒`, 'success');
    
    // Add cart animation and sound
    animateCartButton();
    playSound('cart');
}

function removeFromCart(key) {
    cart = cart.filter(item => item.key !== key);
    updateCartUI();
    renderCartItems();
}

function updateCartQuantity(key, change) {
    const item = cart.find(item => item.key === key);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(key);
        return;
    }

    updateCartUI();
    renderCartItems();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (cartTotal) {
        try {
            const currs = Array.from(new Set(cart.map(i => i.currency || 'USD')));
            const one = currs.length === 1 ? currs[0] : null;
            cartTotal.textContent = one ? formatPrice(totalPrice, one) : totalPrice.toFixed(2);
        } catch {
            cartTotal.textContent = totalPrice.toFixed(2);
        }
    }

    renderCartItems();
    persistCart();
}

function renderCartItems() {
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="icon anime" aria-hidden="true">
                    <img src="images/anime-character-sketches-17.webp" alt="" loading="lazy" decoding="async" />
                </div>
                <div style="text-align:center; max-width: 260px;">
                    <h3>Your cart is empty</h3>
                    <p>Add some amazing products to get started!</p>
                </div>
            </div>
        `;
        return;
    }

    const cartHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.imageSrc ? `<img src="${item.imageSrc}" alt="${item.name}" loading="lazy" decoding="async">` : (item.emoji || '🛍️')}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}${item.size ? ` <span style='font-size:12px;color:#555'>(Size ${item.size})</span>` : ''}</div>
                <div class="cart-item-actions">
                    <button onclick="updateCartQuantity('${item.key}', -1)" class="qty-btn" aria-label="Decrease">−</button>
                    <span style="min-width:22px; text-align:center; font-weight: 900;">${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.key}', 1)" class="qty-btn" aria-label="Increase">+</button>
                    <button onclick="removeFromCart('${item.key}')" class="btn btn-secondary" style="padding:6px 10px;">Remove</button>
                </div>
            </div>
            <div class="cart-item-price">${formatPrice(item.price, item.currency)}</div>
        </div>
    `).join('');

    cartItems.innerHTML = cartHTML;
}

function toggleCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
        document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : '';
    }
}

function persistCart(){
    try{ localStorage.setItem('hoshiya_cart', JSON.stringify(cart)); }catch{}
}

function generateOrderId(){
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2,8);
    return `HSY-${t}-${r}`.toUpperCase();
}

function animateCartButton() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
        }, 200);
    }
}

// Buy Now Function
function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    let size = null;
    if (isSizeCategory(product.category)) {
        // Find any rendered card for this product with a selected size
        const cards = document.querySelectorAll(`.product-card[data-id="${productId}"]`);
        for (const card of cards) {
            const ds = card?.dataset?.size || card.querySelector('.size-pill.active')?.getAttribute('data-size');
            if (ds) { size = ds; break; }
        }
        if (!size) { showNotification('Please select a size using Quick Add on the card.', 'info'); return; }
    }
    addToCart(productId, { qty: 1, size });
    setTimeout(() => {
        toggleCart();
    }, 500);
}

// Quick View functions removed (feature deprecated)

// Theme Functions
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Icon is drawn via CSS; no text swapping needed
    
    // Save theme preference
    localStorage.setItem('darkMode', isDarkMode);
    
    playSound('click');
    showNotification(`${isDarkMode ? 'Dark' : 'Light'} mode activated! ${isDarkMode ? '🌙' : '☀️'}`, 'info');
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        // Icon handled by CSS layers; nothing to update here
    }
}

// Utility Functions
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    // If we're on home/about/contact without products section, navigate to products.html with a nice wipe
    const overlay = document.getElementById('section-transition');
    const go = ()=> window.location.href = 'products.html';
    if (!overlay) { go(); return; }
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    setTimeout(go, 360);
}

function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        if (type === 'click' && clickSound) {
            clickSound.currentTime = 0;
            clickSound.play();
        } else if (type === 'cart' && cartSound) {
            cartSound.currentTime = 0;
            cartSound.play();
        }
    } catch (error) {
        console.log('Sound playback failed:', error);
    }
}
// Sound preference loader (no button). Remains muted by default unless localStorage says otherwise.
function loadSoundPreference() {
    try {
        const v = localStorage.getItem('soundEnabled');
        if (v !== null) {
            soundEnabled = v === 'true';
        }
    } catch {}
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#000' : '#ff0000'};
        color: white;
        padding: 15px 20px;
        border: 3px solid ${type === 'success' ? '#000' : '#ff0000'};
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-weight: bold;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Search Functionality
function setupSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchIconBtn = document.querySelector('.search-icon-btn');
    const searchInput = document.getElementById('site-search');
    const searchWrap = document.querySelector('.search-wrap');
    const suggestions = document.getElementById('search-suggestions');
    const banner = document.getElementById('search-banner');

    if (!searchInput || !searchWrap || !suggestions) return;

    let activeIndex = -1;
    let currentResults = [];

    const openSuggestions = () => {
        if (!suggestions.classList.contains('open') && currentResults.length > 0) {
            suggestions.classList.add('open');
            searchInput.setAttribute('aria-expanded', 'true');
            // mark page as searching so CSS can hide conflicting UI (profile chip, etc.)
            try{ document.body.classList.add('searching'); }catch(e){}
        }
    };

    const closeSuggestions = () => {
        suggestions.classList.remove('open');
        searchInput.setAttribute('aria-expanded', 'false');
        activeIndex = -1;
        Array.from(suggestions.children).forEach(li => li.classList.remove('active'));
        // remove searching state when suggestions closed
        try{ document.body.classList.remove('searching'); }catch(e){}
    };

    const clearSearch = () => {
        searchInput.value = '';
        searchWrap.classList.remove('has-value');
        closeSuggestions();
        hideBanner();
        renderProducts(products);
        try{ document.body.classList.remove('searching'); }catch(e){}
    };

    const highlight = (text, term) => {
        const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(`(${safe})`, 'ig'), '<mark>$1</mark>');
    };

    const updateBanner = (count, term) => {
        if (!banner) return;
        banner.innerHTML = `
            <span class="banner-text">Found ${count} result${count===1?'':'s'} for "${term}"</span>
            <button class="banner-clear">Clear</button>
        `;
        banner.classList.remove('hidden');
        const clearBtn = banner.querySelector('.banner-clear');
        clearBtn.addEventListener('click', clearSearch);
    };

    const hideBanner = () => {
        if (banner) banner.classList.add('hidden');
    };

    // Fuzzy helpers
    const lev = (a,b)=>{ a=a.toLowerCase(); b=b.toLowerCase(); const m=a.length,n=b.length; const dp=Array.from({length:m+1},(_,i)=>Array(n+1).fill(0)); for(let i=0;i<=m;i++)dp[i][0]=i; for(let j=0;j<=n;j++)dp[0][j]=j; for(let i=1;i<=m;i++){ for(let j=1;j<=n;j++){ const cost=a[i-1]===b[j-1]?0:1; dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+cost);} } return dp[m][n]; };
    const fuzzyScore = (q, text)=>{
        q=q.toLowerCase(); text=text.toLowerCase();
        if (text.includes(q)) return 1;
        // subsequence bonus
        let i=0,j=0,match=0; while(i<q.length&&j<text.length){ if(q[i]===text[j]){match++; i++;} j++; }
        const seq = match/q.length;
        const dist = lev(q,text);
        const norm = 1/(1+dist);
        return 0.6*seq + 0.4*norm;
    };

    const buildSuggestions = (term) => {
        const q = term.trim().toLowerCase();
        if (!q) { suggestions.innerHTML = ''; closeSuggestions(); return; }
        const scored = products.map(p=>({ p, s: fuzzyScore(q, `${p.name} ${p.description} ${p.category}`) }))
                               .sort((a,b)=>b.s-a.s);
        currentResults = scored.filter(x=>x.s>0.25).map(x=>x.p);

        const top = currentResults.slice(0, 6);
        const items = top.map((p, idx) => `
            <li id="sug-${p.id}" class="suggestion-item" role="option" data-id="${p.id}" data-index="${idx}">
                <div class="suggestion-emoji">${p.emoji}</div>
                <div class="suggestion-text">
                    <div class="suggestion-name">${highlight(p.name, term)}</div>
                    <div class="suggestion-desc">${highlight(p.description, term)}</div>
                </div>
                <div class="suggestion-price">${formatPrice(p.price, p.currency)}</div>
            </li>
        `).join('');

        const viewAll = currentResults.length > 6 ? `
            <li class="suggestion-viewall" role="option" data-viewall="true">View all ${currentResults.length} results →</li>
        ` : '';

        // category chips
        const cats = Array.from(new Set(currentResults.map(r=>r.category)));
        const chipBar = cats.length? `<li class="suggestion-item" style="cursor:default"><div style="display:flex;gap:8px;flex-wrap:wrap">${cats.map(c=>`<button class="btn btn-outline btn-small" data-cat="${c}" style="padding:6px 10px">#${c}</button>`).join('')}</div></li>`:'';
        suggestions.innerHTML = chipBar + items + viewAll;
        if (currentResults.length > 0) openSuggestions(); else closeSuggestions();

        // Mouse interactions
        Array.from(suggestions.querySelectorAll('.suggestion-item')).forEach(li => {
            if (li.dataset.id){
                li.addEventListener('mouseenter', () => {
                    Array.from(suggestions.children).forEach(el => el.classList.remove('active'));
                    li.classList.add('active');
                    activeIndex = parseInt(li.dataset.index, 10);
                    searchInput.setAttribute('aria-activedescendant', li.id);
                });
                li.addEventListener('mouseleave', () => {
                    li.classList.remove('active');
                    searchInput.removeAttribute('aria-activedescendant');
                    activeIndex = -1;
                });
                li.addEventListener('click', () => {
                    const id = parseInt(li.dataset.id, 10);
                    if (!isNaN(id)) {
                        const u = new URL(window.location.href);
                        u.pathname = (u.pathname.replace(/[^/]*$/, '')) + 'products.html';
                        u.searchParams.set('pid', String(id));
                        window.location.href = u.toString();
                        closeSuggestions();
                    }
                });
            }
        });

        const viewAllEl = suggestions.querySelector('.suggestion-viewall');
        if (viewAllEl) {
            viewAllEl.addEventListener('click', () => {
                renderProducts(currentResults);
                updateBanner(currentResults.length, term);
                closeSuggestions();
            });
        }

        // chip filters
        suggestions.querySelectorAll('[data-cat]').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const cat = btn.getAttribute('data-cat');
                const filtered = currentResults.filter(p=>p.category===cat);
                renderProducts(filtered);
                updateBanner(filtered.length, `${term} · #${cat}`);
                closeSuggestions();
            });
        });

        // Did you mean, when zero results
        if (currentResults.length===0){
            const names = products.map(p=>p.name);
            let best = {name:'', d: Infinity};
            names.forEach(n=>{ const d = lev(q, n.toLowerCase()); if (d < best.d) best = {name:n, d}; });
            suggestions.innerHTML = `<li class="suggestion-item" style="cursor:default">No results. Did you mean <button class="btn btn-outline btn-small" data-dym="${best.name}">${best.name}</button>?</li>`;
            openSuggestions();
            const dym = suggestions.querySelector('[data-dym]');
            if (dym) dym.addEventListener('click', ()=>{ searchInput.value = best.name; applySearch(best.name); });
        }
    };

    const applySearch = (term) => {
        const q = term.trim();
        if (!q) { clearSearch(); return; }
        // If there's no product grid on this page, navigate to products with query
        if (!document.getElementById('product-grid')){
            const url = new URL(window.location.origin + (window.location.pathname.endsWith('/')? '' : '/') + 'products.html', window.location.href);
            url.searchParams.set('q', q);
            window.location.href = url.toString();
            return;
        }
        const scored = products.map(p=>({ p, s: fuzzyScore(q, `${p.name} ${p.description} ${p.category}`) }))
                               .sort((a,b)=>b.s-a.s);
        const filtered = scored.filter(x=>x.s>0.25).map(x=>x.p);
        renderProducts(filtered);
        updateBanner(filtered.length, q);
        closeSuggestions();
    };

    // Input typing
    const onInput = debounce((e) => {
        const val = e.target.value;
        searchWrap.classList.toggle('has-value', val.length > 0);
        // Toggle searching class so CSS can hide the auth chip while typing/searching
        try{
            if (val && val.length > 0) document.body.classList.add('searching');
            else document.body.classList.remove('searching');
        }catch(e){}
        buildSuggestions(val);
    }, 120);

    searchInput.addEventListener('input', onInput);
    // keep searching state on focus (useful on mobile when keyboard opens)
    searchInput.addEventListener('focus', () => { try{ document.body.classList.add('searching'); }catch(e){} });
    // remove searching state on blur after a short delay (allow clicking suggestions)
    searchInput.addEventListener('blur', () => { setTimeout(()=>{ try{ if(!suggestions.classList.contains('open')) document.body.classList.remove('searching'); }catch(e){} }, 150); });
    // On native clear (blue X) the browser fires 'input' with empty value, which onInput handles.

    // Focus from icon buttons
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchInput.focus();
            openSuggestions();
        });
    }
    if (searchIconBtn) {
        searchIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applySearch(searchInput.value);
        });
    }

    // Custom clear button removed; relying on native clear in type=search

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = Array.from(suggestions.querySelectorAll('.suggestion-item'));
        const max = items.length - 1;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!suggestions.classList.contains('open')) openSuggestions();
            activeIndex = Math.min(max, activeIndex + 1);
            items.forEach(el => el.classList.remove('active'));
            if (items[activeIndex]) {
                items[activeIndex].classList.add('active');
                searchInput.setAttribute('aria-activedescendant', items[activeIndex].id);
                items[activeIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(0, activeIndex - 1);
            items.forEach(el => el.classList.remove('active'));
            if (items[activeIndex]) {
                items[activeIndex].classList.add('active');
                searchInput.setAttribute('aria-activedescendant', items[activeIndex].id);
                items[activeIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && items[activeIndex]) {
                const id = parseInt(items[activeIndex].dataset.id, 10);
                if (!isNaN(id)) {
                    const u = new URL(window.location.href);
                    u.pathname = (u.pathname.replace(/[^/]*$/, '')) + 'products.html';
                    u.searchParams.set('pid', String(id));
                    window.location.href = u.toString();
                    closeSuggestions();
                }
            } else {
                applySearch(searchInput.value);
            }
        } else if (e.key === 'Escape') {
            closeSuggestions();
        } else if (e.key === 'Home') {
            activeIndex = 0; items.forEach(el=>el.classList.remove('active')); if(items[0]){ items[0].classList.add('active'); searchInput.setAttribute('aria-activedescendant', items[0].id); items[0].scrollIntoView({block:'nearest'}); }
        } else if (e.key === 'End') {
            activeIndex = max; items.forEach(el=>el.classList.remove('active')); if(items[max]){ items[max].classList.add('active'); searchInput.setAttribute('aria-activedescendant', items[max].id); items[max].scrollIntoView({block:'nearest'}); }
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!searchWrap.contains(e.target)) {
            closeSuggestions();
        }
    });
}

function searchProducts(term) {
    // Backward-compatible: apply integrated search and banner
    const q = term.trim();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(q.toLowerCase()) ||
        product.description.toLowerCase().includes(q.toLowerCase()) ||
        product.category.toLowerCase().includes(q.toLowerCase())
    );
    renderProducts(filteredProducts);
    const banner = document.getElementById('search-banner');
    if (banner) {
        banner.innerHTML = `<span class="banner-text">Found ${filteredProducts.length} result${filteredProducts.length===1?'':'s'} for "${q}"</span><button class="banner-clear">Clear</button>`;
        banner.classList.remove('hidden');
        banner.querySelector('.banner-clear').addEventListener('click', () => {
            const searchInput = document.getElementById('site-search');
            if (searchInput) searchInput.value = '';
            renderProducts(products);
            banner.classList.add('hidden');
        });
    } else {
        showNotification(`Found ${filteredProducts.length} results for "${q}"`, 'info');
    }
}

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Handle responsive adjustments if needed
    if (window.innerWidth > 768 && cartSidebar && cartSidebar.classList.contains('open')) {
        // Adjust cart sidebar for larger screens
    }
}, 250));

// Smooth scroll with section transition overlay
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    // Same-page anchor
    if (href.startsWith('#')){
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const overlay = document.getElementById('section-transition');
        if (!overlay){ target.scrollIntoView({behavior:'smooth', block:'start'}); return; }
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden','false');
        setTimeout(()=>{ target.scrollIntoView({behavior:'auto', block:'start'}); }, 320);
        setTimeout(()=>{ overlay.classList.remove('show'); overlay.setAttribute('aria-hidden','true'); }, 760);
        return;
    }
    // Page navigation within site: add transition for products.html and index.html
    const sameOrigin = href && !/^https?:\/\//i.test(href) && !href.startsWith('mailto:') && !href.startsWith('tel:');
    if (sameOrigin) {
        e.preventDefault();
        const overlay = document.getElementById('section-transition');
        const go = () => { window.location.href = href; };
        if (!overlay) { go(); return; }
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden','false');
        setTimeout(go, 360);
    }
});

// If on products page with a ?q= param, pre-apply the search
document.addEventListener('DOMContentLoaded', () => {
    try {
        const params = new URLSearchParams(window.location.search || '');
        const q = params.get('q');
        if (q) {
            const input = document.getElementById('site-search');
            if (input) input.value = q;
            // Ensure products are initialized
            if (!products || products.length === 0) { products = [...sampleProducts]; }
            // Reuse searchProducts or the integrated apply path
            const banner = document.getElementById('search-banner');
            if (banner) {
                // Use the integrated scoring path for consistency
                const lev = (a,b)=>{ a=a.toLowerCase(); b=b.toLowerCase(); const m=a.length,n=b.length; const dp=Array.from({length:m+1},(_,i)=>Array(n+1).fill(0)); for(let i=0;i<=m;i++)dp[i][0]=i; for(let j=0;j<=n;j++)dp[0][j]=j; for(let i=1;i<=m;i++){ for(let j=1;j<=n;j++){ const cost=a[i-1]===b[j-1]?0:1; dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+cost);} } return dp[m][n]; };
                const fuzzyScore = (qq, text)=>{ qq=qq.toLowerCase(); text=text.toLowerCase(); if (text.includes(qq)) return 1; let i=0,j=0,match=0; while(i<qq.length&&j<text.length){ if(qq[i]===text[j]){match++; i++;} j++; } const seq = match/qq.length; const dist = lev(qq,text); const norm = 1/(1+dist); return 0.6*seq + 0.4*norm; };
                const scored = products.map(p=>({ p, s: fuzzyScore(q, `${p.name} ${p.description} ${p.category}`) })).sort((a,b)=>b.s-a.s);
                const filtered = scored.filter(x=>x.s>0.25).map(x=>x.p);
                renderProducts(filtered);
                const bannerEl = document.getElementById('search-banner');
                if (bannerEl) {
                    bannerEl.innerHTML = `<span class="banner-text">Found ${filtered.length} result${filtered.length===1?'':'s'} for "${q}"</span><button class="banner-clear">Clear</button>`;
                    bannerEl.classList.remove('hidden');
                    bannerEl.querySelector('.banner-clear').addEventListener('click', () => {
                        const searchInput = document.getElementById('site-search');
                        if (searchInput) searchInput.value = '';
                        renderProducts(products);
                        bannerEl.classList.add('hidden');
                        // Clean the query param
                        const u = new URL(window.location.href);
                        u.searchParams.delete('q');
                        window.history.replaceState({}, '', u);
                    });
                }
            }
        }
    } catch {}
});

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.buyNow = buyNow;
window.scrollToProducts = scrollToProducts;
window.toggleTheme = toggleTheme;
// Quick View removed from global API
window.persistCart = persistCart;
window.generateOrderId = generateOrderId;
window.openImageFullscreen = openImageFullscreen;
window.viewProductMedia = viewProductMedia;

// ============================
// Auth (localStorage-based)
// ============================
const AUTH_USER_KEY = 'hoshiya_user';
const AUTH_USERS_DB = 'hoshiya_users_db'; // array of {email, passHash, name, phone}
const AUTH_EMAIL_OTP = 'hoshiya_email_otp'; // { oldEmail, newEmail, code, exp }

function getUsersDb(){ return getLS(AUTH_USERS_DB, []); }
function saveUsersDb(list){ setLS(AUTH_USERS_DB, list); }
function getCurrentUser(){ return getLS(AUTH_USER_KEY, null); }
function setCurrentUser(u){ setLS(AUTH_USER_KEY, u); }
function logout(){ setCurrentUser(null); showNotification('Logged out ✓','success'); try{ setupAuthUI(); }catch{} }

// Tiny non-cryptographic hash for demo only
function hashPwd(p){ try { return btoa(unescape(encodeURIComponent(p))).split('').reverse().join(''); } catch { return p; } }

function setupAuthUI(){
    // Find nav actions; inject login/signup or account/logout
    const nav = document.querySelector('.nav-actions');
    if (!nav) return;
    // Remove existing auth group if any
    nav.querySelectorAll('.auth-group').forEach(el=>el.remove());
    const wrap = document.createElement('div');
    wrap.className = 'auth-group';
    const user = getCurrentUser();
    if (user && user.email){
        wrap.innerHTML = `
            <a class="auth-chip" href="profile.html" title="Profile" style="text-decoration:none;cursor:pointer">${user.name ? user.name : user.email}</a>
            <button class="btn btn-outline btn-small auth-logout" type="button">Logout</button>
        `;
        nav.insertBefore(wrap, nav.querySelector('.menu-toggle'));
        wrap.querySelector('.auth-logout').addEventListener('click', ()=> logout());
    } else {
            wrap.innerHTML = `
                <a class="btn btn-outline btn-small" href="login.html">Login</a>
            `;
        nav.insertBefore(wrap, nav.querySelector('.menu-toggle'));
    }
}

// Helpers for profiles
function findUserByEmail(email){ const db = getUsersDb(); return db.find(u=>u.email===email) || null; }
function updateUser(updated){
    const db = getUsersDb();
    const idx = db.findIndex(u=>u.email===updated.email);
    if (idx>=0){ db[idx] = { ...db[idx], ...updated }; saveUsersDb(db); return true; }
    return false;
}
function updateUserEmail(oldEmail, newEmail){
    const db = getUsersDb();
    const i = db.findIndex(u=>u.email===oldEmail);
    if (i<0) return false;
    if (db.some(u=>u.email===newEmail)) return 'exists';
    db[i].email = newEmail;
    saveUsersDb(db);
    const cur = getCurrentUser();
    if (cur && cur.email===oldEmail){ setCurrentUser({ ...cur, email: newEmail }); }
    return true;
}

// OTP (demo) for email change
function createEmailOtp(oldEmail, newEmail){
    const code = String(Math.floor(100000 + Math.random()*900000));
    const exp = Date.now() + 5*60*1000; // 5 min
    setLS(AUTH_EMAIL_OTP, { oldEmail, newEmail, code, exp });
    return code;
}
function getEmailOtp(){ return getLS(AUTH_EMAIL_OTP, null); }
function clearEmailOtp(){ setLS(AUTH_EMAIL_OTP, null); }
function verifyEmailOtp(inputCode){
    const rec = getEmailOtp();
    if (!rec) return { ok:false, msg:'No OTP pending' };
    if (Date.now() > (rec.exp||0)) { clearEmailOtp(); return { ok:false, msg:'OTP expired' }; }
    if ((rec.code||'') !== String(inputCode)) return { ok:false, msg:'Invalid OTP' };
    const res = updateUserEmail(rec.oldEmail, rec.newEmail);
    clearEmailOtp();
    if (res==='exists') return { ok:false, msg:'Email already in use' };
    if (!res) return { ok:false, msg:'Unable to update email' };
    return { ok:true };
}

// Profile page behavior
function setupProfilePage(){
    const form = document.getElementById('profile-form');
    if (!form) return;
    // Guard: must be logged in
    const cur = getCurrentUser();
    if (!cur) { window.location.href = 'login.html?next=' + encodeURIComponent('profile.html'); return; }
    // Prefill from users DB
    const full = findUserByEmail(cur.email) || { email: cur.email, name: cur.name||'', phone:'' };
    const nameEl = form.querySelector('#pf-name');
    const phoneEl = form.querySelector('#pf-phone');
    const emailEl = document.getElementById('pf-email');
    if (nameEl) nameEl.value = full.name || '';
    if (phoneEl) phoneEl.value = full.phone || '';
    if (emailEl) emailEl.textContent = full.email;

    form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const newName = (nameEl?.value||'').trim();
        const newPhone = (phoneEl?.value||'').trim();
        // Update DB
        const ok = updateUser({ email: full.email, name: newName, phone: newPhone });
        if (ok){
            const cur2 = getCurrentUser();
            if (cur2) setCurrentUser({ ...cur2, name: newName });
            setupAuthUI();
            showNotification('Profile saved ✓','success');
        } else {
            showNotification('Save failed','error');
        }
    });

    // Email change with OTP
    const sendBtn = document.getElementById('pf-send-otp');
    const newEmailInput = document.getElementById('pf-new-email');
    const otpWrap = document.getElementById('pf-otp-wrap');
    const otpInput = document.getElementById('pf-otp');
    const verifyBtn = document.getElementById('pf-verify');
    if (sendBtn && newEmailInput){
        sendBtn.addEventListener('click', ()=>{
            const newEmail = (newEmailInput.value||'').trim().toLowerCase();
            if (!newEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) { showNotification('Enter a valid email','error'); return; }
            const code = createEmailOtp(full.email, newEmail);
            // Demo: show OTP visibly (in real app, send via email)
            showNotification(`OTP sent: ${code} (demo)`, 'success');
            if (otpWrap) otpWrap.classList.remove('hidden');
        });
    }
    if (verifyBtn && otpInput){
        verifyBtn.addEventListener('click', ()=>{
            const code = (otpInput.value||'').trim();
            const res = verifyEmailOtp(code);
            if (!res.ok){ showNotification(res.msg||'OTP failed','error'); return; }
            // update UI post-change
            const cur3 = getCurrentUser();
            if (emailEl && cur3) emailEl.textContent = cur3.email;
            showNotification('Email updated ✓','success');
        });
    }

    // Logout button
    const lo = document.getElementById('pf-logout');
    if (lo) lo.addEventListener('click', ()=>{ logout(); window.location.href = 'index.html#home'; });
}

// Login page behavior
function setupLoginPage(){
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const email = (form.querySelector('#login-email')?.value||'').trim().toLowerCase();
        const pwd = form.querySelector('#login-password')?.value||'';
        if (!email || !pwd) { showNotification('Enter email and password','error'); return; }
        const db = getUsersDb();
        const u = db.find(x=>x.email===email && x.passHash===hashPwd(pwd));
        if (!u) { showNotification('Invalid credentials','error'); return; }
        setCurrentUser({ email: u.email, name: u.name||'' });
        showNotification('Welcome back!','success');
        // redirect
        const params = new URLSearchParams(window.location.search||'');
        const next = params.get('next') || 'index.html#home';
        window.location.href = next;
    });
}

// Signup page behavior
function setupSignupPage(){
    const form = document.getElementById('signup-form');
    if (!form) return;
    form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = (form.querySelector('#signup-name')?.value||'').trim();
        const email = (form.querySelector('#signup-email')?.value||'').trim().toLowerCase();
        const pwd = form.querySelector('#signup-password')?.value||'';
        const pwd2 = form.querySelector('#signup-password2')?.value||'';
        if (!name || !email || !pwd || !pwd2) { showNotification('Please fill all fields','error'); return; }
        if (pwd.length < 6) { showNotification('Password must be at least 6 characters','error'); return; }
        if (pwd !== pwd2) { showNotification('Passwords do not match','error'); return; }
        const db = getUsersDb();
        if (db.some(x=>x.email===email)) { showNotification('Email already registered','error'); return; }
        db.push({ email, name, passHash: hashPwd(pwd) });
        saveUsersDb(db);
        setCurrentUser({ email, name });
        showNotification('Account created!','success');
        const params = new URLSearchParams(window.location.search||'');
        const next = params.get('next') || 'index.html#home';
        window.location.href = next;
    });
}

// Auto-init for standalone pages
document.addEventListener('DOMContentLoaded', ()=>{
    try { setupAuthUI(); } catch {}
    try { setupLoginPage(); } catch {}
    try { setupSignupPage(); } catch {}
    try { setupProfilePage(); } catch {}
    try { setupPreferenceToggles(); } catch {}
});

// ============================
// Custom Cursor
// ============================
function setupCustomCursor(){
    // Skip on touch devices
    const hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (hasTouch) return;
    // Build elements
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add('cursor-custom','cursor-hidden');
    let x = 0, y = 0; let visible = false; let rafId = 0; let rx = 0, ry = 0;
    const lerp = (a,b,t)=> a+(b-a)*t;
    // Motion loop for ring smoothness
    const tick = ()=>{ rx = lerp(rx, x, 0.22); ry = lerp(ry, y, 0.22); ring.style.left = rx+'px'; ring.style.top = ry+'px'; rafId = requestAnimationFrame(tick); };
    rafId = requestAnimationFrame(tick);
    // Move
    const onMove = (e)=>{
        x = e.clientX; y = e.clientY;
        dot.style.left = x+'px'; dot.style.top = y+'px';
        if (!visible){ document.body.classList.add('cursor-visible'); document.body.classList.remove('cursor-hidden'); visible = true; }
    };
    // Hide when leaving window
    const onLeave = ()=>{ document.body.classList.remove('cursor-visible'); document.body.classList.add('cursor-hidden'); visible = false; };
    // Press state
    const onDown = ()=> document.body.classList.add('cursor-active');
    const onUp = ()=> document.body.classList.remove('cursor-active');
    // Interactive hover state
    const isInteractive = (el)=> !!(el && (el.closest('a, button, [role="button"], .btn, input, select, textarea, .product-card, .look-card, .person-card')));
    const onOver = (e)=>{ if (isInteractive(e.target)) document.body.classList.add('cursor-interactive'); };
    const onOut = (e)=>{ if (isInteractive(e.target)) document.body.classList.remove('cursor-interactive'); };
    // Inputs should use system caret
    // Permanently hide system cursor even on inputs: do nothing on focus
    const onFocusIn = ()=>{};
    const onFocusOut = ()=>{};
    // Bind
    window.addEventListener('mousemove', onMove, { passive:true });
    window.addEventListener('mouseout', onLeave, { passive:true });
    window.addEventListener('mousedown', onDown, { passive:true });
    window.addEventListener('mouseup', onUp, { passive:true });
    document.addEventListener('mouseover', onOver, { passive:true });
    document.addEventListener('mouseout', onOut, { passive:true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    // Animated trail particles
    const trailPool = []; const MAX_TRAIL = 14; let trailIndex = 0; let lastTrailTime = 0;
    for (let i=0;i<MAX_TRAIL;i++){ const t = document.createElement('div'); t.className='cursor-trail'; document.body.appendChild(t); trailPool.push(t); }
    const trailTick = (ts)=>{
        if (!visible){ requestAnimationFrame(trailTick); return; }
        if (ts - lastTrailTime > 14){
            const el = trailPool[trailIndex]; trailIndex = (trailIndex+1)%MAX_TRAIL;
            const size = 6 + Math.random()*8; const life = 420 + Math.random()*200;
            el.style.width = size+'px'; el.style.height = size+'px';
            el.style.left = x+'px'; el.style.top = y+'px';
            el.style.opacity = 0.35;
            el.style.transition = `transform ${life}ms ease-out, opacity ${life}ms ease-out`;
            // trigger
            void el.offsetWidth;
            el.style.transform = `translate(-50%, -50%) scale(0.2)`;
            el.style.opacity = '0';
            lastTrailTime = ts;
        }
        requestAnimationFrame(trailTick);
    };
    requestAnimationFrame(trailTick);

    // Magnetic hover around buttons
    const magnets = Array.from(document.querySelectorAll('a, button, .btn, [role="button"]'));
    const MAG_RADIUS = 120; const MAX_PULL = 14; const MAG_EASE = 0.18;
    const magnetState = new WeakMap();
    const updateMagnet = (el)=>{
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2; const cy = r.top + r.height/2;
        const dx = x - cx; const dy = y - cy; const dist = Math.hypot(dx, dy);
        let tx = 0, ty = 0, scale = 1;
        if (dist < MAG_RADIUS){
            const f = 1 - dist / MAG_RADIUS; // 0..1
            tx = (dx / dist || 0) * MAX_PULL * f;
            ty = (dy / dist || 0) * MAX_PULL * f;
            scale = 1 + 0.03 * f;
            el.classList.add('magnet-active');
        } else {
            el.classList.remove('magnet-active');
        }
        const st = magnetState.get(el) || { x:0, y:0, s:1 };
        st.x = lerp(st.x, tx, MAG_EASE); st.y = lerp(st.y, ty, MAG_EASE); st.s = lerp(st.s, scale, MAG_EASE);
        el.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.s})`;
        magnetState.set(el, st);
    };
    const magLoop = ()=>{ for (const el of magnets){ updateMagnet(el); } requestAnimationFrame(magLoop); };
    requestAnimationFrame(magLoop);
}
// Prefer a direct full-image view from the product card
function viewProductMedia(productId){
    const p = products.find(x=>x.id===productId) || sampleProducts.find(x=>x.id===productId);
    if (!p) return;
    const src = p.fullImageSrc || p.imageSrc;
    if (src){ openImageFullscreen(src, p.name); return; }
    // If no image available, inform the user
    showNotification('Preview not available for this item.', 'info');
}

// Full-screen image viewer (object-fit: contain)
function openImageFullscreen(src, alt='Preview'){
    if (!src) return;
    // If already open, first close
    const existing = document.querySelector('.image-fullscreen');
    if (existing) existing.remove();
    const wrap = document.createElement('div');
    wrap.className = 'image-fullscreen';
    wrap.innerHTML = `<div class="fs-backdrop"></div><img src="${src}" alt="${alt}">`;
    document.body.appendChild(wrap);
    const close = ()=>{ if (wrap && wrap.parentNode){ wrap.classList.remove('open'); setTimeout(()=>wrap.remove(), 150); document.removeEventListener('keydown', onEsc); } };
    const onEsc = (e)=>{ if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onEsc);
    wrap.addEventListener('click', close);
    // slight fade-in
    requestAnimationFrame(()=> wrap.classList.add('open'));
}

// ============================
// Preferences UI (Cursor + Reduce Motion)
// ============================
function setupPreferenceToggles(){
    // Preference UI removed permanently. Ensure any existing group is cleaned up.
    try {
        document.querySelectorAll('.pref-group').forEach(el => el.remove());
    } catch {}
    // No UI is injected anymore.
}

// ============================
// Lazy-load category tile media
// ============================
function lazyLoadTiles(){
    const tiles = Array.from(document.querySelectorAll('.tile-media[data-src]'));
    if (!tiles.length) return;
    const obs = new IntersectionObserver((entries, o)=>{
        entries.forEach(e=>{
            if (e.isIntersecting){
                const el = e.target; const src = el.getAttribute('data-src');
                if (src){ el.style.backgroundImage = `url('${src}')`; el.removeAttribute('data-src'); }
                o.unobserve(el);
            }
        });
    }, { rootMargin: '100px' });
    tiles.forEach(t=>obs.observe(t));
}

// ============================
// Structured Data (JSON-LD)
// ============================
function injectStructuredData(){
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;
    const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const site = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Hoshiya',
        'url': base
    };
    const search = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'url': base,
        'potentialAction': {
            '@type': 'SearchAction',
            'target': base + 'products.html?q={search_term_string}',
            'query-input': 'required name=search_term_string'
        }
    };
    [site, search].forEach(obj=>{
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.text = JSON.stringify(obj);
        head.appendChild(s);
    });
}
