import * as fs from 'fs';
import * as path from 'path';
import postcss from 'postcss';
import postcssLogicalScope from '../..';

// File paths
const inputFile = path.join(__dirname, 'input.css');
const outputFile = path.join(__dirname, 'output.css');

async function processBasic() {
  try {
    // Read the CSS file
    const cssContent = fs.readFileSync(inputFile, 'utf8');
    
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
    ]).process(cssContent, {
      from: inputFile,
      to: outputFile
    });
    
    // Write the output
    fs.writeFileSync(outputFile, postcssResult.css);
    console.log('✅ Successfully processed Basic example');
  } catch (error) {
    console.error('❌ Error processing Basic:', error);
  }
}

processBasic();
