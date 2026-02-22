// script.js

// ============================================
// THEME MANAGEMENT
// ============================================

class ThemeManager {
    constructor() {
        this.toggleButtons = [
            document.getElementById('themeToggle'),
            document.getElementById('footerThemeToggle')
        ];
        this.html = document.documentElement;
        this.currentTheme = this.getStoredTheme() || 'light';
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        
        this.toggleButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.toggle());
            }
        });
        
        // Check system preference
        if (!this.getStoredTheme()) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                this.applyTheme('dark');
                this.storeTheme('dark');
            }
        }
    }
    
    getStoredTheme() {
        return localStorage.getItem('theme');
    }
    
    storeTheme(theme) {
        localStorage.setItem('theme', theme);
    }
    
    applyTheme(theme) {
        this.html.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update footer button icon if exists
        const footerBtn = document.getElementById('footerThemeToggle');
        if (footerBtn) {
            const icon = footerBtn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.storeTheme(newTheme);
    }
}

// ============================================
// NAVIGATION MANAGEMENT
// ============================================

class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.scrollTopBtn = document.getElementById('scrollTop');
        
        this.init();
    }
    
    init() {
        // Scroll effects
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        
        // Mobile menu
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }
        
        // Nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.closeMenu();
                this.smoothScroll(e);
            });
        });
        
        // Scroll top
        if (this.scrollTopBtn) {
            this.scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Navbar background
        if (scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
        
        // Scroll top button
        if (this.scrollTopBtn) {
            if (scrollY > 500) {
                this.scrollTopBtn.classList.add('visible');
            } else {
                this.scrollTopBtn.classList.remove('visible');
            }
        }
        
        // Active link
        this.updateActiveLink(scrollY);
    }
    
    updateActiveLink(scrollY) {
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
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ============================================
// ANIMATION MANAGER (Intersection Observer)
// ============================================

class AnimationManager {
    constructor() {
        this.animatedElements = document.querySelectorAll('[data-animate]');
        this.counters = document.querySelectorAll('.stat-number');
        
        this.init();
    }
    
    init() {
        // Scroll animations
        if (this.animatedElements.length > 0) {
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            };
            
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
            }, observerOptions);
            
            this.animatedElements.forEach(el => observer.observe(el));
        }
        
        // Counter animations
        if (this.counters.length > 0) {
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
    }
    
    animateCounter(element) {
        const target = parseFloat(element.getAttribute('data-count'));
        const isDecimal = element.getAttribute('data-decimal') === 'true';
        const duration = 2000;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            const current = target * easeProgress;
            
            if (isDecimal) {
                element.textContent = current.toFixed(2);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// ============================================
// FORM MANAGER
// ============================================

class FormManager {
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
    
    handleSubmit(e) {
        e.preventDefault();
        
        const btn = this.form.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        
        // Loading state
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        
        // Simulate submission
        setTimeout(() => {
            this.showToast('Message sent successfully! I\'ll get back to you soon.');
            this.form.reset();
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }, 1500);
    }
    
    showToast(message) {
        if (this.toast) {
            const span = this.toast.querySelector('span');
            if (span) span.textContent = message;
            
            this.toast.classList.add('show');
            
            setTimeout(() => {
                this.toast.classList.remove('show');
            }, 3000);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new ThemeManager();
    new NavigationManager();
    new AnimationManager();
    new FormManager();
    
    console.log('✨ Tamim Hasan Portfolio - Loaded Successfully');
});