/* globals chrome */

async function fetchBookmarks(activeVideo) {
  const result = await chrome.storage.local.get([activeVideo]);

  return result[activeVideo] ? JSON.parse(result[activeVideo]) : [];
}

export default fetchBookmarks;
