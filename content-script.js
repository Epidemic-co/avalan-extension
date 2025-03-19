let username = "";
let followers = 1;
let num_of_posts = 0;
let likes = [];
let comments = [];
let engagement = [];
let competitors = [];
let cache = {};

let currentUrl = window.location.href;
const regex = /@(\w+)/g;

function resetData() {
  username = window.location.href.split('/')[3];
  likes = [];
  comments = [];
  engagement = [];
  num_of_posts = 0;
  followers = 1;
}

async function newPosts(posts) {
  for (const post of posts) {
    getMentions(post);
    num_of_posts += 1;
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
        if (num_of_posts < 13) getEngagement(mutation, followers);
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
      if (items.competitors) competitors = items.competitors;
      init();
  });
}, false);

setInterval(() => {
  if (window.location.href.split('/').length > 5) return;

  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    resetData();
    document.querySelector("#avalan-competitor .data-value").innerText = "✅";
    setFromCache();
  }
}, 500);
