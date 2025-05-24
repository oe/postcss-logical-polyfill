import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

/**
 * Runs PostCSS on all examples
 */
async function runExamples(): Promise<void> {
  // Get all example directories
  const examples = fs.readdirSync(EXAMPLES_DIR).filter(dir => {
    return fs.statSync(path.join(EXAMPLES_DIR, dir)).isDirectory();
  });

  console.log(chalk.blue('Found examples:'), examples.join(', '));

  // Process each example
  for (const example of examples) {
    const exampleDir = path.join(EXAMPLES_DIR, example);
    console.log(chalk.green(`\nProcessing ${example} example...`));

    try {
      // Check if the example has a process script
      const hasProcessScript = fs.existsSync(path.join(exampleDir, 'process.ts'));
      
      if (hasProcessScript) {
        // Run the example's custom process script
        await runCommand('tsx', ['process.ts'], { cwd: exampleDir });
      } else {
        // Default processing with postcss-cli
        const hasConfig = fs.existsSync(path.join(exampleDir, 'postcss.config.ts')) || 
                         fs.existsSync(path.join(exampleDir, 'postcss.config.js'));
        
        if (!hasConfig) {
          console.log(chalk.yellow(`Warning: ${example} doesn't have a PostCSS config file, skipping.`));
          continue;
        }

        // Find input files
        const inputFiles = fs.readdirSync(exampleDir)
          .filter(file => file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.less'))
          .filter(file => !file.includes('.output.'));

        if (inputFiles.length === 0) {
          console.log(chalk.yellow(`Warning: ${example} doesn't have any input files, skipping.`));
          continue;
        }

        // Process each input file
        for (const inputFile of inputFiles) {
          const inputPath = path.join(exampleDir, inputFile);
          const outputFile = inputFile.replace(/\.(css|scss|less)$/, '.output.$1');
          const outputPath = path.join(exampleDir, outputFile);

          console.log(chalk.blue(`Processing ${inputFile} -> ${outputFile}`));
          await runCommand('npx', ['postcss', inputPath, '-o', outputPath], { cwd: exampleDir });
        }
      }
      
      console.log(chalk.green(`✓ Successfully processed ${example} example`));
    } catch (error) {
      console.error(chalk.red(`✗ Error processing ${example} example:`), error);
    }
  }
}

/**
 * Runs a command and returns a promise
 */
function runCommand(command: string, args: string[], options: any = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

// Run the examples
runExamples().catch(error => {
  console.error(chalk.red('Error running examples:'), error);
  process.exit(1);
});
