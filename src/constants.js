const VOTE_MODES = Object.freeze({
  NONE: 'none',
  UPVOTE: 'up',
  UPVOTE_DOWNVOTE: 'updown'
});
const SUBMENUS = Object.freeze({
  VOTE_MODE: 'voteMode',
  EXPORT: 'export'
});
const ITEM_TEXT_MIN_LENGTH = 1;
const ITEM_TEXT_MAX_LENGTH = 1024;
const PATH_MAX_LENGTH = 128;
const KEY = Object.freeze({
  ESCAPE: 'Escape'
});

export {
  VOTE_MODES,
  SUBMENUS,
  ITEM_TEXT_MIN_LENGTH,
  ITEM_TEXT_MAX_LENGTH,
  PATH_MAX_LENGTH,
  KEY
};