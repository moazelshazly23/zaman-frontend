/* ==============================================================
   ZAMAN — product.js
   Renders the single product page from the ?id= query param:
   gallery, strap options, quantity, add-to-cart / buy now,
   accordions, and a related-products strip.
   ============================================================== */

function initProductPage() {
  const root = document.getElementById("product-root");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get("id") || 1);

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <h3>Watch not found</h3>
        <p>The piece you're looking for may have sold out or moved.</p>
        <a class="btn btn-primary" href="shop.html">Back to Shop</a>
      </div>`;
    return;
  }

  document.title = `${product.name} — ZAMAN`;

  let qty = 1;
  const straps = ["Original", "Alternate Strap"];
  let activeStrap = straps[0];
  let activeImage = 0;

  function render() {
    root.innerHTML = `
      <div class="product-page">
        <div class="product-gallery">
          <div class="gallery-main">
            <img id="gallery-main-img" src="${product.images[activeImage]}" alt="${product.name} detail view" width="700" height="700">
          </div>
          <div class="gallery-thumbs">
            ${product.images
              .map(
                (img, i) => `
              <button class="${i === activeImage ? "is-active" : ""}" data-thumb="${i}" aria-label="View image ${i + 1}">
                <img src="${img}" alt="${product.name} thumbnail ${i + 1}" width="84" height="84">
              </button>`
              )
              .join("")}
          </div>
        </div>

        <div class="product-detail">
          <span class="product-detail-category">${product.category}</span>
          <h1>${product.name}</h1>
          <div class="product-detail-rating">
            <span class="stars" style="color:var(--gold)">${starMarkup(product.rating)}</span>
            <span>${product.rating.toFixed(1)} · ${product.reviews} reviews</span>
          </div>
          <div class="product-detail-price">
            <span class="price">${formatEGP(product.price)}</span>
            ${product.oldPrice ? `<span class="price-old">${formatEGP(product.oldPrice)}</span>` : ""}
            ${
              product.oldPrice
                ? `<span class="discount-badge">−${Math.round(100 - (product.price / product.oldPrice) * 100)}%</span>`
                : ""
            }
          </div>
          <p class="product-detail-desc">${product.description}</p>

          <div class="option-block">
            <span>Strap</span>
            <div class="strap-options">
              ${straps
                .map((s) => `<button data-strap="${s}" class="${s === activeStrap ? "is-active" : ""}">${s}</button>`)
                .join("")}
            </div>
          </div>

          <div class="option-block">
            <span>Quantity</span>
            <div class="qty-selector">
              <button id="qty-dec" aria-label="Decrease quantity">−</button>
              <span id="qty-val">${qty}</span>
              <button id="qty-inc" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div class="product-actions">
            <button class="btn btn-outline-dark wishlist-btn-lg ${isWishlisted(product.id) ? "is-active" : ""}" id="pdp-wishlist" data-wishlist-id="${product.id}" aria-label="Toggle wishlist">
              <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" stroke-width="1.5"/></svg>
            </button>
            <button class="btn btn-outline-dark" id="pdp-add-cart">Add to Cart</button>
            <button class="btn btn-primary" id="pdp-buy-now">Buy Now</button>
          </div>

          <div class="trust-row">
            <div><svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="1" stroke-width="1.3"/><path d="M7 7V5a5 5 0 0 1 10 0v2" stroke-width="1.3"/></svg> 2-year international warranty</div>
            <div><svg viewBox="0 0 24 24"><path d="M3 7h13l4 5v6h-2M3 7v10h2M16 7v11" stroke-width="1.3"/><circle cx="7" cy="18" r="2" stroke-width="1.3"/><circle cx="18" cy="18" r="2" stroke-width="1.3"/></svg> Free shipping over EGP 8,000</div>
            <div><svg viewBox="0 0 24 24"><path d="M4 4v6h6M20 20v-6h-6" stroke-width="1.3"/><path d="M5 15a8 8 0 0 0 14.5 3M19 9A8 8 0 0 0 4.5 6" stroke-width="1.3"/></svg> 14-day free returns</div>
          </div>

          <div class="accordion">
            <div class="accordion-item">
              <button class="accordion-trigger">Specifications <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-width="1.5" stroke-linecap="round"/></svg></button>
              <div class="accordion-panel"><div class="accordion-panel-inner">
                <table class="spec-table">
                  <tr><td>Movement</td><td>${product.movement}</td></tr>
                  <tr><td>Case</td><td>${product.caseMaterial}</td></tr>
                  <tr><td>Glass</td><td>${product.glass}</td></tr>
                  <tr><td>Strap</td><td>${product.strap}</td></tr>
                  <tr><td>Water Resistance</td><td>${product.waterResistance}</td></tr>
                  <tr><td>Case Diameter</td><td>${product.caseDiameter}</td></tr>
                </table>
              </div></div>
            </div>
            <div class="accordion-item">
              <button class="accordion-trigger">Shipping Information <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-width="1.5" stroke-linecap="round"/></svg></button>
              <div class="accordion-panel"><div class="accordion-panel-inner">
                <p>Orders across Egypt ship within 2–4 business days via tracked courier. Cairo and Giza orders typically arrive within 24–48 hours. Shipping is free on orders over EGP 8,000; otherwise a flat EGP 150 fee applies.</p>
              </div></div>
            </div>
            <div class="accordion-item">
              <button class="accordion-trigger">Returns &amp; Warranty <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-width="1.5" stroke-linecap="round"/></svg></button>
              <div class="accordion-panel"><div class="accordion-panel-inner">
                <p>Every ZAMAN watch carries a 2-year international movement warranty. Unworn pieces in original packaging can be returned within 14 days of delivery for a full refund.</p>
              </div></div>
            </div>
          </div>
        </div>
      </div>`;

    bindProductEvents();
  }

  function bindProductEvents() {
    root.querySelectorAll("[data-thumb]").forEach((btn) =>
      btn.addEventListener("click", () => {
        activeImage = Number(btn.dataset.thumb);
        document.getElementById("gallery-main-img").src = product.images[activeImage];
        root.querySelectorAll("[data-thumb]").forEach((b) => b.classList.toggle("is-active", b === btn));
      })
    );

    root.querySelectorAll("[data-strap]").forEach((btn) =>
      btn.addEventListener("click", () => {
        activeStrap = btn.dataset.strap;
        root.querySelectorAll("[data-strap]").forEach((b) => b.classList.toggle("is-active", b === btn));
      })
    );

    document.getElementById("qty-inc").addEventListener("click", () => {
      qty += 1;
      document.getElementById("qty-val").textContent = qty;
    });
    document.getElementById("qty-dec").addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      document.getElementById("qty-val").textContent = qty;
    });

    document.getElementById("pdp-add-cart").addEventListener("click", () => {
      addToCart(product.id, qty, activeStrap);
      showToast(`${product.name} added to cart`);
    });
    document.getElementById("pdp-buy-now").addEventListener("click", () => {
      addToCart(product.id, qty, activeStrap);
      window.location.href = "cart.html";
    });

    const wishBtn = document.getElementById("pdp-wishlist");
    wishBtn.addEventListener("click", () => {
      const active = toggleWishlist(product.id);
      wishBtn.classList.toggle("is-active", active);
    });

    root.querySelectorAll(".accordion-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        trigger.closest(".accordion-item").classList.toggle("is-open");
      });
    });
  }

  render();
  renderRelated(product);
}

function renderRelated(product) {
  const grid = document.getElementById("related-grid");
  if (!grid) return;
  const related = ZAMAN_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const fallback = related.length ? related : ZAMAN_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  renderProductGrid(grid, fallback);
}

document.addEventListener("DOMContentLoaded", initProductPage);
