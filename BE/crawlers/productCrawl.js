require("dotenv").config();
const { Builder, By } = require("selenium-webdriver");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const categories = [
  {
    name: "CASSETTE",
    url: "https://store.hangdiathoidai.com/collections/bang-cassette",
  },
  // Thêm các category khác nếu cần
];

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

  try {
    for (const category of categories) {
      let page = 1;
      while (true) {
        await driver.get(`${category.url}?page=${page}`);
        await driver.sleep(2000);

        // Lấy hết link chi tiết sản phẩm trên trang này
        const productElements = await driver.findElements(
          By.css(".product-container")
        );
        if (productElements.length === 0) break;

        // Lưu lại link chi tiết và element thumbnail để lấy ảnh fallback nếu cần
        let productLinks = [];
        for (const productEl of productElements) {
          try {
            const thumbLinkEl = await productEl.findElement(
              By.css(".product-image > .product-thumbnail > a")
            );
            let productUrl = await thumbLinkEl.getAttribute("href");
            if (productUrl && productUrl.startsWith("/")) {
              productUrl = "https://store.hangdiathoidai.com" + productUrl;
            }
            // Lấy luôn thumbnail src để fallback nếu cần
            let thumbImgSrc = "";
            try {
              const thumbImgEl = await productEl.findElement(
                By.css(".product-thumbnail img")
              );
              thumbImgSrc = await thumbImgEl.getAttribute("src");
              if (thumbImgSrc.startsWith("//"))
                thumbImgSrc = "https:" + thumbImgSrc;
            } catch {
              thumbImgSrc = "";
            }
            // Lấy title để tạo uniqueKey
            let title = "";
            try {
              const titleEl = await productEl.findElement(
                By.css(".product-meta .product-name a")
              );
              title = await titleEl.getText();
            } catch {
              title = "";
            }
            // Lấy price để tạo uniqueKey
            let price = "";
            try {
              price = await productEl
                .findElement(By.css(".product-price span span"))
                .getText();
            } catch {
              try {
                price = await productEl
                  .findElement(By.css(".product-price span"))
                  .getText();
              } catch {
                price = "";
              }
            }
            price = price.trim();
            if (price.toLowerCase().includes("bán hết")) {
              price = "";
            }
            productLinks.push({ productUrl, thumbImgSrc, title, price });
          } catch {
            continue;
          }
        }

        let foundNew = false;
        for (const { productUrl, thumbImgSrc, title, price } of productLinks) {
          try {
            // Kiểm tra productUrl trước khi get
            if (!productUrl || typeof productUrl !== "string") {
              console.warn(
                "⚠️ Bỏ qua sản phẩm vì productUrl không hợp lệ:",
                productUrl
              );
              continue;
            }

            // --- Crawl chi tiết sản phẩm ---
            await driver.get(productUrl);
            await driver.sleep(1500);

            // Lấy imageUrl: chỉ lấy ảnh nhỏ trong carousel, nếu không có thì fallback sang thumbnail
            let imageUrl = [];
            try {
              const thumbImgs = await driver.findElements(
                By.css(".product-single__thumbnails img")
              );
              for (const imgEl of thumbImgs) {
                let src = await imgEl.getAttribute("src");
                if (src.startsWith("//")) src = "https:" + src;
                imageUrl.push(src);
              }
              // Nếu không có carousel, fallback sang 1 ảnh thumbnail đã lấy ở trang list
              if (imageUrl.length === 0 && thumbImgSrc) {
                imageUrl.push(thumbImgSrc);
              }
            } catch {
              if (thumbImgSrc) {
                imageUrl = [thumbImgSrc];
              } else {
                imageUrl = [];
              }
            }

            // Lấy relatedCriteria (tên các sản phẩm liên quan)
            let relatedCriteria = [];
            try {
              const relatedEls = await driver.findElements(
                By.css(".related-products .product-meta .product-name a")
              );
              for (const el of relatedEls) {
                const text = await el.getText();
                relatedCriteria.push(text);
              }
            } catch {
              relatedCriteria = [];
            }

            // Tìm các sản phẩm liên quan trong DB để lấy ObjectId
            let related = [];
            if (relatedCriteria.length > 0) {
              related = await Product.find(
                { title: { $in: relatedCriteria } },
                "_id"
              ).then((docs) => docs.map((doc) => doc._id));
            }

            // Lấy status (ví dụ: kiểm tra có chữ "Hết hàng" không)
            let status = "available";
            try {
              const soldOutEl = await driver.findElement(By.css(".sold-out"));
              const soldOutText = await soldOutEl.getText();
              if (
                soldOutText &&
                soldOutText.toLowerCase().includes("hết hàng")
              ) {
                status = "out_of_stock";
              }
            } catch {
              // Không tìm thấy phần tử sold-out, giữ status là "available"
            }
            // Lấy description từ tab mô tả sản phẩm
            let description = "";
            try {
              const descEl = await driver.findElement(
                By.css("#product-detail .product-description")
              );
              description = await descEl.getText(); // <-- chỉ lấy nội dung text
            } catch {
              description = "";
            }
            // Quay lại trang list để tiếp tục crawl sản phẩm tiếp theo
            await driver.navigate().back();
            await driver.sleep(1000);

            const uniqueKey = `${title}|${price}|${category.name}`;
            if (crawledSet.has(uniqueKey)) continue;
            crawledSet.add(uniqueKey);
            foundNew = true;

            const productData = {
              title,
              price,
              description, // Nếu muốn crawl mô tả, thêm logic ở đây
              imageUrl,
              idCategory: null, // Nếu có idCategory thì lấy, nếu không thì để null
              related,
              status,
            };

            await Product.updateOne(
              { title, price, status },
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
  } catch (error) {
    console.error("Lỗi crawl:", error);
  } finally {
    await driver.quit();
    await mongoose.disconnect();
  }
}

module.exports = { crawlAllCategories };
