// Theme Management
class ThemeManager {
    constructor() {
        this.toggle = document.getElementById('themeToggle');
        this.html = document.documentElement;
        this.currentTheme = localStorage.getItem('theme') || 'light';

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);

        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    applyTheme(theme) {
        this.html.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

}

// Navigation
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.scrollTop = document.getElementById('scrollTop');

        this.init();
    }

    init() {
        // Scroll handler
        window.addEventListener('scroll', () => this.handleScroll());

        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Close menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Mobile dropdown toggle — tap "Tools" to open/close on touch devices
        const dropdownTrigger = document.querySelector('.nav-link-dropdown');
        const dropdownParent = document.querySelector('.nav-item-dropdown');
        if (dropdownTrigger && dropdownParent) {
            dropdownTrigger.addEventListener('click', (e) => {
                // Only handle as click-toggle on mobile (hover handles desktop)
                if (window.innerWidth <= 768) return; // mobile shows it always (CSS static)
                e.preventDefault();
                dropdownParent.classList.toggle('open');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdownParent && !dropdownParent.contains(e.target)) {
                dropdownParent.classList.remove('open');
            }
            // Close nav menu when clicking outside
            if (this.navMenu && this.navMenu.classList.contains('active')) {
                if (!this.navMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
                    this.closeMenu();
                }
            }
        });

        // Scroll to top button
        if (this.scrollTop) {
            this.scrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Smooth scroll for anchor links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.smoothScroll(e));
        });
    }

    handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (this.navbar) {
            if (scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }

        // Scroll to top button visibility
        if (this.scrollTop) {
            if (scrollY > 500) {
                this.scrollTop.classList.add('visible');
            } else {
                this.scrollTop.classList.remove('visible');
            }
        }

        // Update active link based on scroll position
        this.updateActiveLink();
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    toggleMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (this.navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    closeMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.classList.remove('active');
            this.navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    smoothScroll(e) {
        const href = e.currentTarget.getAttribute('href');

        // Only handle internal anchor links
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offset = target.offsetTop - 80;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }
        // For links to other pages with anchors (e.g., index.html#about), let default behavior work
    }
}

// Animations
class Animator {
    constructor() {
        this.animatedElements = document.querySelectorAll('[data-animate]');
        this.counters = document.querySelectorAll('.stat-number');

        this.init();
    }

    init() {
        // Intersection Observer for fade-up animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        this.animatedElements.forEach(el => observer.observe(el));

        // Counter animations
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-count'));
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - (1 - progress) * (1 - progress);
        const current = target * ease;

        element.textContent = Math.floor(current) + '+';

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target + '+';
        }
    };

    requestAnimationFrame(update);
}
}

// Form Handler
class FormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.toast = document.getElementById('toast');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = this.form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        try {
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: new FormData(this.form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                this.showToast();
                this.form.reset();
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            this.showToast('error');
            console.error('Error:', error);
        } finally {
            btn.innerHTML = original;
            btn.disabled = false;
        }
    }

    showToast(type = 'success') {
        if (this.toast) {
            const icon = this.toast.querySelector('i');
            const msg = this.toast.querySelector('span');

            if (type === 'error') {
                icon.className = 'fas fa-exclamation-circle';
                msg.textContent = 'Oops! Something went wrong. Please try again.';
                this.toast.classList.add('error');
                this.toast.style.background = 'var(--danger)';
            } else {
                icon.className = 'fas fa-check-circle';
                msg.textContent = 'Message sent successfully!';
                this.toast.classList.remove('error');
                this.toast.style.background = 'var(--success)';
            }

            this.toast.classList.add('show');
            setTimeout(() => {
                this.toast.classList.remove('show', 'error');
            }, 3500);
        }
    }
}

// Projects Carousel
class ProjectCarousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.dotsContainer = document.getElementById('carouselDots');
        this.slides = document.querySelectorAll('.carousel-slide');

        if (!this.track || this.slides.length === 0) return;

        this.currentIndex = 0;
        this.slidesPerView = this.getSlidesPerView();
        this.maxIndex = Math.ceil(this.slides.length / this.slidesPerView) - 1;

        this.init();
    }

    init() {
        this.createDots();
        this.dots = this.dotsContainer.querySelectorAll('.dot');
        this.updateButtons();
        this.addEventListeners();

        // Handle resize
        window.addEventListener('resize', () => {
            const newSlidesPerView = this.getSlidesPerView();
            if (newSlidesPerView !== this.slidesPerView) {
                this.slidesPerView = newSlidesPerView;
                this.maxIndex = Math.ceil(this.slides.length / this.slidesPerView) - 1;
                this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
                this.goToSlide(this.currentIndex);
            }
        });
    }

    createDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i <= this.maxIndex; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            this.dotsContainer.appendChild(dot);
        }
    }

    getSlidesPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    addEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        if (this.dotsContainer) {
            this.dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('dot')) {
                    const index = Array.from(this.dotsContainer.children).indexOf(e.target);
                    this.goToSlide(index);
                }
            });
        }

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, {passive: true});
    }

    handleSwipe(startX, endX) {
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) this.next();
            else this.prev();
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.goToSlide(this.currentIndex);
        }
    }

    next() {
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
            this.goToSlide(this.currentIndex);
        }
    }

    goToSlide(index) {
        this.currentIndex = index;

        const slideWidth = this.slides[0].offsetWidth;
        const gap = 24;
        const moveAmount = (slideWidth + gap) * this.slidesPerView * index;

        this.track.style.transform = `translateX(-${moveAmount}px)`;
        this.updateButtons();
        this.updateDots();
    }

    updateButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.4' : '1';
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
            this.nextBtn.style.opacity = this.currentIndex >= this.maxIndex ? '0.4' : '1';
        }
    }

    updateDots() {
        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }
    }
}

// Gallery Slider (Apple TV-style)
// A looping track: the current photo sits centred with its neighbours peeking
// in at both edges. Two clones of the last and first slides pad each end, so
// stepping past either end animates into a clone and then jumps silently back
// to the real slide. Autoplay pauses while the gallery is off screen, while the
// tab is hidden, and for reduced-motion users until they press play.
class GallerySlider {
    constructor() {
        this.root = document.getElementById('tvGallery');
        if (!this.root) return;

        this.viewport = this.root.querySelector('.tv-viewport');
        this.track = document.getElementById('tvTrack');
        this.slides = [...this.track.querySelectorAll('.tv-slide')];
        this.count = this.slides.length;
        if (this.count === 0) return;

        this.prevBtn = document.getElementById('galleryPrev');
        this.nextBtn = document.getElementById('galleryNext');
        this.dotsContainer = document.getElementById('galleryDots');
        this.playBtn = document.getElementById('galleryPlay');

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.duration = 5000;
        this.pad = Math.min(2, this.count);
        this.index = 0;
        this.playing = !this.reducedMotion;
        this.onScreen = false;
        this.timer = null;

        this.root.style.setProperty('--tv-dur', this.duration + 'ms');
        this.addClones();
        this.generateDots();
        this.addEventListeners();
        this.place(false);
        this.update();
    }

    addClones() {
        const clone = (slide) => {
            const c = slide.cloneNode(true);
            c.classList.add('is-clone');
            c.setAttribute('aria-hidden', 'true');
            c.querySelectorAll('img').forEach(img => { img.alt = ''; });
            return c;
        };
        this.track.prepend(...this.slides.slice(-this.pad).map(clone));
        this.track.append(...this.slides.slice(0, this.pad).map(clone));
        this.all = [...this.track.children];
    }

    generateDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.count; i++) {
            const dot = document.createElement('button');
            dot.className = 'tv-dot';
            dot.setAttribute('aria-label', `Show photo ${i + 1} of ${this.count}`);
            dot.addEventListener('click', () => this.goTo(i));
            this.dotsContainer.appendChild(dot);
        }
        this.dots = [...this.dotsContainer.children];
    }

    addEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.goTo(this.index - 1));
        this.nextBtn?.addEventListener('click', () => this.goTo(this.index + 1));
        this.playBtn?.addEventListener('click', () => this.setPlaying(!this.playing));

        // a click on a peeking neighbour brings it to the centre
        this.all.forEach((slide, pos) => {
            slide.addEventListener('click', () => {
                if (this.dragged) return;
                const target = pos - this.pad;
                if (target !== this.index) this.goTo(target);
            });
        });

        // after animating into a clone, jump to the real slide it copies
        this.track.addEventListener('transitionend', (e) => {
            if (e.target === this.track && this.position !== this.index + this.pad) this.place(false);
        });

        // swipe on touch, drag with a mouse
        let startX = null;
        this.track.addEventListener('pointerdown', (e) => {
            startX = e.clientX;
            this.dragged = false;
        });
        window.addEventListener('pointerup', (e) => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 50) {
                this.dragged = true;
                this.goTo(this.index + (dx < 0 ? 1 : -1));
                setTimeout(() => { this.dragged = false; }, 0);
            }
        });

        // Keyboard navigation — only when gallery is visible AND no input is focused
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const active = document.activeElement;
            if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;
            if (!this.onScreen) return;
            this.goTo(this.index + (e.key === 'ArrowRight' ? 1 : -1));
        });

        window.addEventListener('resize', () => this.place(false));
        document.addEventListener('visibilitychange', () => this.schedule());

        new IntersectionObserver(([entry]) => {
            this.onScreen = entry.isIntersecting;
            this.schedule();
        }, { threshold: 0.35 }).observe(this.root);
    }

    // target may run one past either end (-1 or count); the clones cover it
    goTo(target) {
        // if a jump back from a clone never ran (its transition was cut
        // short), make it now so this move starts from the real slide
        if (this.position !== this.index + this.pad) this.place();
        const animate = !this.reducedMotion;
        this.index = ((target % this.count) + this.count) % this.count;
        this.position = (animate ? target : this.index) + this.pad;
        this.translate(animate);
        this.update();
    }

    // snap the track to the real current slide without animating
    place() {
        this.position = this.index + this.pad;
        this.translate(false);
    }

    translate(animate) {
        const slideWidth = this.all[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
        const offset = (this.viewport.clientWidth - slideWidth) / 2 - this.position * (slideWidth + gap);
        if (!animate) this.track.style.transition = 'none';
        this.track.style.transform = `translate3d(${offset}px, 0, 0)`;
        if (!animate) {
            void this.track.offsetWidth;
            this.track.style.transition = '';
        }
    }

    update() {
        this.all.forEach((slide, pos) => {
            slide.classList.toggle('is-active', pos === this.position);
        });
        this.slides.forEach((slide, i) => {
            slide.setAttribute('aria-label', `${i + 1} of ${this.count}`);
        });
        this.dots?.forEach((dot, i) => {
            const on = i === this.index;
            dot.classList.toggle('is-active', on);
            if (on) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
        this.restartFill();
        this.schedule();
    }

    // restart the active dot's fill so it tracks the new interval
    restartFill() {
        this.dots?.forEach(dot => dot.classList.remove('is-filling'));
        const dot = this.dots?.[this.index];
        if (!dot) return;
        void dot.offsetWidth;
        dot.classList.add('is-filling');
    }

    setPlaying(on) {
        this.playing = on;
        if (this.playBtn) {
            this.playBtn.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow');
            this.playBtn.innerHTML = `<i class="fas fa-${on ? 'pause' : 'play'}"></i>`;
        }
        this.restartFill();
        this.schedule();
    }

    schedule() {
        clearTimeout(this.timer);
        const running = this.playing && this.onScreen && !document.hidden;
        this.root.classList.toggle('is-playing', running);
        if (running) this.timer = setTimeout(() => this.goTo(this.index + 1), this.duration);
    }
}


// Liquid Glass
// Tracks the pointer across a surface and writes its position into CSS custom
// properties, so a specular highlight can follow the cursor. Skipped entirely
// for touch input (no pointer to follow) and for reduced-motion users.
class LiquidGlass {
    constructor() {
        this.selector = [
            '.info-card-modern',
            '.skill-category',
            '.achievement-card',
            '.carousel-slide .project-card',
            '.certifications-section',
            '.contact-method',
            '.project-featured',
            '.btn',
            '.gallery-nav',
            '.carousel-btn',
            '.scroll-top'
        ].join(',');

        const stillness = window.matchMedia('(prefers-reduced-motion: reduce)');
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
        if (stillness.matches || !fine.matches) return;

        this.init();
    }

    init() {
        document.querySelectorAll(this.selector).forEach(el => {
            el.classList.add('liquid');
            el.addEventListener('pointermove', (e) => this.track(el, e), { passive: true });
        });
    }

    track(el, e) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--lg-x', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
        el.style.setProperty('--lg-y', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    }
}

// Fullscreen toggle (desktop only, the CSS hides it on touch and narrow screens)
class FullscreenToggle {
    constructor() {
        this.btn = document.getElementById('fullscreenToggle');
        const root = document.documentElement;
        if (!this.btn || !(root.requestFullscreen || root.webkitRequestFullscreen)) return;

        this.btn.hidden = false;
        this.btn.addEventListener('click', () => this.toggle());
        document.addEventListener('fullscreenchange', () => this.onChange());
        document.addEventListener('webkitfullscreenchange', () => this.onChange());
    }

    onChange() {
        this.sync();
        this.realignHero();
    }

    // The hero is sized to the viewport, but the browser keeps the old scroll
    // offset across the switch, so a page sitting a few pixels down showed a
    // strip of the next section under the band. If the reader was on the hero,
    // put it back at the top once the new viewport has laid out; anywhere
    // further down the page is left alone.
    realignHero() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y > 0 && y <= hero.offsetHeight / 2) {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        }));
    }

    current() {
        return document.fullscreenElement || document.webkitFullscreenElement;
    }

    toggle() {
        const root = document.documentElement;
        if (this.current()) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else {
            const p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
            if (p && p.catch) p.catch(() => {});
        }
    }

    sync() {
        const on = !!this.current();
        this.btn.classList.toggle('is-fullscreen', on);
        this.btn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Enter fullscreen');
        this.btn.title = on ? 'Exit fullscreen' : 'Fullscreen';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new Navigation();
    new Animator();
    new FormHandler();
    new ProjectCarousel();
    new GallerySlider();
    new LiquidGlass();
    new FullscreenToggle();
});