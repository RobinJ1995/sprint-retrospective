const VOTE_MODES = Object.freeze({
	NONE: 'none',
	UPVOTE: 'up',
	UPVOTE_DOWNVOTE: 'updown'
});
const ITEM_TEXT_MIN_LENGTH = 1;
const ITEM_TEXT_MAX_LENGTH = 1024;
const RETRO_TITLE_MIN_LENGTH = 3;
const RETRO_TITLE_MAX_LENGTH = 48;
const RETRO_ACCESS_KEY_MIN_LENGTH = 5;
const RETRO_ACCESS_KEY_MAX_LENGTH = 64;
const PATH_MAX_LENGTH = 128;
const KEY = Object.freeze({
	ESCAPE: 'Escape'
});
const THEMES = Object.freeze({
	DARK: 'dark',
	COLOURFUL: 'colourful'
});
const HEADERS = Object.freeze({
	TOKEN: 'X-Token',
	ADMIN_KEY: 'X-Admin-Key'
});
const PAGES = Object.freeze({
	RETROSPECTIVE: 'retro',
	ENTER_ACCESS_KEY: 'enter_access_key'
});
const MODALS = Object.freeze({
	SET_NAME: 'set_name',
	SET_VOTE_MODE: 'set_vode_mode',
	SET_THEME: 'set_theme',
	SET_ACCESS_KEY: 'set_access_key',
	EXPORT: 'export'
});
const WS_ACTIONS = Object.freeze({
	ADD_GOOD: 'add_good',
	ADD_BAD: 'add_bad',
	ADD_ACTION: 'add_action'
})
const SECTIONS = Object.freeze({
	GOOD: 'good',
	BAD: 'bad',
	ACTION: 'action'
});

export {
	VOTE_MODES,
	ITEM_TEXT_MIN_LENGTH,
	ITEM_TEXT_MAX_LENGTH,
	RETRO_TITLE_MIN_LENGTH,
	RETRO_TITLE_MAX_LENGTH,
	RETRO_ACCESS_KEY_MIN_LENGTH,
	RETRO_ACCESS_KEY_MAX_LENGTH,
	PATH_MAX_LENGTH,
	KEY,
	THEMES,
	HEADERS,
	PAGES,
	MODALS,
	WS_ACTIONS,
	SECTIONS
};
