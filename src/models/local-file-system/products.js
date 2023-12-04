import { write } from "node:fs";
import { readJSON, writeJSON } from "../../utils.js";
import { randomUUID } from "node:crypto";

const pathProducts = "../data/products.json";

let products = readJSON(pathProducts);

export class ProductModel {
  static async getAll(category) {
    let allProducts = products;
    if (category) {
      allProducts = await this.getByCategory(category);
    }
    const data = {
      products: allProducts,
      total: allProducts.length,
    };
    return data;
  }

  static async getById(id) {
    return products.find((product) => product.id === id);
  }

  static async getByCategory(category) {
    return products.filter((product) => product.category === category);
  }

  static async create({ kwargs }) {
    const newProduct = {
      id: randomUUID(),
      ...kwargs,
    };
    products.push(newProduct);
    return newProduct;
  }

  static async deleteById({ id }) {
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    const data = {
      products: products,
      total: products.length,
    };

    return data;
  }

  // borrar todos los productos de una categoria
  static async deleteByCategory({ category }) {
    let index = products.findIndex((product) => product.category === category);
    if (index === -1) return false; // No hay productos con esa categoria
    while (index !== -1) {
      products.splice(index, 1);
      index = products.findIndex((product) => product.category === category);
    }
    await writeJSON("data/products.json", products);
    return true;
  }

  static async update({ id, kwargs }) {
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return false;
    const updatedProduct = {
      ...products[index],
      ...kwargs,
    };
    products[index] = updatedProduct;
    return products[index];
  }

  static async;
}
