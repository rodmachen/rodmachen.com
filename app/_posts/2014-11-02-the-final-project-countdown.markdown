---
layout: post
title: The Final Project Countdown
<!-- categories: the-coding-life -->
---
I’m in the homestretch of my [MakerSquare](http://www.makersquare.com) class. We’re taking all of the front-end technologies we’ve learned and  putting them to use in self-selected final project.

From early on, redoing my web presence was a priority for me, and for this project, I’ve chosen to build a new photography portfolio site. My previous version uses Wordpress, but for this one, I wanted to move away from that platform. There’s no need for a back end of any kind, so a static site is perfect. 

I thought I might marry Foundation to Jekyll. The latter’s templating functionality could be good for adding future pages, but I ran into some initial problems with setting up those templates. Honestly, I still don’t have enough of a grasp on Jekyll to be tweaking it, so instead of use my time on that, I’m going to go with a straight Foundation site. 

The first big decision was picking a display format for the images. I never liked the lightbox plugin I used on WP, but I stumbled upon a better one recently, [Fluidbox](http://terrymun.github.io/Fluidbox/). It replicates the imagefunctionality of Medium.com. A click on any embedded image brings up a full-sized version, front and center. I thought this is what I was going to go with, but it does fit well with my portfolio which is organized in galleries. There was no way to rotate through a set of images, just one at a time. Fluidbox would be great for other pages, and I might use it for my writing site.

This recent [article](http://codegeekz.com/jquery-lightbox-plugins-beautifying-websites/) lists 20 jQuery lightbox plugins, and it was here that I found [Swipebox](http://brutaldesign.github.io/swipebox/). It’s distinguishing feature is the ability to swipe from images to image on a mobile device, but I like it because of its dead-simple interface. It blacks out the rest of the page, and the navigation arrows and caption fade away, leaving the viewer with a full-screen experience.

My extension project is to modify this plug in to offer additional functionality. I’m going to go through the code and see what I can do. This would give me a chance to test my JavaScript chops a bit. This’ll be my first time to fork a project on Github and start working under the hood. I hope to have a lot more of this in my future. 

As of now, I have my main page set up with placeholder thumbs and one gallery made. I used FitText to make my Garamond heading nice and big. It’s minimal and sleek, pushing the viewer toward the images themselves. Tomorrow I’ll go back to class for some feedback and work time. A week and a half from now I’ll be presenting. Lots of work to do until this. 