// Smooth scrolling with Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- LÓGICA DO CURSOR ---
const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (isDesktop) {
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");
    let mouseX = 0, mouseY = 0;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.1 });
    });

    const xTo = gsap.quickTo(cursorOutline, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(cursorOutline, "y", { duration: 0.5, ease: "power3" });

    window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });

    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .form-btn, .card');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            gsap.to(cursorOutline, { scale: 2.5, backgroundColor: "rgba(59,130,246,0.1)", border: "none", duration: 0.3 });
        });
        target.addEventListener('mouseleave', () => {
            gsap.to(cursorOutline, { scale: 1, backgroundColor: "transparent", border: "1px solid rgba(96, 165, 250, 0.5)", duration: 0.3 });
        });
    });
}

window.onload = function() {
    
    // Stop lenis initially to wait for preloader
    lenis.stop();
    document.body.classList.add("locked");

    const counterElement = document.querySelector(".loader-counter");
    let count = { value: 0 };
    const tl = gsap.timeline();

    if(counterElement) {
        tl.to(".loader-logo", { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" })
            .to(count, {
                value: 100, duration: 2, ease: "power2.inOut",
                onUpdate: function () { counterElement.textContent = Math.round(count.value) + "%"; }
            })
            .to(".loader-content", { y: -50, opacity: 0, duration: 0.5 })
            .to(".preloader", { height: 0, duration: 1.2, ease: "power4.inOut" })
            .to(".overlay-curve", { height: 0, duration: 1.2, ease: "power4.inOut", delay: -1.0 })
            .to(".mask-text", {
                y: "0%", duration: 1.2, stagger: 0.1, ease: "power4.out",
                onStart: () => {
                    document.body.classList.remove("locked");
                    lenis.start();

                    // Initialize Vanta.js
                    if(document.getElementById('vanta-bg')) {
                        VANTA.NET({
                            el: "#vanta-bg",
                            mouseControls: true,
                            touchControls: true,
                            gyroControls: false,
                            minHeight: 200.00,
                            minWidth: 200.00,
                            scale: 1.00,
                            scaleMobile: 1.00,
                            color: 0x3b82f6,
                            backgroundColor: 0x000000,
                            points: 12.00,
                            maxDistance: 22.00,
                            spacing: 20.00
                        });
                    }

                    // Initialize Typed.js
                    if(document.getElementById('typed-text')) {
                        new Typed('#typed-text', {
                            strings: [
                                "Computer Engineering Student",
                                "Backend Developer",
                                "Problem Solver",
                                "Tech Enthusiast"
                            ],
                            typeSpeed: 50,
                            backSpeed: 30,
                            backDelay: 1500,
                            loop: true
                        });
                    }

                    // Initialize VanillaTilt for cards
                    const cards = document.querySelectorAll(".glass-card:not(.portfolio-card)");
                    if (cards.length > 0) {
                        VanillaTilt.init(cards, {
                            max: 5,
                            speed: 400,
                            glare: true,
                            "max-glare": 0.1
                        });
                    }

                    // Initialize Swiper.js for Portfolio
                    if (typeof Swiper !== 'undefined' && document.querySelector('.portfolio-swiper')) {
                        new Swiper('.portfolio-swiper', {
                            effect: 'coverflow',
                            grabCursor: true,
                            centeredSlides: true,
                            slidesPerView: 'auto',
                            initialSlide: 1, // Start on middle slide
                            coverflowEffect: {
                                rotate: 20,
                                stretch: 0,
                                depth: 200,
                                modifier: 1,
                                slideShadows: false, // Turned off since we have dark theme glass shadows
                            },
                            pagination: {
                                el: '.swiper-pagination',
                                clickable: true,
                            },
                            navigation: {
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            },
                        });
                    }
                }
            }, "-=0.5");
        
        // Animate rest of hero on load alongside the mask
        gsap.from(".logo-box", { y: -20, opacity: 0, duration: 0.8, ease: "power2.out", delay: 3.5 });
        gsap.from(".logo-text", { x: -20, opacity: 0, duration: 0.8, ease: "power2.out", delay: 3.7 });
        gsap.from(".nav-link", { y: -20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 3.8 });
        gsap.from(".terminal-window", { scale: 0.9, opacity: 0, duration: 1, ease: "power4.out", delay: 4.1, stagger: 0.2 });
    } else {
        document.body.classList.remove("locked");
        lenis.start();
    }

    // Reveal elements on scroll
    const revealElements = document.querySelectorAll('.reveal-content');
    revealElements.forEach(el => {
        gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            }
        });
    });

    // Animate skill bars
    const skillBars = document.querySelectorAll('.progress-bar');
    skillBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%'; // reset strictly for animation
        
        gsap.to(bar, {
            width: targetWidth,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: bar,
                start: "top 85%"
            }
        });
    });

    // Mobile Toggle logic
    const toggle = document.getElementById('mobileToggle');
    const linksMenu = document.getElementById('navLinks');
    if(toggle && linksMenu) {
        toggle.addEventListener('click', () => {
            linksMenu.classList.toggle('active');
        });
    }

    // Navbar Scrolled Effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if(navbar) {
            if(window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

};