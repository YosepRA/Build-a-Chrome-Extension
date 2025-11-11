/* global chrome */

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    const queryString = tab.url.split('?')[1];
    const urlParameters = new URLSearchParams(queryString);

    const message = {
      type: 'new',
      videoId: urlParameters.get('v'),
    };

    chrome.tabs.sendMessage(tabId, message).catch(console.error);
  }
});
