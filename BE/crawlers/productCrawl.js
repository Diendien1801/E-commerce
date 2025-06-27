require("dotenv").config();
const { Builder, By, until } = require("selenium-webdriver");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/product.model");


const categories = [
  // {
  //   name: "CD",
  //   url: "https://store.hangdiathoidai.com/collections/bang-dia-nhac-cd-dvd",
  // },
  // {
  //   name: "VINYL",
  //   url: "https://store.hangdiathoidai.com/collections/dia-than-vinyl",
  // },
  {
    name: "CASSETTE",
    url: "https://store.hangdiathoidai.com/collections/bang-cassette",
  },
];

const csvWriter = createCsvWriter({
  path: path.join(__dirname, "products.csv"),
  header: [
    { id: "title", title: "Title" },
    { id: "price", title: "Price" },
    { id: "imageUrl", title: "ImageUrl" },
    { id: "productUrl", title: "ProductUrl" },
    { id: "source", title: "Source" },
    { id: "category", title: "Category" },
  ],
});

async function crawlAllCategories() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  const driver = await new Builder().forBrowser("chrome").build();
  const crawledSet = new Set();
  const products = [];
  try {
    for (const category of categories) {
      let page = 1;
      while (true) {
        const pageUrl = `${category.url}?page=${page}`;
        console.log(`Đang crawl: ${pageUrl}`);
        await driver.get(pageUrl);
        await driver
          .wait(until.elementsLocated(By.css(".product-meta")), 10000)
          .catch(() => {});
        await driver.executeScript(
          "window.scrollTo(0, document.body.scrollHeight);"
        );
        await driver.sleep(3000);
        const productElements = await driver.findElements(
          By.css(".grid__item")
        );
        if (productElements.length === 0) break;
        let foundNew = false;
        for (const productEl of productElements) {
          try {
            const nameEl = await productEl.findElement(
              By.css(".product-name a")
            );
            const title = await nameEl.getText();
            const productUrl = await nameEl.getAttribute("href");
            let price = "";
            try {
              price = await productEl
                .findElement(By.css(".product-price span span"))
                .getText();
            } catch {
              price = await productEl
                .findElement(By.css(".product-price span"))
                .getText();
            }
            price = price.trim();
            let imageUrl = await productEl
              .findElement(By.css(".product-image img.product-featured-image"))
              .getAttribute("src");
            if (imageUrl.startsWith("//")) {
              imageUrl = "https:" + imageUrl;
            }
            const uniqueKey = `${title}|${price}|${category.name}`;
            if (crawledSet.has(uniqueKey)) continue;
            crawledSet.add(uniqueKey);
            foundNew = true;
            const productData = {
              title,
              price,
              imageUrl,
              productUrl,
              source: "hangdiathoidai.com",
              category: category.name,
            };
            products.push(productData);
            // Lưu vào MongoDB (upsert theo productUrl và category)
            await Product.updateOne(
              { productUrl, category: category.name },
              { $set: productData },
              { upsert: true }
            );
            console.log(`✅ ${title} | ${price} | ${category.name}`);
          } catch (err) {
            console.warn("⚠️ Lỗi từng sản phẩm:", err.message);
            continue;
          }
        }
        if (!foundNew) break;
        page++;
      }
    }
    await csvWriter.writeRecords(products);
    console.log(
      `\nĐã lưu ${products.length} sản phẩm vào file products.csv và MongoDB`
    );
  } catch (error) {
    console.error("❌ Lỗi crawl:", error.message);
  } finally {
    await driver.quit();
    mongoose.connection.close();
  }
}

module.exports = { crawlAllCategories };