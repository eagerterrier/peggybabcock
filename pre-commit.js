const fs = require('fs');

const dataPath = './data/';
const templateFile = fs.readFileSync('./404.html', 'utf8');

const dataFiles = fs.readdirSync(dataPath);
let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const todaysDate = new Date();
const baseDomain = 'https://peggybabcock.co.uk';
const structuredData = {
	"@context": "https:\/\/schema.org",
	"author": {
		"@type": "Organization",
		"name": "Peggy Babcock's Biographers"
	},
	"publisher": {
		"@type": "Organization",
		"name": "Peggy Babcock, Inc.",
		"logo": {
			"@type": "ImageObject",
			"url": "https://peggybabcock.co.uk/icons/mstile-310x310.png"
		}
	},
	"datePublished": "1997-07-31T09:26:58Z",
}

dataFiles.forEach((file, i) => {
  if (file.indexOf('.json') !== -1) {
      const newFileName = file.replace('.json', '.html');
      const currentFileContents = fs.readFileSync(newFileName, 'utf8');
      let modifiedDate = new Date(fs.statSync(newFileName).mtime);
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
      structuredData.url = `${baseDomain}/${newFileName}`;
      structuredData.mainEntity = structuredData.url;
      structuredData['@type'] = file === 'index.json' ? 'Collection' : 'Article';
      structuredData.name = file === 'index.json' ? 'Peggy Babcock' : `${data.title} | Peggy Babcock`;
      structuredData.image = data.img ? `${baseDomain}/img/${data.img}`: `${baseDomain}/img/peggy-babcock.jpg`;
      structuredData.dateModified = modifiedDate;
      structuredData.headline = data.title;
      let fileContents = templateFile;
      fileContents = fileContents.replace('<title>Peggy Babcock</title>', `<title>${data.title} | Peggy Babcock</title>`);
      fileContents = fileContents.replace('___REPLACE_THIS___', newHTML);
      fileContents = fileContents.replace('<article class="visually-hidden">', '<article>');
      fileContents = fileContents.replace('<script type="application/ld+json"></script>', `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`);
      
      if (currentFileContents !== fileContents) {
        console.log('changing file', newFileName);
        const previousStructuredData = structuredData;
        structuredData.dateModified = modifiedDate;
        fileContents = fileContents.replace(`<script type="application/ld+json">${JSON.stringify(previousStructuredData)}</script>`, `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`);
        fs.writeFileSync(newFileName, fileContents);
        modifiedDate = todaysDate;
      }
      sitemapXML = `${sitemapXML}<url><loc>${baseDomain}/${newFileName}</loc><lastmod>${modifiedDate.toISOString().split('T')[0]}</lastmod></url>`;
  }
})

sitemapXML = sitemapXML + '</urlset>';
fs.writeFileSync('sitemap.xml', sitemapXML);