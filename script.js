// Theme Management
class ThemeManager {
    constructor() {
        this.toggle = document.getElementById('themeToggle');
        this.html = document.documentElement;
        this.currentTheme = localStorage.getItem('theme') || 'dark';

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
                this.toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            } else {
                icon.className = 'fas fa-check-circle';
                msg.textContent = 'Message sent successfully!';
                this.toast.classList.remove('error');
                this.toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
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

// Gallery Slider
class GallerySlider {
    constructor() {
        this.slides = document.querySelectorAll('.gallery-slide');
        this.thumbs = document.querySelectorAll('.gallery-thumbnails .thumb');
        this.progressBar = document.getElementById('progressBar');
        this.prevBtn = document.getElementById('galleryPrev');
        this.nextBtn = document.getElementById('galleryNext');
        this.dotsContainer = document.getElementById('galleryDots');

        if (this.slides.length === 0) return;

        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayDuration = 5000;
        this.progressInterval = null;
        this.autoPlayTimeout = null;
        this.isPaused = false;

        this.init();
    }

    init() {
        this.generateDots();
        this.dots = this.dotsContainer.querySelectorAll('.dot');
        this.addEventListeners();
        this.startAutoPlay();

        // Pause on hover
        const slider = document.querySelector('.gallery-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.pause());
            slider.addEventListener('mouseleave', () => this.resume());
        }
    }

    generateDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('data-index', i);
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            this.dotsContainer.appendChild(dot);
        }
    }

    addEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prev();
                this.resetAutoPlay();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.next();
                this.resetAutoPlay();
            });
        }

        if (this.dotsContainer) {
            this.dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('dot')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.goToSlide(index);
                    this.resetAutoPlay();
                }
            });
        }

        if (this.thumbs.length > 0) {
            this.thumbs.forEach((thumb, index) => {
                thumb.addEventListener('click', () => {
                    this.goToSlide(index);
                    this.resetAutoPlay();
                });
            });
        }

        // Keyboard navigation — only when gallery is visible AND no input is focused
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

            // Don't intercept when user is typing in a form field
            const active = document.activeElement;
            if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;

            // Only activate when the gallery section is visible on screen
            const gallerySection = document.getElementById('gallery');
            if (gallerySection) {
                const rect = gallerySection.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                if (!isVisible) return;
            }

            if (e.key === 'ArrowLeft') {
                this.prev();
                this.resetAutoPlay();
            } else {
                this.next();
                this.resetAutoPlay();
            }
        });
    }

    goToSlide(index) {
        if (index === this.currentIndex) return;

        this.slides[this.currentIndex].classList.remove('active');
        if (this.dots && this.dots[this.currentIndex]) {
            this.dots[this.currentIndex].classList.remove('active');
        }
        if (this.thumbs && this.thumbs[this.currentIndex]) {
            this.thumbs[this.currentIndex].classList.remove('active');
        }

        this.currentIndex = index;

        this.slides[this.currentIndex].classList.add('active');
        if (this.dots && this.dots[this.currentIndex]) {
            this.dots[this.currentIndex].classList.add('active');
        }
        if (this.thumbs && this.thumbs[this.currentIndex]) {
            this.thumbs[this.currentIndex].classList.add('active');
        }

        this.resetProgress();
    }

    next() {
        const newIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(newIndex);
    }

    prev() {
        const newIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(newIndex);
    }

    startAutoPlay() {
        this.resetProgress();
        this.autoPlayTimeout = setTimeout(() => {
            this.next();
            this.startAutoPlay();
        }, this.autoPlayDuration);
    }

    pause() {
        this.isPaused = true;
        clearTimeout(this.autoPlayTimeout);
        clearInterval(this.progressInterval);
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.startAutoPlay();
    }

    resetAutoPlay() {
        clearTimeout(this.autoPlayTimeout);
        clearInterval(this.progressInterval);
        this.startAutoPlay();
    }

    resetProgress() {
        clearInterval(this.progressInterval);
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }

        let progress = 0;
        const increment = 100 / (this.autoPlayDuration / 16);

        this.progressInterval = setInterval(() => {
            progress += increment;
            if (this.progressBar) {
                this.progressBar.style.width = Math.min(progress, 100) + '%';
            }

            if (progress >= 100) {
                clearInterval(this.progressInterval);
            }
        }, 16);
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
});