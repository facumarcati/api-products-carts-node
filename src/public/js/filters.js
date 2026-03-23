const queryInput = document.getElementById("filterQuery");
const sortSelect = document.getElementById("filterSort");
const categorySelect = document.getElementById("filterCategory");
const statusSelect = document.getElementById("filterStatus");
const productList = document.getElementById("productList");
const pagination = document.querySelector(".pagination");

let currentPage = 1;

function renderProducts(products, offset = 0) {
  if (!products || products.length === 0) {
    productList.innerHTML = `
      <li class="list-empty-state">
        <p>No hay productos disponibles.</p>
      </li>
    `;
    return;
  }

  productList.innerHTML = products
    .map(
      (p, i) => `
    <li class="product-row" style="counter-set: product-counter ${offset + i + 1}">
      <span class="col-num"></span>
      <div class="col-title">
        <div class="product-row-header">
          <a href="/products/${p._id}" class="product-row-title">${p.title}</a>
          <span class="product-status ${p.status ? "active" : "inactive"}">${p.status ? "Activo" : "Inactivo"}</span>
        </div>
        <span class="product-row-desc">${p.description}</span>
      </div>
      <span class="col-category">
        <span class="category-tag">${p.category}</span>
      </span>
      <span class="col-stock">
        <span class="stock-value ${p.stock > 10 ? "stock-ok" : "stock-low"}">${p.stock}</span>
      </span>
      <span class="col-price">$${p.price.toLocaleString("es-AR")}</span>
      <button class="btn-add-row" onclick="addToCart('${p._id}')">+</button>
    </li>
  `,
    )
    .join("");
}

function renderPagination(data) {
  pagination.innerHTML = `
    ${data.hasPrevPage ? `<button class="page-btn" onclick="goToPage(${data.prevPage})">← Anterior</button>` : ""}
    <span class="page-number">Página ${data.page}</span>
    ${data.hasNextPage ? `<button class="page-btn" onclick="goToPage(${data.nextPage})">Siguiente →</button>` : ""}
  `;
}

async function fetchProducts() {
  const query = queryInput.value;
  const sort = sortSelect.value;
  const category = categorySelect.value;
  const status = statusSelect.value;

  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (sort) params.set("sort", sort);
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  params.set("limit", 5);
  params.set("page", currentPage);

  const res = await fetch(`/api/products?${params.toString()}`);
  const data = await res.json();

  const offset = (currentPage - 1) * 5;
  renderProducts(data.payload, offset);
  renderPagination(data);
}

function goToPage(page) {
  currentPage = page;
  fetchProducts();
}

queryInput.addEventListener("input", () => {
  currentPage = 1;
  const val = queryInput.value;
  if (val.length === 0 || val.length >= 3) fetchProducts();
});

sortSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchProducts();
});
categorySelect.addEventListener("change", () => {
  currentPage = 1;
  fetchProducts();
});
statusSelect.addEventListener("change", () => {
  currentPage = 1;
  fetchProducts();
});

fetchProducts();
