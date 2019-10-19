// ==UserScript==
// @name         Sliddit
// @namespace    http://www.github.com/DurbanD/Sliddit/
// @version      0.1
// @description  Full-Screen Slideshow browsing for Reddit
// @author       Durban
// @match        https://www.reddit.com/*
// @match        http://www.reddit.com/*
// @grant        none
// ==/UserScript==

class SlideShow {
  constructor(links={}, counter=0) {
    this.links = links;
    this.counter = counter;
    this.fetchJsonDefaultString = './.json?limit=100';
    this.lastLink = {}; 
    this.getMoreLinks(this.links).then(()=>this.updateUI(this.links, this.counter)).then(()=>this.createKeyDownListeners()).then(()=>this.getManyMoreLinks(5));
  }

  async getMoreLinks(linksPrimary) {
    if (this.lastLink.data == undefined) {
      let links = fetch(this.fetchJsonDefaultString).then((response) => response.json()).then((result) => links = result.data.children);
      this.links = await links;
      this.lastLink = this.getLastAvailableLink();
      this.currentLink = this.getCurrentLink();
      return links;
    }
    let extraLinks = fetch(this.fetchJsonDefaultString + `&after=${this.lastLink.data.name}`).then((response) => response.json()).then((result) => extraLinks = result.data.children);
    await extraLinks;
    this.lastLink = this.getLastAvailableLink();
    this.links = linksPrimary.concat(extraLinks);
    return this.links;
  }

  async getManyMoreLinks(desiredCallCount) {
    for (let i = 0; i < desiredCallCount; i++) {
      await this.getMoreLinks(this.links);
    }
    return this.links;
  }

  getLastAvailableLink() {
    return this.links[this.links.length-1];
  }

  getCurrentLink() {
    return this.links[this.counter];
  }

  nextLink() {
    this.counter++;
    if ((this.counter+1)/this.links.length >= 0.8) {
      this.getMoreLinks(this.links).then(()=> this.currentLink = this.getCurrentLink());
    }
    this.updateUI(this.links, this.counter);
  }

  previousLink() {
    this.counter--;
    if (this.counter == 0) {
      console.log('You are at the beginning.');
      this.counter = 0;
      this.updateUI(this.links, this.counter);
    } else {
      this.updateUI(this.links, this.counter);
    }
  }

  createKeyDownListeners() {
    document.body.addEventListener('keydown', (event) => {
      if (event.keyCode == 39) {
        event.preventDefault();
        // window.setTimeout(this.nextLink(),1000);
        this.nextLink();
      }
      if (event.keyCode == 37) {
        event.preventDefault();
        this.previousLink();
      }
    });
  }

  updateUI(links,counter) {
    this.lastLink = this.getLastAvailableLink();
    this.currentLink = this.getCurrentLink();
    return new SlideShowUI(links, counter).generateUI();
  }


  exitSlideShow() {
    let previousLinkName;
    let url;
    if (this.counter > 0 && this.links[0] != undefined) {
      previousLinkName = this.links[this.counter-1].data.name
      url = `./?limit=100&after=${previousLinkName}&count=${this.counter+1}`;
      window.location = url;
      return url;
    }
    url = `./?limit=100`;
    window.location = url;
    return url;
  }

}







class SlideShowUI {
  constructor(links, counter) {
    this.links = links;
    this.counter = counter;
    this.mainLink = this.links[this.counter];
    this.lastLink = this.links[this.links.length-1];
    this.firstLink = this.links[0];
  }

  createBackground() {
    let fullScreenBackground = document.createElement('div');
    fullScreenBackground.style.position = 'absolute';
    fullScreenBackground.style.left = '0';
    fullScreenBackground.style.top = '0';
    fullScreenBackground.style.boxSizing = 'border-box';
    fullScreenBackground.style.zIndex = '99';
    fullScreenBackground.style.background = '#111';
    fullScreenBackground.style.width = '100vw';
    fullScreenBackground.style.height = '100vh';
    fullScreenBackground.style.overflow = 'hidden';
    fullScreenBackground.style.padding = '2rem';
    fullScreenBackground.id = 'slideShowBG';
    document.body.appendChild(fullScreenBackground);
  };

  createExitButton() {
    let exitButtonDiv = document.createElement('div');
    let slideBG = document.querySelector('#slideShowBG');
    exitButtonDiv.id = 'ssExit';
    exitButtonDiv.style.position = 'absolute';
    exitButtonDiv.style.top = '5px';
    exitButtonDiv.style.right = '5px';
    exitButtonDiv.style.height = '1.5rem';
    exitButtonDiv.style.width = '1.5rem';
    exitButtonDiv.style.border = '1px solid rgba(150,150,175,0.3)';
    exitButtonDiv.innerText = 'X';
    exitButtonDiv.style.color = 'rgba(150,150,175,0.9)';
    exitButtonDiv.style.alignItems = 'center';
    exitButtonDiv.style.textAlign = 'center';
    exitButtonDiv.style.paddingTop = '6px';

    exitButtonDiv.onmouseover = function() {
      exitButtonDiv.style.cursor = 'pointer';
    }

    return slideBG.appendChild(exitButtonDiv);
  }

  updateExitButtonListener(links, counter) {
    let exitButtonDiv = document.querySelector('#ssExit');
    exitButtonDiv.onclick = function() {
      return new SlideShow(links, counter).exitSlideShow();
    };
  }

  createContentContainer() {
    let linkMainDiv = document.createElement('div');
    let slideBG = document.querySelector('#slideShowBG');
    linkMainDiv.id = "linkMainDiv";
    linkMainDiv.style.margin = '1rem auto';
    linkMainDiv.style.width = '95%';
    linkMainDiv.style.maxHeight = '95%';
    linkMainDiv.style.maxWidth = '1600px';
    linkMainDiv.style.zIndex = '100';
    linkMainDiv.style.padding = '1rem';
    linkMainDiv.style.boxSizing = 'border-box';
    linkMainDiv.style.textAlign = 'center';
    linkMainDiv.style.border = '1px dotted black';
    linkMainDiv.style.boxShadow = '2px 2px 15px 5px #777, -2px -2px 15px 5px #777';
    linkMainDiv.style.borderRadius = '5px';
    linkMainDiv.style.display = 'flex';
    linkMainDiv.style.flexFlow = 'column';
    linkMainDiv.style.alignContent = 'center';
    linkMainDiv.style.alignItems = 'center';
    linkMainDiv.style.justifyContent = 'center';
    linkMainDiv.style.background = 'rgba(225,225,255,0.05)';
    slideBG.appendChild(linkMainDiv);
  }

  createHead(link) {
    let linkHead = document.createElement('h3');
    let linkMainDiv = document.querySelector('#linkMainDiv');
    linkHead.innerText = link.data.title;
    linkHead.style.fontSize = '1rem';
    linkHead.style.lineHeight = '1rem';
    linkHead.style.textAlign = 'center';
    linkHead.style.width = '95%';
    linkHead.style.margin = 'auto';
    linkHead.style.padding = '5px';
    linkHead.style.marginBottom = '1.5rem';
    linkHead.id = 'linkHead';
    linkHead.style.color = '#CCF';
    linkHead.onclick = function() {
      window.open('.'+link.data.permalink);
    }
    linkHead.onmouseover = function() {
      linkHead.style.cursor = 'pointer';
    }
    linkMainDiv.appendChild(linkHead);
  }

  createContent(link) {
    let linkMainDiv = document.querySelector('#linkMainDiv');

    if (/\.jpg$/.test(link.data.url) || /\.jpeg$/.test(link.data.url) || 
    /\.png$/.test(link.data.url) || /\.bmp$/.test(link.data.url) || 
    /\.tiff$/.test(link.data.url) || /\.gif$/.test(link.data.url)) {
      let linkImg = document.createElement('IMG');
      linkImg.src = link.data.url;
      linkImg.id = 'ssImg';
      linkImg.style.maxHeight = '100%';
      linkImg.style.maxWidth = '100%';
      linkImg.style.margin = 'auto';
      linkImg.style.border = '1px solid black';
      linkImg.onclick = function() {
        window.open(linkImg.src);
      }
      linkImg.onmouseover = function() {
        linkImg.style.cursor = 'pointer';
      }
      linkMainDiv.appendChild(linkImg);
      return linkImg;
    }

    if (/\.webm$/.test(link.data.url) || /\.gifv$/.test(link.data.url) || 
    /\.mp4$/.test(link.data.url) || /\.flv$/.test(link.data.url) || 
    /\.mkv$/.test(link.data.url) || /\.avi$/.test(link.data.url) || 
    /\.mpeg$/.test(link.data.url) || /\.mov$/.test(link.data.url)) {
      let linkVid = document.createElement('video');
      linkVid.id = 'ssVid';
      linkVid.style.maxHeight = '100%';
      linkVid.style.maxWidth = '100%';
      linkVid.autoplay = true;
      linkVid.controls = true;
      linkVid.loop = true;
      linkVid.muted = false;

      let vidSourceWebm = document.createElement('source');
      vidSourceWebm.src = link.data.url;
      vidSourceWebm.type = 'video/webm';
      let vidSourceMp4 = document.createElement('source');
      vidSourceMp4.src = link.data.url;
      vidSourceMp4.type = 'video/mp4';
      linkVid.appendChild(vidSourceMp4);
      linkVid.appendChild(vidSourceWebm);
      linkMainDiv.appendChild(linkVid);
      return linkVid;
    }

    if (link.data.domain == "i.imgur.com" || link.data.domain == 'i.redd.it') {
      let linkImg = document.createElement('IMG');
      linkImg.src = link.data.url;
      linkImg.id = 'ssImg';
      linkImg.style.maxHeight = '100%';
      linkImg.style.maxWidth = '100%';
      linkImg.style.margin = 'auto';
      linkImg.style.border = '1px solid black';
      linkImg.onclick = function() {
        window.open(linkImg.src);
      }
      linkImg.onmouseover = function() {
        linkImg.style.cursor = 'pointer';
      }
      linkMainDiv.appendChild(linkImg);
      return linkImg;
    }
    if (link.data.domain == "imgur.com") {
      let linkImg = document.createElement('IMG');
      linkImg.src = link.data.url + '.jpg';
      linkImg.id = 'ssImg';
      linkImg.style.maxHeight = '100%';
      linkImg.style.maxWidth = '100%';
      linkImg.style.margin = 'auto';
      linkImg.style.border = '1px solid black';
      linkImg.onclick = function() {
        window.open(linkImg.src);
      }
      linkImg.onmouseover = function() {
        linkImg.style.cursor = 'pointer';
      }
      linkMainDiv.appendChild(linkImg);
      return linkImg;
    }

    //Video//

    if (link.data.domain == "gfycat.com") {
      let linkVid = document.createElement('video');
      linkVid.id = 'ssVid';
      linkVid.style.maxHeight = '100%';
      linkVid.style.maxWidth = '100%';
      linkVid.autoplay = true;
      linkVid.controls = true;
      linkVid.loop = true;
      linkVid.muted = false;

      let gfyGiantBase = 'https://giant.gfycat.com';
      let gfyThumbBase = 'https://thumbs.gfycat.com';
      let linkSource;
      if (link.data.secure_media != null && /\/\w+(?:-)/.test(link.data.secure_media.oembed.thumbnail_url) == true) {
        linkSource = link.data.secure_media.oembed.thumbnail_url.match(/\/\w+(?:-)/).join().replace('-','');
      } else if (link.data.secure_media == null && /\/\w+(?:-)/.test(link.data.crosspost_parent_list[0].secure_media.oembed.thumbnail_url) == true){
        linkSource = link.data.crosspost_parent_list[0].secure_media.oembed.thumbnail_url.match(/\/\w+(?:-)/).join().replace('-',''); 
      } else {
        linkSource = link.data.url;
      }

      let vidSourceMobile = document.createElement('source');
      vidSourceMobile.src = gfyThumbBase + linkSource + '-mobile.mp4';
      vidSourceMobile.type = 'video/mp4';
      let vidSourceWebm = document.createElement('source');
      vidSourceWebm.src = gfyGiantBase + linkSource + '.webm';
      vidSourceWebm.type = 'video/webm';
      let vidSourceMP4 = document.createElement('source');
      vidSourceMP4.src = gfyGiantBase + linkSource + '.mp4';
      vidSourceMP4.type = 'video/mp4';
      let vidSourceMP4Mobile = document.createElement('source');
      vidSourceMP4Mobile.src = gfyGiantBase + linkSource + '-mobile.mp4';
      vidSourceMP4Mobile.type = 'video/mp4';
      linkVid.appendChild(vidSourceMobile);
      linkVid.appendChild(vidSourceWebm);
      linkVid.appendChild(vidSourceMP4);
      linkVid.appendChild(vidSourceMP4Mobile);
      linkMainDiv.appendChild(linkVid);
      return linkVid;
    }

    //Text//

    if (/^self\./.test(link.data.domain)) {
      let selfPostParagraph = document.createElement('p');
      if (link.data.selftext.length > 0) {
        selfPostParagraph.innerText = link.data.selftext;
        selfPostParagraph.style.textAlign = 'center';
        selfPostParagraph.style.fontSize = '0.85rem';
        selfPostParagraph.style.maxWidth = '80%';
        selfPostParagraph.style.maxHeight = '90%';
        selfPostParagraph.style.overflowY = 'auto';
        selfPostParagraph.style.border = '1px solid rgba(200,200,200,0.3)';
        selfPostParagraph.style.borderRadius = '5px';
        selfPostParagraph.style.padding = '0.5rem';
        linkMainDiv.appendChild(selfPostParagraph);
      }
      return selfPostParagraph;
    }
    this.contentLoadErrorParagraph(link);

    
  }

  contentLoadErrorParagraph(link) {
    let textLink = document.createElement('span');
    let sorryParagraph = document.createElement('p');
    let sorryText = `Unable to load content.`;
    textLink.style.color = '#AAF';
    textLink.innerText = ` Click here to view`;
    textLink.onclick = function() {
      window.open('.'+link.data.permalink);
    }
    textLink.onmouseover = function() {
      textLink.style.cursor = 'pointer';
      textLink.style.color = '#EFF';
    }
    textLink.onmouseout = function() {
      textLink.style.color = '#AAF';
    }


    sorryParagraph.innerText = sorryText;
    sorryParagraph.style.padding = '2px';
    linkMainDiv.appendChild(sorryParagraph);
    sorryParagraph.appendChild(textLink);
  }

  hideAllBodyNodes() {
    for (let node of document.body.childNodes) {
      try {
        node.style.display = 'none';
      } catch(error) {
        continue;
      }
    }
  }

  showAllBodyNodes() {
    for (let node of document.body.childNodes) {
      try {
        node.style.display = 'initial';
      } catch(error) {
        continue;
      }
    }
  }

  deconstructSlideShowUi() {
    let ssBG = document.querySelector('#slideShowBG');
    ssBG.parentElement.removeChild(ssBG);
  }

  destroyContainerContents() {
    let linkMain = document.querySelector('#linkMainDiv');
    while (linkMain.hasChildNodes()) {
      linkMain.removeChild(linkMain.lastChild);
    }
  }

  generateUI() {

    if (!document.querySelector('#slideShowBG')) {
      this.hideAllBodyNodes();
      this.createBackground();
      this.createExitButton();
    }
    if (!document.querySelector('#linkMainDiv')) {
      this.createContentContainer();
    }

    this.destroyContainerContents();
    this.createHead(this.mainLink); 
    this.createContent(this.mainLink);
    this.updateExitButtonListener(this.links, this.counter);
  }
}

const createSlideShowTab = function() {
  let tabs = document.querySelector('ul.tabmenu');
  let newTab = document.createElement('li');
  newTab.innerHTML = '<p>Browse Fullscreen</p>';
  newTab.classList = tabs.lastChild.classList;
  newTab.style.color = '#8cb3d9';
  newTab.style.background = '#262626';
  newTab.style.padding = '2px 6px 0px 6px';
  newTab.onmouseover = function() {
    newTab.style.cursor = 'pointer';
  }
  newTab.onclick = function() {
    if(/count=\d+/.test(document.URL) == true) {
      let countUrlMethod = document.URL.match(/count=\d+/).join();
      let countNumber = countUrlMethod.match(/\d+$/).join();
      let SS_Main = new SlideShow({},parseInt(countNumber-1));
      return SS_Main;
    }
    let Slide = new SlideShow();
    return Slide;
  }
  tabs.appendChild(newTab);
}

//window.addEventListener('load', createSlideShowTab());
// createSlideShowTab();

let Slide = new SlideShow()