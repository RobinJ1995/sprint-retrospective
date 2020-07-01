import React, {useState} from 'react';
import './style/App.scss';
import uuid from 'uuid/v4';
import {VOTE_MODES, SUBMENUS, PATH_MAX_LENGTH, THEMES, HEADERS, PAGES, MODALS} from './constants';
import Cache from './Cache';
import Preferences from './Preferences';
import {checkHttpStatus, copyToClipboard, httpPost, httpPut} from './utils';
import Retrospective from './Retrospective';
import AccessKeyInput from './AccessKeyInput';
import Overlay from './Overlay';
import Modal from './Modal';
import ShareFallback from './modal/ShareFallback';
import SetVoteMode from './modal/SetVoteMode';
import SetName from './modal/SetName';
import SetAccessKey from './modal/SetAccessKey';
import Export from './modal/Export';

const trimSlashes = str => str.replace(/^\//, '').replace(/\/$/, '');
const getRetroIdFromUrl = () => {
	const path = trimSlashes(String(window.location.pathname));
	if (!path || path.length > PATH_MAX_LENGTH) {
		return false;
	}

	return path;
};
const getOrSetRetroId = () => {
	if (getRetroIdFromUrl()) {
		return getRetroIdFromUrl();
	}

	const id = uuid();
	window.history.replaceState(null, 'Sprint Retrospective', `/${id}`);

	return id;
};

window.RETRO_ID = getOrSetRetroId();

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:5432';
window.API_BASE = `${apiEndpoint}/${window.RETRO_ID}`;

const prefs = new Preferences();
const cache = new Cache();
const initialData = {
	title: null,
	good: [],
	bad: [],
	actions: [],
	voteMode: VOTE_MODES.UPVOTE,
	...cache.get(window.RETRO_ID)
};
const getAuthHeaders = () => ({
	[HEADERS.TOKEN]: cache.get(`${window.RETRO_ID}:token`)
});

function App() {
	const [good, setGood] = useState(initialData.good);
	const [bad, setBad] = useState(initialData.bad);
	const [actions, setActions] = useState(initialData.actions);
	const [title, setTitle] = useState(initialData.title);
	const [voteMode, setVoteMode] = useState(initialData.voteMode);
	const [websocketUrl, setWebsocketUrl] = useState(null);
	const [openedSubmenu, setOpenedSubmenu] = useState(null);
	const [error, setError] = useState(null);
	const [theme, setTheme] = useState(prefs.get(Preferences.THEME, THEMES.DARK));
	const [page, setPage] = useState(PAGES.RETROSPECTIVE);
	const [modal, setModal] = useState(null);

	const updateTitle = title => {
		httpPut(`${window.API_BASE}/title`, {title}, getAuthHeaders())
			.catch(alert);

		setTitle(title);
	};

	const updateVoteMode = voteMode => {
		httpPut(`${window.API_BASE}/voteMode`, {voteMode}, getAuthHeaders())
			.catch(alert);

		setVoteMode(voteMode);
	};

	const updateAccessKey = accessKey => {
		httpPut(`${window.API_BASE}/accessKey`, {accessKey}, getAuthHeaders())
			.then(checkHttpStatus)
			.then(() => httpPost(`${window.API_BASE}/authenticate`, {
				accessKey
			}))
			.then(res => res.json())
			.then(res => {
				if (!res.token) {
					throw Error('Authentication failure');
				}

				return cache.set(`${window.RETRO_ID}:token`, res.token);
			})
			.catch(alert);
	};

	const updateTheme = theme => {
		prefs.set(Preferences.THEME, theme);
		setTheme(theme);
	};

	const toggleOpenedSubmenu = submenu => {
		if (openedSubmenu === submenu) {
			setOpenedSubmenu(null);
			return;
		}

		setOpenedSubmenu(submenu);
	};

	const shareFallback = () => copyToClipboard(window.location)
		.then(() => true)
		.catch(() => false)
		.then(copySucceeded => setModal(<ShareFallback copySucceeded={copySucceeded} />));

	const share = () => {
		if (navigator.share) {
			const nItems = good.length + bad.length + actions.length;

			return navigator.share({
				title: title || 'Sprint Retrospective',
				text: `Collaborate on this sprint retrospective! It currently contains ${nItems} items.`,
				url: window.location
			})
				.catch(() => shareFallback());
		}

		return shareFallback();
	};

	const populateModal = () => {
		switch (modal) {
			case MODALS.SET_NAME:
				return <SetName
					setName={updateTitle}
					current={title}
				/>
			case MODALS.SET_VOTE_MODE:
				return <SetVoteMode
					setMode={updateVoteMode}
				/>;
			case MODALS.SET_ACCESS_KEY:
				return <SetAccessKey
					setAccessKey={updateAccessKey}
				/>
			case MODALS.EXPORT:
				return <Export
					data={{
						title,
						good,
						bad,
						actions
					}}
				/>
			default:
				return modal;
		}
	}

	switch(page) {
		case PAGES.ENTER_ACCESS_KEY:
			return <AccessKeyInput
				cache={cache}
				validKeySubmitted={() => setPage(PAGES.RETROSPECTIVE)}
			/>;
	}

	return (
		<main className={[
			error && 'error',
			`theme-${theme}`
		].filter(x => x).join(' ')}>
			<nav>
				<ul>
					<li onClick={() => setModal(MODALS.SET_NAME)}>{title ? 'Change' : 'Set'} name</li>
					<li onClick={() => setModal(MODALS.SET_VOTE_MODE)}>Set voting mode</li>
					<li onClick={share}>Share</li>
					<li onClick={() => setModal(MODALS.EXPORT)}>Export</li>
					<li onClick={() => toggleOpenedSubmenu(SUBMENUS.THEMES)}>Change theme
						{openedSubmenu === SUBMENUS.THEMES &&
						<ul className="submenu">
							<li onClick={() => updateTheme(THEMES.DARK)} title="Dark">Dark</li>
							<li onClick={() => updateTheme(THEMES.LIGHT)} title="Light">Light</li>
							<li onClick={() => updateTheme(THEMES.COLOURFUL)}
								title="Colourful">Colourful
							</li>
						</ul>
						}
					</li>
					<li onClick={() => setModal(MODALS.SET_ACCESS_KEY)}>Set access key</li>
				</ul>
			</nav>
			{!!title &&
				<h1>{title}</h1>}
			{!!error &&
				<p id="error">{error.message}</p>
			}
			<Retrospective
				good={good}
				setGood={setGood}
				bad={bad}
				setBad={setBad}
				actions={actions}
				setActions={setActions}
				setTitle={setTitle}
				voteMode={voteMode}
				setVoteMode={setVoteMode}
				websocketUrl={websocketUrl}
				setWebsocketUrl={setWebsocketUrl}
				setError={setError}
				cache={cache}
				getAuthHeaders={getAuthHeaders}
				setPage={setPage}
			/>
			{modal && <Overlay>
				<Modal
					closeable={true}
					closeModal={() => setModal(null)}
				>{populateModal()}</Modal>
			</Overlay>}
		</main>
	);
}

export default App;
