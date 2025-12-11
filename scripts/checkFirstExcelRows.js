import xlsx from "xlsx";

const workbook = xlsx.readFile("basic900216800021export1765448106494_1211-18-15-06.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log("First 10 rows:");
console.log(rows.slice(0, 10));
