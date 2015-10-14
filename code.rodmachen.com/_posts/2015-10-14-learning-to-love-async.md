---
title: 'Learning to Love Async'
layout: post
category: code
tags: node
---

Work with [Node.js](https://nodejs.org/en/) is just like working with JavaScript. Until it’s not. Recently, I was building a backend for accessing and manipulating data from APIs and ran right smack into one of the biggest stumbling blocks of that world: asyncronicity.

Like everything in in software development, there’s knowing a concept and **knowing**  a concept. I knew was async was. Node is a non-blocking runtime, and allows the next command to go ahead and start if the previous one needs to wait for some reason. This is a great thing to have on the back end, as access times from a server or disk are not knowable, so the program proceeds down the queue while waiting for these asynchronous tasks to finish.

Having said I knew it, it wasn’t until faced with a real-world problem that I came to truly understand it, painful as the process might have been. Several hours and a couple of headaches later, I was more appreciative of this aspect of Node development and had a better handle on how to deal with it.

Lets start with our required modules. The *request* module will handle our calls. [Firebase](https://www.firebase.com/) is being used as a cache to hold the data, so it will eventually be pushed there. Finally, the [AlchemyAPI](http://www.alchemyapi.com/) is a very cool tech from [IBM's Watson Group](http://www.ibm.com/smarterplanet/us/en/ibmwatson/) that uses artificial intelligence to analyze text.

~~~
var request = require('request');
var AlchemyAPI = require('./alchemyapi');
var Firebase = require('firebase');
~~~

After the external services are instantiated, it's time to make the first call. [The New York Times API](http://developer.nytimes.com/) will be queried for its most popular stories of the day.

~~~
var nytReqURL = 'http://api.nytimes.com/';
var reqParams = 'svc/mostpopular/v2/mostviewed/all-sections/1?';
request(nytReqURL + reqParams + APIkey, function(error, response, body) {
  /.../
};
~~~

Inside of this call, a check is performed to make sure everything worked right, and then the body is parsed as JSON.

~~~
if (!error && response.statusCode === 200) {
  var info = JSON.parse(body);
  /.../
}
~~~

Here's where it gets tricky: I want to capture the url from each of the top news stories and feed those to the AlchemyAPI service. The results need to be limited to the top five most popular stories, so I'll use iteration to pass on only those stories.

~~~
for (var i = 0; i < 5; i++) {
  // set the url to be passed in
  var nytUrl = info.results[num].url;
  // query the AlchemyAPI for keywords, passing in type, url, and data param
  alchemyapi.keywords('url', nytUrl, {sentiment: 1}, function(response) {
    // send data to Firebase, using iteration index as a heading
    firebase.child(num).set(response);
  };
}
~~~

This should work (in a syncronous world). For each article, the url is sent to the API along with the required parameters. The resulting data is then sent to the Firebase cache.

But this won't work. It won't work at all. Why?

Async.

The loop doesn't stop and wait for each API call to execture, and why should it? It's the honeybadger of this scenario, and thus we end up with only the last url sent to the API. That won't work. 

The solution is to make the loop *slow down*. The best way I found to do with was with an IIFE, or immediately-invoked function expression. Let's refactor.

~~~
for (var i = 0; i < 5; i++) {
  var nytUrl = info.results[num].url;
  // the api call is now wrapped in an IIFE, which is passed an iteration index
  (function(num) {
    alchemyapi.keywords('url', nytUrl, {sentiment: 1}, function(response) {
      firebase.child(title).child(num).set(response);
    });
  })(i);
}
~~~

See, it's just that easy? Actually, no. No, it's not easy at all. Asyncronous code requires a different way of approaching the execution of one's program. In addition to getting used to having callbacks handle most of the work (which happens all over this code), Node also requires async to be part of getting code to run. With enough experience, writing this way will be second nature, but for now I have to make the code *slow down*.

Full code below:

~~~
var request = require('request');
var AlchemyAPI = require('./alchemyapi');
var Firebase = require('firebase');

// ...instantiate AlchemyAPI and Firebase...

var nytReqURL = 'http://api.nytimes.com/'
var reqParams = 'svc/mostpopular/v2/mostviewed/all-sections/1?'
request(nytReqURL + reqParams + APIkey, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    var info = JSON.parse(body);
    for (var i = 0; i < 5; i++) {
      var nytUrl = info.results[num].url;
      (function(num) {
        alchemyapi.keywords('url', nytUrl, {sentiment: 1}, function(response) {
          firebase.child(title).child(num).set(response);
        });
      })(i);
    }
  }
};
~~~
