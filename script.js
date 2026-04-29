import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');

    gsap.registerPlugin(ScrollTrigger);

    initHeroAnimations();
    initScrollAnimations();
    initSkillBars();
    initForm();
    initNavigation();
    initBackToTop();
    initProjectHovers();
    initDarkMode();
    initProgressBar();
    initLoadingAnimation();
    initEmailCopy();
    initAnimatedCounters();
    initMicroInteractions();
    initCustomCursor();
});


// ================= HERO =================
function initHeroAnimations() {
    gsap.from('.hero-label', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 });
    gsap.from('.hero-title .line1', { opacity: 0, y: 30, duration: 0.9, delay: 0.5 });
    gsap.from('.hero-title .name', { opacity: 0, y: 30, duration: 0.9, delay: 0.7 });
    gsap.from('.hero-title .italic', { opacity: 0, y: 30, duration: 0.9, delay: 0.9 });
    gsap.from('.hero-description', { opacity: 0, y: 20, duration: 0.8, delay: 1.1 });
    gsap.from('.hero-buttons', { opacity: 0, y: 20, duration: 0.8, delay: 1.25 });

    document.querySelectorAll('.shape').forEach((shape, index) => {
        gsap.to(shape, {
            y: 20,
            rotation: 360,
            duration: 4 + index,
            repeat: -1,
            yoyo: true
        });
    });
}


// ================= SCROLL =================
function initScrollAnimations() {
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0,
            duration: 1
        });
    });
}


// ================= SKILL BARS (kun én version) =================
function initSkillBars() {
    document.querySelectorAll('.skill-level').forEach(level => {
        const targetWidth = level.getAttribute('data-level') || '80%';

        ScrollTrigger.create({
            trigger: level,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(level, {
                    width: targetWidth,
                    duration: 1.5,
                    ease: 'power3.out'
                });
            }
        });
    });
}


// ================= EMAIL FIX =================
function initEmailCopy() {
    const emailButton = document.getElementById('email-button');
    if (!emailButton) return;

    emailButton.addEventListener('click', function(e) {
        e.preventDefault();
        const email = 'hello@silinda.design';

        navigator.clipboard.writeText(email).then(() => {
            const original = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-check"></i> Email kopieret!';

            setTimeout(() => {
                this.innerHTML = original;
            }, 2000);
        }).catch(() => {
            window.location.href = `mailto:${email}`;
        });
    });
}


// ================= COUNTERS =================
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target') || 100;
        let current = 0;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                const update = () => {
                    if (current < target) {
                        current += target / 50;
                        counter.textContent = Math.ceil(current) + '+';
                        setTimeout(update, 30);
                    } else {
                        counter.textContent = target + '+';
                    }
                };
                update();
                observer.disconnect();
            }
        });

        observer.observe(counter);
    });
}


// ================= DARK MODE =================
function initDarkMode() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const icon = toggle.querySelector('i');

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            icon.className = 'fa-solid fa-moon';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.className = 'fa-solid fa-sun';
        }
    });
}


// ================= PROGRESS =================
function initProgressBar() {
    const bar = document.querySelector('.progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        const height = document.body.scrollHeight - window.innerHeight;
        bar.style.width = (scroll / height) * 100 + '%';
    });
}


// ================= LOADING =================
function initLoadingAnimation() {
    window.addEventListener('load', () => {
        document.querySelector('.page-transition')?.classList.add('hidden');
    });
}


// ================= CURSOR (kun én version!) =================
function initCustomCursor() {
    if ('ontouchstart' in window) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';

    const outline = document.createElement('div');
    outline.className = 'cursor-outline';

    document.body.appendChild(dot);
    document.body.appendChild(outline);

    let x = 0, y = 0;

    document.addEventListener('mousemove', e => {
        x = e.clientX;
        y = e.clientY;

        dot.style.left = x + 'px';
        dot.style.top = y + 'px';

        outline.style.left = x + 'px';
        outline.style.top = y + 'px';
    });
}


// ================= NAV =================
function initNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
}


// ================= FORM =================
function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        form.reset();
    });
}


// ================= BACK TO TOP =================
function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.style.opacity = window.scrollY > 500 ? '1' : '0';
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// ================= HOVER =================
function initProjectHovers() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.02 });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { scale: 1 });
        });
    });
}


// ================= MICRO =================
function initMicroInteractions() {
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            gsap.to(btn, {
                scale: 0.95,
                yoyo: true,
                repeat: 1,
                duration: 0.1
            });
        });
    });
}