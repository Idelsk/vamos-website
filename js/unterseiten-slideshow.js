(() => {
    const slides = Array.from(document.querySelectorAll(".subpage-slide"));
    if (slides.length < 2) return;
    let activeIndex = 0;
    window.setInterval(() => {
        slides[activeIndex].classList.remove("is-active");
        activeIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex].classList.add("is-active");
    }, 5000);
})();
