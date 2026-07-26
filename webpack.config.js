const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = [{
    entry: {
        page1: path.join(__dirname, "/src/index.tsx"),
        page2: path.join(__dirname, "/src/animation.tsx"),
        page3: path.join(__dirname, "/src/lexerAnimation.tsx"),
        page4: path.join(__dirname, "/src/parserComparison.tsx"),
    },
   output: {
    filename: "[name]/build.js",
    path: path.join(__dirname, "/docs")},
   module:{
       rules:[{
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: "ts-loader"
       },
       {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
        },
    ],
   },
   resolve: { extensions: [".tsx", ".ts", ".js"], fallback: { fs: false } },
   plugins:[
    new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: 'index.html',
    chunks: ['page1']
  }),
  new HtmlWebpackPlugin({
    template: './src/animation.html',
    filename: 'animation.html',
    chunks: ['page2']
  }),
  new HtmlWebpackPlugin({
    template: './src/lexerAnimation.html',
    filename: 'lexerAnimation.html',
    chunks: ['page3']
  }),
  new HtmlWebpackPlugin({
    template: './src/parserComparison.html',
    filename: 'parserComparison.html',
    chunks: ['page4']
  }),
  new webpack.DefinePlugin({
    'process.env.VERSION': JSON.stringify(require("./package.json").version)
})
   ],
   devtool: 'source-map'
}
];