import { Router } from "express";
import ProductModel from "../models/product.model.js";
import CartModel from "../models/cart.model.js";

const router = Router();

router.use(async (req, res, next) => {
  if (!req.session.cartId) {
    const newCart = await CartModel.create({ products: [] });
    req.session.cartId = newCart._id.toString();
  }

  res.locals.cartId = req.session.cartId;
  next();
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
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

    const buildLink = (targetPage) => {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      if (sort) params.set("sort", sort);
      params.set("page", targetPage);
      return `/products?${params.toString()}`;
    };

    res.render("home", {
      products: result.docs.map((p, i) => ({
        ...p,
        rowNumber: (page - 1) * limit + i + 1,
      })),
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
      activeQuery: query || "",
      activeCategory: category || "",
      activeStatus: status || "",
      sort: sort || "",
      categories,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");

    res.render("productDetail", { product });
  } catch (error) {
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

router.post("/carts/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const redirectTo = req.body.redirectTo || "/products";

  const cart = await CartModel.findById(cid);
  const productInCart = cart.products.find((p) => p.product.toString() === pid);

  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }

  await cart.save();

  res.redirect(redirectTo);
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

export default router;
