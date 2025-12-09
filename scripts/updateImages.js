import fs from "fs";
import db from "../config/db.js";
import csv from "csv-parser";

let data = [];

fs.createReadStream("imageMap.csv")


  .pipe(csv())
  .on("data", row => data.push(row))
  .on("end", async () => {
    console.log(`Updating ${data.length} products...`);
    let updated = 0;

    for (let item of data) {
      if (!item.image || !item.name) continue;

      await db.query(
        "UPDATE products SET image=$1 WHERE name=$2",
        [ item.image.trim(), item.name.trim() ]
      );

      updated++;
      console.log("✔ Updated:", item.name);
    }

    console.log(`\n🔥 Done! ${updated} product images updated successfully.`);
    process.exit();
  });
