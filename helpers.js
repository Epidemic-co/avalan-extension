function openInAvalan() {
    const url = window.location.href;
    const username = url.split('/')[3];
    const newUrl = `https://app.avalan.io/analytics/${username}`;
    window.open(newUrl, '_blank');
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}

function getRedirectButton() {
    const button = document.createElement('button');
    button.innerText = 'Open in Avalan';
    button.classList = 'avalan-redirect-button';
    button.onclick = () => {
        openInAvalan()
    };
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

function getCompetitorIcon() {
    if (competitors.length === 0) return "<a class='settings-button'>Add Competitors +</a>";
    return "✅";
}

function getWidget() {
    const widget = document.createElement('div');
    widget.classList = 'avalan-widget-wrapper';
    widget.innerHTML = `
      <div class="avalan-widget">
        <div class="avalan-widget-inner">
          <div id="logo">${getLogo()}</div>
          ${getData('avalan-likes', 'Avg. Likes')}
          ${getData('avalan-comments', 'Avg. Comments')}
          ${getData('avalan-engagement', 'Engagement')}
          <div id="avalan-competitor" class="data">
            <div class="data-value">${getCompetitorIcon()}</div>
            <div class="data-text" style="display: flex; align-items: center;">
              Competitors
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short settings-button" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="avalan-widget-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-info-circle-fill info-icon" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
          </svg>
          Click <a class="open-in-avalan">Open in Avalan</a> to explore the mentioned brands, audience demographics, including age, gender, location, and more...
        </div>
      </div>
    `;
    widget.querySelector(".settings-button").onclick = () => openOptions();
    widget.querySelector(".open-in-avalan").onclick = () => openInAvalan();
    widget.querySelector(".avalan-widget-inner").appendChild(getRedirectButton());
    return widget;
}

function getCompetitorAlert(username) {
    const alert = document.createElement('div');
    alert.innerHTML = `🚨 ${username} 🚨`;
    alert.classList = 'avalan-competitor-alert';
    return alert;
}

async function getMentions(post) {
    if (post.classList.contains("avalan-checked")) return;
    let caption = post.querySelector("img").getAttribute("alt");

    while ((matches = regex.exec(caption)) !== null) {
        if (competitors.includes(matches[1])) {
            document.querySelector("#avalan-competitor .data-value").innerText = "🚨";
            post.querySelector("._aagw").appendChild(getCompetitorAlert(matches[1]));
            break;
        }
    }
}

function parsee(value) {
    if (value === undefined) return 0;
    if (value.includes('K')) return parseFloat(value) * 1000;
    if (value.includes('M')) return parseFloat(value) * 1000000;
    if (value.includes(',')) return parseFloat(value.replace(',', ''));
    return parseFloat(value);
}

async function getEngagement(mutation, followers) {
    if (followers === 1 || isNaN(followers)) {
        let followersDom = document.querySelector("a[href*='/followers/'] span");
        followers = parsee(followersDom.innerText);
    }

    if (mutation.target.classList.contains("avalan-checked")) return;

    let likesComments = mutation.addedNodes[0].querySelectorAll("li .html-span");
    if (likesComments.length < 2) return;

    if (mutation.addedNodes[0].querySelector(".x1ndrmp0.x1ndrmp0") !== null) {
        likes.push(parsee(likesComments[0].innerText));
        engagement.push((parsee(likesComments[0].innerText) + parsee(likesComments[1].innerText)) / followers);
    }
    comments.push(parsee(likesComments[1].innerText));

    let avgLikes = kFormatter(likes.reduce((a, b) => a + b, 0) / likes.length);
    let avgComments = kFormatter(comments.reduce((a, b) => a + b, 0) / comments.length);
    let avgEngagement = ((engagement.reduce((a, b) => a + b, 0) / engagement.length) * 100).toFixed(2) + "%";

    document.querySelector("#avalan-likes .data-value").innerText = avgLikes;
    document.querySelector("#avalan-comments .data-value").innerText = avgComments;
    document.querySelector("#avalan-engagement .data-value").innerText = avgEngagement;

    cache[username] = [avgLikes, avgComments, avgEngagement, document.querySelector("#avalan-competitor .data-value").innerText];

    mutation.target.blur();
}

function kFormatter(num) {
    return Math.abs(num) > 999 ? (Math.sign(num) * ((Math.abs(num) / 1000).toFixed(2)) + 'k') : Math.sign(num) * Math.abs(num).toFixed(2);
}

function openOptions() {
    let optionsUrl = chrome.runtime.getURL('options.html');
    window.open(optionsUrl, '_blank');
}


function setFromCache() {
    let data = cache[username];
    if (data === undefined) return;
    document.querySelector("#avalan-likes .data-value").innerText = data[0];
    document.querySelector("#avalan-comments .data-value").innerText = data[1];
    document.querySelector("#avalan-engagement .data-value").innerText = data[2];
    document.querySelector("#avalan-competitor .data-value").innerText = data[3];
}