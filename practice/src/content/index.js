/* global chrome */

import { createElement } from '../utils/index.js';
import './content.scss';

function getTimeSring(timestamp) {
  const date = new Date(0);

  date.setSeconds(timestamp);

  return date.toISOString().substring(11, 19);
}

(() => {
  let youtubePlayer, youtubeControls, activeVideo, currentBookmarks;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, value, videoId } = message;

    switch (type) {
      case 'new':
        activeVideo = videoId;
        newVideoLoaded();
        break;

      default:
        break;
    }
  });

  const newVideoLoaded = async () => {
    const addBtnClassName = 'yt-bookmark__add-btn';
    const activeAddButton = document.getElementsByClassName(addBtnClassName)[0];

    // If there is already a button, don't add any more buttons.
    if (activeAddButton !== undefined) return undefined;

    youtubePlayer = document.querySelector('.video-stream');
    youtubeControls = document.querySelector('.ytp-left-controls');

    currentBookmarks = await fetchBookmarks();
    createAddBookmarkButton(addBtnClassName);

    return undefined;
  };

  const createAddBookmarkButton = (addBtnClassName) => {
    // const p = createElement('p', {}, 'Hello World');
    // console.log('🚀 ~ createAddBookmarkButton ~ p:', p);
    const btnContainer = document.createElement('div');
    const addBtnImage = document.createElement('img');

    btnContainer.classList.add('yt-bookmark__container');

    addBtnImage.src = chrome.runtime.getURL('assets/bookmark.png');
    addBtnImage.classList.add(addBtnClassName);
    addBtnImage.addEventListener('click', handleAddBookmark);

    btnContainer.appendChild(addBtnImage);
    youtubeControls.appendChild(btnContainer);
  };

  const fetchBookmarks = async () => {
    const result = await chrome.storage.local.get([activeVideo]);

    return result[activeVideo] ? JSON.parse(result[activeVideo]) : [];
  };

  const handleAddBookmark = async (event) => {
    const { currentTime } = youtubePlayer;

    const bookmark = {
      timestamp: currentTime,
      title: getTimeSring(currentTime),
    };

    currentBookmarks = await fetchBookmarks();

    const newStorageData = {
      [activeVideo]: JSON.stringify(
        [...currentBookmarks, bookmark].sort(
          (a, b) => a.timestamp - b.timestamp,
        ),
      ),
    };

    chrome.storage.local.set(newStorageData);
  };
})();
