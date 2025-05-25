import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// File paths
const inputFile = path.join(__dirname, 'input.css');
const outputFile = path.join(__dirname, 'output.css');
const configFile = path.join(__dirname, 'postcss.config.js');

async function processPostCSSCLI() {
  try {
    // Ensure the config file exists
    if (!fs.existsSync(configFile)) {
      throw new Error('postcss.config.js not found');
    }

    // Build the PostCSS CLI command
    const command = `npx postcss "${inputFile}" --output "${outputFile}" --config "${configFile}"`;
    
    console.log('Running PostCSS CLI...');
    console.log(`Command: ${command}`);
    
    // Execute the PostCSS CLI command
    execSync(command, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    
    // Verify output was created
    if (fs.existsSync(outputFile)) {
      console.log('✅ Successfully processed PostCSS CLI example');
      console.log(`📄 Output written to: ${outputFile}`);
    } else {
      throw new Error('Output file was not created');
    }
  } catch (error) {
    console.error('❌ Error processing PostCSS CLI:', error);
    process.exit(1);
  }
}

processPostCSSCLI();
