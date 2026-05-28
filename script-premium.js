// ============================================
// PREMIUM LANDING PAGE - COMPLETE JAVASCRIPT
// High Conversion Focus | Advanced Interactions
// ============================================

// DOM Query Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ============================================
// MOBILE MENU TOGGLE
// ============================================

const initMobileMenu = () => {
    const mobileMenuBtn = $('#mobileMenuBtn');
    const navLinks = $('.nav-links');
    
    if (!mobileMenuBtn) return;
    
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
        navLinks.style.display = expanded ? 'none' : 'flex';
    });
    
    // Close menu when link clicked
    $$('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-wrapper')) {
            navLinks.style.display = 'none';
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
};

// ============================================
// FAQ TOGGLE WITH SMOOTH ANIMATION
// ============================================

const initFAQ = () => {
    $$('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            $$('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').classList.remove('active');
                }
            });
            
            // Toggle current item
            faqItem.classList.toggle('active');
            answer.classList.toggle('active');
        });
    });
};

// ============================================
// MODAL MANAGEMENT
// ============================================

const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

// Close modal on overlay click or Escape
window.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        $$('.modal.active').forEach(m => {
            m.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }
});

// ============================================
// SMOOTH SCROLL FOR ANCHORS
// ============================================

const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
};

// ============================================
// INTERSECTION OBSERVER - SCROLL REVEAL
// ============================================

const initScrollReveal = () => {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    $$('.benefit-card-modern, .testimonial-card, .profile-card, .stat-card, .pillar, .method-stats, .mockup-showcase').forEach(el => {
        observer.observe(el);
    });
};

// ============================================
// ANALYTICS & TRACKING (GTM/GA4)
// ============================================

window.dataLayer = window.dataLayer || [];

function pushEvent(eventName, payload = {}) {
    window.dataLayer.push(Object.assign({ event: eventName }, payload));
}

// Track CTA clicks
const initCTATracking = () => {
    $$('.cta-button, .cta-primary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const label = this.dataset.cta || this.textContent.trim().slice(0, 50);
            const section = this.closest('section')?.id || 'unknown';
            
            pushEvent('cta_click', {
                cta_label: label,
                cta_section: section,
                cta_url: this.href
            });
            
            // Google Ads conversion tracking (if gtag available)
            if (window.gtag) {
                try {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-11378859517/CONVERSION_LABEL'
                    });
                } catch (err) { /* silent */ }
            }
        });
    });
};

// Scroll depth tracking
const initScrollDepthTracking = () => {
    let scrollMilestones = [25, 50, 75, 100];
    let passed = new Set();
    
    function trackScrollDepth() {
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const pct = Math.round(((scrollTop + windowHeight) / docHeight) * 100);
        
        scrollMilestones.forEach(milestone => {
            if (pct >= milestone && !passed.has(milestone)) {
                passed.add(milestone);
                pushEvent('scroll_depth', { percent: milestone });
            }
        });
    }
    
    window.addEventListener('scroll', throttle(trackScrollDepth, 500));
};

// Throttle utility
function throttle(fn, wait) {
    let last = 0;
    return function(...args) {
        const now = Date.now();
        if (now - last >= wait) {
            last = now;
            fn.apply(this, args);
        }
    };
}

// Page view time tracking
const initTimeTracking = () => {
    let sessionStartTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - sessionStartTime) / 1000);
        pushEvent('page_time', { seconds: timeOnPage });
    });
};

// ============================================
// ANIMATED COUNTER (For Statistics)
// ============================================

const initAnimatedCounters = () => {
    const counters = $$('.proof-number, .stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const suffix = element.textContent.replace(/\d+/g, '');
        const increment = Math.ceil(target / 50);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + suffix;
                clearInterval(timer);
            } else {
                element.textContent = current + suffix;
            }
        }, 30);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
};

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================

const initRippleEffect = () => {
    $$('.cta-button, .cta-primary').forEach(btn => {
        btn.addEventListener('mousedown', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
};

// ============================================
// FORM VALIDATION & SUBMISSION
// ============================================

const initFormHandling = () => {
    $$('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Push to dataLayer
            pushEvent('form_submission', {
                form_name: this.id || this.name,
                form_data: data
            });
            
            // Simulate submission (replace with actual endpoint)
            console.log('Form submitted:', data);
            alert('Obrigado! Sua mensagem foi enviada.');
            this.reset();
        });
    });
};

// ============================================
// LAZY LOADING IMAGES
// ============================================

const initLazyLoading = () => {
    const images = $$('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
};

// ============================================
// ACCESSIBILITY IMPROVEMENTS
// ============================================

const initAccessibility = () => {
    // Keyboard navigation for modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-nav');
    });
    
    // Add focus styles
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        body.keyboard-nav *:focus {
            outline: 2px solid rgba(99, 102, 241, 0.9) !important;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyle);
};

// ============================================
// PERFORMANCE MONITORING
// ============================================

const initPerformanceMonitoring = () => {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                pushEvent('page_load_time', { time_ms: pageLoadTime });
            }, 0);
        });
    }
};

// ============================================
// ENHANCED CONVERSIONS (Email Capture)
// ============================================

const initEnhancedConversions = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (email) {
        pushEvent('enhanced_conversion_data', { email: email });
    }
};

// ============================================
// POPUP / NOTIFICATION SYSTEM (Optional)
// ============================================

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 999;
        animation: slideInUp 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initMobileMenu();
    initFAQ();
    initSmoothScroll();
    initScrollReveal();
    initCTATracking();
    initScrollDepthTracking();
    initTimeTracking();
    initAnimatedCounters();
    initRippleEffect();
    initFormHandling();
    initLazyLoading();
    initAccessibility();
    initPerformanceMonitoring();
    initEnhancedConversions();
    
    console.log('✅ Premium Landing Page initialized successfully');
});

// ============================================
// ADDITIONAL UTILITIES
// ============================================

// Add CSS animations to document
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);
