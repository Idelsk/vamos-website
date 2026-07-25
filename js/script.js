/* =========================================================
   VAMOS LAGER – NAVIGATION UND HERO-SLIDESHOW
   Datei: js/script.js
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initializeMobileNavigation();
    initializeCurrentYear();
    initializeSlideshow();
});

/* ---------- MOBILMENÜ ---------- */

function initializeMobileNavigation() {
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".main-nav");

    if (!menuButton || !navigation) {
        return;
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");

        document.body.classList.toggle("menu-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.textContent = isOpen ? "✕" : "☰";
    });

    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            document.body.classList.remove("menu-open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.textContent = "☰";
        });
    });
}

/* ---------- JAHR IM FOOTER ---------- */

function initializeCurrentYear() {
    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/* ---------- SLIDESHOW ---------- */

async function initializeSlideshow() {
    const slideshow = document.getElementById("slideshow");
    const dotsContainer = document.getElementById("slide-dots");
    const previousButton = document.getElementById("previous-slide");
    const nextButton = document.getElementById("next-slide");

    if (!slideshow) {
        return;
    }

    /*
     * Die Funktion sucht automatisch nach:
     * img/slideshow/slide1.jpg
     * img/slideshow/slide1.jpeg
     * img/slideshow/slide1.png
     * img/slideshow/slide1.webp
     *
     * Danach slide2, slide3 usw. bis slide20.
     */
    const imagePaths = await findAvailableSlides(20);

    if (imagePaths.length === 0) {
        slideshow.innerHTML = `
            <div class="slideshow-empty-message">
                <p>
                    Lege deine Bilder als
                    <strong>slide1.jpg, slide2.jpg, slide3.jpg</strong>
                    usw. im Ordner <strong>img/slideshow</strong> ab.
                </p>
            </div>
        `;

        if (previousButton) {
            previousButton.hidden = true;
        }

        if (nextButton) {
            nextButton.hidden = true;
        }

        if (dotsContainer) {
            dotsContainer.hidden = true;
        }

        return;
    }

    const slides = imagePaths.map((path, index) => {
        const image = document.createElement("img");

        image.className = "slide";
        image.src = path;
        image.alt = "";
        image.loading = index === 0 ? "eager" : "lazy";
        image.decoding = "async";

        if (index === 0) {
            image.classList.add("active");
        }

        slideshow.appendChild(image);
        return image;
    });

    let currentSlide = 0;
    let timerId = null;
    const intervalMilliseconds = 6500;

    const dots = createDots(
        slides.length,
        dotsContainer,
        (selectedIndex) => {
            showSlide(selectedIndex);
            restartTimer();
        }
    );

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === currentSlide;

            dot.classList.toggle("active", isActive);
            dot.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function showNextSlide() {
        showSlide(currentSlide + 1);
    }

    function showPreviousSlide() {
        showSlide(currentSlide - 1);
    }

    function startTimer() {
        if (slides.length > 1) {
            timerId = window.setInterval(showNextSlide, intervalMilliseconds);
        }
    }

    function stopTimer() {
        if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
        }
    }

    function restartTimer() {
        stopTimer();
        startTimer();
    }

    previousButton?.addEventListener("click", () => {
        showPreviousSlide();
        restartTimer();
    });

    nextButton?.addEventListener("click", () => {
        showNextSlide();
        restartTimer();
    });

    slideshow.closest(".hero")?.addEventListener("mouseenter", stopTimer);
    slideshow.closest(".hero")?.addEventListener("mouseleave", startTimer);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopTimer();
        } else {
            restartTimer();
        }
    });

    if (slides.length === 1) {
        previousButton?.setAttribute("hidden", "");
        nextButton?.setAttribute("hidden", "");
        dotsContainer?.setAttribute("hidden", "");
    }

    startTimer();
}

/* ---------- VORHANDENE DATEIEN FINDEN ---------- */

async function findAvailableSlides(maximumNumber) {
    const extensions = [
    "jpg",
    "JPG",
    "jpeg",
    "JPEG",
    "png",
    "PNG",
    "webp",
    "WEBP"
];
    const discoveredPaths = [];

    for (let number = 1; number <= maximumNumber; number += 1) {
        let imageFound = false;

        for (const extension of extensions) {
            const path = `img/slideshow/slide${number}.${extension}`;

            if (await imageExists(path)) {
                discoveredPaths.push(path);
                imageFound = true;
                break;
            }
        }

        /*
         * Nach drei aufeinanderfolgenden fehlenden Nummern stoppen.
         * So muss nicht immer bis slide20 geprüft werden.
         */
        if (!imageFound && number > discoveredPaths.length + 2) {
            break;
        }
    }

    return discoveredPaths;
}

function imageExists(path) {
    return new Promise((resolve) => {
        const testImage = new Image();

        testImage.onload = () => resolve(true);
        testImage.onerror = () => resolve(false);
        testImage.src = path;
    });
}

/* ---------- NAVIGATIONSPUNKTE DER SLIDESHOW ---------- */

function createDots(numberOfSlides, container, onSelect) {
    if (!container) {
        return [];
    }

    container.innerHTML = "";

    return Array.from({ length: numberOfSlides }, (_, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "slide-dot";
        dot.setAttribute("aria-label", `Bild ${index + 1} anzeigen`);

        if (index === 0) {
            dot.classList.add("active");
            dot.setAttribute("aria-current", "true");
        }

        dot.addEventListener("click", () => onSelect(index));
        container.appendChild(dot);

        return dot;
    });
}
