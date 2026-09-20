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
    
    const navList = document.getElementById('nav-list');
    if (!navList) return;

    // CRITICAL FIX: Force hide via JS, not just class
    function hideDropdown(dd) {
        if (!dd) return;
        dd.style.display = 'none';
        dd.style.opacity = '0';
        dd.style.visibility = 'hidden';
        dd.style.pointerEvents = 'none';
    }
    function showDropdown(dd) {
        if (!dd) return;
        if (dd.classList.contains('mega-dropdown')) {
            dd.style.display = 'grid';
        } else {
            dd.style.display = 'block';
        }
        dd.style.opacity = '1';
        dd.style.visibility = 'visible';
        dd.style.pointerEvents = 'auto';
    }

    function closeAll() { 
        document.querySelectorAll('.has-dropdown.dd-open').forEach(el => {
            el.classList.remove('dd-open');
            const dd = el.querySelector('.dropdown');
            hideDropdown(dd);
        });
    }
    
    function closeAllExcept(exceptEl) {
        document.querySelectorAll('.has-dropdown.dd-open').forEach(el => {
            if (el !== exceptEl) {
                el.classList.remove('dd-open');
                const dd = el.querySelector('.dropdown');
                hideDropdown(dd);
            }
        });
    }

    // Initial force hide all
    document.querySelectorAll('.has-dropdown .dropdown').forEach(hideDropdown);
    closeAll(); 
    
    const dropdownItems = navList.querySelectorAll('.has-dropdown');
    let activeTimeout = null;
    
    dropdownItems.forEach(item => {
        const trigger = item.querySelector('.dd-trigger'); 
        const dropdown = item.querySelector('.dropdown');
        if (!trigger || !dropdown) return;
        
        // Ensure initially hidden
        hideDropdown(dropdown);
        
        // Mouse enter - open this, close others
        item.addEventListener('mouseenter', () => {
            if (activeTimeout) clearTimeout(activeTimeout);
            closeAllExcept(item);
            item.classList.add('dd-open');
            showDropdown(dropdown);
        });
        
        // Mouse leave - close with delay
        item.addEventListener('mouseleave', (e) => {
            // Check if mouse is moving to dropdown itself
            const related = e.relatedTarget;
            if (related && item.contains(related)) return;
            
            activeTimeout = setTimeout(() => {
                if (!item.matches(':hover')) {
                    item.classList.remove('dd-open');
                    hideDropdown(dropdown);
                }
            }, 200);
        });
        
        // Keep dropdown open when hovering dropdown itself
        dropdown.addEventListener('mouseenter', () => {
            if (activeTimeout) clearTimeout(activeTimeout);
        });
        dropdown.addEventListener('mouseleave', () => {
            activeTimeout = setTimeout(() => {
                item.classList.remove('dd-open');
                hideDropdown(dropdown);
            }, 200);
        });
        
        // Click toggle for mobile
        trigger.addEventListener('click', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            const isOpen = item.classList.contains('dd-open');
            if (isOpen) {
                item.classList.remove('dd-open');
                hideDropdown(dropdown);
            } else {
                closeAllExcept(item);
                item.classList.add('dd-open');
                showDropdown(dropdown);
            }
        });
    });
    
    // Click outside closes all
    document.addEventListener('click', (e) => { 
        if (!e.target.closest('#nav-list') && !e.target.closest('#menu-toggle') && !e.target.closest('.has-dropdown')) {
            closeAll();
        }
    });
    
    // Scroll closes
    let scrollTimeout;
    document.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(closeAll, 100);
    }, {passive:true});
    
    window.addEventListener('hashchange', closeAll);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
    
    navList.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown a')) {
            setTimeout(closeAll, 150);
        }
    });
    
    // Mobile toggle
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
