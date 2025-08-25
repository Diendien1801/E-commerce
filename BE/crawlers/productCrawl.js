require("dotenv").config();
const { Builder, By } = require("selenium-webdriver");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const testlog = require("./testLog")
// Import logging function
const { addLog } = require("../utils/log");

const categories = [
  // ÂN BẢN THỜI ĐẠI (parentID: 1)
  {
    name: "Ấn Bản Có Chữ Ký",
    url: "https://store.hangdiathoidai.com/collections/an-ban-thoi-dai-times-exclusives/Signed",
    idCategory: 101,
  },
  {
    name: "CD + DVD",
    url: "https://store.hangdiathoidai.com/collections/an-ban-thoi-dai-times-exclusives/CD",
    idCategory: 102,
  },
  {
    name: "Băng Cassette",
    url: "https://store.hangdiathoidai.com/collections/an-ban-thoi-dai-times-exclusives/Cassette",
    idCategory: 103,
  },
  {
    name: "Đĩa đơn",
    url: "https://store.hangdiathoidai.com/collections/an-ban-thoi-dai-times-exclusives/Single",
    idCategory: 104,
  },
  {
    name: "Times' Merchandise",
    url: "https://store.hangdiathoidai.com/collections/times-events/times-merch",
    idCategory: 105,
  },

  // ĐĨA HÁT VIỆT NAM (parentID: 2)
  {
    name: "Ấn Bản Có Chữ Ký",
    url: "https://store.hangdiathoidai.com/collections/an-ban-co-chu-ky/nhac-viet-nam",
    idCategory: 201,
  },
  {
    name: "CD + DVD",
    url: "https://store.hangdiathoidai.com/collections/bang-dia-nhac-cd-dvd/nhac-viet-nam",
    idCategory: 202,
  },
  {
    name: "Đĩa Than",
    url: "https://store.hangdiathoidai.com/collections/dia-than-vinyl/nhac-viet-nam",
    idCategory: 203,
  },
  {
    name: "Đĩa Đơn",
    url: "https://store.hangdiathoidai.com/collections/dia-don-single/nhac-viet-nam",
    idCategory: 204,
  },
  {
    name: "Băng Cassette",
    url: "https://store.hangdiathoidai.com/collections/bang-cassette/nhac-viet-nam",
    idCategory: 205,
  },

  // BĂNG ĐĨA QUỐC TẾ (parentID: 3)
  {
    name: "Autographed",
    url: "https://store.hangdiathoidai.com/collections/an-ban-co-chu-ky/nhac-quoc-te",
    idCategory: 301,
  },
  {
    name: "CD + DVD",
    url: "https://store.hangdiathoidai.com/collections/bang-dia-nhac-cd-dvd/nhac-quoc-te",
    idCategory: 302,
  },
  {
    name: "Vinyl",
    url: "https://store.hangdiathoidai.com/collections/dia-than-vinyl/nhac-quoc-te",
    idCategory: 303,
  },
  {
    name: "Single",
    url: "https://store.hangdiathoidai.com/collections/dia-don-single/nhac-quoc-te",
    idCategory: 304,
  },
  {
    name: "Cassette Tape",
    url: "https://store.hangdiathoidai.com/collections/bang-cassette/nhac-quoc-te",
    idCategory: 305,
  },
];

// Helper function: Convert price string to number
function convertPriceToNumber(priceString) {
  if (!priceString || typeof priceString !== "string") return 0;

  // Loại bỏ tất cả ký tự không phải số
  const cleanPrice = priceString.replace(/[^\d]/g, "");
  return parseInt(cleanPrice) || 0;
}

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
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalErrors = 0;

  try {
    for (const category of categories) {
      addLog(
        "info",
        `📁 Bắt đầu crawl danh mục: ${category.name}`,
        "category",
        { categoryId: category.id, categoryName: category.name }
      );

      let page = 1;
      let categoryProcessed = 0;
      let categorySuccess = 0;

      while (true) {
        addLog(
          "info",
          `📄 Đang crawl trang ${page} của danh mục ${category.name}`,
          "page",
          { categoryId: category.id, page, categoryName: category.name }
        );

        await driver.get(`${category.url}?page=${page}`);
        await driver.sleep(2000);

        // Lấy hết link chi tiết sản phẩm trên trang này
        const productElements = await driver.findElements(
          By.css(".product-container")
        );

        if (productElements.length === 0) {
          addLog(
            "info",
            `🏁 Kết thúc danh mục ${category.name} - không còn sản phẩm mới`,
            "category",
            { categoryId: category.id, categoryName: category.name }
          );
          break;
        }

        addLog(
          "info",
          `🔍 Tìm thấy ${productElements.length} sản phẩm trên trang ${page}`,
          "page",
          {
            categoryId: category.id,
            page,
            productCount: productElements.length,
          }
        );

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
            let priceString = "";
            try {
              priceString = await productEl
                .findElement(By.css(".product-price span span"))
                .getText();
            } catch {
              try {
                priceString = await productEl
                  .findElement(By.css(".product-price span"))
                  .getText();
              } catch {
                priceString = "";
              }
            }
            priceString = priceString.trim();
            if (priceString.toLowerCase().includes("bán hết")) {
              priceString = "";
            }

            productLinks.push({ productUrl, thumbImgSrc, title, priceString });
          } catch {
            continue;
          }
        }

        let foundNew = false;
        for (const {
          productUrl,
          thumbImgSrc,
          title,
          priceString,
        } of productLinks) {
          try {
            totalProcessed++;
            categoryProcessed++;

            // Kiểm tra productUrl trước khi get
            if (!productUrl || typeof productUrl !== "string") {
              addLog(
                "warning",
                `⚠️ Bỏ qua sản phẩm vì productUrl không hợp lệ: ${title}`,
                "product",
                { title, categoryName: category.name }
              );
              continue;
            }

            addLog("info", `🎵 Đang crawl chi tiết: ${title}`, "product", {
              title,
              categoryName: category.name,
              categoryId: category.id,
            });

            // --- Crawl chi tiết sản phẩm ---
            await driver.get(productUrl);
            await driver.sleep(1500);

            // Lấy imageUrl: chỉ lấy ảnh nhỏ trong carousel
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
              // Nếu không có carousel, fallback sang 1 ảnh thumbnail
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

            // Tìm các sản phẩm liên quan trong DB
            let related = [];
            if (relatedCriteria.length > 0) {
              related = await Product.find(
                { title: { $in: relatedCriteria } },
                "_id"
              ).then((docs) => docs.map((doc) => doc._id));
            }

            // Nếu không tìm thấy sản phẩm liên quan, lấy 6 sản phẩm bất kỳ
            if (related.length < 6) {
              related = await Product.aggregate([
                { $sample: { size: 6 } },
                { $project: { _id: 1 } },
              ]).then((docs) => docs.map((doc) => doc._id));
            }

            // Lấy status
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

            // Lấy description
            let description = "";
            try {
              const descEl = await driver.findElement(
                By.css("#product-detail .product-description")
              );
              description = await descEl.getText();
            } catch {
              description = "";
            }

            // Quay lại trang list
            await driver.navigate().back();
            await driver.sleep(1000);

            // Convert price string to number
            const price = convertPriceToNumber(priceString);

            const uniqueKey = `${title}|${priceString}|${category.name}`;
            if (crawledSet.has(uniqueKey)) {
              addLog("info", `🔄 Sản phẩm đã tồn tại: ${title}`, "product", {
                title,
                categoryName: category.name,
                status: "duplicate",
              });
              continue;
            }

            crawledSet.add(uniqueKey);
            foundNew = true;

            const productData = {
              title,
              price, // Bây giờ là number
              description,
              imageUrl,
              idCategory: category.idCategory,
              related,
              status,
            };

            // Upsert product
            const result = await Product.updateOne(
              { title, idCategory: category.idCategory },
              { $set: productData },
              { upsert: true }
            );

            let productId;
            if (result.upsertedId) {
              // Product mới được tạo
              productId = result.upsertedId;
              totalSuccess++;
              categorySuccess++;

              addLog(
                "success",
                `✅ Tạo mới thành công: ${title} | ${price}₫ | ${category.name}`,
                "product",
                {
                  title,
                  price,
                  categoryName: category.name,
                  categoryId: category.id,
                  status: "created",
                  productId: productId.toString(),
                }
              );

              console.log(
                `✅ Tạo mới: ${title} | ${price}₫ | ${category.name}`
              );
            } else {
              // Product đã tồn tại, tìm lại để lấy _id
              const existingProduct = await Product.findOne({
                title,
                idCategory: category.idCategory,
              });
              productId = existingProduct._id;
              totalSuccess++;
              categorySuccess++;

              addLog(
                "success",
                `✅ Cập nhật thành công: ${title} | ${price}₫ | ${category.name}`,
                "product",
                {
                  title,
                  price,
                  categoryName: category.name,
                  categoryId: category.id,
                  status: "updated",
                  productId: productId.toString(),
                }
              );

              console.log(
                `✅ Cập nhật: ${title} | ${price}₫ | ${category.name}`
              );
            }

            // Tạo/cập nhật inventory record
            await Inventory.updateOne(
              {
                warehouseId: 1,
                productId: productId,
              },
              {
                $set: {
                  warehouseId: 1,
                  productId: productId,
                  quantity: 100,
                },
              },
              { upsert: true }
            );

            addLog(
              "info",
              `📦 Cập nhật inventory cho sản phẩm: ${title}`,
              "inventory",
              { title, productId: productId.toString() }
            );
            console.log(`📦 Inventory updated for product: ${title}`);
          } catch (err) {
            totalErrors++;
            addLog(
              "error",
              `❌ Lỗi crawl sản phẩm: ${title} - ${err.message}`,
              "product",
              {
                title,
                categoryName: category.name,
                error: err.message,
                status: "failed",
              }
            );
            console.warn("⚠️ Lỗi từng sản phẩm:", err.message);
            continue;
          }
        }

        if (!foundNew) {
          addLog(
            "info",
            `🏁 Không tìm thấy sản phẩm mới trên trang ${page}, chuyển sang trang tiếp theo`,
            "page",
            { categoryId: category.id, page, categoryName: category.name }
          );
          break;
        }

        addLog(
          "info",
          `📊 Trang ${page} hoàn thành - ${categorySuccess} sản phẩm thành công`,
          "page",
          {
            categoryId: category.id,
            page,
            categoryName: category.name,
            successCount: categorySuccess,
            processedCount: categoryProcessed,
          }
        );

        page++;
      }

      addLog(
        "success",
        `🏁 Hoàn thành danh mục ${category.name} - ${categorySuccess}/${categoryProcessed} sản phẩm thành công`,
        "category",
        {
          categoryId: category.id,
          categoryName: category.name,
          successCount: categorySuccess,
          processedCount: categoryProcessed,
        }
      );
    }

    addLog(
      "success",
      `🎉 Crawling hoàn thành! Tổng cộng: ${totalSuccess}/${totalProcessed} sản phẩm thành công, ${totalErrors} lỗi`,
      "summary",
      {
        totalSuccess,
        totalProcessed,
        totalErrors,
      }
    );
  } catch (error) {
    addLog("error", `💥 Lỗi nghiêm trọng: ${error.message}`, "system", {
      error: error.message,
    });
    console.error("Lỗi crawl:", error);
  } finally {
    await driver.quit();
    addLog("info", "🔒 Đóng Chrome browser", "system");
    await mongoose.disconnect();
    addLog("info", "🔌 Ngắt kết nối MongoDB", "system");
  }
}

module.exports = { crawlAllCategories };
