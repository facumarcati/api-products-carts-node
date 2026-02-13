import { v4 as newId } from "uuid";
import fs from "fs/promises";

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  verifyCode(code, products) {
    return products.some((product) => product.code === code);
  }

  async addProduct(product) {
    try {
      const products = await this.getProducts();

      //verificamos que el codigo no este repetido
      const codeUsed = this.verifyCode(product.code, products);

      if (codeUsed) throw new Error("el codigo enviado ya está en uso");

      const id = newId();

      const newProduct = { id, ...product };

      products.push(newProduct);

      await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");

      return newProduct;
    } catch (error) {
      throw new Error("No se pudo insertar el producto, " + error.message);
    }
  }

  async getProducts() {
    try {
      const productJson = await fs.readFile(this.path, "utf-8");

      const products = JSON.parse(productJson);

      return products;
    } catch (error) {
      throw new Error("No se pudo leer el archivo", error.message);
    }
  }

  async getProductById(id) {
    try {
      const products = await this.getProducts();

      const productFound = products.find((product) => product.id === id);

      if (!productFound) throw new Error("Producto no encontrado");

      return productFound;
    } catch (error) {
      throw new Error("Error al traer un producto por su ID", error.message);
    }
  }

  async deleteProductById(id) {
    try {
      const products = await this.getProducts();

      const productExists = products.some((product) => product.id === id);

      if (!productExists) {
        throw new Error("Producto no encontrado");
      }

      const filteredProducts = products.filter((product) => product.id !== id);

      await fs.writeFile(
        this.path,
        JSON.stringify(filteredProducts, null, 2),
        "utf-8",
      );

      return null;
    } catch (error) {
      throw new Error("Error al borrar un producto por su ID", error.message);
    }
  }

  async updateProductById(id, updates) {
    try {
      const products = await this.getProducts();

      const indexProduct = products.findIndex((product) => product.id === id);

      if (indexProduct === -1) throw new Error("Producto no encontrado");

      delete updates.id;

      products[indexProduct] = {
        ...products[indexProduct],
        ...updates,
        id: products[indexProduct].id,
      };

      await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");

      return products[indexProduct];
    } catch (error) {
      throw new Error("Error al editar un producto por su ID" + error.message);
    }
  }
}

export default ProductManager;
