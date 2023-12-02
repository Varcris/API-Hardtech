import { readJSON } from "../../utils.js";
import { randomUUID } from "node:crypto";

const products = readJSON("../data/products.json");

export class ProductModel {
  static async getAll(args) {
    return products;
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
    return products;
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
}
