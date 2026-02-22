/* ========================================
   TAMIM HASAN - 3D LIGHT THEME PORTFOLIO
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ========================================
    // MOBILE MENU TOGGLE
    // ========================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ========================================
    // ACTIVE NAV LINK ON SCROLL
    // ========================================
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // 3D PARALLAX EFFECT FOR HERO
    // ========================================
    const profile3d = document.querySelector('.profile-3d');
    
    if (profile3d && window.innerWidth > 768) {
        document.addEventListener('mousemove', function(e) {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
            
            profile3d.style.transform = `rotateY(${mouseX}deg) rotateX(${-mouseY}deg)`;
        });
    }

    // ========================================
    // FLOATING SHAPES PARALLAX
    // ========================================
    const shapes = document.querySelectorAll('.floating-shape');
    
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            shape.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });

    // ========================================
    // REVEAL ANIMATIONS ON SCROLL
    // ========================================
    const revealElements = document.querySelectorAll(
        '.info-card, .project-card-3d, .skill-category-3d, .achievement-item, .interest-orb'
    );
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    // ========================================
    // 3D CARD TILT EFFECT
    // ========================================
    const tiltCards = document.querySelectorAll('.project-card-3d, .skill-category-3d');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
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
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // ========================================
    // IMAGE STACK 3D HOVER
    // ========================================
    const imageStack = document.querySelector('.image-stack');
    
    if (imageStack) {
        imageStack.addEventListener('mousemove', function(e) {
            if (window.innerWidth <= 768) return;
            
            const rect = imageStack.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            imageStack.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
        });
        
        imageStack.addEventListener('mouseleave', function() {
            imageStack.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
        });
    }

    // ========================================
    // CONTACT FORM
    // ========================================
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success toast
            showToast('Message sent successfully! I\'ll get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }

    function showToast(message) {
        if (toast) {
            toast.querySelector('span').textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // ========================================
    // BUTTON RIPPLE EFFECT
    // ========================================
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
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
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to { transform: scale(2); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // ========================================
    // TYPING EFFECT FOR ROLES (Optional enhancement)
    // ========================================
    const roleItems = document.querySelectorAll('.role-item');
    let currentRole = 0;
    
    function cycleRoles() {
        roleItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentRole) {
                item.classList.add('active');
            }
        });
        
        currentRole = (currentRole + 1) % roleItems.length;
    }
    
    // Cycle roles every 3 seconds
    setInterval(cycleRoles, 3000);

    // ========================================
    // INTERSECTION OBSERVER FOR TIMELINE
    // ========================================
    const timelineItems = document.querySelectorAll('.achievement-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 150);
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        timelineObserver.observe(item);
    });

    // ========================================
    // FORM INPUT FOCUS EFFECTS
    // ========================================
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // ========================================
    // SOCIAL ORB ANIMATION
    // ========================================
    const socialOrbs = document.querySelectorAll('.social-orb');
    
    socialOrbs.forEach((orb, index) => {
        orb.style.animationDelay = `${index * 0.1}s`;
    });

    // ========================================
    // PAGE LOAD ANIMATION
    // ========================================
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // ========================================
    // ESCAPE KEY TO CLOSE MENU
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // ========================================
    // PERFORMANCE: PAUSE ANIMATIONS WHEN HIDDEN
    // ========================================
    document.addEventListener('visibilitychange', function() {
        const animatedElements = document.querySelectorAll('.floating-shape, .card-glow, .float-icon');
        
        animatedElements.forEach(el => {
            if (document.hidden) {
                el.style.animationPlayState = 'paused';
            } else {
                el.style.animationPlayState = 'running';
            }
        });
    });

    console.log('✨ Tamim Hasan Portfolio - 3D Light Theme Loaded!');
});
