const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    mode: 'production',
   entry: {
       page1: path.join(__dirname, "/src/index.js"),
       page2: path.join(__dirname, "/src/animation.js"),
   },
   output: {
        filename: "[name]/build.js",
       path: path.join(__dirname, "/docs")}, //docs instead of dist for github pages
   module:{
       rules:[{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader"
       },
       {
        test: /\.css$/i,        
        use: [MiniCssExtractPlugin.loader, "css-loader"],      
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
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({      filename: "[name].[contenthash].css",    }),
      new webpack.DefinePlugin({
        'process.env.VERSION': JSON.stringify(require("./package.json").version)
    })
   ],
   resolve: { fallback: { fs: false } },
}