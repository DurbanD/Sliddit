# Sliddit

#### Full-screen Reddit

Script to browse your current Reddit session as a slideshow. Minimal UI, use arrow keys or mouse to navigate. 

### Overview & Features
Sliddit fundamentally changes the browsing experience for Reddit.com to a one-link per page semi-full-screen card-like version. Navigation can be easily accomplished with the arrow keys or the mouse. Easily filter out the results by content type by clicking the wheel in the top left. Navigate with the keyboard or mouse. 

#### Interactivity:
###### Keyboard Shortcuts:
* Right Arrow (Click or Button Press) - Next Page
* Left Arrow (Click or Button Press) - Previous Page
* Up Arrow (Click or Button Press) - Like Post
* Down Arrow (Click or Button Press) - Dislike Post
* Escape (Button Press) or X (Click) - Exit Sliddit
* Posted By (click) - Opens /u/[Posted By] in Sliddit
* Comments (click) - Opens Comments in Reddit
* Domain (Click) - Opens link URL
* Content (Click) - Opens link URL
* Subreddit (Click) - Opens SubReddit in Sliddit

Operated by pulling a library of links from the Reddit JSON API from the current user's client, then generating a card per link based while tracking the current position. 

### Link Domains
Sliddit supports the following Domains. Any other domains, or any link that throws an error loading the content, will instead load the link's thumbnail with an error message.

* i.imgur.com
* i.redd.it
* gfycat.com
* self.reddit
* .gifv urls
* Some Embedded video sites
* Or any direct link to a common image or video file

### Installation & Requirements:
Currently you must use [Reddit Enhancement Suite](https://github.com/honestbleeps/Reddit-Enhancement-Suite) for the "Browse Fullscreen" tab to appear correctly.
First, install [Tampermonkey](https://www.tampermonkey.net/) then use the script at https://greasyfork.org/en/scripts/391366-sliddit


WIP
