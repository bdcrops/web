// Main.js - BDCrops Clean Version
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.feature-card, .demo-card, .step-card, .audience-card').forEach(el => fadeObs.observe(el));

const yEl = document.getElementById('year');
if (yEl) yEl.textContent = new Date().getFullYear();

const form = document.querySelector('.pilot-form');
if (form) {
    form.addEventListener('submit', (e) => {
        const action = form.getAttribute('action');
        if (action && action.includes('YOUR_FORMSPREE_ID')) {
            e.preventDefault();
            alert('Configure Formspree first.\n\n1. Go to formspree.io\n2. Create form\n3. Replace YOUR_FORMSPREE_ID in index.html');
        }
    });
}

// Banner Slider - Single implementation
(function initSlider() {
    const slider = document.querySelector('.banner-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    if (!slides.length) return;

    let current = 0;
    const total = slides.length;
    const interval = 4000;

    function show(idx) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[idx].classList.add('active');
        if (dots[idx]) dots[idx].classList.add('active');
        current = idx;
    }

    function next() {
        show((current + 1) % total);
    }

    let timer = setInterval(next, interval);

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(timer);
            show(i);
            timer = setInterval(next, interval);
        });
    });

    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
        timer = setInterval(next, interval);
    });
})();
