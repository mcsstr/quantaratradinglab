const fs = require("fs");
const text = fs.readFileSync("test_trades.txt", "utf-8");
const lines = text.split(/\r?\n/).filter(l => l.length > 0);
console.log("Raw 1st line:", lines[0]);
const rowValues = lines[0].split("\t").map(v => v.replace(/(^"|"$)/g, "").trim());
console.log("Row values:", rowValues);

