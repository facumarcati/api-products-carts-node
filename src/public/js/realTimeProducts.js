const socket = io();

const productList = document.getElementById("productList");
const productCount = document.getElementById("productCount");
const form = document.getElementById("productForm");

const toastContainer = document.createElement("div");
toastContainer.classList.add("toast-container");
document.body.appendChild(toastContainer);

function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");

  toast.classList.add("toast", type);
  toast.innerHTML = `<span class="toast-dot"></span>${message}`;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.replace("show", "hide");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);
}

socket.on("products", (products) => {
  if (productCount) productCount.textContent = products.length;

  if (products.length === 0) {
    productList.innerHTML = `
      <div class="empty-state">
        <p>No hay productos registrados.</p>
      </div>
    `;
    return;
  }

  productList.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    const statusClass = product.status ? "active" : "inactive";
    const statusLabel = product.status ? "Activo" : "Inactivo";

    card.innerHTML = `
      <div class="product-card-content">
        <div class="product-header">
          <h3>${product.title}</h3>
          <span class="product-price">$${product.price}</span>
        </div>

        <div class="product-body">
          <p>${product.description}</p>

          <div class="product-details">
            <span><b>Código:</b> ${product.code}</span>
            <span><b>Stock:</b> ${product.stock}</span>
            <span><b>Categoría:</b> ${product.category}</span>
            <span class="product-status ${statusClass}">${statusLabel}</span>
          </div>
        </div>
      </div>

      <button class="btn-delete" onclick="deleteProduct('${product.id}')">
        Eliminar
      </button>
    `;

    productList.appendChild(card);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const product = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    code: document.getElementById("code").value,
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value,
    status: true,
    thumbnails: "",
  };

  socket.emit("addProduct", product);

  showToast(`${product.title} agregado correctamente`, "success");

  form.reset();
});

function deleteProduct(id) {
  socket.emit("deleteProduct", id);

  showToast("Producto eliminado", "error");
}
