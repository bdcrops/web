'use strict';

const ROUTES = {
    '/'         : '/pages/home.html',
    '/about'    : '/pages/about.html',
    '/services' : '/pages/services.html',
    '/contact'  : '/pages/contact.html',
    '/8band-report'     : '/pages/8band-report.html',
    '/aquacrop'         : '/pages/aquacrop.html',
    '/billboard'        : '/pages/billboard-analytics.html',
    '/use-case/flood'   : '/pages/use-case-flood.html',
    '/use-case/jute'    : '/pages/use-case-jute.html',
    '/use-case/rice'    : '/pages/use-case-rice.html',
    '/use-case/vegetable': '/pages/use-case-vegetable.html',
    '/8band-report'     : '/pages/8band-report.html',
    '/aquacrop'         : '/pages/aquacrop.html',
    '/billboard'        : '/pages/billboard-analytics.html',
    '/use-case/flood'   : '/pages/use-case-flood.html',
    '/use-case/jute'    : '/pages/use-case-jute.html',
    '/use-case/rice'    : '/pages/use-case-rice.html',
    '/use-case/vegetable': '/pages/use-case-vegetable.html',
    '/8band-report'     : '/pages/8band-report.html',
    '/aquacrop'         : '/pages/aquacrop.html',
    '/billboard'        : '/pages/billboard-analytics.html',
    '/use-case/flood'   : '/pages/use-case-flood.html',
    '/use-case/jute'    : '/pages/use-case-jute.html',
    '/use-case/rice'    : '/pages/use-case-rice.html',
    '/use-case/vegetable': '/pages/use-case-vegetable.html',
};
const DEFAULT_ROUTE = '/pages/home.html';
const FORM_ENDPOINT = 'https://formspree.io/f/xdkodgbw';

function resolvePage() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    return ROUTES[path] || DEFAULT_ROUTE;
}

async function fetchHTML(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
    return res.text();
}

async function injectMeta() {
    try {
        const html = await fetchHTML('/meta.html');
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        tmp.querySelectorAll('link, meta, title').forEach(el => document.head.appendChild(el.cloneNode(true)));
        tmp.querySelectorAll('script').forEach(old => {
            const s = document.createElement('script');
            for (const a of old.attributes) s.setAttribute(a.name, a.value);
            s.textContent = old.textContent;
            document.head.appendChild(s);
        });
    } catch (e) { console.warn('meta.html failed:', e); }
}

function applyPageMeta(doc) {
    const get = n => { const el = doc.querySelector('meta[name="' + n + '"]'); return el ? el.content : null; };
    const title = get('page:title');
    const desc  = get('page:description');
    const canon = get('page:canonical');
    if (title) {
        document.title = title;
        const og = document.querySelector('meta[property="og:title"]');
        if (og) og.setAttribute('content', title);
    }
    if (desc) {
        const d = document.querySelector('meta[name="description"]');
        if (d) d.setAttribute('content', desc);
    }
    if (canon) {
        const c = document.querySelector('link[rel="canonical"]');
        if (c) c.setAttribute('href', canon);
    }
}

async function loadComponent(url, slotId) {
    try {
        const html = await fetchHTML(url);
        const slot = document.getElementById(slotId);
        if (slot) slot.innerHTML = html;
    } catch (e) { console.warn(url + ' failed:', e); }
}

async function loadPage(pageUrl) {
    const slot = document.getElementById('slot-page');
    try {
        const html = await fetchHTML(pageUrl);
        const doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
        const wrap = doc.body.querySelector('div');
        applyPageMeta(wrap);
        wrap.querySelectorAll('meta[name^="page:"]').forEach(el => el.remove());
        if (slot) slot.innerHTML = wrap.innerHTML;
    } catch (e) {
        if (slot) slot.innerHTML = '<section style="padding:140px 24px;text-align:center;"><h2>Page not found</h2><a href="/">Home</a></section>';
    }
}

function initHeaderScroll() {
    const h = document.querySelector('.site-header');
    if (h) window.addEventListener('scroll', () => h.classList.toggle('scrolled', window.pageYOffset > 50), { passive: true });
}

function initMobileNav() {
    const t = document.getElementById('mobile-toggle');
    const n = document.getElementById('mobile-nav');
    const o = document.getElementById('mobile-overlay');
    if (!t || !n || !o) return;
    const open  = () => { t.classList.add('open'); n.classList.add('open'); o.classList.add('show'); document.body.style.overflow='hidden'; };
    const close = () => { t.classList.remove('open'); n.classList.remove('open'); o.classList.remove('show'); document.body.style.overflow=''; };
    t.addEventListener('click', () => n.classList.contains('open') ? close() : open());
    o.addEventListener('click', close);
    n.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => e.key === 'Escape' && close());
}

function initSlider() {
    const s = document.getElementById('banner-slider');
    if (!s) return;
    const slides = s.querySelectorAll('.slide');
    const dots = s.querySelectorAll('.dot');
    let cur = 0, timer = null;
    const go = i => { slides[cur].classList.remove('active'); dots[cur].classList.remove('active'); cur = i; slides[cur].classList.add('active'); dots[cur].classList.add('active'); };
    const next = () => go((cur + 1) % slides.length);
    const start = () => { timer = setInterval(next, 5000); };
    dots.forEach(d => d.addEventListener('click', () => { go(+d.dataset.slide); clearInterval(timer); start(); }));
    s.addEventListener('mouseenter', () => clearInterval(timer));
    s.addEventListener('mouseleave', start);
    if (slides.length > 1) start();
}

function initScrollAnimations() {
    const els = document.querySelectorAll('.fade-in');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => obs.observe(el));
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"], a[href*="/#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            const hash = href.includes('#') ? '#' + href.split('#')[1] : null;
            if (!hash || hash === '#') return;
            const target = document.querySelector(hash);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
        });
    });
}

function initForms() {
    document.querySelectorAll('#pilot-form, #contact-form').forEach(form => {
        const statusEl = form.querySelector('.pilot-status');
        const submitEl = form.querySelector('button[type="submit"]');
        if (!statusEl || !submitEl) return;
        const set = (t, m) => { statusEl.className = 'pilot-status ' + t; statusEl.textContent = m; statusEl.style.display = 'block'; };
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const hp = form.querySelector('[name="_honeypot"]');
            if (hp && hp.value) return;
            submitEl.disabled = true; submitEl.textContent = 'Sending...';
            set('loading', 'Sending...');
            try {
                const r = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
                if (!r.ok) throw new Error('failed');
                set('success', 'Sent! Reply within 24 hours.');
                form.reset();
                submitEl.textContent = 'Sent';
                if (typeof gtag === 'function') gtag('event', 'form_submit', { form_id: form.id });
                setTimeout(() => { submitEl.disabled = false; submitEl.textContent = 'Send'; }, 5000);
            } catch (err) {
                set('error', 'Failed. Email matin@bdcrops.com');
                submitEl.disabled = false; submitEl.textContent = 'Try Again';
            }
        });
    });
}

function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
}

async function init() {
    await Promise.all([
        injectMeta(),
        loadComponent('/components/header.html', 'slot-header'),
        loadComponent('/components/footer.html', 'slot-footer'),
        loadPage(resolvePage()),
    ]);
    initHeaderScroll();
    initMobileNav();
    initSlider();
    initScrollAnimations();
    initSmoothScroll();
    initForms();
    initFooterYear();
}

document.addEventListener('DOMContentLoaded', init);
