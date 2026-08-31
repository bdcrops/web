(async function () {
    'use strict';

    const path = window.location.pathname;

    /*
     * Site root:
     *
     * /index.html
     *      -> ./
     *
     * /pages/about.html
     * /products/index.html
     * /products/dubbing-ai.html
     *      -> ../
     */
    const isChildPage =
        path.includes('/pages/') ||
        path.includes('/products/');

    const root = isChildPage ? '../' : './';


    async function fetchHtml(url) {
        const response = await fetch(url, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(
                response.status + ' ' + url
            );
        }

        const html = await response.text();

        return html.replaceAll(
            '{{ROOT}}',
            root
        );
    }


    async function inject(id, url) {
        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        try {
            element.innerHTML =
                await fetchHtml(url);
        }
        catch (error) {
            console.error(
                'Include failed:',
                error
            );
        }
    }


    /*
     * Load header/footer.
     */
    await Promise.all([
        inject(
            'site-header',
            root + 'partials/header.html'
        ),

        inject(
            'site-footer',
            root + 'partials/footer.html'
        )
    ]);


    /*
     * Header now exists.
     * Inject menu into:
     *
     * <nav id="site-menu"></nav>
     */
    await inject(
        'site-menu',
        root + 'partials/menu.html'
    );


    /*
     * Active menu.
     *
     * Example:
     * <body data-page="products">
     */
    const active =
        document.body.dataset.page || '';

    if (active) {
        const activeLink =
            document.querySelector(
                '#nav-list [data-page="' +
                active +
                '"]'
            );

        if (activeLink) {
            activeLink.classList.add(
                'active'
            );

            const parent =
                activeLink.closest(
                    '.has-dropdown'
                );

            if (parent) {
                parent.classList.add(
                    'active-parent'
                );
            }
        }
    }


    /*
     * Mobile hamburger.
     */
    const button =
        document.getElementById(
            'menu-toggle'
        );

    const menu =
        document.getElementById(
            'nav-list'
        );

    if (button && menu) {

        button.addEventListener(
            'click',
            function () {

                const open =
                    menu.classList.toggle(
                        'open'
                    );

                button.classList.toggle(
                    'is-open',
                    open
                );

                button.setAttribute(
                    'aria-expanded',
                    open ? 'true' : 'false'
                );
            }
        );


        /*
         * Close hamburger after
         * clicking normal link.
         */
        menu.addEventListener(
            'click',
            function (event) {

                const link =
                    event.target.closest('a');

                if (!link) {
                    return;
                }

                /*
                 * Dropdown trigger gets
                 * handled separately.
                 */
                if (
                    link.classList.contains(
                        'dd-trigger'
                    )
                ) {
                    return;
                }

                menu.classList.remove(
                    'open'
                );

                button.classList.remove(
                    'is-open'
                );

                button.setAttribute(
                    'aria-expanded',
                    'false'
                );
            }
        );
    }


    /*
     * Dropdown menus.
     */
    document
        .querySelectorAll(
            '#nav-list .dd-trigger'
        )
        .forEach(function (trigger) {

            trigger.addEventListener(
                'click',
                function (event) {

                    const mobile =
                        window.innerWidth <= 900;

                    const href =
                        trigger.getAttribute(
                            'href'
                        );

                    /*
                     * Mobile:
                     * open dropdown.
                     *
                     * Desktop:
                     * href="#" opens dropdown.
                     *
                     * Products has a real URL,
                     * so desktop click goes
                     * directly to Products.
                     */
                    if (
                        mobile ||
                        href === '#'
                    ) {
                        event.preventDefault();

                        const item =
                            trigger.closest(
                                '.has-dropdown'
                            );

                        if (!item) {
                            return;
                        }

                        /*
                         * Close other dropdowns.
                         */
                        document
                            .querySelectorAll(
                                '#nav-list ' +
                                '.has-dropdown.dd-open'
                            )
                            .forEach(
                                function (other) {

                                    if (
                                        other !== item
                                    ) {
                                        other
                                            .classList
                                            .remove(
                                                'dd-open'
                                            );
                                    }
                                }
                            );

                        item.classList.toggle(
                            'dd-open'
                        );
                    }
                }
            );
        });


    /*
     * Click outside closes dropdown.
     */
    document.addEventListener(
        'click',
        function (event) {

            if (
                event.target.closest(
                    '#nav-list'
                )
            ) {
                return;
            }

            document
                .querySelectorAll(
                    '#nav-list ' +
                    '.has-dropdown.dd-open'
                )
                .forEach(
                    function (item) {
                        item.classList.remove(
                            'dd-open'
                        );
                    }
                );
        }
    );


    /*
     * Footer year.
     */
    const year =
        document.getElementById(
            'year'
        );

    if (year) {
        year.textContent =
            new Date().getFullYear();
    }

})();
