---
title: A Cautious Beginning with React.js
layout: post
category: code
tags: react
---
My exploration of React.js has officially begun, and I’ve learned some fundamental concepts that have helped me get started. Unfortunately, there’s no one-stop-shop for this kind of thing (see [this article](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4#.vy4ccyn5m) for an explanation of the problem) so I’ve had to muck around a bit.

<style>
  pre, code {
    font-size: 1.1em;
  }
</style>

I got started by working through a couple of workshops/tutorials. The best of these has been Ryan Florence’s course on Frontend Masters, ["React (with Introduction to Flux Architecture).”](https://frontendmasters.com/courses/react/) He convinced me that having Webpack, Babel, and ES6 was the way to go for any React project. I also enjoyed Mike Sugarbaker’s O'Reilly course, ["A Practical Introduction to React.js.”](http://shop.oreilly.com/product/0636920039716.do). Having already written a little bit of code, this tutorial helped solidify some concepts for me.

Now I needed to go start my own project, even if it was just a sample one. I found a good introduction in [React Webpack cookbook](https://christianalfoni.github.io/react-webpack-cookbook/index.html). (A quick note: This project hasn’t been updated in a while, so there were some errors, but by looking through the GitHub issues, I was able to fix them.) This, then, is what I put together.

First up, the package.json. I installed the dependencies as I went, but a simple 'npm install' will do. This supplies everything necessary for doing React using JSX, built with Webpack and Babel, with Sass for the CSS engine. 

~~~
// package.json

{
  "name": "react-sample",
  "version": "1.0.0",
  "description": "A sample React app",
  "main": "index.js",
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --devtool eval --progress --colors --hot --content-base build"
},
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "babel-core": "^6.3.26",
    "babel-loader": "^6.2.0",
    "babel-preset-es2015": "^6.3.13",
    "babel-preset-react": "^6.3.13",
    "css-loader": "^0.23.1",
    "style-loader": "^0.13.0",
  },
  "dependencies": {
    "node-sass": "^3.4.2",
    "react": "^0.14.5",
    "react-dom": "^0.14.5",
    "sass-loader": "^3.1.2",
    "webpack": "^1.12.9",
    "webpack-dev-server": "^1.14.0"
  }
}
~~~

Configuring Webpack is not easy, but it doesn’t seem that much worse than Grunt or Gulp. Still, I leaned heavily on the cookbook. This configuration is set up for hot module replacement and livereload. It outputs to a file in the build folder, and uses Babel and Sass so both .jsx and .scss files will work correctly.

~~~
// webpack.config.js

var path = require('path');
var config = {
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8080',
    path.resolve(__dirname, 'app/main.jsx')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/, // A regexp to test require path. accepts .js or .jsx
      loader: 'babel', // Loaded module. "babel" is short for "babel-loader"
      exclude: /(node_modules)/,
      query: {
        presets: ['react']
      }
    },
    {
      test: /\.scss$/,
      loader: 'style!css!sass'
    }]
  }
};

module.exports = config;
~~~

We’ll also use the most basic of index.html pages. The only things to notice here is the 'app' hook on a single 'div' element, the bundled JavaScript file that Webpack will extrude, and a 'script' tag to help the development server work.

~~~
// index.html

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <div id="app"></div>

    <script src="bundle.js"></script>
    <script src="http://localhost:8080/webpack-dev-server.js"></script>
  </body>
</html>

~~~

Next comes the JavaScript, which has been broken up into two files. I don’t necessarily need this separation, but having each component get it’s own space is probably planning for the future. A couple of conventions to note: These files use the ‘import’ instead of ‘require’ syntax for loading modules. Also, I’m using the .jsx extention instead of .js, but Webpack allows either. 

~~~
// main.jsx

import React from 'react';
import Hello from './component.jsx';

function main() {
    React.render(<Hello />, document.getElementById('app'));
}

main();

// component.jsx

import React from 'react';

export default class Hello extends React.Component {
  render() {
    return <h1>Hello world</h1>;
  }
}
~~~

There it is: a fully functional React app that can use ES6, JSX, and Sass. Now comes the actual work of making an app, but at least I'll have a development environment that will let me do that with a minimum of trouble. 
