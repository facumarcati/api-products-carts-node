const socket = io();

const productList = document.getElementById("productList");
const productCount = document.getElementById("productCount");
const form = document.getElementById("productForm");

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
  form.reset();
});

function deleteProduct(id) {
  socket.emit("deleteProduct", id);
}
