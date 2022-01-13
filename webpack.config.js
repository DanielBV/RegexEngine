const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = [{
    entry: {
        page1: path.join(__dirname, "/src/index.js"),
        page2: path.join(__dirname, "/src/animation.js"),
    },
   output: {
    filename: "[name]/build.js",
    path: path.join(__dirname, "/docs")},
   module:{
       rules:[{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader"
       },
       {
        test: /\.css$/i,        
        use: ["style-loader", "css-loader"],      
        },
    ],
   },
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
  new webpack.DefinePlugin({
    'process.env.VERSION': JSON.stringify(require("./package.json").version)
})
   ],
   resolve: { fallback: { fs: false } },
   devtool: 'source-map'
}
];