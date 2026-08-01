(async function () {
    const inPages = window.location.pathname.includes('/pages/');
    const root    = inPages ? '../' : './';

    async function fetchHtml(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        return (await res.text()).replaceAll('{{ROOT}}', root);
    }
    async function inject(id, url) {
        const el = document.getElementById(id);
        if (!el) return;
        try { el.innerHTML = await fetchHtml(url); }
        catch (e) { console.error('include failed:', e); }
    }

    // Load header + footer
    await Promise.all([
        inject('site-header', root + 'partials/header.html'),
        inject('site-footer', root + 'partials/footer.html'),
    ]);
    // Inject menu inside header's <nav id="site-menu">
    await inject('site-menu', root + 'partials/menu.html');

    // Highlight active nav
    const active = document.body.dataset.page || '';
    if (active) {
        const link = document.querySelector(`#nav-list [data-page="${active}"]`);
        if (link) link.classList.add('active');
    }
    // Hamburger toggle
    const btn  = document.getElementById('menu-toggle');
    const menu = document.getElementById('nav-list');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            btn.classList.toggle('is-open', open);
            btn.setAttribute('aria-expanded', open);
        });
        menu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                menu.classList.remove('open');
                btn.classList.remove('is-open');
                btn.setAttribute('aria-expanded', false);
            }
        });
    }
    // Dropdown toggle (mobile: click to expand · desktop: CSS hover handles it)
    document.querySelectorAll('#nav-list .dd-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            // Only intercept on mobile (< 900px) OR when the link href is "#"
            if (window.innerWidth <= 900 || trigger.getAttribute('href') === '#') {
                e.preventDefault();
                const li = trigger.closest('.has-dropdown');
                // Close other open dropdowns
                document.querySelectorAll('#nav-list .has-dropdown.dd-open').forEach(el => {
                    if (el !== li) el.classList.remove('dd-open');
                });
                li.classList.toggle('dd-open');
            }
        });
    });

    // Click outside → close all dropdowns (desktop only)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#nav-list')) {
            document.querySelectorAll('#nav-list .has-dropdown.dd-open')
                    .forEach(el => el.classList.remove('dd-open'));
        }
    });

    // Year in footer
    const yr = document.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();
})();
