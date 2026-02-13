import { v4 as newId } from "uuid";
import fs from "fs/promises";

class CartManager {
  constructor(path) {
    this.path = path;
  }

  async createCart() {
    try {
      const carts = await this.getCarts();

      const id = newId();

      const newCart = {
        id,
        products: [],
      };

      carts.push(newCart);

      await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");

      return newCart;
    } catch (error) {
      throw new Error("No se pudo crear el carrito - " + error.message);
    }
  }

  async getCarts() {
    try {
      const cartsJson = await fs.readFile(this.path, "utf-8");

      const carts = JSON.parse(cartsJson);

      return carts;
    } catch (error) {
      return [];
    }
  }

  async getCartById(id) {
    try {
      const carts = await this.getCarts();

      const cartFound = carts.find((cart) => cart.id === id);

      if (!cartFound) throw new Error("Carrito no encontrado");

      return cartFound;
    } catch (error) {
      throw new Error("Error al traer un carrito por su ID - " + error.message);
    }
  }

  async addProductToCart(cid, pid) {
    try {
      const carts = await this.getCarts();

      const indexCart = carts.findIndex((cart) => cart.id === cid);

      if (indexCart === -1) throw new Error("Carrito no encontrado");

      const cart = carts[indexCart];

      const productIndex = cart.products.findIndex((p) => p.product === pid);

      if (productIndex === -1) {
        cart.products.push({ product: pid, quantity: 1 });
      } else {
        cart.products[productIndex].quantity += 1;
      }

      carts[indexCart] = cart;

      await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");

      return cart;
    } catch (error) {
      throw new Error(
        "No se pudo agregar el producto al carrito - " + error.message,
      );
    }
  }
}

export default CartManager;
