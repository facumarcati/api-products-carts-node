const socket = io();

const productList = document.getElementById("productList");
const form = document.getElementById("productForm");

socket.on("products", (products) => {
  productList.innerHTML = "";

  products.forEach((product) => {
    const li = document.createElement("li");

    li.innerText = `${product.title} - $${product.price} - stock: ${product.stock}`;

    productList.appendChild(li);
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
