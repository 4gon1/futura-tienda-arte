// ---- Configuración de tienda ----
const STORE = {
  name: "Óleo Fino",
  currency: "€",
};

// ---- Utilidades ----
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const format = v => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v);
const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('oleo_cart') || '[]'),
};

function saveCart(){
  localStorage.setItem('oleo_cart', JSON.stringify(state.cart));
  updateCartCount();
}
function addToCart(id, qty=1){
  const item = state.cart.find(i => i.id === id);
  if(item){ item.qty += qty; } else { state.cart.push({ id, qty }); }
  saveCart();
}
function removeFromCart(id){
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
}
function setQty(id, qty){
  const item = state.cart.find(i => i.id === id);
  if(item){ item.qty = Math.max(1, qty|0); saveCart(); }
}
function cartCount(){ return state.cart.reduce((a,b)=>a+b.qty,0); }
function updateCartCount(){ $("#cart-count").textContent = cartCount(); }
function findProduct(id){ return state.products.find(p => p.id === id); }

// ---- Router muy simple (hash) ----
const routes = {
  "/": renderHome,
  "/catalogo": renderCatalog,
  "/producto": renderProduct,
  "/carrito": renderCart,
  "/checkout": renderCheckout,
  "/sobre": renderAbout,
  "/contacto": renderContact,
  "/terminos": renderTerms,
  "/privacidad": renderPrivacy,
};

function navigate(){
  const [path, query] = location.hash.slice(1).split("?");
  const route = routes[path || "/"] || renderNotFound;
  route(new URLSearchParams(query || ""));
  updateCartCount();
}

window.addEventListener("hashchange", navigate);

// ---- Renderizadores ----
function renderHome(){
  $("#app").innerHTML = `
    <section class="hero">
      <img class="hero__img" src="assets/img/hero.jpg" alt="Pinturas al óleo" />
      <div>
        <h1>Óleos profesionales y sets para artistas</h1>
        <p>Descubre colores de alta pureza, gran poder tintóreo y secado uniforme. Envíos a toda España.</p>
        <div class="toolbar">
          <a class="btn" href="#/catalogo">Ver catálogo</a>
          <a class="btn btn--ghost" href="#/sobre">Conoce nuestra marca</a>
        </div>
        <div class="notice small">⚠️ Checkout de demostración: no procesa pagos reales.</div>
      </div>
    </section>
  `;
}

function renderCatalog(params){
  const q = (params.get("q") || "").toLowerCase();
  const cat = params.get("cat") || "todas";

  const cats = ["todas", ...new Set(state.products.map(p=>p.category))];

  const filtered = state.products.filter(p => {
    const okQ = !q || [p.name,p.brand,p.description].join(" ").toLowerCase().includes(q);
    const okC = cat==="todas" || p.category===cat;
    return okQ && okC;
  });

  $("#app").innerHTML = `
    <h1>Catálogo</h1>
    <div class="toolbar">
      <input id="search" class="input" placeholder="Buscar óleos..." value="${q}"/>
      <select id="cat" class="select">
        ${cats.map(c=>`<option value="${c}" ${c===cat?"selected":""}>${c[0].toUpperCase()+c.slice(1)}</option>`).join("")}
      </select>
      <span class="small">${filtered.length} productos</span>
    </div>
    <div class="grid">
      ${filtered.map(cardProduct).join("")}
    </div>
  `;

  $("#search").addEventListener("input", (e)=>{
    location.hash = `#/catalogo?q=${encodeURIComponent(e.target.value)}&cat=${encodeURIComponent($("#cat").value)}`;
  });
  $("#cat").addEventListener("change", (e)=>{
    location.hash = `#/catalogo?q=${encodeURIComponent($("#search").value)}&cat=${encodeURIComponent(e.target.value)}`;
  });
}

function cardProduct(p){
  return `
    <article class="card">
      <img src="${p.image}" alt="${p.name}" class="card__img"/>
      <div class="card__body">
        <h3>${p.name}</h3>
        <p class="small">${p.brand} • ${p.size}ml</p>
        <p class="price">${format(p.price)}</p>
        <div class="toolbar">
          <a class="btn" href="#/producto?id=${p.id}">Detalles</a>
          <button class="btn btn--ghost" onclick="addToCart(${p.id});alert('Añadido al carrito');">Añadir</button>
        </div>
      </div>
    </article>
  `;
}

function renderProduct(params){
  const id = Number(params.get("id"));
  const p = findProduct(id);
  if(!p) return renderNotFound();
  $("#app").innerHTML = `
    <div class="grid" style="grid-template-columns:1fr 1.2fr;gap:28px">
      <img class="hero__img" src="${p.image}" alt="${p.name}"/>
      <div>
        <a class="small" href="#/catalogo">← Volver</a>
        <h1>${p.name}</h1>
        <p class="small">${p.brand} • ${p.category} • ${p.size}ml</p>
        <p>${p.description}</p>
        <p class="price">${format(p.price)}</p>
        <div class="toolbar">
          <button class="btn" onclick="addToCart(${p.id});alert('Añadido al carrito');">Añadir al carrito</button>
          <a class="btn btn--ghost" href="#/carrito">Ir al carrito</a>
        </div>
      </div>
    </div>
  `;
}

function renderCart(){
  const lines = state.cart.map(line => {
    const p = findProduct(line.id);
    return { ...line, product: p, subtotal: p.price * line.qty };
  });
  const total = lines.reduce((a,b)=>a+b.subtotal,0);

  $("#app").innerHTML = `
    <h1>Tu carrito</h1>
    ${lines.length===0 ? `<p>Tu carrito está vacío. <a href="#/catalogo">Ir al catálogo</a></p>` : `
      <div>${lines.map(renderCartLine).join("")}</div>
      <div class="cart-total"><strong>Total</strong><strong>${format(total)}</strong></div>
      <div class="toolbar" style="justify-content:flex-end">
        <a class="btn" href="#/checkout">Continuar al checkout</a>
      </div>
    `}
  `;

  // Eventos de cantidad y eliminar
  $$(".qty-input").forEach(inp => {
    inp.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      const qty = Number(e.target.value);
      setQty(id, qty);
      renderCart();
    });
  });
  $$(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = Number(e.target.dataset.id);
      removeFromCart(id);
      renderCart();
    });
  });
}

function renderCartLine(line){
  const p = line.product;
  return `
    <div class="cart-line">
      <img src="${p.image}" alt="${p.name}"/>
      <div>
        <strong>${p.name}</strong>
        <div class="small">${p.brand} • ${p.size}ml</div>
      </div>
      <div>${format(p.price)}</div>
      <div>
        <input class="input qty-input" style="width:80px" type="number" min="1" value="${line.qty}" data-id="${p.id}"/>
      </div>
      <div><strong>${format(line.subtotal)}</strong> <button class="remove-btn btn btn--ghost" data-id="${p.id}">Eliminar</button></div>
    </div>
  `;
}

function renderCheckout(){
  const lines = state.cart.map(line => ({ ...line, product: findProduct(line.id) }));
  const total = lines.reduce((a,b)=>a + b.product.price * b.qty, 0);

  $("#app").innerHTML = `
    <h1>Checkout</h1>
    <div class="grid" style="grid-template-columns:1.4fr 1fr;gap:24px">
      <form id="checkout-form">
        <h3>Datos de envío</h3>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
          <input class="input" required placeholder="Nombre"/>
          <input class="input" required placeholder="Apellidos"/>
          <input class="input" required placeholder="Email" type="email"/>
          <input class="input" required placeholder="Teléfono" type="tel"/>
          <input class="input" required placeholder="Dirección"/>
          <input class="input" required placeholder="Ciudad"/>
          <input class="input" required placeholder="Provincia"/>
          <input class="input" required placeholder="CP"/>
        </div>
        <h3 style="margin-top:14px">Pago</h3>
        <div class="grid" style="grid-template-columns:2fr 1fr 1fr;gap:12px">
          <input class="input" required placeholder="Número de tarjeta" pattern="\d{16}"/>
          <input class="input" required placeholder="MM/AA"/>
          <input class="input" required placeholder="CVC" pattern="\d{3}"/>
        </div>
        <p class="notice small">Este es un checkout de demostración. No se procesa ningún pago.</p>
        <button class="btn" type="submit">Pagar {total}</button>
      </form>
      <aside>
        <h3>Resumen</h3>
        <div>
          ${lines.map(l=>`<div class="cart-total"><span>${l.product.name} × ${l.qty}</span><span>${format(l.product.price*l.qty)}</span></div>`).join("")}
          <div class="cart-total"><strong>Total</strong><strong>${format(total)}</strong></div>
        </div>
      </aside>
    </div>
  `;

  $("#checkout-form").addEventListener("submit", e => {
    e.preventDefault();
    alert("¡Gracias por tu compra! (demo)");
    state.cart = [];
    saveCart();
    location.hash = "#/";
  });
}

function renderAbout(){
  $("#app").innerHTML = `
    <h1>Sobre ${STORE.name}</h1>
    <p>Somos una casa de bellas artes especializada en óleos profesionales, con una selección curada de marcas y pigmentos. Nuestro objetivo es ofrecer colores intensos, consistencia cremosa y un secado confiable para artistas exigentes.</p>
    <p>Trabajamos con proveedores sostenibles y embalajes reciclables.</p>
  `;
}

function renderContact(){
  $("#app").innerHTML = `
    <h1>Contacto</h1>
    <p>¿Dudas o mayoristas? Escríbenos:</p>
    <ul>
      <li>Email: hola@oleofino.tienda</li>
      <li>Tel: +34 600 000 000</li>
    </ul>
  `;
}

function renderTerms(){
  $("#app").innerHTML = `
    <h1>Términos y condiciones</h1>
    <p>Este sitio es un ejemplo educativo. No se establece relación comercial real.</p>
  `;
}
function renderPrivacy(){
  $("#app").innerHTML = `
    <h1>Privacidad</h1>
    <p>No recopilamos datos personales. Los datos del carrito se guardan solo en tu navegador (localStorage).</p>
  `;
}

function renderNotFound(){
  $("#app").innerHTML = `<h1>404</h1><p>Ruta no encontrada.</p>`;
}

// ---- Carga de catálogo ----
async function loadProducts(){
  const res = await fetch("data/products.json");
  const data = await res.json();
  state.products = data;
}

// ---- Init ----
(async function init(){
  $("#year").textContent = new Date().getFullYear();
  await loadProducts();
  navigate();
})();
