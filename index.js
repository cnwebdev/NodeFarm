const fs = require('fs');
const http = require('http');
const url = require('url');

//////////////////////////////////////////////////////////////////////////
/*
// Blocking, synchronous way
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File written!');
*/

// Non-blocking, asynchronous way
/*
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
   if (err) return console.log('Error! 🔥')

   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
      console.log(data2);
      fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
         console.log(data3);

         fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
            console.log('You file has been written!');
         })
      });
   });
});
console.log('will read file'); 
*/

/////////////////////////////////////////////////
// SERVER
// Replace template
const replaceTemplate = (temp, product) => {
   let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
   output = output.replace(/{%IMAGE%}/g, product.image);
   output = output.replace(/{%PRICE%}/g, product.price);
   output = output.replace(/{%FROM%}/g, product.from);
   output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
   output = output.replace(/{%QUANTITY%}/g, product.quantity);
   output = output.replace(/{%DESCRIPTION%}/g, product.description);
   output = output.replace(/{%ID%}/g, product.id);
   if (!product.organic) {
      output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
   }
   return output;
}

const overviewTempl = fs.readFileSync(`${__dirname}/templates/overview_template.html`, 'utf-8');
const cardTempl = fs.readFileSync(`${__dirname}/templates/card_template.html`, 'utf-8');
const productTempl = fs.readFileSync(`${__dirname}/templates/product_template.html`, 'utf-8');


const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
// console.log(dataObj);

const server = http.createServer((req, res) => {
   const { query, pathname } = (url.parse(req.url, true));
   // const pathName = req.url;

   // OVERVIEW PAGE
   if (pathname === '/' || pathname === '/overview') {
      res.writeHead(200, { 'content-type': 'text/html' });
      
      const cardsHtml = dataObj.map(el => replaceTemplate(cardTempl, el)).join('');
      const output = overviewTempl.replace('{%PRODUCT_CARDS%}', cardsHtml);
      res.end(output);


      // PRODUCT PAGE
   } else if (pathname === '/product') {
      console.log(query);
      res.writeHead(200, { 'content-type': 'text/html' });
      const product = dataObj[query.id];
      const output = replaceTemplate(productTempl, product);
      res.end(output);


      // API
   } else if (pathname === '/api') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(data);

      // PAGE NOT FOUND
   } else {
      res.writeHead(404, {
         'Content-type': 'text/html',
         'My-own-header': 'Hello-there!'
      });
      res.end('<h1>The page you are asking for does not exist!</h1>');
   }
});

server.listen(8000, '127.0.0.1', () => {
   console.log('Listenning to requests on port 8000');
});

