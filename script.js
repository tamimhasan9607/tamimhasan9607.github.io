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
        window.addEventListener('scroll', () => this.handleScroll());
        
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.closeMenu();
                this.smoothScroll(e);
            });
        });
        
        if (this.scrollTop) {
            this.scrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
        
        if (this.scrollTop) {
            if (scrollY > 500) {
                this.scrollTop.classList.add('visible');
            } else {
                this.scrollTop.classList.remove('visible');
            }
        }
        
        // Update active link
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    closeMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    smoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            const offset = target.offsetTop - 80;
            window.scrollTo({ top: offset, behavior: 'smooth' });
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
        // Fade up animations
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
        }, { threshold: 0.1 });
        
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
        const isDecimal = element.getAttribute('data-decimal') === 'true';
        const duration = 2000;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - (1 - progress) * (1 - progress);
            const current = target * ease;
            
            if (isDecimal) {
                element.textContent = current.toFixed(2);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
}

// Form
// Form Handler with Email Integration
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
            alert('Oops! There was a problem sending your message. Please try again.');
            console.error('Error:', error);
        } finally {
            btn.innerHTML = original;
            btn.disabled = false;
        }
    }
    
    showToast() {
        if (this.toast) {
            this.toast.classList.add('show');
            setTimeout(() => {
                this.toast.classList.remove('show');
            }, 3000);
        }
    }
}
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new Navigation();
    new Animator();
    new FormHandler();
});
// Projects Carousel
class ProjectCarousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.dots = document.querySelectorAll('.dot');
        this.slides = document.querySelectorAll('.carousel-slide');
        
        this.currentIndex = 0;
        this.slidesPerView = this.getSlidesPerView();
        this.maxIndex = Math.ceil(this.slides.length / this.slidesPerView) - 1;
        
        this.init();
    }
    
    init() {
        this.updateButtons();
        this.addEventListeners();
        this.updateDots();
        
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
    
    getSlidesPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }
    
    addEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
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
    
    // Replace the goToSlide method in your ProjectCarousel class with this:

goToSlide(index) {
    this.currentIndex = index;
    
    // Calculate slide width based on current viewport
    const slideWidth = this.slides[0].offsetWidth;
    const gap = 24; // 1.5rem in pixels
    const moveAmount = (slideWidth + gap) * this.slidesPerView * index;
    
    this.track.style.transform = `translateX(-${moveAmount}px)`;
    this.updateButtons();
    this.updateDots();
}
    
    updateButtons() {
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
        
        this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.4' : '1';
        this.nextBtn.style.opacity = this.currentIndex >= this.maxIndex ? '0.4' : '1';
    }
    
    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new Navigation();
    new Animator();
    new FormHandler();
    new ProjectCarousel(); // Add this line
});
// Gallery Auto-Sliding functionality
// Gallery Auto-Sliding functionality
class GallerySlider {
    constructor() {
        this.slides = document.querySelectorAll('.gallery-slide');
        this.thumbs = document.querySelectorAll('.gallery-thumbnails .thumb');
        this.progressBar = document.getElementById('progressBar');
        this.prevBtn = document.getElementById('galleryPrev');
        this.nextBtn = document.getElementById('galleryNext');
        this.dotsContainer = document.getElementById('galleryDots');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayDuration = 3000; // 3 seconds
        this.progressInterval = null;
        this.autoPlayTimeout = null;
        this.isPaused = false;
        
        this.init();
    }
    
    init() {
        this.generateDots();
        this.dots = document.querySelectorAll('.gallery-dots .dot');
        this.addEventListeners();
        this.startAutoPlay();
        
        // Pause on hover
        const slider = document.querySelector('.gallery-slider');
        slider.addEventListener('mouseenter', () => this.pause());
        slider.addEventListener('mouseleave', () => this.resume());
        
        // Touch support for mobile
        let touchStartX = 0;
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this.pause();
        }, {passive: true});
        
        slider.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
            this.resume();
        }, {passive: true});
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
                this.resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                this.next();
                this.resetAutoPlay();
            }
        });
    }
    
    generateDots() {
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
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => {
            this.prev();
            this.resetAutoPlay();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.next();
            this.resetAutoPlay();
        });
        
        // Dot indicators
        this.dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.goToSlide(index);
                this.resetAutoPlay();
            }
        });
        
        // Thumbnails
        this.thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoPlay();
            });
        });
    }
    
    handleSwipe(startX, endX) {
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) this.next();
            else this.prev();
        }
    }
    
    goToSlide(index) {
        if (index === this.currentIndex) return;
        
        // Remove active class from current
        this.slides[this.currentIndex].classList.remove('active');
        if (this.dots[this.currentIndex]) this.dots[this.currentIndex].classList.remove('active');
        if (this.thumbs[this.currentIndex]) this.thumbs[this.currentIndex].classList.remove('active');
        
        // Update index
        this.currentIndex = index;
        
        // Add active class to new
        this.slides[this.currentIndex].classList.add('active');
        if (this.dots[this.currentIndex]) this.dots[this.currentIndex].classList.add('active');
        if (this.thumbs[this.currentIndex]) this.thumbs[this.currentIndex].classList.add('active');
        
        // Reset progress bar
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
        this.progressBar.style.width = '0%';
        
        // Animate progress bar
        let progress = 0;
        const increment = 100 / (this.autoPlayDuration / 16); // ~60fps
        
        this.progressInterval = setInterval(() => {
            progress += increment;
            this.progressBar.style.width = Math.min(progress, 100) + '%';
            
            if (progress >= 100) {
                clearInterval(this.progressInterval);
            }
        }, 16);
    }
}

// Initialize Gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new Navigation();
    new Animator();
    new FormHandler();
    new ProjectCarousel();
    new GallerySlider(); // Initialize gallery
});

// Initialize Gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // ... your existing initializations
    new ThemeManager();
    new Navigation();
    new Animator();
    new FormHandler();
    new ProjectCarousel();
    new GallerySlider(); // Add this line
});
