/* ==========================================================
   Interfaz: menú de productos, panel del carrito, WhatsApp
   ========================================================== */

(function () {
  "use strict";

  var CFG = window.DC_CONFIG;
  var PRODUCTS = window.DC_PRODUCTS;
  var Cart = window.DC_Cart;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var money = function (n) { return CFG.currency + n; };

  /* ---------- Utilidades ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  // Imagen de reemplazo si aún no existe el archivo en /images
  function placeholder(label) {
    var safe = String(label || "Dulce cariño").replace(/[<>&"]/g, "");
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='350' viewBox='0 0 400 350'>" +
      "<rect width='400' height='350' fill='#ffd3e0'/>" +
      "<text x='200' y='170' text-anchor='middle' font-family='Georgia,serif' font-size='24' fill='#c2185b'>" + safe + "</text>" +
      "<text x='200' y='205' text-anchor='middle' font-family='sans-serif' font-size='14' fill='#7d5a65'>(agrega la imagen en /images)</text>" +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function withFallback(img, label) {
    function useFallback() {
      img.removeEventListener("error", useFallback);
      img.src = placeholder(label);
    }
    img.addEventListener("error", useFallback);
    // Si el error ocurrió antes de enlazar el evento
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) useFallback();
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 1800);
  }

  /* ---------- Menú de productos ---------- */
  function renderProducts() {
    var grid = $("#productGrid");
    grid.textContent = "";

    PRODUCTS.forEach(function (p) {
      var img = el("img", { src: p.image, alt: p.name, loading: "lazy", width: "400", height: "350" });
      withFallback(img, p.name);

      var area = el("div", { class: "add-area", "data-area": p.id });

      var card = el("article", { class: "card" }, [
        el("div", { class: "card__media" }, [img]),
        el("div", { class: "card__body" }, [
          el("h3", { class: "card__name", text: p.name }),
          el("span", { class: "price", text: money(p.price) }),
          area
        ])
      ]);
      grid.appendChild(card);
    });
    refreshProductControls();
  }

  // Muestra "Agregar" o el selector de cantidad según lo que haya en el carrito
  function refreshProductControls() {
    PRODUCTS.forEach(function (p) {
      var area = $('[data-area="' + p.id + '"]');
      if (!area) return;
      var q = Cart.qty(p.id);
      area.textContent = "";

      if (q === 0) {
        var add = el("button", { class: "add-btn", type: "button", "data-add": p.id, "aria-label": "Agregar " + p.name + " al carrito", text: "Agregar" });
        area.appendChild(add);
      } else {
        area.appendChild(qtyControl(p, q));
      }
    });
  }

  function qtyControl(p, q) {
    return el("div", { class: "qty", role: "group", "aria-label": "Cantidad de " + p.name }, [
      el("button", { type: "button", "data-dec": p.id, "aria-label": "Quitar uno", text: "−" }),
      el("span", { "aria-live": "polite", text: String(q) }),
      el("button", { type: "button", "data-inc": p.id, "aria-label": "Agregar uno", text: "+" })
    ]);
  }

  /* ---------- Panel del carrito ---------- */
  var cartPanel = $("#cart");
  var overlay = $("#overlay");
  var lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    cartPanel.classList.add("is-open");
    cartPanel.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    $("#cartClose").focus();
  }

  function closeCart() {
    cartPanel.classList.remove("is-open");
    cartPanel.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function renderCart() {
    var body = $("#cartItems");
    var foot = $("#cartFoot");
    var lines = Cart.lines();
    body.textContent = "";

    if (!lines.length) {
      foot.hidden = true;
      var goMenu = el("button", { class: "btn", type: "button", "data-go-menu": "1", text: "Ver el menú" });
      body.appendChild(el("div", { class: "cart__empty" }, [
        el("p", { text: "Tu carrito está vacío. Agrega tus postres favoritos para armar tu pedido." }),
        goMenu
      ]));
      return;
    }

    foot.hidden = false;
    lines.forEach(function (l) {
      var p = l.product;
      var img = el("img", { src: p.image, alt: "", width: "64", height: "64" });
      withFallback(img, p.name);

      body.appendChild(el("div", { class: "line-item" }, [
        img,
        el("div", {}, [
          el("div", { class: "line-item__name", text: p.name }),
          el("div", { class: "line-item__price", text: money(p.price) + " c/u" }),
          el("button", { class: "line-item__rm", type: "button", "data-rm": p.id, text: "Quitar" })
        ]),
        el("div", { class: "line-item__side" }, [
          el("span", { class: "line-item__sub", text: money(l.subtotal) }),
          qtyControl(p, l.qty)
        ])
      ]));
    });

    $("#cartTotal").textContent = money(Cart.total());
    updateCheckoutLink();
  }

  function updateCount() {
    var n = Cart.count();
    var badge = $("#cartCount");
    badge.textContent = n;
    $("#cartOpen").setAttribute("aria-label", "Abrir carrito (" + n + (n === 1 ? " producto" : " productos") + ")");
  }

  /* ---------- WhatsApp ---------- */
  function waLink(text) {
    return "https://wa.me/" + CFG.whatsappIntl + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  function orderMessage() {
    var name = $("#custName").value.trim();
    var note = $("#custNote").value.trim();
    var msg = "Hola " + CFG.businessName + ", quiero hacer un pedido";
    if (name) msg += " a nombre de " + name;
    msg += ":\n\n";

    Cart.lines().forEach(function (l) {
      msg += "• " + l.qty + " x " + l.product.name + " (" + money(l.subtotal) + ")\n";
    });
    msg += "\nTotal: " + money(Cart.total());
    if (note) msg += "\n\nNotas: " + note;
    msg += "\n\n¡Gracias!";
    return msg;
  }

  function updateCheckoutLink() {
    var btn = $("#checkoutBtn");
    btn.href = Cart.count() ? waLink(orderMessage()) : "#";
    btn.classList.toggle("is-disabled", !Cart.count());
  }

  /* ---------- Navegación ---------- */
  function setupNav() {
    var nav = $("#nav");
    var toggle = $("#menuToggle");

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Resalta la sección visible
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (a) { a.classList.remove("is-active"); });
            map[en.target.id].classList.add("is-active");
          }
        });
      }, { rootMargin: "-40% 0px -55% 0px" });

      Object.keys(map).forEach(function (id) {
        var s = document.getElementById(id);
        if (s) io.observe(s);
      });
      // "Contacto" apunta a la franja inferior
    }
  }

  /* ---------- Eventos ---------- */
  function setupEvents() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      var add = t.closest("[data-add]");
      var inc = t.closest("[data-inc]");
      var dec = t.closest("[data-dec]");
      var rm  = t.closest("[data-rm]");

      if (add) {
        Cart.add(add.getAttribute("data-add"));
        var p = PRODUCTS.filter(function (x) { return x.id === add.getAttribute("data-add"); })[0];
        toast(p.name + " agregado al carrito");
        var btn = $("#cartOpen");
        btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
      } else if (inc) {
        Cart.add(inc.getAttribute("data-inc"));
      } else if (dec) {
        Cart.decrease(dec.getAttribute("data-dec"));
      } else if (rm) {
        Cart.remove(rm.getAttribute("data-rm"));
      } else if (t.closest("[data-go-menu]")) {
        closeCart();
        $("#menu").scrollIntoView({ behavior: "smooth" });
      }
    });

    $("#cartOpen").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && cartPanel.classList.contains("is-open")) closeCart();
    });

    $("#clearCart").addEventListener("click", function () {
      if (window.confirm("¿Quieres vaciar todo tu carrito?")) Cart.clear();
    });

    ["custName", "custNote"].forEach(function (id) {
      $("#" + id).addEventListener("input", updateCheckoutLink);
    });

    $("#checkoutBtn").addEventListener("click", function (e) {
      if (!Cart.count()) { e.preventDefault(); return; }
      updateCheckoutLink(); // asegura el mensaje más reciente
    });

    document.addEventListener("cart:change", function () {
      updateCount();
      refreshProductControls();
      renderCart();
    });
  }

  /* ---------- Datos fijos de contacto ---------- */
  function setupContact() {
    var general = waLink("Hola " + CFG.businessName + ", quiero información sobre sus postres.");
    $("#heroWa").href = general;
    $("#contactWa").href = general;
    $("#heroWaNumber").textContent = CFG.whatsappDisplay;
    $("#contactWaNumber").textContent = CFG.whatsappDisplay;

    document.querySelectorAll("[data-social]").forEach(function (a) {
      var url = CFG.social[a.getAttribute("data-social")];
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
      else { a.addEventListener("click", function (e) { e.preventDefault(); }); }
    });
  }

  function setupStaticImages() {
    document.querySelectorAll("img[src^='images/']").forEach(function (img) {
      if (!img.closest(".card") && !img.closest(".line-item")) {
        withFallback(img, img.getAttribute("data-fallback") || "Dulce cariño");
      }
    });
  }

  /* ---------- Inicio ---------- */
  Cart.init();
  setupStaticImages();
  setupContact();
  renderProducts();
  setupNav();
  setupEvents();
  updateCount();
  renderCart();
})();
