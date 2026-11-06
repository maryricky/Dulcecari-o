/* ==========================================================
   Configuración del negocio y catálogo de productos
   Edita este archivo para cambiar precios, nombres o el número.
   ========================================================== */

window.DC_CONFIG = {
  businessName: "Dulce cariño",
  // Número que se muestra en pantalla
  whatsappDisplay: "5638830474",
  // Número con lada de país (México = 52) para el enlace de WhatsApp
  whatsappIntl: "525638830474",
  currency: "$",
  // Redes sociales (pon aquí tus enlaces; si se dejan vacíos, el ícono no se activa)
  social: {
    facebook: "",
    instagram: "",
    tiktok: ""
  }
};

window.DC_PRODUCTS = [
  { id: "pastel-vainilla",   name: "Pastel 3 leches Vainilla",   price: 30, image: "images/PastelVainilla.jpeg" },
  { id: "pastel-chocolate",  name: "Pastel 3 leches Chocolate",  price: 30, image: "images/PastelChocolate.jpeg" },
  { id: "pay-limon",         name: "Pay de limón",               price: 20, image: "images/PayLimon.jpeg" },
  { id: "chocoflan",         name: "Chocoflan",                  price: 35, image: "images/Chocoflan.jpeg" },
  { id: "gelatinas-sabores", name: "Gelatinas de sabores",       price: 15, image: "images/Gelatinasabores.jpeg" },
  { id: "gelatina-yogurth",  name: "Gelatina con yogurth",       price: 25, image: "images/GelatinaYoghurt.jpeg" },
  { id: "fresas-crema",      name: "Fresas con Crema",           price: 40, image: "images/FresasCrema.jpeg" },
  { id: "flan-napolitano",   name: "Flan napolitano",            price: 35, image: "images/Flannapolitano.jpeg" }
];
