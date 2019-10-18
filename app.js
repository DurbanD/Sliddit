class SlideShow {
  constructor() {
    this.counter = 0;
    this.fetchJsonDefaultString = './.json?limit=100';
    this.page = 1; 
    this.getListings().then(()=>this.updateUI(this.links, this.counter)).then(()=>this.createListeners());
  }

  async getListings(after=null, before=null) {

    if (after === null && before === null) {
      let links = fetch(this.fetchJsonDefaultString).then((response) => response.json()).then((result) => links = result.data.children);
      this.links = await links;
      this.lastLink = this.getLastAvailableLink();
      this.currentLink = this.getCurrentLink();
      return links;
    }
    if (after === null && before != null) {
      let links = fetch(this.fetchJsonDefaultString + `&before=${before}`).then((response) => response.json()).then((result) => links = result.data.children);
      this.links = await links;
      this.lastLink = this.getLastAvailableLink();
      this.currentLink = this.getCurrentLink();
      return links;
    }
    if (after != null && before === null) {
      let links = fetch(this.fetchJsonDefaultString + `&after=${after}`).then((response) => response.json()).then((result) => links = result.data.children);
      this.links = await links;
      this.lastLink = this.getLastAvailableLink();
      this.currentLink = this.getCurrentLink();
      return links;
    }
    if (after != null && before != null) {
      let links = fetch(this.fetchJsonDefaultString + `&after=${after}` + `&before=${before}`).then((response) => response.json()).then((result) => links = result.data.children);
      this.links = await links;
      this.lastLink = this.getLastAvailableLink();
      this.currentLink = this.getCurrentLink();
      return links;
    }
  }

  getLastAvailableLink() {
    return this.links[this.links.length-1];
  }

  getCurrentLink() {
    return this.links[this.counter];
  }

  updateUI(links,counter) {
    return new SlideShowUI(links, counter).generateUI();
  }

  nextLink() {
    this.counter++;
    if (this.counter > this.links.length - 1) {
      this.page++;
      this.counter = 0;
      this.getListings(this.currentLink.data.name, null).then(()=> {
        this.updateUI(this.links, this.counter);
      });
       
    }
    else { 
      this.currentLink = this.getCurrentLink();
      this.updateUI(this.links, this.counter); 
    }
  }

  previousLink() {
    this.counter--;
    if (this.counter < 0 && this.page == 1) {
      console.log('There are no previous links, you are at the beginning.');
      this.counter = 0;
      this.currentLink = this.getCurrentLink();
    }
    if (this.counter == 0 && this.page > 1) {
      this.counter = 99;
      this.page--;
      this.getListings(null, this.currentLink.data.name).then(() => {
        this.updateUI(this.links, this.counter);
      });
    }
    else {
      this.currentLink = this.getCurrentLink();
      this.updateUI(this.links, this.counter);
    }
  }

  createListeners() {
    document.body.addEventListener('keydown', (event) => {
      if (event.keyCode == 39) {
        event.preventDefault();
        this.nextLink();
      }
      if (event.keyCode == 37) {
        event.preventDefault();
        this.previousLink();
      }
    });
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
    fullScreenBackground.style.background = '#222';
    fullScreenBackground.style.width = '100vw';
    fullScreenBackground.style.height = '100vh';
    fullScreenBackground.style.overflow = 'hidden';
    fullScreenBackground.style.padding = '2rem';
    fullScreenBackground.id = 'slideShowBG';
    document.body.appendChild(fullScreenBackground);
  };

  createContent(link) {
    let linkMainDiv = document.createElement('div');
    let slideBG = document.querySelector('#slideShowBG');
    linkMainDiv.id = "linkMainDiv";
    linkMainDiv.style.margin = '2rem auto';
    linkMainDiv.style.width = '90%';
    linkMainDiv.style.maxHeight = '90%';
    linkMainDiv.style.maxWidth = '1200px';
    linkMainDiv.style.zIndex = '100';
    linkMainDiv.style.border = '1px dotted black';
    linkMainDiv.style.padding = '1rem';
    linkMainDiv.style.boxSizing = 'border-box';
    linkMainDiv.style.textAlign = 'center';
    linkMainDiv.style.boxShadow = '2px 2px 15px 5px #777, -2px -2px 15px 5px #777';
    linkMainDiv.style.borderRadius = '5px';
    linkMainDiv.style.display = 'flex';
    linkMainDiv.style.flexFlow = 'column';
    linkMainDiv.style.alignContent = 'center';
    linkMainDiv.style.alignItems = 'center';
    linkMainDiv.style.justifyContent = 'center';
    if (!document.querySelector('#linkMainDiv')) {
      slideBG.appendChild(linkMainDiv);
    }
    if (link.data.domain == "i.imgur.com" || link.data.domain == 'i.redd.it') {
      let linkImg = document.createElement('IMG');
      linkImg.src = link.data.url;
      linkImg.id = 'ssImg';
      linkImg.style.maxHeight = '100%';
      linkImg.style.maxWidth = '100%';
      linkImg.style.margin = 'auto';
      linkMainDiv.appendChild(linkImg);
    }

  }

  createImg(link) {
    let slideImg = document.createElement('IMG');
    slideImg.src = link.data.url;
    slideImg.style.margin = 'auto';
    slideImg.style.position = 'absolute';
    slideImg.style.left = '0';
    slideImg.style.right = '0';
    slideImg.style.top = '0';
    slideImg.style.bottom = '0';
    slideImg.style.maxHeight = '85vh';
    slideImg.style.maxWidth = '85vw';
    slideImg.style.zIndex = '100';
    slideImg.style.border = '2px solid white';
    slideImg.id = 'slideShowImg';
    document.querySelector('#slideShowBG').appendChild(slideImg);
  }

  removeDefault() {
    document.querySelector('#header').style.display = 'none';
    document.querySelector('div.content').style.display = 'none';
    document.querySelector('div.side').style.display = 'none';
    document.querySelector('div.footer-parent').style.display = 'none';
    document.querySelector('ul.res-floater-list').style.display = 'none';
    document.body.style.height = '100%';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  generateUI() {

    if (!document.querySelector('#slideShowBG')) {
      this.removeDefault();
      this.createBackground();
    }

    if (document.querySelector('#ssImg')) {
      let ssImg = document.querySelector('#ssImg');
      ssImg.src = this.links[this.counter].data.url;
    } else {this.createContent(this.mainLink)}
  }

}

let Slide = new SlideShow()