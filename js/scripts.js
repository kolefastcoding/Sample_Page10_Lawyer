(() => {
    "use strict";

    const CLASS_NAME = {
        active: "is-active",
        open: "is-open",
        menuOpen: "is-menu-open",
        fontLoaded: "is-font-loaded",
        fontFailed: "is-font-failed"
    };

    const MEDIA_QUERY = {
        pc: "(min-width: 768px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
    };

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

    /**
     * Initialize all functions.
     */
    function init() {
        loadFonts();
        initMenu();
        initSmoothScroll();
        initCurrentNavigation();
        initFeedbackSlider();
        initAppointmentDate();
    }

    /**
     * Load Google Fonts.
     */
    function loadFonts() {
        const existingScript = document.querySelector(
            ".js-webfont-loader"
        );

        if (existingScript) {
            return;
        }

        window.WebFontConfig = {
            custom: {
                families: [
                    "Barlow:n4,n5,n6"
                ],
                urls: [
                    "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap"
                ]
            },

            active() {
                document.documentElement.classList.add(
                    CLASS_NAME.fontLoaded
                );

                document.documentElement.classList.remove(
                    CLASS_NAME.fontFailed
                );
            },

            inactive() {
                setFontFailedState();
            }
        };

        const script = document.createElement("script");

        script.className = "js-webfont-loader";

        script.src =
            "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js";

        script.async = true;

        script.addEventListener(
            "error",
            setFontFailedState,
            {
                once: true
            }
        );

        document.head.appendChild(script);
    }

    /**
     * Set font loading failure state.
     */
    function setFontFailedState() {
        document.documentElement.classList.add(
            CLASS_NAME.fontFailed
        );

        document.documentElement.classList.remove(
            CLASS_NAME.fontLoaded
        );
    }

    /**
     * Initialize SP navigation menu.
     */
    function initMenu() {
        const button = document.querySelector(
            ".js-menu-button"
        );

        const menu = document.querySelector(
            ".js-menu"
        );

        if (!button || !menu) {
            return;
        }

        const mediaPc = window.matchMedia(
            MEDIA_QUERY.pc
        );

        function openMenu() {
            button.classList.add(
                CLASS_NAME.active
            );

            menu.classList.add(
                CLASS_NAME.open
            );

            document.body.classList.add(
                CLASS_NAME.menuOpen
            );

            button.setAttribute(
                "aria-expanded",
                "true"
            );

            button.setAttribute(
                "aria-label",
                "Close navigation"
            );
        }

        function closeMenu(
            returnFocus = false
        ) {
            button.classList.remove(
                CLASS_NAME.active
            );

            menu.classList.remove(
                CLASS_NAME.open
            );

            document.body.classList.remove(
                CLASS_NAME.menuOpen
            );

            button.setAttribute(
                "aria-expanded",
                "false"
            );

            button.setAttribute(
                "aria-label",
                "Open navigation"
            );

            if (returnFocus) {
                button.focus();
            }
        }

        function toggleMenu() {
            const isOpen = menu.classList.contains(
                CLASS_NAME.open
            );

            if (isOpen) {
                closeMenu();

                return;
            }

            openMenu();
        }

        function handleMediaChange(event) {
            if (event.matches) {
                closeMenu();
            }
        }

        button.addEventListener(
            "click",
            toggleMenu
        );

        menu.querySelectorAll(
            'a[href^="#"]'
        ).forEach((link) => {
            link.addEventListener(
                "click",
                () => {
                    closeMenu();
                }
            );
        });

        document.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key !== "Escape" ||
                    !menu.classList.contains(
                        CLASS_NAME.open
                    )
                ) {
                    return;
                }

                closeMenu(true);
            }
        );

        document.addEventListener(
            "click",
            (event) => {
                if (
                    mediaPc.matches ||
                    !menu.classList.contains(
                        CLASS_NAME.open
                    )
                ) {
                    return;
                }

                const clickedInsideMenu =
                    menu.contains(event.target);

                const clickedButton =
                    button.contains(event.target);

                if (
                    clickedInsideMenu ||
                    clickedButton
                ) {
                    return;
                }

                closeMenu();
            }
        );

        mediaPc.addEventListener(
            "change",
            handleMediaChange
        );
    }

    /**
     * Initialize smooth scrolling
     * for internal anchor links.
     */
    function initSmoothScroll() {
        const links = document.querySelectorAll(
            'a[href^="#"]'
        );

        if (!links.length) {
            return;
        }

        const reducedMotion = window.matchMedia(
            MEDIA_QUERY.reduceMotion
        );

        links.forEach((link) => {
            link.addEventListener(
                "click",
                (event) => {
                    const href = link.getAttribute(
                        "href"
                    );

                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }

                    const targetId = decodeURIComponent(
                        href.slice(1)
                    );

                    const target = document.getElementById(
                        targetId
                    );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: reducedMotion.matches
                            ? "auto"
                            : "smooth",
                        block: "start"
                    });

                    window.history.pushState(
                        null,
                        "",
                        href
                    );
                }
            );
        });
    }

    /**
     * Initialize active navigation state.
     */
    function initCurrentNavigation() {
        const links = Array.from(
            document.querySelectorAll(
                '.l-header__nav-link[href^="#"]'
            )
        );

        if (!links.length) {
            return;
        }

        const sections = [];

        links.forEach((link) => {
            const href = link.getAttribute(
                "href"
            );

            if (
                !href ||
                href === "#"
            ) {
                return;
            }

            const targetId = decodeURIComponent(
                href.slice(1)
            );

            const section = document.getElementById(
                targetId
            );

            if (
                !section ||
                sections.includes(section)
            ) {
                return;
            }

            sections.push(section);
        });

        if (!sections.length) {
            return;
        }

        if (
            !("IntersectionObserver" in window)
        ) {
            updateCurrentNavigation(
                links,
                sections[0]
            );

            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter(
                        (entry) =>
                            entry.isIntersecting
                    )
                    .sort(
                        (
                            firstEntry,
                            secondEntry
                        ) =>
                            secondEntry.intersectionRatio -
                            firstEntry.intersectionRatio
                    );

                if (!visibleEntries.length) {
                    return;
                }

                updateCurrentNavigation(
                    links,
                    visibleEntries[0].target
                );
            },
            {
                rootMargin:
                    "-25% 0px -60% 0px",

                threshold: [
                    0,
                    0.25,
                    0.5,
                    0.75
                ]
            }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });
    }

    /**
     * Update active navigation link.
     */
    function updateCurrentNavigation(
        links,
        currentSection
    ) {
        links.forEach((link) => {
            const isCurrent =
                link.getAttribute("href") ===
                `#${currentSection.id}`;

            link.classList.toggle(
                CLASS_NAME.active,
                isCurrent
            );

            if (isCurrent) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );

                return;
            }

            link.removeAttribute(
                "aria-current"
            );
        });
    }

    /**
     * Initialize feedback slider.
     */
    function initFeedbackSlider() {
        const slider = document.querySelector(
            ".js-feedback-slider"
        );

        const previousButton =
            document.querySelector(
                ".js-feedback-prev"
            );

        const nextButton =
            document.querySelector(
                ".js-feedback-next"
            );

        if (
            !slider ||
            !previousButton ||
            !nextButton
        ) {
            return;
        }

        const items = Array.from(
            slider.querySelectorAll(
                ".p-section-feedback__item"
            )
        );

        if (!items.length) {
            previousButton.disabled = true;
            nextButton.disabled = true;

            return;
        }

        let currentIndex = 0;

        slider.setAttribute(
            "aria-live",
            "polite"
        );

        slider.setAttribute(
            "aria-atomic",
            "true"
        );

        if (items.length > 1) {
            slider.setAttribute(
                "tabindex",
                "0"
            );
        }

        function render() {
            items.forEach(
                (item, index) => {
                    const isCurrent =
                        index === currentIndex;

                    item.hidden = !isCurrent;

                    item.classList.toggle(
                        CLASS_NAME.active,
                        isCurrent
                    );

                    item.setAttribute(
                        "aria-hidden",
                        String(!isCurrent)
                    );
                }
            );

            const hasMultipleItems =
                items.length > 1;

            previousButton.disabled =
                !hasMultipleItems;

            nextButton.disabled =
                !hasMultipleItems;
        }

        function showPrevious() {
            currentIndex =
                (
                    currentIndex -
                    1 +
                    items.length
                ) % items.length;

            render();
        }

        function showNext() {
            currentIndex =
                (
                    currentIndex +
                    1
                ) % items.length;

            render();
        }

        previousButton.addEventListener(
            "click",
            showPrevious
        );

        nextButton.addEventListener(
            "click",
            showNext
        );

        slider.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key === "ArrowLeft"
                ) {
                    event.preventDefault();

                    showPrevious();
                }

                if (
                    event.key === "ArrowRight"
                ) {
                    event.preventDefault();

                    showNext();
                }
            }
        );

        render();
    }

    /**
     * Set the minimum appointment date
     * to the current local date.
     */
    function initAppointmentDate() {
        const dateInput = document.getElementById(
            "appointment-date"
        );

        if (!dateInput) {
            return;
        }

        const currentDate = new Date();

        const timezoneOffset =
            currentDate.getTimezoneOffset() *
            60 *
            1000;

        const localDate = new Date(
            currentDate.getTime() -
            timezoneOffset
        )
            .toISOString()
            .split("T")[0];

        dateInput.min = localDate;
    }
})();