(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, value, videoId } = message;

    console.log('🚀 ~ videoId:', videoId);
    console.log('🚀 ~ type:', type);
  });
})();
