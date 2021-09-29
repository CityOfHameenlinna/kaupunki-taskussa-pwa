const { InjectManifest } = require("workbox-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const dotenv = require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
// webpackplugin creates index.html file for us
const HtmlWebpackPlugin = require("html-webpack-plugin");
var HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/js/index.js",
  output: {
    path: path.join(__dirname, "/build"),
    filename: "index_bundle.js",
  },
  // dev server configuration
  devServer: {
    contentBase: path.join(__dirname, "build"),
    compress: true,
    port: 9000,
    open: true,
    hot: true,
  },
  module: {
    rules: [
      {
        // Look js files
        test: /\.js$/,
        //Ignore node_modules
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|ttf|ttc|woff|woff2)$/i,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new InjectManifest({
    //     swSrc: './service-worker.js',
    //   }),
    new HtmlWebpackPlugin({
      //favicon
      favicon: "public/favicon.png",
      title: "Kaupunki taskussa",
      template: "./public/index.html",
      meta: {
        viewport: "width=device-width, initial-scale=1",
        // Will generate: <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        "theme-color": "#0a2e59",
        // Will generate: <meta name="theme-color" content="#4285f4">
      },
    }),
    // new WorkboxPlugin.GenerateSW({
    //     clientsClaim:true,
    //     skipWaiting:true
    // }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/img", to: "images" },
        { from: "./public/manifest.json", to: "manifest.json" },
        { from: "./.env", to: ".env" },
      ],
    }),
    //Add link rel="stylesheet" tags-> for generated Index.html file
    new HtmlWebpackTagsPlugin({
      append: false,
      links: "https://fonts.googleapis.com/icon?family=Material+Icons",
    }),
    new HtmlWebpackTagsPlugin({
      append: false,
      links:
        "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-alpha.3/css/materialize.min.css",
    }),
    new HtmlWebpackTagsPlugin({
      append: false,
      links: "https://use.typekit.net/evv0alu.css",
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.parsed),
    }),
    new InjectManifest({
      swSrc: "./service-worker.js",
    }),
  ],
};
