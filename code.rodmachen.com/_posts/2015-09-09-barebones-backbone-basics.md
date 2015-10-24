---
title: Barebones Backbone Basics
layout: post
published: false
category: code
tags: 
---

In this age of powerful and ubiquitous MVC frameworks, Backbone has staked out a place as the minimalist option for building web apps. On the continuum between highly-opinionated and do-it-yourself, Backbone most definitely falls on the latter side. Its continued relevance speaks to the need for just such an option.

Backbone was the first JavaScript framework I learned, and beginners of all kinds would benefit from doing the same. This short introduction will lay out the structure and key pieces of a basic Backbone app.

The first step is to install Backbone and its dependencies, jQuery and Underscore. Each of these can be downloaded and added to our project, placing them at the bottom of the html's body element in the proper order. Installation via NPM or Bower would work, too. An app.js file along with a starting div would be nice, too.

~~~
<body>
  <div class="main"></div>
  <script src="jquery.js"></script>
  <script src="underscore.js"></script>
  <script src="backbone.js"></script>
  <script src="app.js"></script>
</body>
~~~

It's certainly possible include multiple JavaScript files for the different part of the application, but for this project we'll put it all in app.js. The first step is setting up a model. This is the part of the app considered with our data, not how it is used on the page. The syntax requires extending from Backbone's code, passing in an object. For this exercise, we'll imagine creating a team roster, and due to author's perogotive, we'll use my favorite team.

~~~ 
var Player = Backbone.Model.extend({
  defaults: {
    sport: 'football',
  },
});
~~~

In this case we passed in a default property, but we could have left that out entirely. Notice that capitalization of our model. This indicates we'll be using pseudoclassical instantiation when the time comes. That would look something like this:

~~~ 
var player = new Player();
~~~ 

Of course we might want to create a player with some properties on it. We can do this by passing in an object, much like we did earlier.

~~~ 
var player1 = new Player({
  number: 1,
  name: 'Kyler Murray',
  position: 'QB',
  height: '5-11',
  weight: 188,
});
~~~ 

Now we have a single, specific player for our roster, but that's not going to do us a whole lot of good considering there are over one hundred players on a college football team. At this point, we need to think about making a collection, or grouping of models. The process is the same, except each collection needs a model work with.

~~~ 
var Players = Backbone.Collection.extend({model: Player});
~~~ 

Now we can keep all of our player models together in a collection. There are a couple of ways to add specific players to it. During instantiation, an array of objects could be passed in, each one defining a new player just like we did with 'player1' above. Once the collection is created, we could simply add them using Backbone's 'add' method. Here we'll make a new collection with two new players, then add our existing player. 

~~~ 
var players = new Players([
  {
    number: 2,
    name: 'Speedy Noil',
    position: 'WR',
    height: '5-11',
    weight: 192,
  },
  {
    number: 3,
    name: 'Christian Kirk',
    position: 'WR',
    height: '5-11',
    weight: 200,
  }
]);

players.add(player1);
~~~ 

Now that we have some models and a collection to work with, we'll move on to views, the part of our app that deals with presenting our models on the page. Let's start with a model view, since each of our model will need a way to be shown in our app.

~~~ 
var PlayerView = Backbone.View.extend({
  tagName: 'li',

  template: _.template($('.playerTemplate').html()),

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
});
~~~ 

Several things to note here. We've assigned a tag property to give the view a default html element type. If we're going to make our players into a list, it makes sense that each player will be a list item.

We're not going to get into templating much here, but it's possible to use Underscore's basic template functionality to help present our views. 

The most important part of this view is the render method which will take our model's data and use it to create the DOM element we'll use later. 

Now, we'll create a specific view for a specific player.

~~~ 
var player1View = new PlayerView({model: player1});
~~~ 

This new view works fine, but since we have a collection already, it's a little pointless. We can capture this and all of the players inside of a collection view.

~~~ 
var PlayersView = Backbone.View.extend({
  tag: 'ul',

  render: function() {
    this.collection.each(function(person) {
      var personView = new PersonView({model: person});
      this.$el.append(personView.render().el);
    }, this);

    return this;
  },
});
~~~ 

This view looks very similar to the previous one, except it accounts for the fact that it is working with a collection instead of a single model. The tag is now an unordered list, and the render function actually uses the single view for constructing said list. The end result is larger DOM element that contains all of the smaller views with in it.

This code shows an important distinction between models and views. While models have a prescribed structure called a collection to hold them, views are just views. There's no such thing as a 'collection view', per se. Any view that's going to connect to a collection still needs the same properties. The change happens when we instantiate it.

~~~ 
var playersView = Backbone.View.extend({collection: players});
~~~ 

Here, we've passed in our collection, and now this view will be responsible for presenting the group of models on our page.

~~~ 

~~~ 










