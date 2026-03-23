function calcTotal() {
  const rows = document.querySelectorAll(".product-row");
  let total = 0;

  rows.forEach((row) => {
    const price = parseFloat(row.dataset.price);
    const qty = parseInt(row.querySelector(".qty-value").textContent);
    total += price * qty;
  });

  document.getElementById("cartTotal").textContent =
    "$" + total.toLocaleString("es-AR");
}

async function changeQty(cartId, productId, delta, stock) {
  const row = document.querySelector(`[data-product="${productId}"]`);
  const qtyEl = row.querySelector(".qty-value");
  const currentQty = parseInt(qtyEl.textContent);
  const newQty = currentQty + delta;

  if (newQty < 1 || newQty > stock) return;

  await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: newQty }),
  });

  qtyEl.textContent = newQty;
  calcTotal();
}

async function deleteProduct(cartId, productId) {
  await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "DELETE",
  });

  const row = document.querySelector(`[data-product="${productId}"]`);
  row.remove();
  calcTotal();

  if (document.querySelectorAll(".product-row").length === 0) {
    document.querySelector(".product-list").innerHTML = `
      <li class="list-empty-state"><p>El carrito está vacío.</p></li>
    `;
    document.querySelector(".cart-total").style.display = "none";
    document.querySelector(".btn-clear-cart").style.display = "none";
  }
}

async function clearCart(cartId) {
  await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
  window.location.reload();
}

calcTotal();
