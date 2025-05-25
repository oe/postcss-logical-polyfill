import * as fs from 'fs';
import * as path from 'path';
import * as sassLib from 'sass';
import postcss from 'postcss';
import postcssLogicalPolyfill from '../..';

// File paths
const inputFile = path.join(__dirname, 'input.scss');
const outputFile = path.join(__dirname, 'output.css');

async function processSass() {
  try {
    // Compile Sass to CSS
    const sassResult = sassLib.compile(inputFile);
    
    // Process with PostCSS and our plugin
    const postcssResult = await postcss([
      postcssLogicalPolyfill({
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
    // Print more detailed error info
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

processSass();
