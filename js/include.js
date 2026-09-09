(async function () {
    'use strict';
    const path = window.location.pathname;
    const isChildPage = path.includes('/pages/') || path.includes('/products/') || path.includes('/serivces/') || path.includes('/services/') || path.includes('/careers/');
    const root = isChildPage ? '../' : './';
    async function fetchHtml(url) {
        const res = await fetch(url, {cache:'no-store'});
        if (!res.ok) throw new Error(res.status+' '+url);
        const html = await res.text();
        return html.replaceAll('{{ROOT}}', root);
    }
    async function inject(id, url) {
        const el = document.getElementById(id);
        if (!el) return;
        try { el.innerHTML = await fetchHtml(url); }
        catch (e) { console.error('Include failed:', e); }
    }
    await Promise.all([
        inject('site-header', root+'partials/header.html'),
        inject('site-footer', root+'partials/footer.html')
    ]);
    await inject('site-menu', root+'partials/menu.html');

    function closeAll() {
        document.querySelectorAll('#nav-list .has-dropdown.dd-open').forEach(el=>el.classList.remove('dd-open'));
    }

    // Dropdown triggers - only one open at a time
    document.querySelectorAll('#nav-list .dd-trigger').forEach(trigger=>{
        trigger.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            const item = this.closest('.has-dropdown');
            const wasOpen = item.classList.contains('dd-open');
            closeAll();
            if (!wasOpen) item.classList.add('dd-open');
        });
    });

    // Click on dropdown links closes menu
    document.querySelectorAll('#nav-list .dropdown a').forEach(a=>{
        a.addEventListener('click', ()=> closeAll());
    });

    // Click outside closes all
    document.addEventListener('click', function(e){
        if (!e.target.closest('#nav-list') && !e.target.closest('#menu-toggle')) {
            closeAll();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') closeAll();
    });

    // Active page
    const active = document.body.dataset.page || '';
    if (active) {
        const activeLink = document.querySelector('#nav-list [data-page="'+active+'"]');
        if (activeLink) {
            activeLink.classList.add('active');
            const parent = activeLink.closest('.has-dropdown');
            if (parent) parent.classList.add('active-parent');
        }
    }

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
        menu.addEventListener('click', function(e){
            const link = e.target.closest('a');
            if (!link) return;
            if (link.classList.contains('dd-trigger')) return;
            menu.classList.remove('open');
            button.classList.remove('is-open');
            button.setAttribute('aria-expanded','false');
        });
    }

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
})();
