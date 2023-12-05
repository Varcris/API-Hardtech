import express from "express";
import cors from "cors";
import { productsRoute } from "./routes/products.js";
import morgan from "morgan";
const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(express.json());
app.use(cors("*"));
app.use(morgan("dev"));
app.disable("x-powered-by");
app.use("/api/products", productsRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
