chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (tab.url && tab.url.includes('youtube.com')) {
    const queryString = tab.url.split('?')[1];
    const urlParameters = new URLSearchParams(queryString);

    const message = {
      type: 'NEW',
      videoId: urlParameters.get('v'),
    };

    chrome.tabs.sendMessage(tabId, message).catch(console.error);
  }
});
