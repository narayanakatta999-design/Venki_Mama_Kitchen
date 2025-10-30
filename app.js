// basic interactivity (same as scaffold shortened)
const navLinks = Array.from(document.querySelectorAll("[data-link]"));
navLinks.forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // set active class on click
    navLinks.forEach((n) => n.classList.remove("tab-active"));
    a.classList.add("tab-active");
  });
});
// initialize active tab based on URL hash or default to first nav link
try {
  const preferred =
    document.querySelector(`[href="${location.hash || "#menu"}"][data-link]`) ||
    navLinks[0];
  if (preferred)
    navLinks.forEach((n) => n.classList.remove("tab-active")) ||
      preferred.classList.add("tab-active");
} catch (e) {
  /* ignore when run outside browser */
}

// Scrollspy: highlight the nav link for the section in view
const sections = Array.from(document.querySelectorAll("main section[id]"));
if ("IntersectionObserver" in window && sections.length) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = document.querySelector(`[href="#${id}"][data-link]`);
        if (entry.isIntersecting) {
          navLinks.forEach((n) => n.classList.remove("tab-active"));
          if (link) link.classList.add("tab-active");
        }
      });
    },
    { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}
document.getElementById("year").textContent = new Date().getFullYear();
async function loadMenu() {
  try {
    const res = await fetch("menu.json", { cache: "no-store" });
    const items = await res.json();
    renderMenu(items);
    initFilters(items);
  } catch (e) {
    document.getElementById("menu-list").innerHTML =
      "<p>Could not load menu.</p>";
  }
}

function renderMenu(items) {
  const list = document.getElementById("menu-list");
  const tpl = document.getElementById("menu-card-template");
  list.textContent = "";
  // adjust grid behavior when very few items
  list.classList.remove("count-1", "count-2");
  if (items.length === 1) list.classList.add("count-1");
  else if (items.length === 2) list.classList.add("count-2");
  items.forEach((it) => {
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector(".menu-img");
    img.src = it.image || "assets/placeholder.jpg";
    img.alt = it.name;
    node.querySelector(".menu-title").textContent = it.name;
    node.querySelector(".menu-price").textContent = `₹${Number(
      it.price
    ).toFixed(2)}`;
    node.querySelector(".menu-desc").textContent = it.description || "";
    node.querySelector(".menu-tag").textContent = it.category;
    list.appendChild(node);
  });
}

function initFilters(items) {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      renderMenu(
        f === "all" ? items : items.filter((i) => i.filterGroup === f)
      );
    });
  });
}
loadMenu();

// Full-menu image viewer: loads pages (e.g. assets/menu_page1.jpg, assets/menu_page2.jpg)
const viewFullBtn = document.getElementById("view-full-menu");
const fullMenuWrap = document.getElementById("full-menu");
const fullMenuList = document.getElementById("full-menu-list");
const closeFullBtn = document.getElementById("close-full-menu");

// Mobile nav toggle
(function () {
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("nav-toggle");
  if (!nav || !toggle) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  // close nav when link clicked
  document.querySelectorAll(".nav-links [data-link]").forEach((a) =>
    a.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    })
  );
  // close on resize to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800 && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

/* Mobile hero display fallback: ensure the animated text hero replaces the <picture> on narrow viewports
   This helps in edge cases where CSS rules aren't applied or when you want a JS-driven swap. */
(function mobileHeroFallback() {
  if (typeof window === "undefined") return;
  const mq = window.matchMedia("(max-width:800px)");
  // select either a <picture> (if present) or the fallback <img> inside .hero
  const picture = document.querySelector(".hero picture, .hero img");
  const mobile = document.querySelector(".hero-mobile");
  if (!picture || !mobile) return;
  function update() {
    if (mq.matches) {
      picture.style.display = "none";
      mobile.style.display = "block";
      mobile.setAttribute("aria-hidden", "false");
      picture.setAttribute("aria-hidden", "true");
    } else {
      picture.style.display = "";
      mobile.style.display = "none";
      mobile.setAttribute("aria-hidden", "true");
      picture.setAttribute("aria-hidden", "false");
    }
  }
  // run once and keep in sync with viewport changes
  update();
  if (typeof mq.addEventListener === "function") mq.addEventListener("change", update);
  else if (typeof mq.addListener === "function") mq.addListener(update);
})();

function showFullMenu(pages) {
  if (!fullMenuWrap || !fullMenuList) return;
  fullMenuList.innerHTML = "";
  pages.forEach((src) => {
    const img = document.createElement("img");
    img.src = src.trim();
    img.className = "full-menu-img";
    img.loading = "lazy";
    img.alt = "Menu page";
    fullMenuList.appendChild(img);
  });
  fullMenuWrap.hidden = false;
  fullMenuWrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (viewFullBtn) {
  viewFullBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const pages = viewFullBtn.dataset.pages
      ? viewFullBtn.dataset.pages.split(",")
      : ["assets/menu_page1.jpg", "assets/menu_page2.jpg"];
    showFullMenu(pages);
  });
}

if (closeFullBtn) {
  closeFullBtn.addEventListener("click", () => {
    if (fullMenuWrap) fullMenuWrap.hidden = true;
    if (fullMenuList) fullMenuList.innerHTML = "";
    viewFullBtn && viewFullBtn.focus();
  });
}

/* Hero carousel functionality (init after DOM) */
(function () {
  const carousel = document.getElementById("hero-carousel");
  if (!carousel) return;
  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const prev = carousel.querySelector(".carousel-button.prev");
  const next = carousel.querySelector(".carousel-button.next");
  const indicatorsWrap = carousel.querySelector(".carousel-indicators");
  let current = 0;
  let autoplayId = null;
  const AUTOPLAY_MS = 4000;

  slides.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Slide ${i + 1}`);
    btn.dataset.index = i;
    btn.addEventListener("click", () => goTo(i));
    if (i === 0) btn.setAttribute("aria-selected", "true");
    indicatorsWrap.appendChild(btn);
  });

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    Array.from(indicatorsWrap.children).forEach((b, idx) =>
      b.setAttribute("aria-selected", idx === current ? "true" : "false")
    );
  }

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    update();
  }

  function nextSlide() {
    goTo(current + 1);
  }

  function prevSlide() {
    goTo(current - 1);
  }

  next &&
    next.addEventListener("click", () => {
      nextSlide();
      resetAutoplay();
    });
  prev &&
    prev.addEventListener("click", () => {
      prevSlide();
      resetAutoplay();
    });

  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      nextSlide();
      resetAutoplay();
    }
    if (e.key === "ArrowLeft") {
      prevSlide();
      resetAutoplay();
    }
  });

  function startAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = setInterval(nextSlide, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusout", startAutoplay);

  carousel.setAttribute("tabindex", "0");
  update();
  startAutoplay();
})();
