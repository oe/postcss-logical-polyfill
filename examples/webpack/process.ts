import webpack from 'webpack';
import path from 'path';


// Resolve the webpack config in the current directory
const configPath = path.resolve(process.cwd(), 'webpack.config.js');

const config = require(configPath);

webpack(config, (err, stats) => {
  if (err) {
    console.error('Webpack build failed:', err);
    process.exit(1);
  }

  if (stats?.hasErrors()) {
    console.error('Webpack compilation errors:\n', stats.toString({ colors: true }));
    process.exit(1);
  }

  console.log('Webpack build completed successfully:\n', stats?.toString({ colors: true }));
});