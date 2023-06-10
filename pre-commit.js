const fs = require('fs');
const sharp = require('sharp');

const sensibleTimes = time => time.substring(0, time.length -2);
const removeMilliseconds = originalDate => originalDate.toISOString().split('.')[0];

const forceUpdate = false;

const dataPath = './data/';
const imagePath = './img/';
const templateFile = fs.readFileSync('./404.html', 'utf8');
const templateFileModified = removeMilliseconds(new Date(fs.statSync('./404.html').mtime));
const previousTemplateFile = fs.readFileSync('./previous-404.html', 'utf8');
const previousTemplateFileModified = removeMilliseconds(new Date(fs.statSync('./previous-404.html').mtime));

const dataFiles = fs.readdirSync(dataPath);
const imageFiles = fs.readdirSync(imagePath);
let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const todaysDate = new Date();
const baseDomain = 'https://peggybabcock.co.uk';
const structuredData = {
	"@context": "https://schema.org",
	"@type": "Article",
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


const shouldWriteFile = (modifiedDate, file) => {
    return forceUpdate || 
      sensibleTimes(previousTemplateFileModified) !== sensibleTimes(templateFileModified) || 
      sensibleTimes(removeMilliseconds(fs.statSync(`data/${file}`).mtime)) !== sensibleTimes(removeMilliseconds(fs.statSync(`previous-data/${file}`).mtime))
};

dataFiles.forEach((file, i) => {
  if (file.indexOf('.json') !== -1) {
      const newFileName = file.replace('.json', '.html');
      let modifiedDate = new Date(fs.statSync(newFileName).mtime);
      const dataFileContents = fs.readFileSync(dataPath + file, 'utf8');
      const data = JSON.parse(dataFileContents);
      let toReturn = `<h2>${data.title}</h2>`;
      const newHtml = data.img ? `<picture><source srcset="./img/${data.img.replace('.jpg', '.webp')}" type="image/webp"><img src="./img/${data.img}" width="${data.img === 'peggy-babcock.jpg' ? '1424' : '1024'}" height="${data.img === 'peggy-babcock.jpg' ? '848' : '1024'}" alt="${data.img_alt}" /></picture>` : '';
      let newHTML = `${newHtml}<h2>${data.title}</h2>`;
      if (Array.isArray(data.body)) {
          newHTML += data.body.reduce((newstring, block) => newstring + block.block, '');
      }
      else {
          newHTML += data.body;
      }
      structuredData.url = `${baseDomain}/${newFileName}`;
      structuredData.mainEntity = structuredData.url;
      structuredData.name = file === 'index.json' ? 'Peggy Babcock' : `${data.title} | Peggy Babcock`;
      structuredData.image = data.img ? `${baseDomain}/img/${data.img}`: `${baseDomain}/img/peggy-babcock.jpg`;
      structuredData.dateModified = modifiedDate;

      structuredData.headline = data.title;
      let fileContents = templateFile;
      fileContents = fileContents.replace('<title>Peggy Babcock</title>', `<title>${data.title} | Peggy Babcock</title>`);
      fileContents = fileContents.replace('___REPLACE_THIS___', newHTML);
      fileContents = fileContents.replace('<article class="visually-hidden">', '<article>');
      fileContents = fileContents.replace('<script type="application/ld+json"></script>', `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`);
      if (shouldWriteFile(modifiedDate, file)) {
        console.log('changing file', newFileName);
        const previousStructuredData = structuredData;
        structuredData.dateModified = modifiedDate;
        fileContents = fileContents.replace(`<script type="application/ld+json">${JSON.stringify(previousStructuredData)}</script>`, `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`);
        fs.writeFileSync(newFileName, fileContents);
        fs.copyFileSync(`data/${file}`, `previous-data/${file}`);
        fs.writeFileSync(`data/${file}`, dataFileContents);
        modifiedDate = todaysDate;
      }
      sitemapXML = `${sitemapXML}<url><loc>${baseDomain}/${newFileName}</loc><lastmod>${modifiedDate.toISOString().split('T')[0]}</lastmod></url>`;
  }
})

imageFiles.forEach(img => {
    if (img.indexOf('.jpg') !== -1) {
        const webpFilename = img.replace('.jpg', '.webp');
        const webpAlreadyExists = fs.existsSync(imagePath + webpFilename);
        if (!webpAlreadyExists) {
            sharp(imagePath + img).webp({ quality: 80 }).toFile(imagePath + webpFilename, (err, info) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log(info);
                }
            });
        }
    }
});

if (forceUpdate || sensibleTimes(previousTemplateFileModified) !== sensibleTimes(templateFileModified)) {
     fs.writeFileSync('./previous-404.html', templateFile);
     fs.writeFileSync('./404.html', templateFile);
}

sitemapXML = sitemapXML + '</urlset>';
fs.writeFileSync('sitemap.xml', sitemapXML);