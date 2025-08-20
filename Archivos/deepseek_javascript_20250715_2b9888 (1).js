// Carrito de compras
let cart = [];

function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.length;
}

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function() {
    const productId = this.getAttribute('data-id');
    cart.push(productId);
    updateCartCount();
    alert('Producto añadido al carrito!');
  });
});