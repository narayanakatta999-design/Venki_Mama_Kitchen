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
