function openInAvalan() {
  const url = window.location.href;
  const username = url.split('/')[3];
  const newUrl = `https://app.avalan.io/analytics/${username}`;
  window.open(newUrl, '_blank');
}

function getRedirectButton() {
  const button = document.createElement('button');
  button.innerText = 'Open in Avalan';
  button.classList = 'avalan-redirect-button';
  button.onclick = () => {openInAvalan()};
  return button;
}

function getData(id, text, defaultValue = "Loading...") {
  return `<div id='${id}' class='data'>
    <div class='data-value'>${defaultValue}</div>
    <div class='data-text'>${text}</div>
  </div>`;
}

function getLogo() {
  return `<svg width="24" height="24" viewBox="0 0 372 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M162.594 0C250.573 0.000342934 282.971 126.653 232.836 198.895L93.2664 400C5.28632 399.999 -26.2715 272.243 23.8639 200L162.594 0Z" fill="black"/>
      <path d="M371.046 321.087C371.046 364.647 335.706 399.96 292.112 399.96C248.518 399.96 213.178 364.647 213.178 321.087C213.178 277.526 248.518 242.213 292.112 242.213C335.706 242.213 371.046 277.526 371.046 321.087Z" fill="black"/>
    </svg>`
}

function downloadMedia(post) {
  const code = post.href.split('/')[5];
  fetch(`https://www.instagram.com/p/${code}/?__a=1&__d=dis`)
    .then(response => response.json())
    .then(data => {
      const a = document.createElement('a')
      const url = data.items[0].video_versions ? data.items[0].video_versions[0].url : data.items[0].image_versions2.candidates[0].url;
      fetch(url).then(response => response.blob()).then(blob => {
        a.href = URL.createObjectURL(blob);
        a.download = data.items[0].video_versions ? `${code}.mp4` : `${code}.jpg`;
        a.click();
      });
    });
    event.preventDefault();
    event.stopPropagation();
}

function getWidget( ) {
  const widget = document.createElement('div');
  widget.classList = 'avalan-widget-wrapper';
  widget.innerHTML = `
    <div class="avalan-widget">
      <div class="avalan-widget-inner">
        <div id="logo">${getLogo()}</div>
        ${getData('avalan-likes', 'Avg. Likes')}
        ${getData('avalan-comments', 'Avg. Comments')}
        ${getData('avalan-engagement', 'Engagement')}
      </div>
      <div class="avalan-widget-info">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-info-circle-fill info-icon" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
        </svg>
        Click <a class="open-in-avalan">Open in Avalan</a> to explore the mentioned brands, audience demographics, including age, gender, location, and more...
      </div>
    </div>
  `;
  widget.querySelector(".open-in-avalan").onclick = () => openInAvalan(); 
  widget.querySelector(".avalan-widget-inner").appendChild(getRedirectButton());
  // widget.appendChild(getData('avalan-competitor', 'Competitors', '✅'));
  return widget;
}

function getCompetitorAlert() {
  const alert = document.createElement('div');
  alert.innerHTML = "🚨 Competitor Alert 🚨";
  alert.classList = 'avalan-competitor-alert';
  return alert; 
}

function getDownloadPostButton(post) {
  const button = document.createElement('a');
  button.onclick = () => downloadMedia(post);
  button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';
  button.classList = 'avalan-download-button';

  if (post.querySelector("._aagw") !== null) {
    post.querySelector("._aagw").appendChild(button);
  }
}

let followers = 1;
let num_of_posts = 0;
let likes = [];
let comments = [];
let engagement = [];
let competitors = [];

const regex = /@(\w+)/g;

function resetData() {
  likes = [];
  comments = [];
  engagement = [];
  num_of_posts = 0;
  followers = 1;
}

async function getMentions(post) {
  if (post.classList.contains("avalan-checked")) return;  
  let caption = post.querySelector("img").getAttribute("alt");

  while ((matches = regex.exec(caption)) !== null) {
    if (competitors.includes(matches[1])) {
      document.querySelector("#avalan-competitor .data-value").innerText = "🚨";
      post.querySelector("._aagw").appendChild(getCompetitorAlert());
      break;
    }
  }
}

async function downloadPost(post) {
  if (post.classList.contains("avalan-checked")) return;
  getDownloadPostButton(post);
}


function parsee(str) {
  if (str === undefined) return 0;
  if (str.includes('K')) return parseFloat(str) * 1000;
  if (str.includes('M')) return parseFloat(str) * 1000000;
  if (str.includes(',')) return parseFloat(str.replace(',', ''));
  return parseFloat(str);
}

async function getEngagement(mutation) {
  if (followers === 1) {
    let followersDom = document.querySelector("a[href*='/followers/'] span");
    if (followersDom) followers = parsee(followersDom.innerText);
  }

  if (mutation.target.classList.contains("avalan-checked")) return;

  let likesComments = mutation.addedNodes[0].querySelectorAll("li .html-span");
  if (likesComments.length < 2) return;

  if (mutation.addedNodes[0].querySelector(".x1ndrmp0.x1ndrmp0") !== null) {
    likes.push(parsee(likesComments[0].innerText));
    engagement.push((parsee(likesComments[0].innerText) + parsee(likesComments[1].innerText)) / followers);
  }
  comments.push(parsee(likesComments[1].innerText));

  document.querySelector("#avalan-likes .data-value").innerText = kFormatter(likes.reduce((a, b) => a + b, 0) / likes.length);
  document.querySelector("#avalan-comments .data-value").innerText = kFormatter(comments.reduce((a, b) => a + b, 0) / comments.length);
  document.querySelector("#avalan-engagement .data-value").innerText = ((engagement.reduce((a, b) => a + b, 0) / engagement.length) * 100).toFixed(2) + "%";

  mutation.target.blur();
}

async function newPosts(posts) {
  for (const post of posts) {
    // getMentions(post);
    num_of_posts += 1;
    // downloadPost(post);
    post.classList.add("avalan-post");
    this.setTimeout(() => {post.focus({ preventScroll: true })}, 100);
  }
}

const observe = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.addedNodes[0] === undefined) continue;
    if (mutation.type === 'childList' && typeof mutation.addedNodes[0].querySelector !== "undefined") {
      if (mutation.addedNodes[0].querySelector("li .html-span") !== null) {
        // Post was focused
        if (num_of_posts < 13) getEngagement(mutation);
      }
      else if (mutation.addedNodes[0].querySelector("._aagu") !== null) {
        // New post was loaded to the page
        newPosts(mutation.addedNodes[0].querySelectorAll("a"));
      }
      mutation.target.classList.add("avalan-checked");
    }
  };
};

function init() {
  resetData();
  
  if (document.querySelector(".avalan-widget")) return;
  document.querySelector("body").appendChild(getWidget());

  const config = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver(observe);
  observer.observe(document.body, config);
}

window.addEventListener('load', function load(e){
  chrome.storage.sync.get(['competitors'], function(items) {
      if (items.competitors) {
        competitors = items.competitors;
      }
  });
  init();
}, false);

let currentUrl = window.location.href;

setInterval(() => {
  if (window.location.href.split('/').length > 5) return;

  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    init();
  }
}, 500); // Check every second

function openOptions() {
  let optionsUrl = chrome.runtime.getURL('options.html');
  window.open(optionsUrl, '_blank');
}


function kFormatter(num) {
  return Math.abs(num) > 999 ? (Math.sign(num)*((Math.abs(num)/1000).toFixed(2)) + 'k') : Math.sign(num)*Math.abs(num).toFixed(2);
}