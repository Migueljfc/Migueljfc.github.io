if (history.scrollRestoration) { history.scrollRestoration = 'manual'; }
window.scrollTo(0, 0);

// --- LÓGICA DO CURSOR ---
// Verifica se o dispositivo suporta hover (rato)
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
            gsap.to(cursorOutline, { scale: 2.5, backgroundColor: "rgba(255,255,255,0.1)", border: "none", duration: 0.3 });
        });
        target.addEventListener('mouseleave', () => {
            gsap.to(cursorOutline, { scale: 1, backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.5)", duration: 0.3 });
        });
    });
}

// --- LOADING & ANIMATIONS ---
window.onload = function () {
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        lenis.stop();
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        const counterElement = document.querySelector(".loader-counter");
        let count = { value: 0 };
        const tl = gsap.timeline();

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
                }
            }, "-=0.5");

        setupScrollAnimations();
    } else {
        document.body.classList.remove("locked");
        document.querySelector('.preloader').style.display = 'none';
    }
};

function setupScrollAnimations() {
    gsap.utils.toArray('.skill-bar').forEach(bar => {
        gsap.to(bar, {
            width: bar.getAttribute('data-width'), duration: 1.5, ease: "power2.out",
            scrollTrigger: { trigger: bar, start: "top 85%" }
        });
    });

    gsap.utils.toArray('.reveal-content').forEach(el => {
        gsap.from(el, {
            y: 50, opacity: 0, duration: 1,
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });
}