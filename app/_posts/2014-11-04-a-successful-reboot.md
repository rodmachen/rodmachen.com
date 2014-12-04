---
layout: post
title: A Successful Reboot
published: true
---

Today has been a bit of a rebound day for me. After hitting some pretty sizable bumps on the road to completing my MakerSquare final project, things are finally falling into place.

Where things stand: I have created a framework for my web presence. A main page (www.rodmachen.com) will link to a page for my writing (rodmachen.com/words), my coding/tech stuff (rodmachen.com/code), and my photography (rodmachen.com/photo). This project is focused on the later, but I realized during Monday’s class that I need a look that will tie all of them together. I’ve decided that thing is a navigation bar along the top, jet-black with menus for getting around. I’d like to find a common footer as well. Since I’m using Foundation as my base, I found a template to start off with and am working to modify it. I copied the nav bar to all of my pages and have been playing around with it quite a bit.

Bottom line: I have a placeholder main page, a working photography index, and a working gallery, complete with lightbox plugin. Not bad considering how things were looking the other day. 

Thinking back on the problems: Sunday night my project broke. I had been running a local server and viewing all of my changes that way. Making a gh-pages branch on Github was the next step. The branch itself was easy enough, but something was wrong. All of my styling and JavaScript was missing. Turns out the .gitignore file included all of Foundation’s Bower components so none of that had been uploaded. An easy enough fix, right? Fast forward a couple of commits. Only a small part of this folder had been uploaded and the rest had virtually disappeared from my local repo. I had all of the Bower folders but none of the contents.

I gave up. My instructors would rescue me, and sure enough, between Mae and Flip, we rolled back my commits to the point where it was working again. At that point I was done with gh-pages and am using Amazon S3 to host. That worked like a charm. Updating is a bit of a pain, but my site is small enough that it’s fine. I’ll get some type of deployment scheme up and running eventually, but for this project, working is working. 

Almost exactly one week from now, I’ll present my project. More that likely it’ll fall short of what I had originally intended, but because this is my real web site, I’ll continue to work on it going forward. 

The takeway for me is this: Move forward incrementally. When I got to a place where I was trying to ingest too many different technologies at once, I got overwhelmed. I need to slow down and take the time to get comfortable with something before adding something else to my plate. Right now getting better at git and Foundation is enough. There are plenty of things to keep me busy after that, to be sure.
