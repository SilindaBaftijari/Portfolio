// Main JavaScript for Interactive Portfolio

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Initialize all functions
    initHeroAnimations();
    initScrollAnimations();
    initSkillBars();
    initForm();
    initNavigation();
    initBackToTop();
    initProjectHovers();
});

// Hero Animations
function initHeroAnimations() {
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
}

// Skill Bars Animation
function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        const level = item.getAttribute('data-level');
        const skillLevel = item.querySelector('.skill-level');
        if (skillLevel) {
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
        }
    });
}

// Form Handling
function initForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = this.querySelector('.submit-button');
        submitButton.innerHTML = `<span>Sender...</span>`;
        submitButton.disabled = true;
        
        setTimeout(() => {
            submitButton.innerHTML = `<span>Besked sendt!</span>`;
            submitButton.style.background = '#588157';
            contactForm.reset();
            setTimeout(() => { location.reload(); }, 2000);
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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
                if (menuToggle && menuToggle.classList.contains('active')) menuToggle.click();
            }
        });
    });
}

// Back to Top
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    backToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// Hover effects only on desktop
function initProjectHovers() {
    if (window.innerWidth > 768) {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                this.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-5px)`;
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
}

// Fallback for older browsers
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 1000 / 60);
    };
}