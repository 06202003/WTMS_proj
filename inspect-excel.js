const XLSX = require('xlsx');
const workbook = XLSX.readFile('d:\\Wimbledoc\\DATA PESERTA SURABAYA.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);
console.log('Sheet Name:', sheetName);
console.log('Headers:', Object.keys(data[0] || {}));
console.log('First Row:', data[0]);
console.log('Total Rows:', data.length);
