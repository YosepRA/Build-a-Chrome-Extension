/* globals chrome */

import {
  ready,
  getCurrentTab,
  fetchBookmarks,
  createElement as cel,
} from 'Utilities/index.js';
import { classnames, attributes } from 'Statics/index.js';

import './popup.scss';

let mainContainer, activeTab;

async function start() {
  mainContainer = document.querySelector('.main-container');
  activeTab = await getCurrentTab();

  if (!activeTab.url?.includes('youtube.com/watch')) {
    showNonYouTubePage();

    return undefined;
  }

  loadBookmarks(activeTab);

  return undefined;
}

async function loadBookmarks() {
  /* 
    - Get video ID.
    - Search for bookmarks in local extension storage.
    - Render bookmarks to the page.
  */

  const url = new URL(activeTab.url);
  const videoId = url.searchParams.get('v');
  const bookmarks = await fetchBookmarks(videoId);

  if (bookmarks.length === 0) {
    showEmptyBookmarks();

    return undefined;
  }

  showBookmarkList(videoId, bookmarks);

  return undefined;
}

function showEmptyBookmarks() {
  const emptyBookmarksContent = cel(
    'div',
    { className: 'container' },
    cel(
      'div',
      { className: 'row' },
      cel(
        'div',
        { className: 'col' },
        cel(
          'h1',
          {
            className: `${classnames.PREFIX}__title h6 mb-3 text-center`,
          },
          'YouTube Bookmarks',
        ),
      ),
    ),
    cel(
      'div',
      { className: 'row' },
      cel(
        'div',
        { className: 'col' },
        cel(
          'p',
          {
            className: `${classnames.PREFIX}__no-bookmark text text-center`,
          },
          'There is no bookmark for this video.',
          cel('br'),
          cel(
            'em',
            {},
            cel(
              'small',
              {},
              'Press (+) on YouTube player to add new bookmarks.',
            ),
          ),
        ),
      ),
    ),
  );

  mainContainer.appendChild(emptyBookmarksContent);
}

function showBookmarkList(videoId, bookmarks) {
  const bookmarkListContent = cel(
    'div',
    { className: 'container' },
    cel(
      'div',
      { className: 'row' },
      cel(
        'div',
        { className: 'col' },
        cel(
          'h1',
          {
            className: `${classnames.PREFIX}__title h6 mb-3 text-center`,
          },
          'YouTube Bookmarks',
        ),
      ),
    ),
    cel(
      'div',
      { className: 'row' },
      cel(
        'div',
        { className: 'col' },
        cel(
          'ul',
          {
            className: `${classnames.PREFIX}__list list-group list-group-flush`,
            onClick: handleBookmarkClick,
          },
          bookmarks.map(({ timestamp, title }) =>
            cel(
              'li',
              {
                id: `${videoId}-${timestamp}`,
                className: `${classnames.PREFIX}__list-item list-group-item d-flex justify-content-between align-items-center`,
                [`${attributes.PREFIX}-video-id`]: videoId,
                [`${attributes.PREFIX}-timestamp`]: timestamp,
              },
              cel(
                'div',
                {
                  className: `${classnames.PREFIX}__list-timestamp`,
                },
                title,
              ),
              cel(
                'div',
                {
                  className: `${classnames.PREFIX}__list-controls`,
                },
                cel(
                  'button',
                  {
                    type: 'button',
                    className: `${classnames.PREFIX}__list-controls__btn ${classnames.PREFIX}__list-controls__btn-play btn btn-primary btn-sm me-1`,
                  },
                  'Play',
                ),
                cel(
                  'button',
                  {
                    type: 'button',
                    className: `${classnames.PREFIX}__list-controls__btn ${classnames.PREFIX}__list-controls__btn-delete btn btn-secondary btn-sm`,
                  },
                  'Delete',
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );

  mainContainer.appendChild(bookmarkListContent);
}

function showNonYouTubePage() {
  const nonYouTubeContent = cel(
    'div',
    { className: 'container' },
    cel(
      'div',
      { className: 'row' },
      cel(
        'div',
        { className: 'col' },
        cel(
          'h1',
          {
            className: `${classnames.PREFIX}__title h6 mb-3 text-center`,
          },
          'YouTube Bookmarks',
        ),
      ),
    ),
    cel(
      'div',
      { className: 'row' },
      cel(
        'div',
        { className: 'col' },
        cel(
          'p',
          {
            className: `${classnames.PREFIX}__non-youtube-page-text text-center`,
          },
          'This is not a YouTube page.',
        ),
      ),
    ),
  );

  mainContainer.appendChild(nonYouTubeContent);
}

function handleBookmarkClick(event) {
  const element = event.target;

  if (element.tagName !== 'BUTTON') return undefined;

  const parentListItem = element.closest(`.${classnames.PREFIX}__list-item`);
  const videoId = parentListItem.dataset.ytbVideoId;
  const timestamp = parentListItem.dataset.ytbTimestamp;

  if (
    element.classList.contains(`${classnames.PREFIX}__list-controls__btn-play`)
  ) {
    // If it's a play action.
    // console.log(`Playing video (${videoId}) to timestamp (${timestamp})`);

    playBookmark(timestamp);
  } else if (
    element.classList.contains(
      `${classnames.PREFIX}__list-controls__btn-delete`,
    )
  ) {
    // console.log(`Deleting timestamp (${timestamp}) for video (${videoId})`);

    deleteBookmark(videoId, timestamp);
  }

  return undefined;
}

async function playBookmark(timestamp) {
  const payload = {
    type: 'play',
    timestamp,
  };

  chrome.tabs.sendMessage(activeTab.id, payload);
}

async function deleteBookmark(videoId, timestamp) {
  const payload = {
    type: 'delete',
    videoId,
    timestamp,
  };

  const response = await chrome.tabs.sendMessage(activeTab.id, payload);

  if (response.status !== 'ok') {
    console.log('Failed to delete bookmark');

    return undefined;
  }

  // Remove from list in the popup window.
  deleteBookmarkFromPopup(videoId, timestamp);

  return undefined;
}

function deleteBookmarkFromPopup(videoId, timestamp) {
  const listItem = document.getElementById(`${videoId}-${timestamp}`);

  listItem.remove();
}

/* ======================= Initialization ======================= */

ready(start);
