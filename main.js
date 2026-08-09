/* ==============================================================
   ZAMAN — main.js
   Shared behavior across every page: header, mobile nav, wishlist,
   product-card rendering, shop filters/search/sort, scroll reveal,
   toast notifications, newsletter, back-to-top.
   ============================================================== */

const ZAMAN_WISHLIST_KEY = "zaman_wishlist";

/* ---------------- Wishlist storage ---------------- */
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(ZAMAN_WISHLIST_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveWishlist(list) {
  localStorage.setItem(ZAMAN_WISHLIST_KEY, JSON.stringify(list));
  updateWishlistBadge();
}
function isWishlisted(id) {
  return getWishlist().includes(Number(id));
}
function toggleWishlist(id) {
  id = Number(id);
  let list = getWishlist();
  let added;
  if (list.includes(id)) {
    list = list.filter((x) => x !== id);
    added = false;
  } else {
    list.push(id);
    added = true;
  }
  saveWishlist(list);
  document
    .querySelectorAll(`[data-wishlist-id="${id}"]`)
    .forEach((el) => el.classList.toggle("is-active", added));
  showToast(added ? "Added to wishlist" : "Removed from wishlist", "heart");
  return added;
}
function updateWishlistBadge() {
  const badge = document.querySelector("[data-wishlist-count]");
  if (badge) badge.textContent = getWishlist().length;
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function showToast(message, icon = "check") {
  const toast = document.getElementById("zaman-toast");
  if (!toast) return;
  const icons = {
    check:
      '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" stroke-width="1.5"/></svg>',
  };
  toast.querySelector(".toast-icon").innerHTML = icons[icon] || icons.check;
  toast.querySelector(".toast-msg").textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

/* ---------------- Star rating markup ---------------- */
function starMarkup(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/* ---------------- Product card renderer ---------------- */
function productCardHTML(p) {
  const wished = isWishlisted(p.id) ? "is-active" : "";
  const tag = p.oldPrice
    ? '<span class="product-tag sale">Sale</span>'
    : p.reviews > 100
    ? '<span class="product-tag">Bestseller</span>'
    : "";
  return `
  <article class="product-card reveal stagger-item" data-category="${p.category}" data-price="${p.price}" data-name="${p.name.toLowerCase()}">
    <div class="product-media">
      <a href="product.html?id=${p.id}" aria-label="View ${p.name}">
        <img src="${p.image}" alt="${p.name} — ${p.category} watch by ZAMAN" loading="lazy" width="600" height="750">
      </a>
      ${tag}
      <button class="wishlist-toggle ${wished}" data-wishlist-id="${p.id}" aria-label="Toggle wishlist for ${p.name}">
        <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" stroke-width="1.5"/></svg>
      </button>
      <a class="quick-view" href="product.html?id=${p.id}">Quick View</a>
    </div>
    <div class="product-info">
      <span class="product-category">${p.category}</span>
      <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <p class="product-desc">${p.description}</p>
      <div class="rating"><span class="stars">${starMarkup(p.rating)}</span> (${p.reviews})</div>
      <div class="price-row">
        <span class="price">${formatEGP(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old">${formatEGP(p.oldPrice)}</span>` : ""}
      </div>
      <button class="add-cart-btn" data-add-id="${p.id}">Add to Cart</button>
    </div>
  </article>`;
}

function renderProductGrid(container, products) {
  if (!container) return;
  if (!products.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke-width="1.2"/><path d="M21 21l-4.3-4.3" stroke-width="1.2" stroke-linecap="round"/></svg></div>
        <h3>No watches found</h3>
        <p>Try a different search term or clear your filters.</p>
      </div>`;
    return;
  }
  container.innerHTML = products.map(productCardHTML).join("");
  bindProductCardEvents(container);
  initRevealObserver();
}

function bindProductCardEvents(scope = document) {
  scope.querySelectorAll("[data-wishlist-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleWishlist(btn.dataset.wishlistId);
      btn.classList.add("pulse-badge");
      setTimeout(() => btn.classList.remove("pulse-badge"), 400);
    });
  });
  scope.querySelectorAll("[data-add-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const product = getProductById(btn.dataset.addId);
      if (!product) return;
      addToCart(product.id, 1);
      btn.textContent = "Added ✓";
      btn.classList.add("is-added");
      showToast(`${product.name} added to cart`);
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.classList.remove("is-added");
      }, 1600);
    });
  });
}

/* ---------------- Header scroll + mobile nav ---------------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (header && !header.classList.contains("is-solid")) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    onScroll();
  }

  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".mobile-nav");
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("is-open");
      mobileNav.classList.toggle("is-open");
      document.body.style.overflow = mobileNav.classList.contains("is-open") ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        hamburger.classList.remove("is-open");
        mobileNav.classList.remove("is-open");
        document.body.style.overflow = "";
      })
    );
  }
}

/* ---------------- Back to top ---------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 600);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------------- Scroll reveal ---------------- */
function initRevealObserver() {
  const items = document.querySelectorAll(".reveal:not(.is-visible), .reveal-stagger:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------------- Newsletter ---------------- */
function initNewsletter() {
  document.querySelectorAll(".newsletter-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      const msg = form.parentElement.querySelector(".newsletter-msg");
      if (input && input.value && input.checkValidity()) {
        if (msg) msg.textContent = "You're on the list — welcome to the ZAMAN Circle.";
        input.value = "";
      } else if (msg) {
        msg.textContent = "Please enter a valid email address.";
      }
    });
  });
}

/* ---------------- Shop page: search / filter / sort / paginate ---------------- */
function initShopPage() {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  let state = {
    query: "",
    categories: [],
    maxPrice: 15000,
    sort: "featured",
    page: 1,
    perPage: 8,
  };
  if (params.get("category")) state.categories = [params.get("category")];
  if (params.get("search")) state.query = params.get("search");

  const searchInput = document.getElementById("shop-search");
  const sortSelect = document.getElementById("shop-sort");
  const priceSlider = document.getElementById("price-slider");
  const priceLabel = document.getElementById("price-range-value");
  const resultsCount = document.getElementById("shop-results-count");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const categoryInputs = document.querySelectorAll("[data-category-filter]");
  if (searchInput && state.query) searchInput.value = state.query;

  function getFiltered() {
    let items = ZAMAN_PRODUCTS.slice();
    if (state.query) {
      const q = state.query.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (state.categories.length) {
      items = items.filter((p) => state.categories.includes(p.category));
    }
    items = items.filter((p) => p.price <= state.maxPrice);

    switch (state.sort) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        items.sort((a, b) => b.id - a.id);
        break;
    }
    return items;
  }

  function render() {
    const filtered = getFiltered();
    const visible = filtered.slice(0, state.page * state.perPage);
    renderProductGrid(grid, visible);
    if (resultsCount) resultsCount.textContent = `${filtered.length} watch${filtered.length === 1 ? "" : "es"}`;
    if (loadMoreBtn) loadMoreBtn.classList.toggle("hidden", visible.length >= filtered.length);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.query = searchInput.value.trim();
      state.page = 1;
      render();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      render();
    });
  }
  if (priceSlider) {
    priceSlider.addEventListener("input", () => {
      state.maxPrice = Number(priceSlider.value);
      if (priceLabel) priceLabel.textContent = formatEGP(state.maxPrice);
      state.page = 1;
      render();
    });
  }
  categoryInputs.forEach((input) => {
    if (state.categories.includes(input.value)) input.checked = true;
    input.addEventListener("change", () => {
      state.categories = Array.from(categoryInputs)
        .filter((i) => i.checked)
        .map((i) => i.value);
      state.page = 1;
      render();
    });
  });
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      state.page += 1;
      render();
    });
  }

  render();
}

/* ---------------- Home page: filterable best-sellers ---------------- */
function initBestSellers() {
  const grid = document.getElementById("bestsellers-grid");
  if (!grid) return;
  const chips = document.querySelectorAll("[data-filter-chip]");
  const bestsellers = ZAMAN_PRODUCTS.slice(0, 8);

  function render(category) {
    const items = category === "All" ? bestsellers : bestsellers.filter((p) => p.category === category);
    renderProductGrid(grid, items);
  }
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      render(chip.dataset.filterChip);
    });
  });
  render("All");
}

/* ---------------- Home page: featured collection ---------------- */
function initFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  renderProductGrid(grid, ZAMAN_PRODUCTS.slice(0, 4));
}

/* ---------------- Global search (header icon) ---------------- */
function initHeaderSearch() {
  const trigger = document.querySelector("[data-search-trigger]");
  const panel = document.getElementById("header-search-panel");
  if (!trigger || !panel) return;
  const input = panel.querySelector("input");
  trigger.addEventListener("click", () => {
    panel.classList.toggle("is-open");
    if (panel.classList.contains("is-open")) input.focus();
  });
  panel.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim()) {
      window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

/* ---------------- Init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initBackToTop();
  initNewsletter();
  initHeaderSearch();
  updateWishlistBadge();
  updateCartBadge();
  initFeatured();
  initBestSellers();
  initShopPage();
  initRevealObserver();

  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const group = field.closest(".form-group");
        if (!field.checkValidity()) {
          valid = false;
          group?.classList.add("has-error");
          const err = group?.querySelector(".form-error");
          if (err) err.textContent = field.validity.valueMissing ? "This field is required." : "Please check this field.";
        } else {
          group?.classList.remove("has-error");
          const err = group?.querySelector(".form-error");
          if (err) err.textContent = "";
        }
      });
      if (valid) {
        form.reset();
        const successEl = document.getElementById("contact-success");
        if (successEl) successEl.classList.remove("hidden");
        showToast("Message sent — we'll reply within 24 hours.");
      }
    });
  });
});
