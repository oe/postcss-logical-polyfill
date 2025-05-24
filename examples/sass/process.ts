import * as fs from 'fs';
import * as path from 'path';
import sass from 'sass';
import postcss from 'postcss';
import postcssLogicalScope from '../../dist';

// File paths
const inputFile = path.join(__dirname, 'input.scss');
const outputFile = path.join(__dirname, 'output.css');

async function processSass() {
  try {
    // Compile Sass to CSS
    const sassResult = sass.compile(inputFile);
    
    // Process with PostCSS and our plugin
    const postcssResult = await postcss([
      postcssLogicalScope({
        // Configure RTL and LTR transformations
        rtl: {
          selector: '[dir="rtl"]'
        },
        ltr: {
          selector: '[dir="ltr"]'
        }
      })
    ]).process(sassResult.css, {
      from: inputFile,
      to: outputFile
    });
    
    // Write the output
    fs.writeFileSync(outputFile, postcssResult.css);
    console.log('✅ Successfully processed Sass example');
  } catch (error) {
    console.error('❌ Error processing Sass:', error);
  }
}

processSass();
