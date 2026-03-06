import { Router } from "express";
import ProductManager from "../productManager.js";

const router = Router();

const productManager = new ProductManager("./src/data/products.json");

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();

    res.render("home", { products });
  } catch (error) {
    res.status(500).send("Error al cargar los productos");
  }
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

export default router;
