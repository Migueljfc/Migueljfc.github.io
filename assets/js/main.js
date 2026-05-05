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
    // --- i18n Localization System ---
    let currentLang = localStorage.getItem('site_lang') || 'pt';
    const langToggleBtn = document.getElementById('langToggle');

    function applyTranslations(lang) {
        if (!window.siteTranslations || !window.siteTranslations[lang]) return;
        const t = window.siteTranslations[lang];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.innerHTML = t[key];
        });

        if(t.contact_ph_name) {
            const f1 = document.getElementById('i18n-name');
            if(f1) f1.placeholder = t.contact_ph_name;
        }
        if(t.contact_ph_email) {
            const f2 = document.getElementById('i18n-email');
            if(f2) f2.placeholder = t.contact_ph_email;
        }
        if(t.contact_ph_subject) {
            const f3 = document.getElementById('i18n-subject');
            if(f3) f3.placeholder = t.contact_ph_subject;
        }
        if(t.contact_ph_msg) {
            const f4 = document.getElementById('i18n-msg');
            if(f4) f4.placeholder = t.contact_ph_msg;
        }

        if (langToggleBtn) {
            langToggleBtn.textContent = lang === 'pt' ? 'EN' : 'PT';
        }
    }

    applyTranslations(currentLang);

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            localStorage.setItem('site_lang', currentLang);
            applyTranslations(currentLang);
            
            if (window.typedInstance) {
                window.typedInstance.destroy();
                window.typedInstance = new Typed('#typed-text', {
                    strings: window.siteTranslations[currentLang].typed_strings,
                    typeSpeed: 50,
                    backSpeed: 30,
                    backDelay: 1500,
                    loop: true,
                    contentType: null
                });
            }
        });
    }

    // --- Contact Form AJAX Submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.getElementById('contactSubmitBtn');
            const feedback = document.getElementById('contactFeedback');
            const originalText = btn.textContent;
            
            // Loading state
            btn.disabled = true;
            btn.textContent = currentLang === 'pt' ? 'A enviar...' : 'Sending...';
            feedback.style.display = 'none';

            try {
                const formData = new FormData(contactForm);
                const res = await fetch('https://formsubmit.co/ajax/3bf70c7d243e2a10589d40e6db1d77c5', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    // Track conversion in Google Analytics
                    if (typeof gtag === 'function') {
                        gtag('event', 'generate_lead', {
                            'event_category': 'contact',
                            'event_label': 'portfolio_form'
                        });
                    }

                    feedback.textContent = currentLang === 'pt' ? '✓ Mensagem enviada com sucesso!' : '✓ Message sent successfully!';
                    feedback.style.color = '#22c55e';
                    feedback.style.display = 'block';
                    contactForm.reset();
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                feedback.textContent = currentLang === 'pt' ? '✕ Erro ao enviar. Tenta novamente.' : '✕ Failed to send. Please try again.';
                feedback.style.color = '#ef4444';
                feedback.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }

    // Stop lenis initially to wait for preloader
    lenis.stop();
    document.body.classList.add("locked");

    const percElement = document.querySelector(".loader-counter");
    const preloaderElement = document.getElementById("three-preloader");
    const canvasContainer = document.getElementById("three-canvas-container");
    const tl = gsap.timeline();

    if(percElement && preloaderElement && canvasContainer) {
        
        // --- THREE.JS SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        canvasContainer.appendChild(renderer.domElement);

        // Core geometry (Icosahedron)
        const geometry = new THREE.IcosahedronGeometry(1.5, 1);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x3b82f6, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Particles around it
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const posArray = new Float32Array(particlesCount * 3);
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0xc084fc,
            transparent: true,
            opacity: 0.5
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Resize handler
        window.addEventListener('resize', () => {
            if(camera && renderer && preloaderElement.style.display !== "none") {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            mesh.rotation.x += 0.005;
            mesh.rotation.y += 0.01;
            particlesMesh.rotation.y -= 0.002;
            renderer.render(scene, camera);
        };
        animate();

        // --- PROGRESS ANIMATION ---
        let count = { value: 0 };
        gsap.to(count, {
            value: 100, 
            duration: 2.5, 
            ease: "power2.inOut",
            onUpdate: function () { 
                percElement.textContent = Math.round(count.value) + "%"; 
                const scale = 1 + (count.value / 200);
                mesh.scale.set(scale, scale, scale);
                camera.position.z = 5 - (count.value / 100);
            },
            onComplete: function() {
                // The "Explosion / Dive in" Effect
                tl.to(".loader-content", { opacity: 0, duration: 0.3 })
                  .to(camera.position, { z: 0.1, duration: 1.0, ease: "power4.in" }, "dive")
                  .to(mesh.rotation, { y: mesh.rotation.y + Math.PI, duration: 1.0, ease: "power4.in" }, "dive")
                  .to(material, { opacity: 0, wireframeLinewidth: 5, duration: 1.0 }, "dive")
                  .to(particlesMaterial, { size: 0.1, opacity: 0, duration: 1.0 }, "dive")
                  .to(".overlay-curve", { opacity: 0, duration: 0.5 }, "dive")
                  .to(preloaderElement, { 
                      opacity: 0, 
                      duration: 0.5, 
                      ease: "power2.out",
                      onComplete: () => {
                          preloaderElement.style.display = "none";
                          const curve = document.querySelector(".overlay-curve");
                          if(curve) curve.style.display = "none";
                          cancelAnimationFrame(animationFrameId);
                          renderer.dispose();
                      }
                  }, ">-0.2")
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
                              const s = window.siteTranslations ? window.siteTranslations[currentLang].typed_strings : ["Computer Engineering Student"];
                              window.typedInstance = new Typed('#typed-text', {
                                  strings: s,
                                  typeSpeed: 50,
                                  backSpeed: 30,
                                  backDelay: 1500,
                                  loop: true,
                                  contentType: null
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
            }
        });
        
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

    // --- Interactive Terminal Logic ---
    const terminalInput = document.getElementById('terminal-input');
    const terminalHistory = document.getElementById('terminal-history');
    const terminalBody = document.getElementById('terminal-body');
    const terminalDisplay = document.getElementById('terminal-display');

    if (terminalInput && terminalHistory && terminalBody && terminalDisplay) {
        
        terminalInput.addEventListener('input', function() {
            terminalDisplay.textContent = terminalInput.value;
        });

        const availableCommands = ['whoami', 'pwd', 'ls', 'date', 'echo', 'clear', 'neofetch', 'sudo', 'help'];

        terminalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const currentVal = terminalInput.value.toLowerCase();
                const match = availableCommands.find(cmd => cmd.startsWith(currentVal));
                if (match) {
                    terminalInput.value = match;
                    terminalDisplay.textContent = match;
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = terminalInput.value.trim();
                const args = cmd.split(' ');
                const command = args[0].toLowerCase();
                
                // Emulate terminal prompt echoing
                const cmdLine = document.createElement('div');
                cmdLine.className = 'text-green-400 flex mt-2';
                cmdLine.innerHTML = `<span class="mr-2">$</span>${cmd}`;
                
                if (command !== 'clear' || cmd === '') {
                    terminalHistory.appendChild(cmdLine);
                }
                
                if (cmd === '') {
                    terminalInput.value = '';
                    terminalDisplay.textContent = '';
                    terminalBody.scrollTo({ top: terminalBody.scrollHeight, behavior: 'smooth' });
                    return;
                }

                const outputDiv = document.createElement('div');
                
                switch (command) {
                    case 'whoami':
                        outputDiv.className = 'text-gray-300';
                        outputDiv.textContent = 'Miguel Cabral';
                        break;
                    case 'pwd':
                        outputDiv.className = 'text-gray-300';
                        outputDiv.textContent = '/home/miguel/portfolio';
                        break;
                    case 'ls':
                        outputDiv.className = 'text-blue-400 font-bold flex gap-4 flex-wrap mt-1';
                        outputDiv.innerHTML = '<span>about.txt</span><span>skills.json</span><span>projects/</span><span>cv.pdf</span>';
                        break;
                    case 'date':
                        outputDiv.className = 'text-gray-300';
                        outputDiv.textContent = new Date().toString();
                        break;
                    case 'echo':
                        outputDiv.className = 'text-gray-300';
                        outputDiv.textContent = args.slice(1).join(' ');
                        break;
                    case 'clear':
                        terminalHistory.innerHTML = '';
                        break;
                    case 'neofetch':
                        outputDiv.className = 'text-blue-400';
                        outputDiv.innerHTML = 'OS: Zorin OS<br>Host: University of Aveiro<br>Major: Computer Engineering';
                        break;
                    case 'sudo':
                        outputDiv.className = 'text-red-500';
                        outputDiv.textContent = 'guest is not in the sudoers file. This incident will be reported.';
                        break;
                    case 'help':
                        outputDiv.className = 'text-gray-300 text-xs mt-1 leading-relaxed';
                        outputDiv.innerHTML = 'whoami&nbsp;&nbsp;&nbsp;&nbsp;- Print effective userid<br>ls&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- List directory contents<br>pwd&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Print working directory<br>date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Print system date<br>echo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Print text<br>neofetch&nbsp;&nbsp;- Show system info<br>clear&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Clear terminal<br>help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Display this help';
                        break;
                    default:
                        outputDiv.className = 'text-red-400';
                        outputDiv.textContent = `bash: ${command}: command not found`;
                }

                if (command !== 'clear') {
                    terminalHistory.appendChild(outputDiv);
                }

                terminalInput.value = '';
                terminalDisplay.textContent = '';
                terminalBody.scrollTo({ top: terminalBody.scrollHeight, behavior: 'smooth' });
            }
        });
    }

    // --- Project Preview Modal Logic ---
    const modal = document.getElementById('projectModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('modalClose');
    const modalIframe = document.getElementById('modalIframe');
    const modalTitle = document.getElementById('modalTitle');
    const modalRepoBtn = document.getElementById('modalRepoBtn');
    const modalLiveBtn = document.getElementById('modalLiveBtn');
    const modalLoader = document.getElementById('modalLoader');
    const modalContent = document.getElementById('modalContent');

    function openModal(card) {
        const repo = card.dataset.repo;
        const live = card.dataset.live;
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Project';
        const cardImg = card.querySelector('.portfolio-img-stub img');
        const iframeContainer = modalIframe.parentElement;

        // Clean up any previous image preview
        const oldImg = iframeContainer.querySelector('.modal-preview-img');
        if (oldImg) oldImg.remove();

        modalTitle.textContent = title;
        modalRepoBtn.href = repo && repo !== '#' ? repo : '#';

        // Helper: show card image as fallback inside modal
        function showImageFallback() {
            modalIframe.style.display = 'none';
            modalIframe.src = 'about:blank';
            modalLoader.style.display = 'none';
            const existing = iframeContainer.querySelector('.modal-preview-img');
            if (existing) return; // already showing
            if (cardImg) {
                const bigImg = document.createElement('img');
                bigImg.src = cardImg.src;
                bigImg.alt = cardImg.alt || title;
                bigImg.className = 'modal-preview-img';
                bigImg.style.cssText = 'width:100%; height:100%; min-height:450px; object-fit:contain; display:block;';
                iframeContainer.appendChild(bigImg);
            } else {
                modalLoader.textContent = 'Sem preview disponível';
                modalLoader.style.display = 'block';
            }
        }
        
        if (live) {
            modalLiveBtn.style.display = 'inline-flex';
            modalLiveBtn.href = live;

            // Pre-validate URL before loading iframe
            modalIframe.style.display = 'block';
            modalLoader.style.display = 'block';
            modalLoader.textContent = 'Carregando preview...';
            modalIframe.style.opacity = '0';

            // Use fetch to test if the URL is reachable and iframe-friendly
            const controller = new AbortController();
            const fetchTimeout = setTimeout(() => controller.abort(), 4000);

            fetch(live, { mode: 'no-cors', signal: controller.signal, redirect: 'follow' })
                .then(() => {
                    clearTimeout(fetchTimeout);
                    // URL seems reachable — try iframe
                    modalIframe.src = live;

                    let iframeLoaded = false;
                    const iframeTimeout = setTimeout(() => {
                        if (!iframeLoaded) showImageFallback();
                    }, 6000);
                    
                    modalIframe.onload = function() {
                        iframeLoaded = true;
                        clearTimeout(iframeTimeout);
                        try {
                            const doc = modalIframe.contentDocument || modalIframe.contentWindow.document;
                            if (doc && doc.body && doc.body.innerHTML.length < 50) {
                                showImageFallback();
                                return;
                            }
                        } catch(e) { /* cross-origin, that's ok */ }
                        modalLoader.style.display = 'none';
                        modalIframe.style.opacity = '1';
                    };

                    modalIframe.onerror = function() {
                        iframeLoaded = true;
                        clearTimeout(iframeTimeout);
                        showImageFallback();
                    };
                })
                .catch(() => {
                    clearTimeout(fetchTimeout);
                    // URL unreachable (redirect loop, network error, etc) — show image
                    showImageFallback();
                });
        } else {
            modalLiveBtn.style.display = 'none';
            showImageFallback();
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        lenis.stop();

        // Animate in
        gsap.fromTo(modalBackdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(modalContent, { scale: 0.9, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }

    function closeModal() {
        gsap.to(modalContent, { scale: 0.95, opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' });
        gsap.to(modalBackdrop, { opacity: 0, duration: 0.25, onComplete: () => {
            modal.style.display = 'none';
            modalIframe.src = 'about:blank';
            const oldImg = modalIframe.parentElement.querySelector('.modal-preview-img');
            if (oldImg) oldImg.remove();
            modalLoader.textContent = 'Carregando preview...';
            document.body.style.overflow = '';
            lenis.start();
        }});
    }

    if (modal) {
        // Button clicks on cards
        document.querySelectorAll('.project-preview-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const card = this.closest('.portfolio-card');
                if (card) openModal(card);
            });
        });

        // Close handlers
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
        
        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
    }

};