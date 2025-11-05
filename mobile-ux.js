/**
 * Mobile UX Enhancement Script
 * Adds mobile-specific interactions and improvements
 */

(function() {
    'use strict';

    // ========================================================================
    // MOBILE DETECTION
    // ========================================================================
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile || isTouch) {
        document.body.classList.add('is-mobile', 'is-touch');
    }

    // ========================================================================
    // PREVENT iOS DOUBLE-TAP ZOOM
    // ========================================================================
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // ========================================================================
    // MOBILE MENU ENHANCEMENTS
    // ========================================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (menuToggle && navMenu) {
        // Toggle menu
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');
            menuToggle.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('open')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('open');
                menuToggle.classList.remove('active');
                body.classList.remove('menu-open');
                body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('open') && 
                !navMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                navMenu.classList.remove('open');
                menuToggle.classList.remove('active');
                body.classList.remove('menu-open');
                body.style.overflow = '';
            }
        });
    }

    // ========================================================================
    // SMOOTH SCROLL WITH MOBILE OPTIMIZATION
    // ========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const headerOffset = isMobile ? 70 : 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================================================
    // TOUCH SWIPE DETECTION FOR CAROUSEL
    // ========================================================================
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;

        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            isDown = true;
        }, { passive: true });

        carousel.addEventListener('touchend', function() {
            isDown = false;
        }, { passive: true });

        carousel.addEventListener('touchmove', function(e) {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        }, { passive: false });
    });

    // ========================================================================
    // LAZY LOADING IMAGES (Mobile Optimization)
    // ========================================================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: isMobile ? '50px' : '100px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ========================================================================
    // ORIENTATION CHANGE HANDLER
    // ========================================================================
    window.addEventListener('orientationchange', function() {
        // Close mobile menu on orientation change
        if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            menuToggle.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
        }

        // Recalculate heights after orientation change
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });

    // ========================================================================
    // PREVENT ZOOM ON INPUT FOCUS (iOS)
    // ========================================================================
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (isMobile) {
                const fontSize = window.getComputedStyle(this).fontSize;
                if (parseFloat(fontSize) < 16) {
                    this.style.fontSize = '16px';
                }
            }
        });
    });

    // ========================================================================
    // ADD TOUCH FEEDBACK TO BUTTONS
    // ========================================================================
    const touchElements = document.querySelectorAll('button, .btn, a.btn, .product-card');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });

        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 100);
        }, { passive: true });

        element.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });

    // ========================================================================
    // MOBILE VIEWPORT HEIGHT FIX (for 100vh issues)
    // ========================================================================
    function setMobileVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    if (isMobile) {
        setMobileVH();
        window.addEventListener('resize', setMobileVH);
        window.addEventListener('orientationchange', setMobileVH);
    }

    // ========================================================================
    // REDUCE MOTION FOR USERS WHO PREFER IT
    // ========================================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        document.body.classList.add('reduce-motion');
    }

    prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    });

    // ========================================================================
    // CART PANEL MOBILE IMPROVEMENTS
    // ========================================================================
    const cartPanel = document.querySelector('.cart-panel');
    const cartBtn = document.querySelector('.cart-btn');
    const cartClose = document.querySelector('.cart-close');

    if (cartPanel && isMobile) {
        // Swipe to close cart on mobile
        let cartStartY = 0;
        let cartCurrentY = 0;

        cartPanel.addEventListener('touchstart', function(e) {
            cartStartY = e.touches[0].clientY;
        }, { passive: true });

        cartPanel.addEventListener('touchmove', function(e) {
            cartCurrentY = e.touches[0].clientY;
            const diff = cartCurrentY - cartStartY;

            if (diff > 0 && cartPanel.scrollTop === 0) {
                e.preventDefault();
                cartPanel.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: false });

        cartPanel.addEventListener('touchend', function() {
            const diff = cartCurrentY - cartStartY;
            
            if (diff > 100) {
                cartPanel.classList.remove('open');
                body.style.overflow = '';
            }
            
            cartPanel.style.transform = '';
            cartStartY = 0;
            cartCurrentY = 0;
        }, { passive: true });
    }

    // ========================================================================
    // NETWORK DETECTION (Show message on slow connection)
    // ========================================================================
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            const effectiveType = connection.effectiveType;
            
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                console.log('Slow connection detected. Optimizing experience...');
                document.body.classList.add('slow-connection');
                
                // Disable animations on slow connections
                document.body.classList.add('reduce-motion');
            }
        }
    }

    // ========================================================================
    // ADD VISUAL FEEDBACK FOR LOADING STATES
    // ========================================================================
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
        });
    });

    // ========================================================================
    // LOG MOBILE FEATURES
    // ========================================================================
    console.log('Mobile UX Enhanced:', {
        isMobile,
        isTouch,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        features: [
            'Touch gestures',
            'Smooth scrolling',
            'Menu auto-close',
            'Orientation handling',
            'iOS zoom prevention',
            'Safe area support'
        ]
    });

})();
