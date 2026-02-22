/**
 * TAMIM HASAN PORTFOLIO
 * Features: Dark/Light Theme Toggle, Animations, Form Handling, Scroll Effects
 * Organized in modular sections for easy editing
 */

// ========================================
// 1. CONFIGURATION
// ========================================

const CONFIG = {
    // Animation settings
    animation: {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    // Scroll settings
    scroll: {
        offset: 80,
        threshold: 0.1
    },
    
    // Theme settings
    theme: {
        storageKey: 'theme-preference',
        defaultTheme: 'light'
    }
};

// ========================================
// 2. THEME MANAGEMENT
// ========================================

class ThemeManager {
    constructor() {
        this.toggleBtn = document.getElementById('themeToggle');
        this.footerToggleBtn = document.getElementById('footerThemeToggle');
        this.html = document.documentElement;
        this.currentTheme = this.getStoredTheme() || CONFIG.theme.defaultTheme;
        
        this.init();
    }
    
    init() {
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Event listeners
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        if (this.footerToggleBtn) {
            this.footerToggleBtn.addEventListener('click', () => this.toggle());
        }
        
        // Check system preference on first visit
        if (!this.getStoredTheme()) {
            this.checkSystemPreference();
        }
    }
    
    getStoredTheme() {
        return localStorage.getItem(CONFIG.theme.storageKey);
    }
    
    storeTheme(theme) {
        localStorage.setItem(CONFIG.theme.storageKey, theme);
    }
    
    applyTheme(theme) {
        this.html.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update footer button icon
        if (this.footerToggleBtn) {
            const icon = this.footerToggleBtn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.storeTheme(newTheme);
        
        // Add toggle animation
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }
    
    checkSystemPreference() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            this.applyTheme('dark');
            this.storeTheme('dark');
        }
    }
}

// ========================================
// 3. NAVIGATION MANAGEMENT
// ========================================

class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.scrollTopBtn = document.getElementById('scrollTop');
        
        this.init();
    }
    
    init() {
        // Scroll effects
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Mobile menu
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }
        
        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.closeMenu();
                this.smoothScroll(e);
            });
        });
        
        // Scroll to top
        if (this.scrollTopBtn) {
            this.scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Keyboard navigation
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
        
        // Scroll to top button
        if (this.scrollTopBtn) {
            if (scrollY > 500) {
                this.scrollTopBtn.classList.add('visible');
            } else {
                this.scrollTopBtn.classList.remove('visible');
            }
        }
        
        // Active nav link
        this.updateActiveLink(scrollY);
    }
    
    updateActiveLink(scrollY) {
        let current = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - CONFIG.scroll.offset - 100;
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
            const headerOffset = CONFIG.scroll.offset;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ========================================
// 4. ANIMATION MANAGER
// ========================================

class AnimationManager {
    constructor() {
        this.initParallax();
        this.initRevealAnimations();
        this.init3DTilt();
        this.initCounters();
    }
    
    initParallax() {
        const shapes = document.querySelectorAll('.floating-shape');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.1;
                shape.style.transform = `translateY(${scrollY * speed}px)`;
            });
        });
        
        // Mouse parallax for hero
        const profile3d = document.querySelector('.profile-3d');
        if (profile3d && window.innerWidth > 768) {
            document.addEventListener('mousemove', (e) => {
                const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
                const mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
                profile3d.style.transform = `rotateY(${mouseX}deg) rotateX(${-mouseY}deg)`;
            });
        }
    }
    
    initRevealAnimations() {
        const revealElements = document.querySelectorAll(
            '.info-card, .project-card-3d, .skill-category-3d, .interest-orb, .achievement-item'
        );
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: CONFIG.scroll.threshold,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
            observer.observe(el);
        });
    }
    
    init3DTilt() {
        const cards = document.querySelectorAll('[data-tilt], .project-card-3d, .skill-category-3d');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= 768) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }
    
    initCounters() {
        const counters = document.querySelectorAll('.stat-num');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseFloat(element.getAttribute('data-count'));
        const isDecimal = element.getAttribute('data-decimal') === 'true';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = isDecimal ? current.toFixed(2) : Math.floor(current) + '+';
        }, 16);
    }
}

// ========================================
// 5. FORM MANAGER
// ========================================

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
        this.initInputEffects();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Add loading state
        const btn = this.form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.showToast('Message sent successfully! I\'ll get back to you soon.');
            this.form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1500);
    }
    
    initInputEffects() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
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

// ========================================
// 6. UTILITY FUNCTIONS
// ========================================

const Utils = {
    // Debounce function for scroll events
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Add ripple effect to buttons
    addRipple: (button, e) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
};

// ========================================
// 7. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    const themeManager = new ThemeManager();
    const navManager = new NavigationManager();
    const animationManager = new AnimationManager();
    const formManager = new FormManager();
    
    // Add ripple effect to all buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => Utils.addRipple(btn, e));
    });
    
    // Role cycling animation
    const roleItems = document.querySelectorAll('.role-item');
    let currentRole = 0;
    
    setInterval(() => {
        roleItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentRole) {
                item.classList.add('active');
            }
        });
        currentRole = (currentRole + 1) % roleItems.length;
    }, 3000);
    
    // Page load animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // Performance: Pause animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
        const animatedElements = document.querySelectorAll('.floating-shape, .card-glow, .float-icon');
        animatedElements.forEach(el => {
            el.style.animationPlayState = document.hidden ? 'paused' : 'running';
        });
    });
    
    console.log('✨ Tamim Hasan Portfolio - Loaded Successfully!');
});

// Add ripple keyframes to document
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to { transform: scale(2); opacity: 0; }
    }
`;
document.head.appendChild(style);