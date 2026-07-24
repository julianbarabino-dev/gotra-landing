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
    // Target date: July 31, 2026 at 00:00:00 (Local time or UTC, let's make it local)
    const targetDate = new Date('2026-07-31T00:00:00').getTime();
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference <= 0) {
            // Reached release date
            const countdownWidget = document.getElementById('countdown-widget');
            if (countdownWidget) {
                countdownWidget.innerHTML = `
                    <h3 style="color: var(--secondary)">¡YA DISPONIBLE!</h3>
                    <p class="release-date" style="font-size: 1.2rem; font-weight: 700;">Muerto Al Fin ha sido lanzado en todas las plataformas</p>
                `;
            }
            return;
        }
        
        // Calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Render
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
});
