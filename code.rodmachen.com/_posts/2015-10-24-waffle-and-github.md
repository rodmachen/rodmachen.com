---
title: Waffle.io & GitHub for Fun and Profit!
layout: post
category: code
tags: 
---

Working on a coding project with a group has lots of challenges. Luckily there are tools to make it easy to get things done while keeping the chaos to a minimum.

Any time multiple people are working with the same codebase, source control is a must, and at this point in time, [Git](https://git-scm.com/) is best-in-class. Harnessing the power of Git is [GitHub](https://github.com/), the most widely-used source control platform on the planet. Much as been written about this technology (including this great book, free to read [here](https://git-scm.com/book/en/v2)), so I won't belabor the point.

Part of the GitHub platform is the ability to create issues. This allows team members to break down the work into manageable chunks. These can then be assigned to someone, given different properties based on factors like difficulty and priority, and finally closed once the code related to them has been merged into the master branch of the project. 

That's where [Waffle.io](https://waffle.io/) comes in. As depicted below, a Waffle board creates a graphical and intuitive interface to the issues for a GitHub repository. Any issue created on GitHub will be shown here, and visa versa.

![](https://waffle.io/resources/images/waffle_board.jpg)

*(A sample waffle from the official site, complete with silliness.)*

The default board comes with four columns: Backlog, Ready, In Progress, and Done. These match up well with the different phases of work on a project, but additional columns can be created if need be. Every newly created issue starts off in Backlog. Once an issue is at the point of being worked on, it can be moved to Ready, the on-deck circle of the Waffle, or if a team member is ready to get started on it, the issue could be placed directly In Progress. 

Each issue has several attributes that can be set on it. The most immediately useful of these is the ability to assign an issue to a specific person. This can be done by any member of the group, so it's great for assigning tasks as well as grabbing one yourself. Its then a simple matter to look at the In Progress column to see what everyone is currently working on.

Waffle.io also allows tags to be used on each issue. Several are already included, such as 'bug' and 'question'. Custom tags can also be made. It is then easy to see basic information about an issue just by glancing at it. There is also a size attribute that sits right next to the team member's avatar. This can be used to show the time estimated to finish the task, or the difficulty of doing so. 

Finally, Waffle.io is responsive to the natural flow of merging pull requests within GitHub. When an issue is attached to a pull request using the issue number, it is automatically closed when the merge is completed. The issue will now reside in the Done column and the next task can begin. 

There is much more than can be done with Waffle.io, but even with a simple implementation, its power and easy of use is apparent. 
