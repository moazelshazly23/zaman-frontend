/* ==============================================================
   ZAMAN — cart.js
   Real, working cart backed by localStorage. Handles the cart
   page, the checkout page, and the header cart-count badge.
   ============================================================== */

const ZAMAN_CART_KEY = "zaman_cart";
const SHIPPING_FLAT = 150; // EGP
const FREE_SHIPPING_THRESHOLD = 8000; // EGP

/* ---------------- Storage ---------------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(ZAMAN_CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(ZAMAN_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.classList.toggle("hidden", count === 0);
  });
}

function addToCart(id, qty = 1, strap = null) {
  const product = getProductById(id);
  if (!product) return;
  const cart = getCart();
  const lineKey = strap || "default";
  const existing = cart.find((item) => item.id === Number(id) && item.strap === lineKey);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: Number(id), qty, strap: lineKey });
  }
  saveCart(cart);
}

function updateCartQty(id, strap, qty) {
  let cart = getCart();
  const lineKey = strap || "default";
  const item = cart.find((i) => i.id === Number(id) && i.strap === lineKey);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
  renderCartPage();
}

function removeFromCart(id, strap) {
  const lineKey = strap || "default";
  let cart = getCart().filter((i) => !(i.id === Number(id) && i.strap === lineKey));
  saveCart(cart);
  renderCartPage();
  showToast?.("Removed from cart");
}

function getCartLines() {
  return getCart()
    .map((item) => {
      const product = getProductById(item.id);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean);
}

function getCartTotals() {
  const lines = getCartLines();
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;
  return { subtotal, shipping, total, itemCount: lines.reduce((s, l) => s + l.qty, 0) };
}

/* ---------------- Cart page rendering ---------------- */
function renderCartPage() {
  const tbody = document.getElementById("cart-items-body");
  const emptyState = document.getElementById("cart-empty");
  const tableWrap = document.getElementById("cart-table-wrap");
  if (!tbody) return;

  const lines = getCartLines();

  if (!lines.length) {
    tableWrap?.classList.add("hidden");
    emptyState?.classList.remove("hidden");
    updateSummary();
    return;
  }
  tableWrap?.classList.remove("hidden");
  emptyState?.classList.add("hidden");

  tbody.innerHTML = lines
    .map(
      (line) => `
    <tr class="cart-row">
      <td>
        <div class="cart-product">
          <img src="${line.product.image}" alt="${line.product.name}" width="84" height="84">
          <div>
            <h4>${line.product.name}</h4>
            <span>${line.strap !== "default" ? line.strap + " strap" : line.product.strap}</span><br>
            <button class="cart-remove" data-remove-id="${line.id}" data-remove-strap="${line.strap}">Remove</button>
          </div>
        </div>
      </td>
      <td>${formatEGP(line.product.price)}</td>
      <td>
        <div class="qty-selector sm">
          <button data-qty-decrease="${line.id}" data-strap="${line.strap}" aria-label="Decrease quantity">−</button>
          <span>${line.qty}</span>
          <button data-qty-increase="${line.id}" data-strap="${line.strap}" aria-label="Increase quantity">+</button>
        </div>
      </td>
      <td><strong>${formatEGP(line.product.price * line.qty)}</strong></td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("[data-qty-increase]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const line = getCartLines().find((l) => l.id === Number(btn.dataset.qtyIncrease) && l.strap === btn.dataset.strap);
      updateCartQty(btn.dataset.qtyIncrease, btn.dataset.strap, line.qty + 1);
    })
  );
  tbody.querySelectorAll("[data-qty-decrease]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const line = getCartLines().find((l) => l.id === Number(btn.dataset.qtyDecrease) && l.strap === btn.dataset.strap);
      if (line.qty <= 1) {
        removeFromCart(btn.dataset.qtyDecrease, btn.dataset.strap);
      } else {
        updateCartQty(btn.dataset.qtyDecrease, btn.dataset.strap, line.qty - 1);
      }
    })
  );
  tbody.querySelectorAll("[data-remove-id]").forEach((btn) =>
    btn.addEventListener("click", () => removeFromCart(btn.dataset.removeId, btn.dataset.removeStrap))
  );

  updateSummary();
}

function updateSummary() {
  const { subtotal, shipping, total, itemCount } = getCartTotals();
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("summary-subtotal", formatEGP(subtotal));
  set("summary-shipping", shipping === 0 ? "Free" : formatEGP(shipping));
  set("summary-total", formatEGP(total));
  set("summary-count", itemCount);
  set("checkout-summary-subtotal", formatEGP(subtotal));
  set("checkout-summary-shipping", shipping === 0 ? "Free" : formatEGP(shipping));
  set("checkout-summary-total", formatEGP(total));

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.toggleAttribute("disabled", itemCount === 0);
}

/* ---------------- Checkout page ---------------- */
function renderCheckoutSummary() {
  const wrap = document.getElementById("checkout-order-items");
  if (!wrap) return;
  const lines = getCartLines();
  if (!lines.length) return;
  wrap.innerHTML = lines
    .map(
      (l) => `
    <div class="order-summary-item">
      <img src="${l.product.image}" alt="${l.product.name}" width="56" height="56">
      <div class="meta">
        <h5>${l.product.name}</h5>
        <span>Qty ${l.qty} · ${formatEGP(l.product.price)}</span>
      </div>
      <strong>${formatEGP(l.product.price * l.qty)}</strong>
    </div>`
    )
    .join("");
  updateSummary();
}

function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const group = field.closest(".form-group");
      if (!field.checkValidity()) {
        valid = false;
        group?.classList.add("has-error");
      } else {
        group?.classList.remove("has-error");
      }
    });
    if (!valid) return;
    document.getElementById("checkout-form-wrap").classList.add("hidden");
    document.getElementById("checkout-success").classList.remove("hidden");
    saveCart([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  form.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      form.querySelectorAll(".payment-option").forEach((opt) => opt.classList.remove("is-active"));
      radio.closest(".payment-option").classList.add("is-active");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  renderCheckoutSummary();
  initCheckoutForm();

  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      saveCart([]);
      renderCartPage();
    });
  }

  /* Cart page <-> checkout view toggle (single-page checkout flow) */
  const cartView = document.getElementById("cart-view");
  const checkoutView = document.getElementById("checkout-view");
  const toCheckoutBtn = document.getElementById("checkout-btn");
  const backToCartBtn = document.getElementById("back-to-cart-btn");

  if (toCheckoutBtn && cartView && checkoutView) {
    toCheckoutBtn.addEventListener("click", () => {
      if (getCartTotals().itemCount === 0) return;
      cartView.classList.add("hidden");
      checkoutView.classList.remove("hidden");
      renderCheckoutSummary();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  if (backToCartBtn && cartView && checkoutView) {
    backToCartBtn.addEventListener("click", () => {
      checkoutView.classList.add("hidden");
      cartView.classList.remove("hidden");
    });
  }
});
