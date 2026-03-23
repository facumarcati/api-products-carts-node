import { Router } from "express";
import ProductModel from "../models/product.model.js";
import CartModel from "../models/cart.model.js";

const router = Router();

router.get("/realtimeproducts", (req, res) => {
  res.render("realtimeProducts");
});

router.get("/", (req, res) => {
  res.redirect("/products");
});

router.get("/products", async (req, res) => {
  try {
    let { limit = 5, page = 1, sort, query, category, status } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    let filter = {};

    if (query) filter.title = new RegExp(query, "i");
    if (category) filter.category = category;
    if (status !== undefined && status !== "")
      filter.status = status === "true";

    let options = { page, limit, lean: true };

    if (sort) options.sort = { price: sort === "asc" ? 1 : -1 };

    const result = await ProductModel.paginate(filter, options);

    const categories = await ProductModel.distinct("category");

    res.render("home", {
      products: result.docs,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}` : null,
      nextLink: result.hasNextPage ? `/products?page=${result.nextPage}` : null,
      activeQuery: query || "",
      activeCategory: category || "",
      activeStatus: status || "",
      sort: sort || "",
      categories,
    });
  } catch (error) {
    console.error("Error en /products:", error.message);
    res.status(500).send(error.message);
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", {
      product,
      cartId: "ID_DEL_CARRITO",
    });
  } catch (error) {
    console.error("Error en /products/:pid:", error.message);
    res.status(500).send(error.message);
  }
});

router.get("/carts/:cid", async (req, res) => {
  const cart = await CartModel.findById(req.params.cid)
    .populate("products.product")
    .lean();

  const products = cart.products.filter((p) => p.product != null);

  res.render("cart", {
    products,
    cartId: req.params.cid,
  });
});

export default router;
