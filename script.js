// Listeners and timers tied to the current page end when the next page replaces it
let pageLife;
function renewPageLife() {
    pageLife?.abort();
    pageLife = new AbortController();
    window.pageSignal = pageLife.signal;
}
renewPageLife();

// Site colors: "default" is the original white design
const SITE_PALETTES = ['cream', 'blue', 'green', 'purple'];

function setPalette(name) {
    const root = document.documentElement;
    if (SITE_PALETTES.includes(name)) {
        root.dataset.palette = name;
        localStorage.setItem('palette', name);
    } else {
        delete root.dataset.palette;
        localStorage.removeItem('palette');
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
        window.addEventListener('scroll', () => this.handleScroll(), { signal: pageLife.signal });
        this.handleScroll();

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
        }, { signal: pageLife.signal });

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
            const target = href.length > 1 && document.querySelector(href);

            if (target) {
                const offset = target.offsetTop - 80;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }
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

        pageLife.signal.addEventListener('abort', () => {
            observer.disconnect();
            counterObserver.disconnect();
        }, { once: true });
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
        }, { signal: pageLife.signal });
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
        }, { signal: pageLife.signal });

        // Keyboard navigation — only when gallery is visible AND no input is focused
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const active = document.activeElement;
            if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;
            if (!this.onScreen) return;
            this.goTo(this.index + (e.key === 'ArrowRight' ? 1 : -1));
        }, { signal: pageLife.signal });

        window.addEventListener('resize', () => this.place(false), { signal: pageLife.signal });
        document.addEventListener('visibilitychange', () => this.schedule(), { signal: pageLife.signal });

        const visibility = new IntersectionObserver(([entry]) => {
            this.onScreen = entry.isIntersecting;
            this.schedule();
        }, { threshold: 0.35 });
        visibility.observe(this.root);

        pageLife.signal.addEventListener('abort', () => {
            visibility.disconnect();
            this.playing = false;
            clearTimeout(this.timer);
        }, { once: true });
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


// Fullscreen toggle (desktop only, the CSS hides it on touch and narrow screens)
class FullscreenToggle {
    constructor() {
        this.btn = document.getElementById('fullscreenToggle');
        const root = document.documentElement;
        if (!this.btn || !(root.requestFullscreen || root.webkitRequestFullscreen)) return;

        this.btn.hidden = false;
        this.btn.addEventListener('click', () => this.toggle());
        document.addEventListener('fullscreenchange', () => this.onChange(), { signal: pageLife.signal });
        document.addEventListener('webkitfullscreenchange', () => this.onChange(), { signal: pageLife.signal });
        this.sync();
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

// Color picker: hover or tap the palette to fan out the available colors
class PalettePicker {
    constructor() {
        this.root = document.getElementById('palette');
        if (!this.root) return;

        this.toggle = document.getElementById('paletteToggle');
        this.swatches = [...this.root.querySelectorAll('[data-palette-choice]')];
        this.positions = [[-48, 14], [-46, -24], [-20, -52], [20, -52]];
        this.hovering = false;
        this.sync();

        this.root.addEventListener('pointerenter', (e) => {
            if (e.pointerType !== 'mouse') return;
            this.hovering = true;
            this.setOpen(true);
        });
        this.root.addEventListener('pointerleave', (e) => {
            if (e.pointerType !== 'mouse') return;
            this.hovering = false;
            if (!this.root.contains(document.activeElement) || !document.activeElement.matches(':focus-visible')) this.setOpen(false);
        });
        this.toggle.addEventListener('click', () => {
            if (!this.hovering) this.setOpen(!this.isOpen());
        });
        this.swatches.forEach(swatch => swatch.addEventListener('click', () => {
            setPalette(swatch.dataset.paletteChoice);
            this.sync();
            if (!this.hovering) {
                this.setOpen(false);
                this.toggle.focus();
            }
        }));
        this.root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.setOpen(false);
                this.toggle.focus();
            }
        });
        this.root.addEventListener('focusout', (e) => {
            if (!this.root.contains(e.relatedTarget) && !this.hovering) this.setOpen(false);
        });
        document.addEventListener('pointerdown', (e) => {
            if (!this.root.contains(e.target)) this.setOpen(false);
        }, { signal: pageLife.signal });
    }

    isOpen() {
        return this.root.classList.contains('is-open');
    }

    setOpen(open) {
        this.root.classList.toggle('is-open', open);
        this.toggle.setAttribute('aria-expanded', String(open));
    }

    sync() {
        const current = document.documentElement.dataset.palette || 'default';
        let order = 0;
        this.swatches.forEach(swatch => {
            const active = swatch.dataset.paletteChoice === current;
            swatch.hidden = active;
            if (active) return;
            const [x, y] = this.positions[order];
            swatch.style.setProperty('--x', x + 'px');
            swatch.style.setProperty('--y', y + 'px');
            swatch.style.setProperty('--order', order);
            order += 1;
        });
    }
}

// Homepage intro
// Splits the intro into words for the reveal, then restores the original text
// so nothing about the finished page depends on the animation.
class HeroIntro {
    constructor() {
        this.ready = new Promise(resolve => { this.markReady = resolve; });
        this.hero = document.querySelector('.hero');
        this.blocks = [...document.querySelectorAll('.hero-intro, .hero-current')];
        if (!this.hero || !this.blocks.length) {
            this.markReady();
            return;
        }

        this.root = document.documentElement;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.root.classList.add('intro-done');
            this.markReady();
            return;
        }

        this.words = 0;
        this.originals = this.blocks.map(block => block.innerHTML);
        this.blocks.forEach(block => this.split(block));

        const delay = this.root.classList.contains('page-entering') ? 450 : 0;
        this.hero.style.setProperty('--intro-delay', delay + 'ms');
        this.hero.style.setProperty('--intro-words', this.words);
        this.root.classList.remove('intro-done');
        this.root.classList.add('intro-run');

        const finish = () => this.finish();
        this.timer = setTimeout(finish, delay + this.words * 70 + 800);
        pageLife.signal.addEventListener('abort', finish, { once: true });
    }

    split(node) {
        [...node.childNodes].forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (child.tagName !== 'BR') this.split(child);
                return;
            }
            if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;

            const parts = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (!part.trim()) {
                    parts.append(part);
                    return;
                }
                const word = document.createElement('span');
                const inner = document.createElement('span');
                word.className = 'hero-word';
                inner.style.setProperty('--word', this.words++);
                inner.textContent = part;
                word.append(inner);
                parts.append(word);
            });
            child.replaceWith(parts);
        });
    }

    finish() {
        if (this.finished) return;
        this.finished = true;
        clearTimeout(this.timer);
        this.blocks.forEach((block, i) => { block.innerHTML = this.originals[i]; });
        this.root.classList.remove('intro-run');
        this.root.classList.add('intro-done');
        this.markReady();
    }
}

// Homepage slider
// After the intro, a bar fills and blue shutters change to the featured project,
// then keeps alternating. It waits while off screen, in a hidden tab, while the
// pointer rests on the bar, or while the keyboard is inside the bar.
class HeroSlider {
    constructor(intro) {
        this.hero = document.querySelector('.hero');
        this.track = document.querySelector('.hero-track');
        if (!this.hero || !this.track) return;

        this.slides = [...this.track.children];
        this.segments = [...this.hero.querySelectorAll('.hero-segment')];
        this.bar = this.hero.querySelector('.hero-bar');
        this.index = 0;
        this.addShutters();
        this.holds = new Set();
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.life = pageLife.signal;

        this.segments.forEach((segment, i) => {
            segment.addEventListener('click', () => this.go(i));
            segment.addEventListener('animationend', (e) => {
                if (e.animationName === 'hero-bar-fill') this.go((this.index + 1) % this.slides.length);
            });
        });
        this.bar.addEventListener('pointerenter', () => this.hold('pointer', true));
        this.bar.addEventListener('pointerleave', () => this.hold('pointer', false));
        this.bar.addEventListener('focusin', (e) => this.hold('keyboard', e.target.matches(':focus-visible')));
        this.bar.addEventListener('focusout', () => this.hold('keyboard', false));
        document.addEventListener('visibilitychange', () => this.hold('hidden', document.hidden), { signal: this.life });
        this.hold('hidden', document.hidden);

        const visibility = new IntersectionObserver(([entry]) => this.hold('offscreen', !entry.isIntersecting), { threshold: 0.5 });
        visibility.observe(this.hero);
        this.life.addEventListener('abort', () => visibility.disconnect(), { once: true });

        this.hero.classList.toggle('is-static', this.reduced);
        intro.ready.then(() => {
            if (this.life.aborted) return;
            this.hero.querySelector('.hero-project-image').loading = 'eager';
            this.go(0);
        });
    }

    addShutters() {
        this.hero.querySelectorAll('.geometric-profile').forEach(profile => {
            const shutters = document.createElement('div');
            shutters.className = 'hero-shutters';
            shutters.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 6; i++) {
                const shutter = document.createElement('i');
                shutter.style.setProperty('--shutter', i);
                shutters.append(shutter);
            }
            profile.append(shutters);
        });
    }

    hold(reason, active) {
        if (active) this.holds.add(reason);
        else this.holds.delete(reason);
        this.hero.classList.toggle('is-paused', this.holds.size > 0);
    }

    go(index) {
        if (index !== this.index && !this.reduced) this.hero.classList.add('has-switched');
        this.index = index;
        this.slides.forEach((slide, i) => {
            slide.inert = i !== index;
            slide.toggleAttribute('aria-hidden', i !== index);
            if (i !== index) slide.setAttribute('aria-hidden', 'true');
        });
        this.segments.forEach(segment => {
            segment.classList.remove('is-active');
            segment.removeAttribute('aria-current');
        });
        void this.hero.offsetWidth;
        const active = this.segments[index];
        active.style.setProperty('--hero-dwell', active.dataset.dwell + 'ms');
        active.classList.add('is-active');
        active.setAttribute('aria-current', 'true');
    }
}

// Page transitions
// Links between pages load the next page in the background first, then slide it
// in within this window, so every click animates the same way. Each page is still
// a real HTML file: anything unsupported falls back to a normal page load.
class PageRouter {
    constructor() {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!document.startViewTransition || reduced) return;

        this.pages = new Map();
        this.scrollPositions = new Map();
        this.navigationId = 0;
        this.path = location.pathname;
        this.index = history.state?.pageIndex ?? 0;
        this.key = history.state?.pageKey ?? this.newKey();

        history.scrollRestoration = 'manual';
        history.replaceState({ ...history.state, pageKey: this.key, pageIndex: this.index }, '', location.href);
        document.head.querySelectorAll('style').forEach(style => { style.dataset.pageStyle = ''; });

        document.addEventListener('click', (e) => this.onClick(e));
        window.addEventListener('popstate', (e) => this.onPopState(e));
        ['pointerover', 'focusin', 'touchstart'].forEach(type => {
            document.addEventListener(type, (e) => this.onIntent(e), { passive: true });
        });
        this.preloadMenuPages();
    }

    newKey() {
        return Math.random().toString(36).slice(2);
    }

    // The page a link leads to, or null when the browser should handle it
    linkTarget(link) {
        if (!link || link.hasAttribute('download')) return null;
        if (link.target && link.target !== '_self') return null;
        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin) return null;
        if (!/(\.html|\/)$/.test(url.pathname)) return null;
        return url;
    }

    onClick(e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const url = this.linkTarget(e.target.closest?.('a[href]'));
        if (!url) return;

        if (url.pathname === this.path) {
            if (url.hash) return;
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        e.preventDefault();
        this.navigate(url, { push: true });
    }

    onIntent(e) {
        const url = this.linkTarget(e.target.closest?.('a[href]'));
        if (url && url.pathname !== this.path) this.load(url).catch(() => {});
    }

    onPopState(e) {
        if (location.pathname === this.path) return;
        const index = e.state?.pageIndex ?? 0;
        this.navigate(new URL(location.href), {
            push: false,
            back: index < this.index,
            top: this.scrollPositions.get(e.state?.pageKey) || 0,
            key: e.state?.pageKey ?? this.newKey(),
            index
        });
    }

    preloadMenuPages() {
        if (navigator.connection?.saveData) return;
        const preload = () => document.querySelectorAll('.nav-menu a[href]').forEach(link => {
            const url = this.linkTarget(link);
            if (url && url.pathname !== this.path) this.load(url).catch(() => {});
        });
        if (window.requestIdleCallback) requestIdleCallback(preload, { timeout: 2500 });
        else setTimeout(preload, 1200);
    }

    load(url) {
        const key = url.pathname;
        if (!this.pages.has(key)) {
            const page = fetch(key, { credentials: 'same-origin' }).then(response => {
                const type = response.headers.get('content-type') || '';
                if (!response.ok || !type.includes('text/html')) throw new Error('Page unavailable');
                return response.text();
            });
            page.catch(() => this.pages.delete(key));
            this.pages.set(key, page);
        }
        return this.pages.get(key);
    }

    // Everything the first screen needs, so nothing pops in during the slide
    async prepare(next) {
        const have = (selector, attr, href) =>
            [...document.querySelectorAll(selector)].some(el => el[attr] === href);

        const styles = [...next.head.querySelectorAll('link[rel="stylesheet"]')]
            .filter(link => !have('link[rel="stylesheet"]', 'href', link.href))
            .map(link => this.addToHead(link.cloneNode()));
        const scripts = [...next.head.querySelectorAll('script[src]')]
            .filter(script => !have('script[src]', 'src', script.src))
            .map(script => {
                const el = document.createElement('script');
                el.src = script.src;
                el.async = false;
                return this.addToHead(el);
            });
        await Promise.all([...styles, ...scripts]);

        const images = [...next.querySelectorAll('img:not([loading="lazy"])')].slice(0, 6).map(img => {
            const image = new Image();
            image.src = img.src;
            return image.decode().catch(() => {});
        });
        await Promise.race([Promise.all(images), new Promise(done => setTimeout(done, 1500))]);
    }

    addToHead(el) {
        return new Promise((resolve, reject) => {
            el.onload = resolve;
            el.onerror = reject;
            document.head.appendChild(el);
        });
    }

    startProgress() {
        document.querySelector('.page-progress')?.remove();
        this.progress = document.createElement('div');
        this.progress.className = 'page-progress';
        document.documentElement.appendChild(this.progress);
    }

    finishProgress() {
        const bar = this.progress;
        if (!bar) return;
        bar.classList.add('is-done');
        setTimeout(() => bar.remove(), 450);
    }

    async navigate(url, { push, back = false, top = 0, key, index }) {
        const id = ++this.navigationId;
        this.startProgress();

        let next;
        try {
            const html = await this.load(url);
            next = new DOMParser().parseFromString(html, 'text/html');
            await this.prepare(next);
        } catch (error) {
            location.assign(url.href);
            return;
        }
        if (id !== this.navigationId) return;

        const root = document.documentElement;
        root.toggleAttribute('data-nav-back', back);

        const transition = document.startViewTransition(() => {
            // stop any smooth scroll still running on the page being left
            window.scrollTo({ top: window.scrollY, behavior: 'instant' });
            this.scrollPositions.set(this.key, window.scrollY);
            if (push) {
                this.key = this.newKey();
                this.index += 1;
                history.pushState({ pageKey: this.key, pageIndex: this.index }, '', url.href);
            } else {
                this.key = key;
                this.index = index;
            }
            this.path = url.pathname;
            this.show(next, url, top);
        });

        transition.updateCallbackDone.catch(() => location.assign(url.href));
        transition.ready.catch(() => {});
        transition.finished.finally(() => {
            if (id !== this.navigationId) return;
            root.removeAttribute('data-nav-back');
            root.classList.remove('page-entering');
            this.finishProgress();
        }).catch(() => {});
    }

    show(next, url, top) {
        document.title = next.title;
        ['meta[name="description"]', 'link[rel="canonical"]'].forEach(selector => {
            const current = document.head.querySelector(selector);
            const incoming = next.head.querySelector(selector);
            if (current && incoming) current.replaceWith(document.adoptNode(incoming));
        });

        document.head.querySelectorAll('style[data-page-style]').forEach(style => style.remove());
        next.head.querySelectorAll('style').forEach(style => {
            style.dataset.pageStyle = '';
            document.head.appendChild(document.adoptNode(style));
        });

        const inlineScripts = [...next.body.querySelectorAll('script')]
            .filter(script => !script.src)
            .map(script => script.textContent);
        next.body.querySelectorAll('script').forEach(script => script.remove());

        renewPageLife();
        document.documentElement.classList.add('page-entering');
        document.body.className = next.body.className;
        document.body.removeAttribute('style');
        document.body.replaceChildren(...[...next.body.childNodes].map(node => document.adoptNode(node)));

        inlineScripts.forEach(code => {
            try {
                new Function(code)();
            } catch (error) {
                console.error(error);
            }
        });
        startPage();

        const target = url.hash && document.getElementById(url.hash.slice(1));
        const place = () => {
            if (target) target.scrollIntoView({ behavior: 'instant' });
            else window.scrollTo({ top, behavior: 'instant' });
        };
        place();
        requestAnimationFrame(place);

        // the first screen arrives finished; lower content still fades in on scroll
        document.querySelectorAll('[data-animate]').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('animated');
        });

        const main = document.querySelector('main');
        if (main) {
            main.tabIndex = -1;
            main.focus({ preventScroll: true });
        }
    }
}

// Set up everything that belongs to the current page
function startPage() {
    new PalettePicker();
    new Navigation();
    new Animator();
    new FormHandler();
    new ProjectCarousel();
    new GallerySlider();
    new FullscreenToggle();
    new HeroSlider(new HeroIntro());
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    startPage();
    new PageRouter();
});
