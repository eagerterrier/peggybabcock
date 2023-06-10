const fs = require('fs');

const dataPath = './data/';
const templateFile = fs.readFileSync('./404.html', 'utf8');

const dataFiles = fs.readdirSync(dataPath);


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
      fs.writeFileSync(newFileName, fileContents);
  }
})