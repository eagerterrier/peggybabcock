const fs = require('fs');

const dataPath = './data/';
const templateFile = fs.readFileSync('./404.html', 'utf8');

const dataFiles = fs.readdirSync(dataPath);
let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const todaysDate = new Date().toISOString().split('T')[0];
const baseDomain = 'https://peggybabcock.co.uk';

dataFiles.forEach((file, i) => {
  if (file.indexOf('.json') !== -1) {
      const newFileName = file.replace('.json', '.html');
      const data = JSON.parse(fs.readFileSync(dataPath + file, 'utf8'));
      let toReturn = `<h2>${data.title}</h2>`;
      const newHtml = data.img ? `<img src="./img/${data.img}" alt="${data.img_alt}" />` : '';
      let newHTML = `${newHtml}<h2>${data.title}</h2>`;
      if (Array.isArray(data.body)) {
          newHTML += data.body.reduce((newstring, block) => newstring + block.block, '');
      }
      else {
          newHTML += data.body;
      }
      let fileContents = templateFile;
      fileContents = fileContents.replace('<title>Peggy Babcock</title>', `<title>${data.title} | Peggy Babcock</title>`);
      fileContents = fileContents.replace('___REPLACE_THIS___', newHTML);
      fileContents = fileContents.replace('<article class="visually-hidden">', '<article>');
      const currentFileContents = fs.readFileSync(newFileName, 'utf8');
      let modifiedDate = new Date(fs.statSync(newFileName).mtime).toISOString().split('T')[0];
      if (currentFileContents !== fileContents) {
        console.log('changing file', newFileName);
        fs.writeFileSync(newFileName, fileContents);
        modifiedDate = todaysDate;
      }
      sitemapXML = `${sitemapXML}<url><loc>${baseDomain}/${newFileName}</loc><lastmod>${modifiedDate}</lastmod></url>`;
  }
})

sitemapXML = sitemapXML + '</urlset>';
fs.writeFileSync('sitemap.xml', sitemapXML);