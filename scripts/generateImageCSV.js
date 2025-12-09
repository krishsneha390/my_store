import xlsx from "xlsx";
import fs from "fs";

const productsFile = xlsx.readFile("products.xlsx");
const imagesFile = xlsx.readFile("basic900216800021export1765283141643_1209-20-25-41.xlsx");

const products = xlsx.utils.sheet_to_json(productsFile.Sheets[productsFile.SheetNames[0]]);
const images = xlsx.utils.sheet_to_json(imagesFile.Sheets[imagesFile.SheetNames[0]]);

// mapping using English Product Name & our DB name
const mapped = products.map(p => {
    const match = images.find(i => i["Product Name(English)"] === p.name);
    return {
        name: p.name,
        image: match ? match["*Product Images1"] : null
    };
});

// save as CSV
const csvRows = ["name,image"];
mapped.forEach(row => {
    csvRows.push(`"${row.name.replace(/"/g,'""')}", "${row.image || ""}"`);
});

fs.writeFileSync("imageMap.csv", csvRows.join("\n"), "utf8");

console.log("imageMap.csv generated successfully!");
