import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import session from "express-session";
import connectMongoDB from "./config/db.js";
import ProductModel from "./models/product.model.js";
import dotenv from "dotenv";
import passport from "passport";
import initializePassport from "./config/passport.config.js";

import viewsRouter from "./routes/views.router.js";
import sessionsRouter from "./routes/sessions.router.js";

import productsRouter from "./routes/products.route.js";
import cartsRouter from "./routes/carts.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 8081;

connectMongoDB();

app.engine(
  "handlebars",
  engine({
    helpers: {
      gt: (a, b) => a > b,
      eq: (a, b) => a === b,
      formatPrice: (price) =>
        price != null ? price.toLocaleString("es-AR") : "-",
    },
  }),
);

app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));

initializePassport();
app.use(passport.initialize());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto123",
    resave: false,
    saveUninitialized: true,
  }),
);
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  const products = await ProductModel.find().lean();
  socket.emit("products", products);

  socket.on("addProduct", async (data) => {
    await ProductModel.create(data);
    const updated = await ProductModel.find().lean();
    io.emit("products", updated);
  });

  socket.on("deleteProduct", async (id) => {
    await ProductModel.findByIdAndDelete(id);
    const updated = await ProductModel.find().lean();
    io.emit("products", updated);
  });

  socket.on("toggleProduct", async (id) => {
    const product = await ProductModel.findById(id);
    await ProductModel.findByIdAndUpdate(id, { status: !product.status });
    const updated = await ProductModel.find().lean();
    io.emit("products", updated);
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
});

server.listen(PORT, () => {
  console.log("Servidor iniciado en http://localhost:" + PORT);
});
