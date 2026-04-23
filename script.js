const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const footerYear = document.querySelector("[data-year]");

if (navToggle && nav) {
  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    nav.dataset.open = "false";
  };

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.dataset.open = String(!expanded);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeNav();
    }
  });
}

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

