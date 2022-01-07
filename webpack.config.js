const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
   entry: path.join(__dirname, "/src/index.js"),
   output: {
       filename: "build.js",
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
        template: './src/index.html'
      }),
      new webpack.DefinePlugin({
        'process.env.VERSION': JSON.stringify(require("./package.json").version)
    })
   ],
   resolve: { fallback: { fs: false } },
   devtool: 'source-map'
}