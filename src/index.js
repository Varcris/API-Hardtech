import express from "express";
import { productsRoute } from "./routes/products.js";
import { categoryRoute } from "./routes/categories.js";
import morgan from "morgan";
import { corsMiddleware } from "./middlewares/cors.js";
const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(express.json());
app.use(corsMiddleware());
app.use(morgan("dev"));
app.disable("x-powered-by");
app.use("/api/products", productsRoute);
app.use("/api/categories", categoryRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
