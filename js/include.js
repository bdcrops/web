(async function () {
    const path = window.location.pathname;
    const isChildPage = path.includes('/pages/') || path.includes('/products/') || path.includes('/serivces/') || path.includes('/careers/');
    const root = isChildPage ? '../' : './';
    async function fetchHtml(url) {
        try { const res = await fetch(url, {cache:'no-store'}); if (!res.ok) return ''; const html = await res.text(); return html.replaceAll('{{ROOT}}', root); } catch(e) { return ''; }
    }
    async function inject(id, url) {
        const el = document.getElementById(id); if (!el) return; const html = await fetchHtml(url); if (html) el.innerHTML = html;
    }
    await Promise.all([inject('site-header', root+'partials/header.html'), inject('site-footer', root+'partials/footer.html')]);
    await inject('site-menu', root+'partials/menu.html');
    function closeAll() { document.querySelectorAll('#nav-list .has-dropdown.dd-open').forEach(el=>el.classList.remove('dd-open')); }
    closeAll(); setTimeout(closeAll, 50); setTimeout(closeAll, 300);
    document.querySelectorAll('#nav-list .has-dropdown').forEach(item => {
        const trigger = item.querySelector('.dd-trigger'); if (!trigger) return;
        item.addEventListener('mouseenter', () => { closeAll(); item.classList.add('dd-open'); });
        item.addEventListener('mouseleave', () => { closeAll(); });
        trigger.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (item.classList.contains('dd-open')) closeAll(); else { closeAll(); item.classList.add('dd-open'); } });
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#nav-list') && !e.target.closest('#menu-toggle')) closeAll(); });
    document.addEventListener('scroll', closeAll, {passive:true});
    window.addEventListener('hashchange', closeAll);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
    document.querySelectorAll('#nav-list .dropdown a').forEach(a => a.addEventListener('click', closeAll));
    const button = document.getElementById('menu-toggle'); const menu = document.getElementById('nav-list');
    if (button && menu) { button.addEventListener('click', function(e){ e.stopPropagation(); const open = menu.classList.toggle('open'); button.classList.toggle('is-open', open); if (!open) closeAll(); }); }
    const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
})();