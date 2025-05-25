import * as fs from 'fs';
import * as path from 'path';
// @ts-expect-error ignore missing types for less
import less from 'less';
import postcss from 'postcss';
import postcssLogicalPolyfill from '../..';

// File paths
const inputFile = path.join(__dirname, 'input.less');
const outputFile = path.join(__dirname, 'output.css');

async function processLess() {
  try {
    // Read the LESS file
    const lessContent = fs.readFileSync(inputFile, 'utf8');
    
    // Compile LESS to CSS
    const lessResult = await less.render(lessContent, {
      filename: inputFile,
    });
    
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
    ]).process(lessResult.css, {
      from: inputFile,
      to: outputFile
    });
    
    // Write the output
    fs.writeFileSync(outputFile, postcssResult.css);
    console.log('✅ Successfully processed LESS example');
  } catch (error) {
    console.error('❌ Error processing LESS:', error);
  }
}

processLess();
