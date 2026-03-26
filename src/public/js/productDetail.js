async function addToCart(productId) {
  await fetch(`/api/carts/${CART_ID}/products/${productId}`, {
    method: "POST",
  });
  showToast("Producto agregado al carrito", "success");
}

function goToCart() {
  window.location.href = `/carts/${CART_ID}`;
}
