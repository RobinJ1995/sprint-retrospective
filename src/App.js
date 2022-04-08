import React, {useCallback, useEffect, useState} from 'react';
import './style/App.scss';
import {v4 as uuid} from 'uuid';
import {ToastProvider, useToasts} from 'react-toast-notifications';
import {VOTE_MODES, PATH_MAX_LENGTH, THEMES, HEADERS, PAGES, MODALS} from './constants';
import cache from './Cache';
import {checkHttpStatus, copyToClipboard, getAuthHeaders, httpCheckParse, httpPost, httpPut} from './utils';
import Retrospective from './Retrospective';
import AccessKeyInput from './page/AccessKeyInput';
import Home from './page/Home';
import Overlay from './Overlay';
import Modal from './Modal';
import ShareFallback from './modal/ShareFallback';
import SetVoteMode from './modal/SetVoteMode';
import SetName from './modal/SetName';
import SetAccessKey from './modal/SetAccessKey';
import Export from './modal/Export';
import SetTheme from './modal/SetTheme';
import RetrospectiveContext from './RetrospectiveContext';
import useCache, {useLocalStorage} from "./useCache";
import ForkMeOnGithub from 'fork-me-on-github';
import MDSpinner from "react-md-spinner";

const trimSlashes = str => str.replace(/^\//, '').replace(/\/$/, '');
const getRetroIdFromUrl = () => {
	const path = trimSlashes(String(window.location.pathname));
	if (!path || path.length > PATH_MAX_LENGTH) {
		return null;
	}

	return path;
};

const RETRO_ID = getRetroIdFromUrl() ?? null;

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:5432';
const API_BASE = `${apiEndpoint}/${RETRO_ID ?? ''}`;

const initialData = {
	title: null,
	good: [],
	bad: [],
	actions: [],
	voteMode: VOTE_MODES.UPVOTE,
	...cache.get(RETRO_ID)
};

try {
	cache.prune()
		.catch(ex => console.error('Failed to prune cache.', ex));
} catch (ex) {
	console.error('Failed to prune cache.', ex);
}

function App() {
	const [good, setGood] = useState(initialData.good);
	const [bad, setBad] = useState(initialData.bad);
	const [actions, setActions] = useState(initialData.actions);
	const [title, setTitle] = useState(initialData.title);
	const [voteMode, setVoteMode] = useState(initialData.voteMode);
	const [websocketUrl, setWebsocketUrl] = useState(null);
	const [error, setError] = useState(null);
	const [theme, setTheme] = useLocalStorage('theme', THEMES.DARK);
	const [page, setPage] = useState(PAGES.RETROSPECTIVE);
	const [modal, setModal] = useState(null);
	const [lastSetAccessKey, setLastSetAccessKey] = useState(null);
	const [adminKey, setAdminKey] = useCache('admin_key', null);
	const [advancedMode, setAdvancedMode] = useLocalStorage('advanced_mode', false);

	const { addToast } = useToasts();
	const showErrorToast = useCallback((error, autoDismiss = true) => {
		const message = (error instanceof Error && error?.message) ? error?.message : String(error);
		return addToast(message, {
			appearance: 'error',
			autoDismiss,
			autoDismissTimeout: 8_000
		})
	}, [addToast]);

	// Hidden dev methods
	useEffect(() => {
		window.hereBeDragons = (adminKey = null) => {
			if (adminKey) {
				setAdminKey(adminKey);
			}
			setAdvancedMode(true);
		};
		window.imAfraidOfTheDragonsPleaseMakeThemGoAway = () => {
			setAdminKey(null);
			setAdvancedMode(false);
		};
	}, [adminKey, setAdminKey, advancedMode, setAdvancedMode])

	const updateTitle = title => {
		httpPut(`${API_BASE}/title`, {title}, getAuthHeaders(RETRO_ID))
			.catch(alert);

		setTitle(title);
	};

	const updateVoteMode = voteMode => {
		httpPut(`${API_BASE}/voteMode`, {voteMode}, getAuthHeaders(RETRO_ID))
			.catch(alert);

		setVoteMode(voteMode);
	};

	const updateAccessKey = accessKey => {
		return httpPut(`${API_BASE}/accessKey`, {accessKey}, getAuthHeaders(RETRO_ID))
			.then(checkHttpStatus)
			.then(() => httpPost(`${API_BASE}/authenticate`, {
				accessKey
			}))
			.then(res => res.json())
			.then(res => {
				if (!res.token) {
					throw Error('Authentication failure');
				}

				setLastSetAccessKey(accessKey);
				return cache.set(`${RETRO_ID}:token`, res.token);
			})
			.catch(alert);
	};

	const updateTheme = theme => {
		setTheme(theme);
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
			case MODALS.SET_THEME:
				return <SetTheme
					setTheme={updateTheme}
					theme={theme}
				/>
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
				apiBaseUrl={API_BASE}
				retroId={RETRO_ID}
				cache={cache}
				validKeySubmitted={() => setPage(PAGES.RETROSPECTIVE)}
			/>;
		case PAGES.HOME:
			return <Home
				apiBaseUrl={API_BASE}
				cache={cache}
				showErrorToast={showErrorToast}
			/>;
	}

	if (RETRO_ID === null) {
		setPage(PAGES.HOME);
		return <MDSpinner />;
	}

	return (
		<RetrospectiveContext.Provider value={{
			apiBaseUrl: API_BASE,
			retroId: RETRO_ID,
			lastSetAccessKey,
			advancedMode,
			debugLogging: advancedMode,
			getAuthHeaders,
			showErrorToast
		}}>
			<main className={[
				error && 'error',
				`theme-${theme}`
			].filter(x => x).join(' ')}>
				<ForkMeOnGithub
					className="fork-me-on-github"
					colorBackground="#888"
					colorOctocat="#222"
					repo="https://github.com/RobinJ1995/sprint-retrospective/" />
				<nav>
					<ul>
						<li onClick={() => setModal(MODALS.SET_NAME)}>{title ? 'Change' : 'Set'} name</li>
						<li onClick={() => setModal(MODALS.SET_VOTE_MODE)}>Set voting mode</li>
						<li onClick={share}>Share</li>
						<li onClick={() => setModal(MODALS.EXPORT)}>Export</li>
						<li onClick={() => setModal(MODALS.SET_THEME)}>Change theme</li>
						<li onClick={() => setModal(MODALS.SET_ACCESS_KEY)}>Set access key</li>
						{advancedMode && adminKey &&
						<li onClick={() => fetch(`${API_BASE}/_actions`, {
							headers: getAuthHeaders(RETRO_ID)
						})
							.then(httpCheckParse)
							.then(logs => setModal(<pre>{JSON.stringify(logs, undefined, 4)}</pre>))}>Logs</li>}
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
		</RetrospectiveContext.Provider>
	);
}

export default App;
