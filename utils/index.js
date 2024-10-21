const mongoose = require("mongoose");
const fs = require("fs");
const https = require("https");
const path = require("path");
const { ObjectId } = mongoose.Types;
const axios = require("axios");
const sharp = require("sharp");
const { UTApi } = require("uploadthing/server");

const utils = {
  utapi: new UTApi(),

  message: "Internal server error",

  isEnglish(str) {
    return /^[a-zA-Z0-9\s.,!?]+$/.test(str);
  },

  async downloadImage(url, filename) {
    const filePath = path.join(
      __dirname,
      `../../frontend/public/images/doctor/${filename}`
    );
    const webpFilePath = path.join(
      __dirname,
      `../../frontend/public/images/doctor/${path.parse(filename).name}.webp`
    );
    const file = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          response.pipe(file);
          file.on("finish", async () => {
            file.close();
            try {
              await sharp(filePath).toFile(webpFilePath);
              fs.unlink(filePath, () => resolve(webpFilePath));
            } catch (error) {
              reject(error);
            }
          });
        })
        .on("error", (error) => {
          fs.unlink(filePath, () => reject(error));
          console.error(`Failed to download ${filename}: ${error.message}`);
        });
    });
  },

  async translate(page, text) {
    try {
      let translatedText = "";
      // await page.type('textarea[aria-label="Source text"]', text);
      await page.evaluate((text) => {
        const textarea = document.querySelector(
          'textarea[aria-label="Source text"]'
        );
        textarea.focus();
        textarea.value = text;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }, text);

      await page.screenshot({ path: `screenshot.png` });
      await page.waitForSelector(".HwtZe", { visible: true });
      translatedText = await page.evaluate(() => {
        return document.querySelector(".HwtZe").innerText;
      });
      await page.screenshot({ path: `screenshot.png` });

      const button = await page.$('button[aria-label="Clear source text"]');
      if (button) await button.click();

      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return null;
    }
  },

  stringSlug(string, sign = "-") {
    return string
      .toLowerCase() // Convert to lowercase
      .replace(/[\s_&]+/g, sign) // Replace spaces, underscores, and '&' with hyphens
      .replace(/-+/g, sign) // Replace multiple hyphens with a single hyphen
      .replace(/[^\w\-]/g, "") // Remove all non-word characters except hyphens
      .replace(/^-|-$/g, ""); // Remove hyphens at the start or end of the string
  },

  randomKey(length = 5, stringOnly = false) {
    if (stringOnly) {
      const characters = "abcdefghijklmnopqrstuvwxyz";
      return [...Array(length)]
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join("");
    } else {
      return [...Array(length)]
        .map(() => Math.random().toString(36)[2])
        .join("");
    }
  },

  paginate(page, perPage) {
    page = Math.max(Number(page) || 1, 1);
    const limit = Math.max(Number(perPage) || 1, 1);
    const skip = (page - 1) * limit;

    return [{ $skip: skip }, { $limit: limit }];
  },

  hasOne(query, from, as, select = []) {
    const $expr = { $eq: ["$_id", `$$${query}`] };
    const pipeline = [{ $match: { $expr } }];
    if (select.length) {
      pipeline.push({
        $project: Object.fromEntries(select.map((key) => [key, 1])),
      });
    }
    return [
      {
        $lookup: {
          from,
          let: { [query]: `$${query}` },
          pipeline,
          as,
        },
      },
      {
        $addFields: {
          [as]: { $arrayElemAt: [`$${as}`, 0] },
        },
      },
    ];
  },

  hasMany(
    from,
    localField,
    foreignField,
    as,
    select = [],
    additionalCriteria = {}
  ) {
    const pipeline = [];
    if (Object.keys(additionalCriteria).length) {
      pipeline.push({
        $match: additionalCriteria,
      });
    }
    if (select.length) {
      pipeline.push({
        $project: Object.fromEntries(select.map((key) => [key, 1])),
      });
    }

    return [
      {
        $lookup: {
          from,
          localField,
          foreignField,
          as,
          pipeline,
        },
      },
    ];
  },

  toggle(field) {
    return [{ $set: { [field]: { $eq: [false, `$${field}`] } } }];
  },

  startDate(date = new Date()) {
    let startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  },

  endDate(date = new Date()) {
    let endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  },

  addDate(days = 0, date = new Date()) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  dateDifferent(start = new Date(), end = new Date()) {
    const { startDate } = utils;
    return (startDate(end) - startDate(start)) / (1000 * 60 * 60 * 24);
  },

  objectID(id) {
    return new ObjectId(id);
  },

  arrayConverter(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  },

  encode(value) {
    return value ? btoa(value) : "";
  },

  decode(value) {
    return value ? atob(value) : "";
  },

  async postReq(url, header = {}, body = {}) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...header,
    };

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        return await axios.post(url, body, { headers });
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === 5)
          return { error: "Max attempts reached", details: error };
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // exponential backoff
      }
    }
  },

  async average(...numbers) {
    return (
      numbers.reduce((sum, num) => sum + (+num || 0), 0) / numbers.length
    ).toFixed(2);
  },

  dateFormat(value = new Date(), sign = "-") {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(value)
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, sign);
  },

  countUniqueDates(start, end) {
    return new Set(
      Array.from(
        {
          length:
            ((max = new Date(end)) - (min = new Date(start))) / 86400000 + 1,
        },
        (_, i) =>
          new Date(min.getTime() + i * 86400000).toISOString().split("T")[0]
      )
    ).size;
  },

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

module.exports = utils;
