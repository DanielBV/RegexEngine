const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
   entry: path.join(__dirname, "/src/index.js"),
   output: {
       filename: "build.js",
       path: path.join(__dirname, "/dist")},
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
      })
   ],
   resolve: { fallback: { fs: false } },
   devtool: 'source-map'
}