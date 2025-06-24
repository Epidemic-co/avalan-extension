document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('saveSettings').addEventListener('click', saveSettings);

// Save settings to chrome.storage
function saveSettings() {
    let competitors = Array.from(document.querySelectorAll('.tag'));
    competitors = competitors.map(competitor => competitor.textContent);

    let competitorInput = document.getElementById('competitors');
    if (competitorInput.value.trim() !== '') {
        competitors.push(competitorInput.value.trim());
    }

    chrome.storage.sync.set({
        competitors: competitors,
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