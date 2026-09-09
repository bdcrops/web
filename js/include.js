(async function () {
    'use strict';
    const path = window.location.pathname;
    const isChildPage = path.includes('/pages/') || path.includes('/products/') || path.includes('/serivces/') || path.includes('/services/') || path.includes('/careers/') || path.includes('/tasks/');
    const root = isChildPage ? '../' : './';
    
    async function fetchHtml(url) {
        try {
            const res = await fetch(url, {cache:'no-store'});
            if (!res.ok) throw new Error(res.status+' '+url);
            const html = await res.text();
            return html.replaceAll('{{ROOT}}', root);
        } catch(e) { console.error('Include failed:', url, e); return ''; }
    }
    async function inject(id, url) {
        const el = document.getElementById(id);
        if (!el) return;
        const html = await fetchHtml(url);
        if (html) el.innerHTML = html;
    }
    
    await Promise.all([
        inject('site-header', root+'partials/header.html'),
        inject('site-footer', root+'partials/footer.html')
    ]);
    await inject('site-menu', root+'partials/menu.html');

    // --- MENU FIX: only one dropdown open, hide on leave ---
    let closeTimer = null;
    
    function closeAll() {
        document.querySelectorAll('#nav-list .has-dropdown.dd-open').forEach(el=>el.classList.remove('dd-open'));
    }
    
    function openOne(item) {
        closeAll();
        item.classList.add('dd-open');
    }

    const dropdowns = document.querySelectorAll('#nav-list .has-dropdown');
    dropdowns.forEach(item => {
        const trigger = item.querySelector('.dd-trigger');
        if (!trigger) return;
        
        // Desktop hover: open on enter
        item.addEventListener('mouseenter', () => {
            clearTimeout(closeTimer);
            openOne(item);
        });
        
        // Close on leave with small delay
        item.addEventListener('mouseleave', () => {
            closeTimer = setTimeout(() => closeAll(), 200);
        });
        
        // Click for mobile: toggle
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = item.classList.contains('dd-open');
            closeAll();
            if (!isOpen) item.classList.add('dd-open');
        });
    });

    // Close when clicking outside or on a link inside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#nav-list') && !e.target.closest('#menu-toggle')) {
            closeAll();
        }
    });
    
    document.querySelectorAll('#nav-list .dropdown a').forEach(a => {
        a.addEventListener('click', () => closeAll());
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll();
    });

    // Mobile hamburger
    const button = document.getElementById('menu-toggle');
    const menu = document.getElementById('nav-list');
    if (button && menu) {
        button.addEventListener('click', function(e){
            e.stopPropagation();
            const open = menu.classList.toggle('open');
            button.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (!open) closeAll();
        });
    }

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
})();
