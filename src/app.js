import express from "express";
import ProductManager from "./productManager.js";
import CartManager from "./cartManager.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import viewsRouter from "./routes/views.router.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.engine(
  "handlebars",
  engine({
    helpers: {
      gt: (a, b) => a > b,
    },
  }),
);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(express.json());
app.use(express.static("./src/public"));
app.use("/", viewsRouter);

const productManager = new ProductManager("./src/data/products.json");
const cartManager = new CartManager("./src/data/carts.json");

app.get("/api/products", async (req, res) => {
  try {
    const products = await productManager.getProducts();

    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await productManager.getProductById(productId);

    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const newProduct = req.body;

    const product = await productManager.addProduct(newProduct);

    res.status(201).json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    await productManager.deleteProductById(productId);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const upgrades = req.body;

    const product = await productManager.updateProductById(productId, upgrades);

    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/carts", async (req, res) => {
  try {
    const cart = await cartManager.createCart();

    res.status(201).json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/carts/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const cart = await cartManager.getCartById(cartId);

    res.status(200).json({ status: "success", products: cart.products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/carts/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    await productManager.getProductById(productId);

    const updatedCart = await cartManager.addProductToCart(cartId, productId);

    res.status(200).json({ status: "success", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  let products = await productManager.getProducts();

  socket.emit("products", products);

  socket.on("addProduct", async (product) => {
    await productManager.addProduct(product);

    products = await productManager.getProducts();

    io.emit("products", products);
  });

  socket.on("deleteProduct", async (id) => {
    try {
      await productManager.deleteProductById(id);

      const products = await productManager.getProducts();

      io.emit("products", products);
    } catch (error) {
      console.log(error);
    }
  });
});

app.use((req, res) => {
  res.json({ message: "Ruta no encontrada" });
});

server.listen(8080, () => {
  console.log("Servidor iniciado en http://localhost:8080");
});
