async function addToCart(productId) {
  let cartId = localStorage.getItem("cartId");

  if (!cartId) {
    const res = await fetch("/api/carts", { method: "POST" });
    const data = await res.json();
    cartId = data.cart._id;
    localStorage.setItem("cartId", cartId);
  }

  await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "POST",
  });

  showToast("Producto agregado al carrito", "success");
}

function goToCart() {
  const cartId = localStorage.getItem("cartId");

  if (!cartId) {
    showToast("Tu carrito está vacío", "error");
    return;
  }

  window.location.href = `/carts/${cartId}`;
}
