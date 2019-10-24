// ==UserScript==
// @name         Sliddit
// @namespace    http://www.github.com/DurbanD/Sliddit/
// @version      0.4
// @description  Full-Screen Slideshow browsing for Reddit
// @author       Durban
// @match        https://www.reddit.com/*
// @match        http://www.reddit.com/*
// @match        http://old.reddit.com/*
// @match        https://old.reddit.com/*
// @grant        none
// ==/UserScript==

class SlideShow {
  constructor(links={}, counter=0) {
    this.links = links;
    this.counter = counter;
    this.fetchJsonDefaultString = './.json?limit=100';
    this.lastLink = {};
    if (parseInt(counter) >= parseInt(Object.keys(links).length)-50) {
      this.getMoreLinks(this.links).then(()=>this.updateUI(this.links, this.counter)).then(()=>this.createKeyDownListeners()).then(()=>this.getManyMoreLinks(2));
    }
    else {
      this.createKeyDownListeners();
    }
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
    if ((this.counter+1)/this.links.length >= 0.5) {
      this.getMoreLinks(this.links).then(()=> this.currentLink = this.getCurrentLink());
    }
    this.updateUI(this.links, this.counter);
  }

  previousLink() {
    this.counter--;
    if (this.counter < 0) {
      console.log('You are at the beginning.');
      this.counter = 0;
      this.updateUI(this.links, this.counter);
    } else {
      this.updateUI(this.links, this.counter);
    }
  }

  createKeyDownListeners() {
    let keyHandler = () => {
      if (event.code == 'ArrowRight') {
        event.preventDefault();
        this.nextLink();
      }
      if (event.code == 'ArrowLeft') {
        event.preventDefault();
        this.previousLink();
      }
      if (event.code == 'Escape') {
        event.preventDefault();
        this.exitSlideShow();
      }
      if (event.code == 'Enter') {
        event.preventDefault();
        window.open('.'+ this.currentLink.data.permalink);
      }
    };
    return document.body.addEventListener('keydown', keyHandler);
  }

  createNavigationListeners() {
    let ssNext = document.getElementById('ssNextButton');
    let ssPrevious = document.getElementById('ssPreviousButton');
    let ssExit = document.getElementById('ssExit');
    let nextLinkListenerFunction = () => {
      this.nextLink();
    };
    let previousLinkListenerFunction = () => {
      this.previousLink();
    };
    if (ssNext && ssPrevious) {
      ssNext.addEventListener('click', nextLinkListenerFunction);
      ssPrevious.addEventListener('click', previousLinkListenerFunction);
    }
    ssExit.addEventListener('click', () => {
      this.exitSlideShow();
    })
  }

  updateUI(links,counter) {
    this.lastLink = this.getLastAvailableLink();
    this.currentLink = this.getCurrentLink();
    let updatedSlideUI = new SlideShowUI(links, counter);
    updatedSlideUI.generateUI();
    this.createNavigationListeners();
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

//
/////
/////////
/////////////
////////////////////
////////////
/////////
/////
//

class SlideShowUI {
  constructor(links, counter) {
    this.links = links;
    this.counter = counter;
    this.mainLink = this.links[this.counter];
    this.lastLink = this.links[this.links.length-1];
    this.firstLink = this.links[0];
  }

  createBackground() {
    document.body.style.lineHeight = '1rem';
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
    fullScreenBackground.style.padding = '1rem';
    fullScreenBackground.style.display = 'flex';
    fullScreenBackground.style.justifyContent = 'center';
    fullScreenBackground.style.alignContent = 'flex-start';
    fullScreenBackground.style.alignItems = 'flex-start';
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

  createContentContainer() {
    let linkMainDiv = document.createElement('div');
    let slideBG = document.querySelector('#slideShowBG');
    linkMainDiv.id = "linkMainDiv";
    linkMainDiv.style.width = '95vw';
    linkMainDiv.style.minHeight = '200px';
    linkMainDiv.style.maxHeight = '95vh';
    linkMainDiv.style.maxWidth = '1600px';
    linkMainDiv.style.zIndex = '100';
    linkMainDiv.style.padding = '1rem';
    linkMainDiv.style.boxSizing = 'border-box';
    linkMainDiv.style.textAlign = 'center';
    linkMainDiv.style.border = '1px dotted black';
    linkMainDiv.style.boxShadow = '2px 2px 10px 5px #777, -2px -2px 10px 5px #777';
    linkMainDiv.style.borderRadius = '5px';
    linkMainDiv.style.display = 'flex';
    linkMainDiv.style.flexFlow = 'column nowrap';
    linkMainDiv.style.alignContent = 'center';
    linkMainDiv.style.alignItems = 'center';
    linkMainDiv.style.justifyContent = 'stretch';
    linkMainDiv.style.justifyItems = 'stretch';
    linkMainDiv.style.background = 'rgba(225,225,255,0.05)';
    linkMainDiv.style.overflowY = 'hidden';
    slideBG.appendChild(linkMainDiv);
  }

  createHead(links, counter) {
    let link = links[counter];
    let linkMainDiv = document.querySelector('#linkMainDiv');
    let generateLinkHead = function(link) {
      let linkHead = document.createElement('h3');
      linkHead.innerText = link.data.title;
      linkHead.style.width = '90%';
      linkHead.style.fontSize = '0.9rem';
      linkHead.style.lineHeight = '1rem';
      linkHead.style.textAlign = 'center';
      linkHead.id = 'linkHead';
      linkHead.style.color = '#CCF';

      linkHead.onclick = function() {
        window.open(link.data.permalink);
      }
      linkHead.onmouseover = function() {
        linkHead.style.cursor = 'pointer';
      }

      return linkHead;
    }

    let generateHeaderSecondRow = function(links, counter) {

      let generatePostedIn = () => {
        let postedInSubRedditP = document.createElement('p');
        postedInSubRedditP.innerText = `${link.data.subreddit_name_prefixed}`;
        postedInSubRedditP.style.textAlign = 'left';
        postedInSubRedditP.style.paddingLeft = '1rem';
        postedInSubRedditP.onclick = () => {
          window.open(`./${link.data.subreddit_name_prefixed}`);
        }
        postedInSubRedditP.onmouseover = () => {
          postedInSubRedditP.style.cursor = 'pointer';
          postedInSubRedditP.style.color = 'white';
        }
        postedInSubRedditP.onmouseout = () => {
          postedInSubRedditP.style.color = 'rgb(204,204,204)';
        }
        return postedInSubRedditP;
      }

      let generateDomainOrigin = () => {
        let linkDomainP = document.createElement('p');
        linkDomainP.innerText = `${link.data.domain}`;
        linkDomainP.style.textAlign = 'right';
        linkDomainP.style.paddingRight = '1rem';
        linkDomainP.onclick = () => {
          window.open(`${link.data.url}`);
        }
        linkDomainP.onmouseover = () => {
          linkDomainP.style.cursor = 'pointer';
          linkDomainP.style.color = 'white';
        }
        linkDomainP.onmouseout = () => {
          linkDomainP.style.color = 'rgb(204,204,204)';
        }
        return linkDomainP;
      }

      let generateLeftNav = function(links,counter) {
        let leftNav = document.createElement('div');
        leftNav.innerText = '<';
        leftNav.id = 'ssPreviousButton'
        leftNav.style.height = '100%';
        leftNav.style.width = '1.5rem';
        leftNav.style.border = '1px solid rgba(225,225,255, 0.3)';
        leftNav.style.borderRadius = '5px';
        leftNav.style.color = 'rgba(225,225,255, 0.8)';
        leftNav.style.padding = '0.75rem 0.25rem';
        leftNav.style.marginTop = '-2rem';
        if (counter != 0) {
          leftNav.onmouseover = function() {
            leftNav.style.cursor = 'pointer';
          };
        }
        return leftNav;
      }

      let generateRightNav = function(links,counter) {
        let rightNav = document.createElement('div');
        rightNav.innerText = '>';
        rightNav.id = 'ssNextButton';
        rightNav.style.height = '100%';
        rightNav.style.width = '1.5rem';
        rightNav.style.border = '1px solid rgba(225,225,255, 0.3)';
        rightNav.style.borderRadius = '5px';
        rightNav.style.color = 'rgba(225,225,255, 0.8)';
        rightNav.style.padding = '0.75rem 0.25rem';
        rightNav.style.marginTop = '-2rem';
        rightNav.onmouseover = function() {
          rightNav.style.cursor = 'pointer';
        }
        return rightNav;
      }

      let generateAlerts = function(link) {
        let nsfwStatus = link.data.over_18;
        let quarantineStatus = link.data.quarantine;
        let alertDisplayFlex = document.createElement('div');
        alertDisplayFlex.style.display = 'flex';
        alertDisplayFlex.style.justifyContent = 'center';
        alertDisplayFlex.style.alignItems = 'center';
        alertDisplayFlex.style.width = '30%';
        alertDisplayFlex.style.textAlign = 'center';
  
        let alertNSFW = document.createElement('p');
        alertNSFW.style.display = 'inline';
        alertNSFW.innerText = 'NSFW';
        alertNSFW.style.color = 'darkred';
        alertNSFW.style.border = '1px solid darkred';
        alertNSFW.style.borderRadius = '5px';
        alertNSFW.style.padding = '0 .5rem 0 .5rem';
  
        let alertQuarantine = document.createElement('p');
        alertQuarantine.style.display = 'inline';
        alertQuarantine.innerText = 'Quarantine';
        alertQuarantine.style.color = 'black';
        alertQuarantine.style.border = '1px solid yellow';
        alertQuarantine.style.background = 'yellow';
        alertQuarantine.style.borderRadius = '5px';
        alertQuarantine.style.padding = '0 .5rem 0 .5rem';
  
        if (nsfwStatus == true) {
          alertDisplayFlex.appendChild(alertNSFW);
        }
        if (quarantineStatus == true) {
          alertDisplayFlex.appendChild(alertQuarantine);
        }
  
        return alertDisplayFlex;
      }

      let secondRow = document.createElement('div');
      secondRow.style.width = '100%';
      secondRow.style.display = 'flex';
      secondRow.style.justifyContent = 'space-between';
      secondRow.style.alignItems = 'center';
      secondRow.style.textAlign = 'center';
      secondRow.style.marginTop = '0.5rem';
      secondRow.id = 'secondHeadRow'

      secondRow.appendChild(generateLeftNav(links,counter));
      secondRow.appendChild(generatePostedIn());
      secondRow.appendChild(generateAlerts(link));
      secondRow.appendChild(generateDomainOrigin());
      secondRow.appendChild(generateRightNav(links,counter));
      return secondRow;
    }

    let generateHeadContainer = function(link) {
      let headContainer = document.createElement('div');
      headContainer.style.display = 'flex';
      headContainer.flexFlow = 'column';
      headContainer.id = 'headContainer';
      headContainer.style.width = '100%';
      headContainer.style.margin = '0 1rem 0.5rem 1rem';
      headContainer.style.flexWrap = 'wrap';
      headContainer.style.textAlign = 'center';
      headContainer.style.justifyContent = 'center';
      headContainer.style.flex = '0 1 auto';

      headContainer.appendChild(generateLinkHead(link));
      headContainer.appendChild(generateHeaderSecondRow(links, counter))
      return headContainer;
    }
    
    linkMainDiv.appendChild(generateHeadContainer(link));
  }

  createContent(link) {
    let linkMainDiv = document.querySelector('#linkMainDiv');

    let styleImgContent = (content) => {
      content.style.objectFit = 'contain';
      content.style.height = 'auto';
      content.style.width = 'auto';
      content.style.maxWidth = '100%';
      content.style.maxHeight = '80vh';
      content.style.margin = 'auto';
      content.style.border = '1px solid black';
      return content;
    }

    let styleVideoContent = (content) => {
      content.style.maxHeight = '75vh';
      content.style.maxWidth = '100%';
      content.autoplay = true;
      content.controls = true;
      content.loop = true;
      content.muted = false;
      return content;
    }

    let styleTextContent = (content) => {
      content.style.textAlign = 'left';
      content.style.fontSize = '0.85rem';
      content.style.maxWidth = '1200px';
      content.style.width = '80%';
      content.style.maxHeight = '90%';
      content.style.overflowY = 'auto';
      content.style.border = '1px solid rgba(200,200,200,0.3)';
      content.style.borderRadius = '5px';
      content.style.padding = '1rem';
      content.style.paddingLeft = '1rem';
      content.style.paddingTop = '1rem';
      content.style.color = 'rgb(204,204,204)';
      content.style.lineHeight = '1rem';
      return content;
    }

    let generateContentFromGenericImageURL = () => {
      let extensions = [/\.jpg$/, /\.jpeg$/, /\.png$/, /\.bmp$/, /\.tiff$/, /\.gif$/];
      for (let i = 0; i < extensions.length; i++) {
        if (extensions[i].test(link.data.url)){
          let linkImgContainer = document.createElement('div');
          linkImgContainer.style.flex = '0 1 auto';
          linkImgContainer.id = 'ssImgDivWrapper';
          let linkImg = document.createElement('IMG');
          linkImg.src = link.data.url;
          linkImg.id = 'ssImg';
          styleImgContent(linkImg);

          linkImg.onclick = function() {
            window.open(linkImg.src);
          }
          linkImg.onmouseover = function() {
            linkImg.style.cursor = 'pointer';
          }

          linkImgContainer.appendChild(linkImg);
          return linkImgContainer;
        }
      }
      return null;
    };

    let generateContentFromGenericVideoURL = () => {
      let extensions = [/\.webm$/, /\.gifv$/, /\.mp4$/, /\.flv$/, /\.mkv$/, /\.avi$/, /\.mpeg$/, /\.mov$/];
      for (let i = 0; i < extensions.length; i++) {
        if (extensions[i].test(link.data.url)){
          let linkVid = document.createElement('video');
          linkVid.id = 'ssVid';
          styleVideoContent(linkVid);
          let linkSource = link.data.url.replace('.gifv','.mp4');

          let vidSourceWebm = document.createElement('source');
          vidSourceWebm.src = linkSource;
          vidSourceWebm.type = 'video/webm';
          let vidSourceMp4 = document.createElement('source');
          vidSourceMp4.src = linkSource;
          vidSourceMp4.type = 'video/mp4';

          linkVid.appendChild(vidSourceMp4);
          linkVid.appendChild(vidSourceWebm);
          return linkVid;
        }
      }
      return null;
    }

    let generateContentFromImgurDomain = () => {
      if (link.data.domain == "imgur.com") {
        if (/\/a\//.test(link.data.url)) {
          let albumNotification = document.createElement('p');
          styleTextContent(albumNotification);
          albumNotification.style.width = 'auto';
          albumNotification.style.border = 'none';
          albumNotification.style.textAlign = 'center';
          albumNotification.style.marginTop = '0';
          this.createThumbNailImg(link);
          albumNotification.innerText = 'This is an album. Click the thumbnail above to view';
          return albumNotification;
        }
        else {
          let linkImg = document.createElement('IMG');
          linkImg.src = link.data.url + '.jpg';
          linkImg.id = 'ssImg';
          styleImgContent(linkImg);
          linkImg.onclick = function() {
            window.open(linkImg.src);
          }
          linkImg.onmouseover = function() {
            linkImg.style.cursor = 'pointer';
          }
          return linkImg;
        }
      }
      return null;
    }

    let generateContentFromGfycatDomain = () => {
      if (link.data.domain == "gfycat.com") {
        let linkVid = document.createElement('video');
        linkVid.id = 'ssVid';
        styleVideoContent(linkVid);

        let gfyGiantBase = 'https://giant.gfycat.com';
        let gfyThumbBase = 'https://thumbs.gfycat.com';
        let linkSource;

        if (!link.data.secure_media && !link.data.crosspost_parent_list) {
          return null;
        }
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

        return linkVid;
      }
      return null;
    }

    let generateContentFromCommonVideoDomain = () => {
      let linkVid = document.createElement('iframe');
      let keyReg = /(?:viewkey=)\w+(?:&)/;
      if (keyReg.test(link.data.url)) {
        let embedKey = link.data.url.match(/(?:viewkey=)\w+(?:&)/).join().replace('viewkey=','').replace('&','');
        let vidSource = `https://${link.data.domain}/embed/${embedKey}`;
        let vidWidth = '600';
        let vidHeight = '350';
        linkVid.src = vidSource;
        linkVid.height = vidHeight;
        linkVid.width = vidWidth;
        linkVid.allowFullscreen = true;
        return linkVid;
      }
      return null;
    }

    let generateContentFromSelfPost = () => {
      if (/^self\./.test(link.data.domain) && link.data.selftext.length > 0) {
        let selfPostParagraph = document.createElement('p');
        selfPostParagraph.innerText = link.data.selftext;
        styleTextContent(selfPostParagraph);
        return selfPostParagraph;
      } else if (/^self\./.test(link.data.domain)) {
        let selfPostParagraph = document.createElement('p');
        return selfPostParagraph;
      }
      return null;
    }
    
    let attemptCreation = () => {
      let possibleContent = [generateContentFromGenericImageURL(), generateContentFromGenericVideoURL(), generateContentFromImgurDomain(), generateContentFromGfycatDomain(), generateContentFromSelfPost(), generateContentFromCommonVideoDomain()];
      possibleContent.forEach((item)=> {
        if (item !== null) {
          linkMainDiv.appendChild(item);
          return item;
        }
      });
      if (possibleContent.filter(v=> v !== null).length === 0){
        this.contentLoadErrorParagraph(link);
      };
    }

    attemptCreation();
  }


  createThumbNailImg(link) {
    let linkMainDiv = document.querySelector('#linkMainDiv');
    let thumbnailOfLink = document.createElement('IMG');
    thumbnailOfLink.src = link.data.thumbnail;
    thumbnailOfLink.id = 'ssThumbnail';
    thumbnailOfLink.style.height = `${link.data.thumbnail_height}px`;
    thumbnailOfLink.style.width = `${link.data.thumbnail_width}px`;
    thumbnailOfLink.style.maxWidth = '100%';
    thumbnailOfLink.style.margin = 'auto';
    thumbnailOfLink.style.border = '1px solid black';
    thumbnailOfLink.style.marginBottom = '0.5rem';
    thumbnailOfLink.style.borderRadius = '3px';
    thumbnailOfLink.onclick = function() {
      window.open(link.data.url);
    }
    thumbnailOfLink.onmouseover = function() {
      thumbnailOfLink.style.cursor = 'pointer';
    }
    linkMainDiv.appendChild(thumbnailOfLink);

  }

  contentLoadErrorParagraph(link) {
    let textLink = document.createElement('span');
    textLink.style.color = '#AAF';
    textLink.innerText = ` Click here to view`;
    let sorryParagraph = document.createElement('p');
    let sorryText = `Unable to load content.`;
    sorryParagraph.innerText = sorryText;
    sorryParagraph.style.padding = '2px';
    sorryParagraph.style.color = 'rgb(204,204,204)';

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
    try {
      this.createThumbNailImg(link);
    } catch(error) {
      throw error;
    }
    linkMainDiv.appendChild(sorryParagraph);
    sorryParagraph.appendChild(textLink);
    console.log(`Unable to load content for: \n`, this.mainLink.data,  `\nCounter: ${this.counter} of ${this.links.length} available links`);
  }

  createFooter(links, counter) {
    let linkMainDiv = document.querySelector('#linkMainDiv');
    let currentLink = links[counter];
    let generateFooterDiv = function() {
      let footerDiv = document.createElement('div');
      footerDiv.style.width = '100%';
      footerDiv.style.display = 'flex';
      footerDiv.style.justifyContent = 'center';
      footerDiv.style.alignItems = 'center';
      footerDiv.style.margin = '0rem 2rem';
      footerDiv.style.color = 'rgb(204,204,204)';
      footerDiv.style.flex = '0 0 auto';
      footerDiv.id = 'ssFooterDiv';
      return footerDiv;
    }
    let generateCenterInfo = function(link) {
      let postedBy = link.data.author;
      let commentCount = link.data.num_comments;
      let karmaCount = link.data.ups;
      let centerInfoBox = document.createElement('div');
      centerInfoBox.style.width = '50%';
      centerInfoBox.style.maxWidth = '600px';
      centerInfoBox.style.paddingTop = '0.5rem';
      centerInfoBox.style.display = 'flex';
      centerInfoBox.style.justifyContent = 'space-around';
      centerInfoBox.style.alignItems = 'center';
      centerInfoBox.style.textAlign = 'center';
      centerInfoBox.style.borderTop = '1px solid rgba(150,150,250,0.2)';
      let generateKarmaCountP = function(karmaCount) {
        let karmaCountP = document.createElement('p');
        karmaCountP.innerText = `${karmaCount} Karma`;
        return karmaCountP;
      }
      let generatePostedByP = function(postedBy) {
        let postedByInfoP = document.createElement('p');
        postedByInfoP.innerText = `Posted by ${postedBy}`;
        postedByInfoP.onclick = () => {
          window.open(`./u/${postedBy}`);
        }
        postedByInfoP.onmouseover = () => {
          postedByInfoP.style.cursor = 'pointer';
          postedByInfoP.style.color = 'white';
        }
        postedByInfoP.onmouseout = () => {
          postedByInfoP.style.color = 'rgb(204,204,204)';
        }
        return postedByInfoP;
      }
      let generateCommentCountP = function(commentCount) {
        let commentInfoP = document.createElement('p');
        commentInfoP.innerText = `${commentCount} Comments`;
        commentInfoP.onclick = () => {
          window.open('.'+link.data.permalink);
        }
        commentInfoP.onmouseover = () => {
          commentInfoP.style.cursor = 'pointer';
          commentInfoP.style.color = 'white';
        }
        commentInfoP.onmouseout = () => {
          commentInfoP.style.color = 'rgb(204,204,204)';
        }
        return commentInfoP;
      }
      centerInfoBox.appendChild(generateKarmaCountP(karmaCount));
      centerInfoBox.appendChild(generatePostedByP(postedBy));
      centerInfoBox.appendChild(generateCommentCountP(commentCount));
      return centerInfoBox;
    }
    let footerDiv = generateFooterDiv();
    footerDiv.appendChild(generateCenterInfo(currentLink));
    linkMainDiv.appendChild(footerDiv);
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
    this.createHead(this.links, this.counter); 
    this.createContent(this.mainLink);
    this.createFooter(this.links, this.counter);
    // this.updateExitButtonListener(this.links, this.counter);
  }
}

const createLaunch = function() {
  let styleTab = (content) => {
    content.innerHTML = '<p>Sliddit</p>';
    content.style.color = '#8cb3d9';
    content.style.background = '#262626';
    content.style.padding = '2px 6px 0px 6px';
    content.onmouseover = function() {
      content.style.cursor = 'pointer';
    }
    content.onclick = function() {
      if(/count=\d+/.test(document.URL) == true) {
        let countUrlMethod = document.URL.match(/count=\d+/).join();
        let countNumber = countUrlMethod.match(/\d+$/).join();
        let SS_Main = new SlideShow({},parseInt(countNumber-1));
        return SS_Main;
      }
      let Slide = new SlideShow();
      return Slide;
    }
  }
  if (document.querySelector('ul.tabmenu')) {
    let newTab = document.createElement('li');
    let tabs = document.querySelector('ul.tabmenu');
    newTab.classList = tabs.lastChild.classList;
    styleTab(newTab);
    return tabs.appendChild(newTab);
  }
  else {
    let launchButton = document.createElement('div');
    launchButton.style.width = '3rem';
    launchButton.style.height = '1.5rem';
    launchButton.id = 'ssLaunch';
    launchButton.style.position = 'fixed';
    launchButton.style.top = '3rem';
    launchButton.style.right = '10px';
    launchButton.style.zIndex = '99';
    launchButton.style.border = '1px solid rgba(225,225,255,0.2)';
    launchButton.style.borderTop = 'none';
    launchButton.style.borderRadius = '5px';
    styleTab(launchButton);
    return document.body.appendChild(launchButton);
  }
}

window.addEventListener('load', createLaunch());
// createLaunch();
//let Slide = new SlideShow()