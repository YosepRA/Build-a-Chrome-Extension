import {
  ready,
  getCurrentTab,
  fetchBookmarks,
  createElement as cel,
} from 'Utilities/index.js';
import { classnames } from 'Statics/index.js';
import './popup.scss';

let mainContainer;

async function start() {
  mainContainer = document.querySelector('.main-container');
  const activeTab = await getCurrentTab();

  if (!activeTab.url?.includes('youtube.com/watch')) {
    showNonYouTubePage();

    return undefined;
  }

  loadBookmarks(activeTab);

  return undefined;
}

async function loadBookmarks(activeTab) {
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

  showBookmarkList(bookmarks);

  return undefined;
}

function showEmptyBookmarks() {
  const emptyBookmarksContent = cel(
    'section',
    {
      className: `container ${classnames.PREFIX}__container`,
    },
    cel(
      'p',
      { className: `${classnames.PREFIX}__text` },
      'No bookmark for this video.',
    ),
  );

  mainContainer.appendChild(emptyBookmarksContent);
}

function showBookmarkList(bookmarks) {
  const emptyBookmarksContent = cel(
    'section',
    {
      className: `container ${classnames.PREFIX}__container`,
    },
    cel('p', { className: `${classnames.PREFIX}__text` }, 'Bookmark list.'),
  );

  mainContainer.appendChild(emptyBookmarksContent);
}

function showNonYouTubePage() {
  const emptyBookmarksContent = cel(
    'section',
    {
      className: `container ${classnames.PREFIX}__non-youtube-page__container`,
    },
    cel(
      'p',
      { className: `${classnames.PREFIX}__non-youtube-page__text` },
      'This is not a YouTube page.',
    ),
  );

  mainContainer.appendChild(emptyBookmarksContent);
}

ready(start);
