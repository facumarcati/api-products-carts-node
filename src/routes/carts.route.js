import express from "express";
import CartModel from "../models/cart.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const newCart = await CartModel.create({ products: [] });

  res.json({
    status: "success",
    cart: newCart,
  });
});

router.get("/:cid", async (req, res) => {
  const cart = await CartModel.findById(req.params.cid)
    .populate("products.product")
    .lean();

  res.json({
    status: "success",
    cart,
  });
});

router.post("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  const cart = await CartModel.findById(cid);

  const productInCart = cart.products.find((p) => p.product.toString() === pid);

  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.products.push({
      product: pid,
      quantity: 1,
    });
  }

  await cart.save();

  res.json({
    status: "success",
    cart,
  });
});

router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  const cart = await CartModel.findById(cid);

  cart.products = cart.products.filter((p) => p.product.toString() !== pid);

  await cart.save();

  res.json({
    status: "success",
    cart,
  });
});

router.put("/:cid", async (req, res) => {
  const { products } = req.body;

  const cart = await CartModel.findByIdAndUpdate(
    req.params.cid,
    { products },
    { new: true },
  );

  res.json({
    status: "success",
    cart,
  });
});

router.put("/:cid/products/:pid", async (req, res) => {
  const { quantity } = req.body;

  const cart = await CartModel.findById(req.params.cid);

  const product = cart.products.find(
    (p) => p.product.toString() === req.params.pid,
  );

  if (product) {
    product.quantity = quantity;
  }

  await cart.save();

  res.json({
    status: "success",
    cart,
  });
});

router.delete("/:cid", async (req, res) => {
  const cart = await CartModel.findById(req.params.cid);

  cart.products = [];

  await cart.save();

  res.json({
    status: "success",
    cart,
  });
});

export default router;
