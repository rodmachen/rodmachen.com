---
title: 'Firebase + Angular'
layout: post
draft: true
category: code
tags: angular
---
I'm only just learning Angluar, but when I had to do a quick project with it, I turned to Firebase for my back end. 

[Firebase](https://www.firebase.com/) makes it easy to get set up. Simply make an account, and then create your Firebase app. You'll be given a url that will be your point of interaction.

Getting it connected to my Angular code was as easy as passing it into the module.

~~~
angular.module('app', ['firebase']);
~~~

From there, I need a little help. Firebase is easy enough to use, but the [Angularfire](https://www.firebase.com/docs/web/libraries/angular/) module makes it a snap to connect with your Angular app. Either install it or use their cdn, and then pass one of the data type into your controller. In this case, I chose an array.

~~~
.controller('MainCtrl', function($scope, $firebaseArray) {...});
~~~

Now it's just a matter of instantiating a new array inside the app. It can then be put into scope by assign it to an internal variable.

~~~
var myArray = $firebaseArray(
  new Firebase('https://crazy-name-1234.firebaseio.com/')
);
$scope.myArray = myArray;
~~~

From here, this variable allows very easy reading of data (treat it like you would any array), but it's important to use the right write methods. For instance:

~~~
$scope.myArray.$add({ status: true, count: 0});
~~~

The '$add' method will do the same thing as the native '.push' method and add this object to the end of the array.

This is just the tip of the iceberg in terms of what can be done with Firebase and Angular. Give it a try!

