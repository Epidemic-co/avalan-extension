document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('saveSettings').addEventListener('click', saveSettings);

// Save settings to chrome.storage
function saveSettings() {
    const competitors = document.querySelectorAll('.tag');
    console.log(competitors);

    chrome.storage.sync.set({
        competitors: Array.from(competitors).map(competitor => competitor.textContent),
    }, function() {
        console.log('Settings saved');
    });

    chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.remove(tab.id); // for tabs
    });
}

function restoreSettings() {
    chrome.storage.sync.get(['competitors'], function(items) {
        if (items.competitors) {
            items.competitors.map(competitor => addTag(competitor));
        }
    });
}

document.getElementById('competitors').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && this.value.trim() !== '') {
        event.preventDefault();
        addTag(this.value.trim());
        this.value = '';
    }
});

function addTag(tagText) {
    const tagContainer = document.getElementById('tagContainer');
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = tagText;
    
    const removeBtn = document.createElement('button');
    removeBtn.onclick = function() {
      tagContainer.removeChild(tag);
    };
    
    tag.appendChild(removeBtn);
    tagContainer.appendChild(tag);
}