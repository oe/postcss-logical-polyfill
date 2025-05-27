import postcss from 'postcss';
import logicalPolyfill from '../../src/index';
import fs from 'fs';
import path from 'path';

async function processCSS() {
  console.log('🎯 Smart Selector Priority Optimization Example\n');
  
  // Read input CSS
  const inputPath = path.join(__dirname, 'input.css');
  const inputCSS = fs.readFileSync(inputPath, 'utf8');
  
  console.log('📄 Input CSS with complex direction selector chains:');
  console.log('=' .repeat(60));
  console.log(inputCSS);
  console.log('=' .repeat(60));
  
  // Configure the plugin with custom selectors
  const plugin = logicalPolyfill({
    ltr: { selector: '.theme-ltr' },
    rtl: { selector: '.theme-rtl' },
    outputOrder: 'ltr-first'
  });
  
  try {
    // Process the CSS
    const result = await postcss([plugin]).process(inputCSS, { 
      from: inputPath 
    });
    
    console.log('\n🔄 Processing with rightmost priority optimization...\n');
    
    console.log('✅ Output CSS showing rightmost priority logic:');
    console.log('=' .repeat(60));
    console.log(result.css);
    console.log('=' .repeat(60));
    
    // Save output
    const outputPath = path.join(__dirname, 'output.css');
    fs.writeFileSync(outputPath, result.css);
    console.log(`\n💾 Output saved to: ${outputPath}`);
    
    // Show key optimization points
    console.log('\n🎯 Key Optimization Points Demonstrated:');
    console.log('1. ✨ Rightmost direction selector takes precedence');
    console.log('2. 🔗 Mixed built-in and custom selectors handled correctly');
    console.log('3. 🏗️  Complex nested scenarios work predictably');
    console.log('4. ⚡ Edge cases managed gracefully');
    console.log('5. 🎨 Framework-agnostic custom selector support');
    
    console.log('\n📋 Example Analysis:');
    console.log('• ".app[dir="ltr"] .section:dir(rtl) .content" → RTL applied (rightmost :dir(rtl))');
    console.log('• ":dir(rtl) .container .theme-ltr .component" → LTR applied (rightmost .theme-ltr)');
    console.log('• "[dir="ltr"] .parent [dir="rtl"] .child [dir="ltr"] .final" → LTR applied (rightmost [dir="ltr"])');
    
  } catch (error) {
    console.error('❌ Error processing CSS:', error);
    process.exit(1);
  }
}

// Run the example
processCSS();
