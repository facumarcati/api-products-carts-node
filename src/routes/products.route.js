import express from "express";
import ProductModel from "../models/product.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { limit = 5, page = 1, sort, query, category, status } = req.query;

    limit = parseInt(limit);
    page = parseInt(page);

    let filter = {};

    if (query) filter.title = new RegExp(query, "i");
    if (category) filter.category = category;
    if (status !== undefined && status !== "")
      filter.status = status === "true";

    let options = {
      page,
      limit,
      lean: true,
    };

    if (sort) {
      options.sort = {
        price: sort === "asc" ? 1 : -1,
      };
    }

    const result = await ProductModel.paginate(filter, options);

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/api/products?page=${result.prevPage}`
        : null,
      nextLink: result.hasNextPage
        ? `/api/products?page=${result.nextPage}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
