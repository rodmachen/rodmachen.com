---
title: 'Blogging for (Aspiring) Developers'
layout: post
published: true
category: code
tags: 
---

So you want to blog. Maybe you want to. Maybe you have to. Maybe you’ve become convinced it’s ‘what developers do.’ Regardless, there are some things to keep in mind, and some tools you should consider.

The biggest decision is the platform that you’ll use to host your blog. There are a ton of options. WordPress is the 800-pound gorilla in the industry. Ghost is an up-and-comer with beautiful layouts. For a developer, though, there’s a better answer: Jekyll.

[Jekyll](http://jekyllrb.com/) is a [static-site generator](http://www.staticgen.com/). That means it creates flat files. That means it’s very fast to serve. It also means its very cheap to serve. Something like WordPress has a much more complicated database structure that renders ever page for every view. Static sites are composed of simple HTML files, but that doesn’t mean Jekyll is simple. The cost of having something that’s easy at the end means it’s a little harder at the beginning. But not too hard for a developer! 

Start off by going to  <http://jekyllrb.com/> and follow the installation instructions. You’ll need to have Ruby installed, but that’s going to happen at some point along your developer journey anyway, so you might as well figure it out now. (Many [gems](https://rubygems.org/) await.) 

Once you have it set up, you can get as deep in the weeds as you like. Jekyll comes with [Sass](http://sass-lang.com/) built in. Your CSS will be taken up a whole notch with Sass, and every designer you meet will be impressed you know what it is.

Where Jekyll becomes non-developer unfriendly is in its approach to file creation. Posts and pages will be written using templates and markdown. Jekyll then takes all of the pieces and builds your web site. You can serve it locally, and then when you’re ready, push it to a hosting company to be served.

And here’s the real beauty of Jekyll: It is shepherded by [GitHub](http://github.com) and is the default technology behind their [GitHub Pages](https://pages.github.com/) hosting service. That means you can take advantage of your existing GitHub account and create a free blog! It gets even better. Once GitHub Pages is set up (and a web address like ‘username.github.com’ is a part of the deal) you simply push changes to GitHub, and it’s compiled automatically. 

While an everyday user won’t be interested something as ‘technical’ as Jekyll, developers that are already using GitHub have a very easy option for making a blog that’s easy to set up and easy to keep up. Don’t be fooled into thinking that because it’s free it’s lesser-than. Several top-notch developers I know (see [here](http://rmurphey.com/), [here](http://daverupert.com/), and [here](https://alexsexton.com/)) use it for their sites. (For a little more customization, check out [Octopress](), a framework for Jekyll that allows for themes and more.)

There’s still some work to be done in terms of learning the ins and out of Jekyll (make sure to check out <http://prose.io>) but compared to messing around with an MVC JavaScript framework, it’s small potatoes. And who knows? Someday you may want to build a web site that is strictly front end. Jekyll could be a great tech for that.

Get started with Jekyll, and before you know it, your blog will be out there in the world. 
