---
title: Solo Project Lessons Learned
layout: post
category: code
tags: angular
---
Recently, I was tasked with building a piece of software by myself. The bottom line was simple: “Make something. Make anything.”

With such a broad mandate, I went to the tech. After getting a little exposure to the AngularJS framework, I thought this would be a good chance to get more experience with it.

The concept was simple. I wanted a form to feed a table, and idealy for the data to persist. For the content, I chose a football roster. Name, number, position. Off I went.

The Angular part wasn’t bad. Again, I had used it before, and once I got used to its use of descriptors mixed into the HTML, it was pretty easy to have each form field populate a column.

At that point, I had built something, so the minimum requirements had been met. Now time to extend. For data persistance, I didn’t want to do something as involved as a server with a database. I had heard that Firebase was a popular option for Angular devs, so I was planning to use that. However, after talking with some more experienced devs, I came up with a smaller extension: local storage.

Now, local storage would not allow the data to be shared between computers, but it would allow a user to make their own roster and come back to it later. Using Angular, local storage was fairly easy to set up. I even put in some dummy data so the table would be populated with a couple of players on page load. 

The Firebase implementation deserves its own blog post. (Update: Find it [here](http://code.rodmachen.com/firebase-plus-angular/).) Suffice it to say, that the ease of use and ready availability for developers is great thing. If I need a simple back end in the future, I won’t hesistat to go with a Firebase or another “back end as a service."

The biggest thing I learned by coding this project was scaffolding. At each point along the way, I implemented the minimum features that would make a working app. I then added new features step by step. This allowed me to move forward, even with a time constraint, knowing I had something I could present. 

Of course, if this was a project meant for anything more than my own personal learning, there would be a lot left to do. Right now, I’m not checking the data at all, either its type or whether there’s data at all. It’s also being shared by everyone that logs in. I’d need user accounts to make this truly functional. 

To see this project, please visit [Roster Builder](http://rodmachen.com/roster-builder/)