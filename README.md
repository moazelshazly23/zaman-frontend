# ZAMAN — Timeless Watches, Redefined

A production-quality e-commerce front end for **ZAMAN**, a fictional modern
premium watch brand. Built with plain HTML5, CSS3 and vanilla JavaScript —
no frameworks, no build step.

## 1. Project Structure

```
ZAMAN/
├── index.html          Homepage — hero, featured collection, collections,
│                        why-ZAMAN, brand story, best sellers
├── shop.html            Full shop — search, category & price filters, sort, load more
├── product.html          Product detail — gallery, options, accordion, related products
├── about.html            Brand story, mission/vision, craftsmanship
├── contact.html           Contact form + details, validated client-side
├── cart.html               Shopping cart + single-page checkout flow
│
├── css/
│   ├── style.css          Design system, layout, components
│   ├── responsive.css       Breakpoints: 1280 / 1024 / 768 / 425 / 375 / 320
│   └── animations.css        Scroll-reveal, stagger, micro-interactions
│
├── js/
│   ├── products.js         Product catalog (12 watches) + helpers
│   ├── main.js               Header, nav, wishlist, product-card rendering,
│   │                          shop filters/search/sort, reveal, toast, newsletter
│   ├── cart.js                 Cart storage/totals, cart page, checkout
│   └── product.js               Product detail page logic
│
└── README.md
```

No `/images` folder is used — see **Images** below.

## 2. How to Run It

No build tools or server required.

1. Unzip/copy the `ZAMAN/` folder anywhere on your machine.
2. Open `index.html` directly in a browser, **or** serve it locally for the
   best experience (some browsers restrict `localStorage` on `file://`):

   ```bash
   cd ZAMAN
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```

## 3. What Was Implemented

- **Brand identity**: black / off-white / charcoal / gold palette exactly as
  specified, Playfair Display + Montserrat type pairing, a recurring "sweeping
  gold hairline" motif (a nod to a watch hand) used as the section-divider
  signature across the site.
- **6 pages**: Home, Shop, Product, About, Contact, Cart (checkout is a
  second view within the cart page, since a dedicated `checkout.html` wasn't
  part of the requested file structure).
- **12 realistic products** with full data (price, old price, description,
  gallery, rating, reviews, movement, case, glass, strap, water resistance,
  diameter) in `js/products.js`.
- **Real shopping cart**: add / remove / update quantity, subtotal, flat
  EGP 150 shipping (free over EGP 8,000), total, item counter, persisted in
  `localStorage` so it survives a refresh.
- **Wishlist**: add/remove from any product card or the product page, badge
  counter, persisted in `localStorage`.
- **Working search**: header search panel and a dedicated shop search box,
  both filter live without a page reload.
- **Filtering & sorting**: category checkboxes, a price range slider, and a
  sort dropdown (price, rating, newest) on the shop page; category chips on
  the homepage best-sellers grid.
- **Product page**: image gallery with thumbnails, strap selector, quantity
  stepper, Add to Cart / Buy Now, specifications & shipping/returns
  accordions, and a related-products strip by category.
- **Checkout UI**: customer info + address form, Cash on Delivery / Card
  payment selection, live order summary — frontend simulation only, no real
  payment processing, as requested.
- **UX details**: toast notifications, empty states (cart, wishlist-aware
  grids, no search results), loading-free instant client rendering, back-to-
  top button, sticky header that solidifies on scroll, mobile hamburger menu,
  scroll-reveal animations, keyboard-focus states.
- **SEO basics**: unique titles/descriptions per page, Open Graph tags on the
  homepage, semantic HTML, inline SVG favicon.
- **Fully responsive**: tested breakpoints at 1440 / 1024 / 768 / 425 / 375 /
  320, with a real mobile nav (not just a shrunk desktop layout).

## 4. Images

All photography is real product/lifestyle photography sourced from
**Pexels** (free license — commercial use permitted, no attribution
required: see https://www.pexels.com/license/). Images are referenced
directly from Pexels' CDN (`images.pexels.com`) rather than downloaded into
an `/images` folder, so the site has no binary assets to manage and always
loads the same stable URLs. If you'd prefer local copies for a fully offline
build, download each URL used in the HTML/JS into `images/watches`,
`images/banners`, and `images/lifestyle`, and update the `src`/`PEXELS()`
references accordingly.

## 5. Remaining Limitations

- Checkout is a **frontend simulation**: no payment gateway, backend, or
  order persistence is wired up — "Place Order" clears the cart and shows a
  confirmation state only.
- The contact form and newsletter form validate client-side but do not send
  anywhere (no backend).
- Product images are stock photography standing in for an actual ZAMAN
  product shoot; a real launch would need a commissioned shoot per SKU.
- Google Fonts (Playfair Display, Montserrat) load from
  `fonts.googleapis.com` — an internet connection is required for the
  intended typography; the CSS falls back to system serif/sans-serif fonts
  offline.
