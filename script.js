// Main JavaScript for Interactive Portfolio

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations and interactions
    initHeroAnimations();
    initScrollAnimations();
    initSkillBars();
    initForm();
    initNavigation();
    initBackToTop();
});

// Hero Animations
function initHeroAnimations() {
    // Animate hero elements on load
    const heroElements = document.querySelectorAll('.title-line, .hero-description, .hero-buttons');
    
    gsap.set(heroElements, { y: 30, opacity: 0 });
    
    gsap.to(heroElements, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
    });
    
    // Floating shapes animation
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        gsap.to(shape, {
            y: 20,
            rotation: 360,
            duration: 4 + index,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            x: -50,
            opacity: 0,
            duration: 1,
            delay: i * 0.2,
            ease: 'power3.out'
        });
    });
    
    // Animate skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((category, i) => {
        gsap.from(category, {
            scrollTrigger: {
                trigger: category,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            delay: i * 0.1,
            ease: 'power3.out'
        });
    });
    
    // Animate project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            delay: i * 0.15,
            ease: 'power3.out'
        });
    });
    
    // Parallax effect for floating shapes in hero
    const floatingShapes = document.querySelector('.floating-shapes');
    if (floatingShapes) {
        gsap.to(floatingShapes, {
            y: -100,
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}

// Skill Bars Animation
function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        const level = item.getAttribute('data-level');
        const skillLevel = item.querySelector('.skill-level');
        
        ScrollTrigger.create({
            trigger: item,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(skillLevel, {
                    width: `${level}%`,
                    duration: 1.5,
                    ease: 'power3.out'
                });
            }
        });
    });
}

// Form Handling
function initForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    // Form input focus effects
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.querySelector('span').textContent;
        const originalHTML = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = `
            <svg class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76M19.07 19.07L16.24 16.24" 
                      stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Sending...</span>
        `;
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Show success state
            submitButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L19 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Message Sent!</span>
            `;
            submitButton.style.background = '#4CAF50';
            
            // Reset form
            contactForm.reset();
            
            // Reset button after delay
            setTimeout(() => {
                submitButton.innerHTML = originalHTML;
                submitButton.style.background = '';
                submitButton.disabled = false;
                submitButton.querySelector('span').textContent = originalText;
            }, 2000);
        }, 1500);
    });
}

// Navigation
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Animate menu toggle lines
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (menuToggle && menuToggle.classList.contains('active')) {
                    menuToggle.click();
                }
            }
        });
    });
}

// Back to Top
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (!backToTop) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
            backToTop.style.transform = 'translateY(0)';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
            backToTop.style.transform = 'translateY(10px)';
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Project Card Hover Effects
function initProjectHovers() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = (x - centerX) / 25;
            const rotateX = (centerY - y) / 25;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// Initialize project hover effects after load
window.addEventListener('load', initProjectHovers);

// Mobile detection and optimizations
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Disable heavy animations on mobile
if (isMobile()) {
    document.body.classList.add('mobile');
    
    // Reduce animation intensity
    gsap.defaults({
        duration: 0.5
    });
}

// Window resize handling
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        location.reload();
    }, 250);
});