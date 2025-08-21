async function loadProducts() {
  const res = await fetch('data/products.json');
  const products = await res.json();
  const grid = document.getElementById('product-grid');
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${prod.image}" alt="${prod.title}">
      <h3>${prod.title}</h3>
      <p>Medidas: ${prod.size}</p>
      <p class="price">${prod.price}</p>
      <button onclick="addToCart(${prod.id})">Añadir al carrito</button>
    `;
    grid.appendChild(card);
  });
}

let cart = [];

function addToCart(id) {
  fetch('data/products.json').then(r => r.json()).then(products => {
    const prod = products.find(p => p.id === id);
    cart.push(prod);
    renderCart();
  });
}

function renderCart() {
  const cartList = document.getElementById('cart-items');
  cartList.innerHTML = '';
  cart.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `${item.title} - ${item.price}`;
    cartList.appendChild(li);
  });
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  const msg = cart.map(c => c.title + ' ' + c.price).join('%0A');
  const url = `https://wa.me/${WHATSAPP_NUM}?text=Pedido:%0A${msg}`;
  window.open(url, '_blank');
});

loadProducts();
