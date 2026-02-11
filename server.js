import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const BEAUTYFORT_API = process.env.BEAUTYFORT_API;

app.get("/", (req, res) => {
  res.send("BeautyFort Shopify Connector Running");
});

app.post("/sync-products", async (req, res) => {
  try {
    const response = await axios.get(`${BEAUTYFORT_API}/products`);
    const products = response.data;

    for (let product of products) {
      await axios.post(
        `https://${SHOPIFY_STORE}/admin/api/2024-01/products.json`,
        {
          product: {
            title: product.name,
            body_html: product.description,
            vendor: "BeautyFort",
            variants: [
              {
                price: product.price,
                sku: product.sku
              }
            ]
          }
        },
        {
          headers: {
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Sync failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
