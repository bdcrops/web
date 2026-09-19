(async function () {
    const path = window.location.pathname;
    const isChildPage = path.includes('/pages/') || path.includes('/products/') || path.includes('/serivces/') || path.includes('/careers/');
    const root = isChildPage ? '../' : './';
    
    async function fetchHtml(url) {
        try { 
            const res = await fetch(url, {cache:'no-store'}); 
            if (!res.ok) return ''; 
            const html = await res.text(); 
            return html.replaceAll('{{ROOT}}', root); 
        } catch(e) { 
            console.error('Failed to fetch', url, e);
            return ''; 
        }
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
    
    // FIXED: Robust closeAll that ensures only one dropdown open
    function closeAll() { 
        document.querySelectorAll('.has-dropdown.dd-open').forEach(el => {
            el.classList.remove('dd-open');
        });
    }
    
    function closeAllExcept(exceptEl) {
        document.querySelectorAll('.has-dropdown.dd-open').forEach(el => {
            if (el !== exceptEl) el.classList.remove('dd-open');
        });
    }
    
    // Initial close
    closeAll(); 
    setTimeout(closeAll, 50); 
    setTimeout(closeAll, 300);
    
    // Setup dropdowns after injection
    const navList = document.getElementById('nav-list');
    if (!navList) return;
    
    const dropdownItems = navList.querySelectorAll('.has-dropdown');
    
    dropdownItems.forEach(item => {
        const trigger = item.querySelector('.dd-trigger'); 
        if (!trigger) return;
        
        let leaveTimeout;
        
        // Mouse enter - close others, open this
        item.addEventListener('mouseenter', () => {
            clearTimeout(leaveTimeout);
            closeAllExcept(item);
            item.classList.add('dd-open');
        });
        
        // Mouse leave - close with small delay to allow moving to dropdown content
        item.addEventListener('mouseleave', () => {
            leaveTimeout = setTimeout(() => {
                // Only close if not hovering the item or its dropdown
                if (!item.matches(':hover')) {
                    item.classList.remove('dd-open');
                }
            }, 150);
        });
        
        // Click toggle - for mobile and accessibility
        trigger.addEventListener('click', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            const isOpen = item.classList.contains('dd-open');
            if (isOpen) {
                item.classList.remove('dd-open');
            } else {
                closeAllExcept(item);
                item.classList.add('dd-open');
            }
        });
    });
    
    // Click outside closes all
    document.addEventListener('click', (e) => { 
        if (!e.target.closest('#nav-list') && !e.target.closest('#menu-toggle')) {
            closeAll();
        }
    });
    
    // Scroll, hash change, escape closes all
    document.addEventListener('scroll', closeAll, {passive:true});
    window.addEventListener('hashchange', closeAll);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
    
    // Clicking any dropdown link closes menu
    navList.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown a')) {
            setTimeout(closeAll, 100);
        }
    });
    
    // Mobile menu toggle
    const button = document.getElementById('menu-toggle'); 
    const menu = document.getElementById('nav-list');
    if (button && menu) { 
        button.addEventListener('click', function(e){ 
            e.stopPropagation(); 
            const open = menu.classList.toggle('open'); 
            button.classList.toggle('is-open', open); 
            if (!open) closeAll(); 
        }); 
    }
    
    const year = document.getElementById('year'); 
    if (year) year.textContent = new Date().getFullYear();
})();
