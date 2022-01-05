const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    mode: 'production',
   entry: path.join(__dirname, "/src/index.js"),
   output: {
       filename: "build.js",
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
        template: './src/index.html'
      }),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({      filename: "[name].[contenthash].css",    }),
   ],
   resolve: { fallback: { fs: false } },
   devtool: 'source-map' /* This is left intentionally since it shouldn't matter too much and it allows me to debug directly in github pages :D */
}