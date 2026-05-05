async function addToCart(productId) {
  const res = await fetch(`/api/carts/${CART_ID}/products/${productId}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  if (res.ok) {
    showToast("Producto agregado al carrito", "success");
  } else {
    showToast("Error al agregar", "error");
  }
}
function goToCart() {
  window.location.href = `/carts/${CART_ID}`;
}
