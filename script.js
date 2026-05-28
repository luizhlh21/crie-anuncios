/* Enhanced front-end script: accessibility, tracking and performance
   - Pushes tracking events to dataLayer (GTM/GA4)
   - Adds scroll-depth tracking
   - Tracks CTA clicks and labels
   - Improves mobile menu accessibility
*/

// Short helpers
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Mobile Menu Toggle (accessible)
const mobileMenuBtn = $('#mobileMenuBtn');
const navLinks = $('.nav-links');
if (mobileMenuBtn) {
    mobileMenuBtn.setAttribute('aria-expanded','false');
    mobileMenuBtn.addEventListener('click', () => {
        const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', String(!expanded));
        navLinks.style.display = expanded ? 'none' : 'flex';
    });
}

// Close mobile menu when a link is clicked (improve UX for small devices)
$$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navLinks.style.display = 'none';
            mobileMenuBtn && mobileMenuBtn.setAttribute('aria-expanded','false');
        }
    });
});

// FAQ Toggle (keeps previous signature used in HTML)
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer');

    // Close other items
    $$('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            item.querySelector('.faq-answer').classList.remove('active');
        }
    });

    faqItem.classList.toggle('active');
    answer.classList.toggle('active');
}

// Modal helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal on overlay click or Escape
window.addEventListener('click', function(e){
    if (e.target.classList && e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});
document.addEventListener('keydown', function(e){ if (e.key === 'Escape') { $$('.modal.active').forEach(m=>{m.classList.remove('active');}); document.body.style.overflow='auto'; }});

// Smooth scroll for anchors
$$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Intersection Observer for reveal animations (lightweight)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
$$('.benefit-card').forEach(card => observer.observe(card));

// ---------------------------
// Tracking (GTM / dataLayer)
// ---------------------------
window.dataLayer = window.dataLayer || [];

function pushEvent(eventName, payload = {}) {
    window.dataLayer.push(Object.assign({ event: eventName }, payload));
}

// Track CTA clicks and fire GA/Ads via dataLayer
$$('.cta-button').forEach(btn => {
    btn.addEventListener('click', function(e){
        const label = this.dataset.cta || this.textContent.trim().slice(0,40);
        pushEvent('cta_click', { cta_label: label, cta_url: this.href });

        // Example gtag conversion (AW) — replace label if needed or implement via GTM
        if (window.gtag && this.dataset.cta !== 'no-conversion') {
            try {
                gtag('event', 'conversion', { 'send_to': 'AW-11378859517/CONVERSION_LABEL', 'event_callback': function(){ /* callback after conversion */ } });
            } catch (err) { /* silent */ }
        }
    });
});

// Scroll depth tracking (25/50/75/100)
let scrollMilestones = [25,50,75,100];
let passed = new Set();
function handleScrollDepth(){
    const pct = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
    scrollMilestones.forEach(m => {
        if (pct >= m && !passed.has(m)){
            passed.add(m);
            pushEvent('scroll_depth', { percent: m });
        }
    });
}
window.addEventListener('scroll', throttle(handleScrollDepth, 300));

// Throttle utility
function throttle(fn, wait){
    let last = 0; return function(...args){
        const now = Date.now(); if (now - last >= wait){ last = now; fn.apply(this,args); }
    };
}

// Basic enhanced conversions placeholder: capture email from URL or forms and push to dataLayer
function initEnhancedConversions(){
    // Example: if URL contains ?email=you@example.com -> push to dataLayer for GTM to handle hashing
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) pushEvent('enhanced_conversion_data', { email: email });

    // If site had a purchase form, hook into submit to send hashed email via GTM
    // (GTM server-side or tag template must be configured to use this)
}
initEnhancedConversions();

// Accessibility: keyboard nav outlines
document.addEventListener('keydown', function(e){ if (e.key === 'Tab') document.body.classList.add('keyboard-nav'); });
document.addEventListener('mousedown', function(){ document.body.classList.remove('keyboard-nav'); });
const focusStyle = document.createElement('style'); focusStyle.textContent = 'body.keyboard-nav *:focus{ outline:2px solid rgba(99,102,241,0.9)!important; outline-offset:2px; }'; document.head.appendChild(focusStyle);

// Console friendly message minimized
if (window.console) console.log('MarketingPro - Landing optimized');