const WebpackStrip = require('webpack-strip');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const isProd = process.env.NODE_ENV === 'production';

const config = {
  // #TODO: check if this is ok…
  node: {
    fs: 'empty',
  },
  entry: './src/index.js',
  output: {
    filename: isProd ? 'snitchy-kapla-plugin.min.js' : 'snitchy-kapla-plugin.js',
    library: 'Snitchy Kapla Plugin',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    mainFields: ['browser', 'main', 'module'],
  },
  mode: isProd ? 'production' : 'development',
  optimization: {
    minimize: isProd,
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: '../report.html',
    }),
  ],
};

if (isProd) {
  config.module.rules.push({
    test: /\.js$/,
    use: [
      { loader: WebpackStrip.loader('debug', 'console.info') },
    ],
  });
}

module.exports = config;
