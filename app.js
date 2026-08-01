document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mobile Menu Toggle ---
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (btnMenuToggle && mainNav) {
        btnMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = btnMenuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                const icon = btnMenuToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- 2. Countdown Timer ---
    // Target date: July 31, 2026 at 00:00:00 (Local time)
    const targetDate = new Date('2026-07-31T00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const countdownWidget = document.getElementById('countdown-widget');
        if (!countdownWidget) return;

        if (difference <= 0) {
            // Reached release date - Show a subtle, clean text below the button
            countdownWidget.innerHTML = `
                <p class="release-notification-text">¡Ya disponible en plataformas digitales!</p>
            `;
            return;
        }

        // Calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // If the countdown structure isn't rendered yet (because we removed it from static HTML), render it once
        if (!document.getElementById('days')) {
            countdownWidget.innerHTML = `
                <div class="countdown-container">
                    <h3>El final comienza en</h3>
                    <div class="timer">
                        <div class="time-block">
                            <span class="time-num" id="days">00</span>
                            <span class="time-label">Días</span>
                        </div>
                        <div class="time-block">
                            <span class="time-num" id="hours">00</span>
                            <span class="time-label">Horas</span>
                        </div>
                        <div class="time-block">
                            <span class="time-num" id="minutes">00</span>
                            <span class="time-label">Min</span>
                        </div>
                        <div class="time-block">
                            <span class="time-num" id="seconds">00</span>
                            <span class="time-label">Seg</span>
                        </div>
                    </div>
                    <p class="release-date">31 de Julio de 2026</p>
                </div>
            `;
        }

        // Render values
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // Run countdown immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // --- 3. Scroll Active Link Highlight & Fade-in Animations ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 4. Simple Reveal on Scroll using Intersection Observer ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add class fade-in-scroll to items we want to animate on scroll
    const itemsToAnimate = document.querySelectorAll('.img-frame, .tarot-card, .vintage-manuscript-card, .contact-details-box, .contact-form-box');
    itemsToAnimate.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        revealObserver.observe(item);
    });

    // CSS rule simulation via JS since we style dynamic entrance:
    document.body.insertAdjacentHTML('beforeend', `
        <style>
            .fade-in-visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);

    // --- 5. Show/Hide Header on Scroll ---
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Don't trigger hide if menu is open
        if (mainNav && mainNav.classList.contains('active')) {
            return;
        }

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide header
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show header
            header.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
    });

    // --- 6. Formspree AJAX Contact Form Handling ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('#btn-submit-contact');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            const data = new FormData(contactForm);
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Reemplazar el formulario por un mensaje de éxito estético
                    contactForm.style.transition = 'opacity 0.3s ease';
                    contactForm.style.opacity = '0';
                    setTimeout(() => {
                        contactForm.innerHTML = `
                            <div class="form-success-message" style="text-align: center; padding: 40px 20px; animation: fadeIn 0.8s ease forwards;">
                                <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: var(--primary); margin-bottom: 20px; text-shadow: 0 0 15px var(--primary-glow);"></i>
                                <h3 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 15px; color: var(--text-main);">¡Mensaje Recibido!</h3>
                                <p style="font-family: var(--font-body); color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
                                    Recibimos tu mensaje. Te contactaremos a la brevedad.
                                </p>
                            </div>
                        `;
                        contactForm.style.opacity = '1';
                    }, 300);
                } else {
                    const responseData = await response.json();
                    throw new Error(responseData.error || 'Error al procesar el mensaje.');
                }
            } catch (error) {
                alert('Ocurrió un error al enviar el mensaje: ' + error.message);
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // --- 7. & 8. Press Carousel Navigation & Active Card Sync ---
    const pressCarousel = document.getElementById('press-carousel');
    const btnPressPrev = document.getElementById('btn-press-prev');
    const btnPressNext = document.getElementById('btn-press-next');
    const carouselIndicators = document.getElementById('carousel-indicators');

    if (pressCarousel) {
        const cards = pressCarousel.querySelectorAll('.press-card');
        const dots = carouselIndicators ? carouselIndicators.querySelectorAll('.indicator-dot') : [];

        const updateActiveState = (index) => {
            const targetIndex = Math.max(0, Math.min(index, cards.length - 1));
            cards.forEach((card, i) => {
                card.classList.toggle('active', i === targetIndex);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === targetIndex);
            });
        };

        // Sincronizar al hacer scroll (táctil, mouse wheel o botones)
        let scrollTimeout;
        pressCarousel.addEventListener('scroll', () => {
            if (!cards.length) return;
            const scrollLeft = pressCarousel.scrollLeft;
            const cardWidth = cards[0].clientWidth;
            const gap = 24;
            const index = Math.round(scrollLeft / (cardWidth + gap));
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateActiveState(index);
            }, 50);
        });

        // Controles flechas
        if (btnPressPrev && btnPressNext) {
            btnPressPrev.addEventListener('click', () => {
                const cardWidth = cards[0] ? cards[0].clientWidth : 450;
                pressCarousel.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
            });
            btnPressNext.addEventListener('click', () => {
                const cardWidth = cards[0] ? cards[0].clientWidth : 450;
                pressCarousel.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
            });
        }

        // Clic en viñetas / bullets
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                const targetIdx = isNaN(slideIndex) ? i : slideIndex;
                if (!cards.length) return;
                const cardWidth = cards[0].clientWidth;
                const gap = 24;

                pressCarousel.scrollTo({
                    left: targetIdx * (cardWidth + gap),
                    behavior: 'smooth'
                });
                updateActiveState(targetIdx);
            });
        });
    }
});
