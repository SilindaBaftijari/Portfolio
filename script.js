import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    initDarkMode();
    initProgressBar();
    initLoadingAnimation();
    initEmailCopy();
    initAnimatedCounters();
    initMicroInteractions();
});

// Tilføj i din JavaScript (efter DOMContentLoaded)
function terminalEffect() {
    const text = "const designer = new Designer();\nconst developer = new Developer();\nconst solution = designer.meet(developer);\nconsole.log(solution); // 'Magical Digital Experience'";
    const terminal = document.getElementById('terminal-code');
    
    if (terminal) {
        let lineIndex = 0;
        const lines = text.split('\n');
        
        function typeLine() {
            if (lineIndex < lines.length) {
                const line = lines[lineIndex];
                let charIndex = 0;
                const lineElement = document.createElement('div');
                lineElement.className = 'terminal-line';
                terminal.appendChild(lineElement);
                
                function typeChar() {
                    if (charIndex < line.length) {
                        lineElement.textContent += line.charAt(charIndex);
                        charIndex++;
                        setTimeout(typeChar, 30 + Math.random() * 30);
                    } else {
                        lineIndex++;
                        setTimeout(typeLine, 200);
                    }
                }
                typeChar();
            }
        }
        setTimeout(typeLine, 500);
    }
}

// Animation der "highlight" kode keywords
function codeHighlightPulse() {
    const codeElements = document.querySelectorAll('.code-keyword, .code-function, .code-string');
    
    codeElements.forEach((el, i) => {
        gsap.to(el, {
            color: "#588157",
            duration: 0.5,
            repeat: 3,
            yoyo: true,
            delay: i * 0.2,
            ease: "power2.inOut"
        });
    });
}

// Animation der viser "flow" mellem UI elementer
function prototypeFlow() {
    const flowPath = document.querySelector('.flow-path');
    if (flowPath) {
        const pathLength = flowPath.getTotalLength();
        
        // Reset
        flowPath.style.strokeDasharray = pathLength;
        flowPath.style.strokeDashoffset = pathLength;
        
        gsap.to(flowPath, {
            strokeDashoffset: 0,
            duration: 3,
            repeat: -1,
            ease: "power1.inOut"
        });
    }
}


// Animerede data bars til kompetencer
function animateSkillBars() {
    gsap.utils.toArray('.skill-bar-container').forEach(container => {
        const skillLevel = container.getAttribute('data-level') || '80';
        const bar = container.querySelector('.skill-level');
        
        ScrollTrigger.create({
            trigger: container,
            start: "top 80%",
            onEnter: () => {
                gsap.to(bar, {
                    width: `${skillLevel}%`,
                    duration: 2,
                    ease: "elastic.out(1, 0.5)",
                    onUpdate: function() {
                        const currentWidth = Math.ceil(this.progress() * skillLevel);
                        const percentage = container.querySelector('.skill-percentage');
                        if (percentage) {
                            percentage.textContent = `${currentWidth}%`;
                        }
                    }
                });
            }
        });
    });
}
// Loading Animation
function initLoadingAnimation() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const pageTransition = document.querySelector('.page-transition');
            if (pageTransition) {
                pageTransition.classList.add('hidden');
            }
        }, 500);
    });
}

// Progress Bar
function initProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }
}

// Dark Mode Toggle
function initDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme or prefer-color-scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fa-solid fa-sun';
    }
    
    // Toggle theme
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.className = 'fa-solid fa-moon';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.className = 'fa-solid fa-sun';
        }
    });
}

// Email Copy Functionality
function initEmailCopy() {
    const emailButton = document.getElementById('email-button');
    if (!emailButton) return;
    
    emailButton.addEventListener('click', function(e) {
        e.preventDefault();
        const email = 'hello@silinda.design';
        
        // Copy to clipboard
        navigator.clipboard.writeText(email).then(() => {
            const original = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-check"></i> Email kopieret!';
            this.style.background = 'rgba(88, 129, 87, 0.1)';
            
            setTimeout(() => {
                this.innerHTML = original;
                this.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy email: ', err);
            // Fallback: Open mail client directly
            window.location.href = `mailto:${email}`;
        });
        
        // Open mail client as fallback
        window.location.href = `mailto:${email}`;
    });
}

// Animated Counters
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target') || 100;
        const increment = target / 50;
        let current = 0;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            counter.textContent = Math.ceil(current) + '+';
                            setTimeout(updateCounter, 30);
                        } else {
                            counter.textContent = target + '+';
                        }
                    };
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Hero Animations
function initHeroAnimations() {
    const heroElements = document.querySelectorAll('.title-line, .hero-description, .hero-buttons');
    if (heroElements.length) {
        gsap.set(heroElements, { y: 30, opacity: 0 });
        gsap.to(heroElements, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            delay: 0.5
        });
    }
    
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
    
    // Section animations
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });
}

// Skill Bars Animation
function initSkillBars() {
    const skillLevels = document.querySelectorAll('.skill-level');
    skillLevels.forEach(level => {
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

// Form Handling
function initForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sender...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            submitButton.innerHTML = '<i class="fa-solid fa-check"></i> Besked sendt!';
            submitButton.style.background = '#588157';
            
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                submitButton.style.background = '';
                contactForm.reset();
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

    // Smooth scrolling for anchor links
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
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

// Micro-interactions
function initMicroInteractions() {
    // Hover effects on interactive elements
    document.querySelectorAll('.skill-category, .education-card, .project-card').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Button click effects
    document.querySelectorAll('button:not(#theme-toggle), .button-primary, .button-secondary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Don't trigger for links that navigate
            if (this.tagName === 'A' && this.getAttribute('href') !== '#') return;
            
            gsap.to(this, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out'
            });
        });
    });

    // Social link hover effects
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                scale: 1.1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        
        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
}

// Custom Cursor - OPTIMERET TIL MAKSIMAL HASTIGHED
function initCustomCursor() {
    if ('ontouchstart' in window) return;
    
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    // Vi fjerner CSS transitions næsten helt for at undgå "input lag"
    dot.style.cssText = 'position:fixed;width:8px;height:8px;background:#588157;border-radius:50%;pointer-events:none;z-index:9997;transform:translate(-50%,-50%);'; 
    
    const outline = document.createElement('div');
    outline.className = 'cursor-outline';
    // transition sat til 0.05s så den føles responsiv men stadig blød
    outline.style.cssText = 'position:fixed;width:40px;height:40px;border:2px solid rgba(163,177,138,0.5);border-radius:50%;pointer-events:none;z-index:9996;transform:translate(-50%,-50%);transition: transform 0.1s ease-out, opacity 0.2s ease;'; 
    
    document.body.appendChild(dot);
    document.body.appendChild(outline);
    document.body.style.cursor = 'none';
    
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Prikken skal være 1:1 med musen (ingen forsinkelse)
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });
    
    // Smooth outline animation - MEGET HURTIGERE
    function animateOutline() {
        // Vi øger faktoren fra 0.1 til 0.3 for at gøre den mere "snappy"
        const speed = 0.3; 
        outlineX += (mouseX - outlineX) * speed;
        outlineY += (mouseY - outlineY) * speed;
        
        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';
        requestAnimationFrame(animateOutline);
    }
    animateOutline();
    
    // Hover effekter
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-category, .education-card, .social-link');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            outline.style.background = 'rgba(163, 177, 138, 0.1)';
        });
        
        el.addEventListener('mouseleave', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.background = 'transparent';
        });
    });
    
    // Skjul/vis cursor
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        outline.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        outline.style.opacity = '1';
    });
}
// Initialize custom cursor separately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
    initCustomCursor();
}

// Fallback for older browsers
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 1000 / 60);
    };
}

// Registrer ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Animationer kun kører i browseren
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    
    // ===== 1. TYPEWRITER ANIMATION =====
    const heroText = document.querySelector('#hero-text');
    if (heroText) {
      const originalText = heroText.textContent;
      heroText.textContent = '';
      heroText.style.overflow = 'hidden';
      heroText.style.borderRight = '2px solid #333';
      heroText.style.whiteSpace = 'nowrap';
      heroText.style.display = 'inline-block';
      
      let i = 0;
      const typeWriter = () => {
        if (i < originalText.length) {
          heroText.textContent += originalText.charAt(i);
          i++;
          setTimeout(typeWriter, 50);
        } else {
          setTimeout(() => {
            heroText.style.borderRight = 'none';
          }, 500);
        }
      };
      
      // Start med forsinkelse
      setTimeout(typeWriter, 300);
    }
    
    // ===== 2. FADE-IN PÅ SCROLL =====
    gsap.utils.toArray('section').forEach((section, i) => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 30,
        opacity: 0,
        duration: 1,
        delay: i * 0.1,
        ease: 'power2.out',
      });
    });
    
    // ===== 3. HOVER EFFECT PÅ PROJEKTER =====
    const projectCards = document.querySelectorAll('.project-card, .projekt-card'); // Begge mulige klasser
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });
    
    // ===== 4. COUNTER ANIMATION TIL STATISTIK =====
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const target = parseInt(stat.textContent.replace('+', ''));
      if (!isNaN(target)) {
        gsap.to(stat, {
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: stat,
            start: 'top 90%',
            once: true, // Kør kun én gang
          },
          onUpdate: function() {
            stat.textContent = Math.floor(this.targets()[0].innerText) + '+';
          },
        });
      }
    });
  });
}

