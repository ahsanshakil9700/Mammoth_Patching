const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');


const styleMap = `
p[style-name='Title'] => h1.text-center:fresh
p[style-name='Heading 1'] => h2:fresh
p[style-name='Caption'] => strong
p[style-name='Heading 2'] => h3:fresh
table => table.table-bordered.align-middle.mx-auto:fresh
comment-reference => sup
p.levelone => ol.level-one > li.level-one-item:fresh
p.leveltwo => ol.level-one > li.level-one-item > ol.level-two > li.level-two-item:fresh
p.levelthree => ol.level-one > li.level-one-item > ol.level-two > li.level-two-item > ol.level-three > li.level-three-item:fresh
p.levelfour => ol.level-one > li.level-one-item > ol.level-two > li.level-two-item > ol.level-three > li.level-three-item > ol.level-four > li.level-four-item:fresh
p.levelfive => ol.level-one > li.level-one-item > ol.level-two > li.level-two-item > ol.level-three > li.level-three-item > ol.level-four > li.level-four-item > ol.level-five > li.level-five-item:fresh
p.levelsix => ol.level-one > li.level-one-item > ol.level-two > li.level-two-item > ol.level-three > li.level-three-item > ol.level-four > li.level-four-item > ol.level-five > li.level-five-item > ol.level-six > li.level-six-item:fresh
p.levelseven => ol.level-one > li.level-one-item > ol.level-two > li.level-two-item > ol.level-three > li.level-three-item > ol.level-four > li.level-four-item > ol.level-five > li.level-five-item > ol.level-six > li.level-six-item > ol.level-seven > li.level-seven-item:fresh
`;

const inputPath = 'Moderna.docx';

const inputFilename = path.basename(inputPath, path.extname(inputPath));

fs.readFile(inputPath, function (err, data) {
  if (err) throw err;
  mammoth.convertToHtml({ buffer: data }, { styleMap: styleMap, convertLists: true })
    .then(function (result) {
      const html = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                <title>${inputFilename}</title>
                <style>
                    body {
                        margin: 0 auto;
                        max-width: 800px;
                        font-size: 16px;
                    }


                </style>
            </head>
            <body>
                ${result.value}
            </body>
            </html>`;
      const outputFilename = `${inputFilename}.html`;
      fs.writeFile(outputFilename, html, function (err) {
        if (err) throw err;
        console.log(`Conversion completed and output saved to ${outputFilename}`);
      });
    })
    .done();
});
