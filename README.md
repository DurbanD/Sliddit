# Sliddit

#### Full-screen Reddit

Script to browse your current Reddit session as a slideshow. Minimal UI, use arrow keys or mouse to navigate. 

### Overview & Features
Sliddit fundamentally changes the browsing experience for Reddit.com to a one-link per page semi-full-screen card-like version. Navigation can be easily accomplished with the arrow keys or the mouse.

#### Interactivity
* Right Arrow (Click or Button Press) - Next Page
* Left Arrow (Click or Button Press) - Previous Page
* Escape (Button Press) or X (Click) - Exit Sliddit
* Posted By (click) - Opens /u/[Posted By]
* Comments (click) - Opens Comments
* Domain (Click) - Opens link URL
* Content (Click) - Opens link URL
* Subreddit (Click) - Opens SubReddit

Operated by pulling a library of links from the Reddit JSON API from the current user's client, then generating a card per link based while tracking the current position. 

### Link Domains
Sliddit supports the following Domains. Any other domains, or any link that throws an error loading the content, will instead load the link's thumbnail with an error message.

* i.imgur.com
* i.redd.it
* gfycat.com
* self.reddit
* Or any direct link to a common image or video file

### Installation & Requirements:
Currently you must use [Reddit Enhancement Suite](https://github.com/honestbleeps/Reddit-Enhancement-Suite) for the "Browse Fullscreen" tab to appear correctly.
First, install [Tampermonkey](https://www.tampermonkey.net/) then use the script at https://greasyfork.org/en/scripts/391366-sliddit


WIP
