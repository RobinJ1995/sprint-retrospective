const VOTE_MODES = Object.freeze({
	NONE: 'none',
	UPVOTE: 'up',
	UPVOTE_DOWNVOTE: 'updown'
});
const SUBMENUS = Object.freeze({
	EXPORT: 'export'
});
const ITEM_TEXT_MIN_LENGTH = 1;
const ITEM_TEXT_MAX_LENGTH = 1024;
const PATH_MAX_LENGTH = 128;
const KEY = Object.freeze({
	ESCAPE: 'Escape'
});
const THEMES = Object.freeze({
	DARK: 'dark',
	LIGHT: 'light',
	COLOURFUL: 'colourful'
});
const HEADERS = Object.freeze({
	TOKEN: 'X-Token'
});
const PAGES = Object.freeze({
	RETROSPECTIVE: 'retro',
	ENTER_ACCESS_KEY: 'enter_access_key'
});
const MODALS = Object.freeze({
	SET_VOTE_MODE: 'set_vode_mode'
});

export {
	VOTE_MODES,
	SUBMENUS,
	ITEM_TEXT_MIN_LENGTH,
	ITEM_TEXT_MAX_LENGTH,
	PATH_MAX_LENGTH,
	KEY,
	THEMES,
	HEADERS,
	PAGES,
	MODALS
};
