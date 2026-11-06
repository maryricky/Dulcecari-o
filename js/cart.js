/* ==========================================================
   Carrito de compras
   - Guarda en localStorage (si el navegador lo permite)
   - Notifica cambios con el evento "cart:change"
   ========================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "dulce-carino-cart-v1";
  var items = {}; // { productId: cantidad }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      var valid = {};
      window.DC_PRODUCTS.forEach(function (p) {
        var q = parseInt(parsed[p.id], 10);
        if (q > 0) valid[p.id] = Math.min(q, 99);
      });
      items = valid;
    } catch (e) {
      items = {};
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* sin almacenamiento */ }
  }

  function emit() {
    save();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  function product(id) {
    return window.DC_PRODUCTS.filter(function (p) { return p.id === id; })[0];
  }

  var Cart = {
    init: load,

    qty: function (id) { return items[id] || 0; },

    add: function (id) {
      if (!product(id)) return;
      items[id] = Math.min((items[id] || 0) + 1, 99);
      emit();
    },

    decrease: function (id) {
      if (!items[id]) return;
      items[id] -= 1;
      if (items[id] <= 0) delete items[id];
      emit();
    },

    remove: function (id) {
      delete items[id];
      emit();
    },

    clear: function () {
      items = {};
      emit();
    },

    lines: function () {
      return Object.keys(items).map(function (id) {
        var p = product(id);
        return { product: p, qty: items[id], subtotal: p.price * items[id] };
      });
    },

    count: function () {
      return Object.keys(items).reduce(function (sum, id) { return sum + items[id]; }, 0);
    },

    total: function () {
      return this.lines().reduce(function (sum, l) { return sum + l.subtotal; }, 0);
    }
  };

  window.DC_Cart = Cart;
})();
