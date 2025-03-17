document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('saveSettings').addEventListener('click', saveSettings);

// Save settings to chrome.storage
function saveSettings() {
    const competitors = document.getElementById('competitors').value;

    chrome.storage.sync.set({
        competitors: competitors.split(',').map(competitor => competitor.trim()),
    }, function() {
        console.log('Settings saved');
    });

    chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.remove(tab.id); // for tabs
    });
}

function restoreSettings() {
    chrome.storage.sync.get(['competitors'], function(items) {
        document.getElementById('competitors').value = items.competitors || [];
    });
}