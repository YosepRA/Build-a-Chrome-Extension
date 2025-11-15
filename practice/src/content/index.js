/* global chrome */

import { classnames } from 'Statics/index.js';
import { fetchBookmarks, createElement as cel } from 'Utilities/index.js';

import './content.scss';

function getTimeSring(timestamp) {
  const date = new Date(0);

  date.setSeconds(timestamp);

  return date.toISOString().substring(11, 19);
}

(() => {
  let youtubePlayer, youtubeControls, activeVideo, currentBookmarks;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, videoId, timestamp } = message;

    switch (type) {
      case 'new':
        activeVideo = videoId;
        newVideoLoaded();
        break;

      case 'play':
        playBookmark(timestamp);
        break;

      case 'delete':
        deleteBookmark(videoId, timestamp).then(sendResponse);
        return true;

      default:
        break;
    }
  });

  const newVideoLoaded = async () => {
    const addBtnClassName = `${classnames.PREFIX}__add-btn`;
    const activeAddButton = document.getElementsByClassName(addBtnClassName)[0];

    // If there is already a button, don't add any more buttons.
    if (activeAddButton) return undefined;

    youtubePlayer = document.querySelector('.video-stream');
    youtubeControls = document.querySelector('.ytp-left-controls');

    currentBookmarks = await fetchBookmarks(activeVideo);
    createAddBookmarkButton(addBtnClassName);

    return undefined;
  };

  const createAddBookmarkButton = (addBtnClassName) => {
    const addBtnImage = cel(
      'div',
      { className: `${classnames.PREFIX}__container` },
      cel('img', {
        src: chrome.runtime.getURL('assets/bookmark.png'),
        className: addBtnClassName,
        onClick: handleAddBookmark,
      }),
    );

    youtubeControls.appendChild(addBtnImage);
  };

  const handleAddBookmark = async () => {
    const { currentTime } = youtubePlayer;

    const bookmark = {
      timestamp: currentTime,
      title: getTimeSring(currentTime),
    };

    currentBookmarks = await fetchBookmarks(activeVideo);

    const newStorageData = {
      [activeVideo]: JSON.stringify(
        [...currentBookmarks, bookmark].sort(
          (a, b) => a.timestamp - b.timestamp,
        ),
      ),
    };

    chrome.storage.local.set(newStorageData);
  };

  const playBookmark = (timestamp) => {
    youtubePlayer.currentTime = timestamp;
  };

  const deleteBookmark = async (videoId, timestamp) => {
    const bookmarks = await fetchBookmarks(videoId);
    const filteredBookmarks = bookmarks.filter(
      (item) => item.timestamp !== parseFloat(timestamp),
    );
    const newStorageData = {
      [videoId]: JSON.stringify(filteredBookmarks),
    };

    await chrome.storage.local.set(newStorageData);

    const response = {
      status: 'ok',
      data: {
        videoId,
        timestamp,
      },
    };

    return response;
  };
})();
