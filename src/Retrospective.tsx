import React, {useState, useRef, useEffect, useContext, useCallback, useMemo} from 'react';
import useInterval from './useInterval';
import { useToasts } from 'react-toast-notifications';
import { v4 as uuid } from 'uuid';
import List from './List';
import {PAGES, SECTIONS, SECTIONS_MAP_PLURALISED, WS_ACTIONS} from './constants';
import {checkHttpStatus, httpCheckParse, httpDelete, httpPatch, httpPost, repeat} from './utils';
import RetrospectiveContext from "./RetrospectiveContext";
import RetrospectiveSection from "./type/RetrospectiveSection";
import useCache from "./useCache";
import sentence from '@fakerjs/sentence';
import WebsocketContext from "./WebsocketContext";
import Avatar from "./Avatar";

const Retrospective = ({
						good, setGood,
						bad, setBad,
						actions, setActions,
						setTitle,
						voteMode, setVoteMode,
						websocketUrl, setWebsocketUrl,
						setError,
						cache,
						getAuthHeaders,
						setPage,
					   }) => {
	const {
		apiBaseUrl,
		retroId,
		lastSetAccessKey,
		advancedMode,
		debugLogging,
		showErrorToast
	} = useContext(RetrospectiveContext);
	
	const [autorefresh, setAutorefresh] = useState(true);
	const [autorefreshInterval, setAutorefreshInterval] = useState(1000);
	const [nParticipants, setNParticipants] = useState(null);
	const [participantAvatars, setParticipantAvatars] = useState([]);
	const [latency, setLatency] = useState<number | null>(null);
	const [lastPingSentTimestamp, setLastPingSentTimestamp] = useState<number | null>(null);
	const [myVotes, setMyVotes] = useCache(`${retroId}:votes`, []);
	const [participantsTypingIn, setParticipantsTypingIn] = useState([]); // Which fields which participants are currently typing in.

	const websocket = useRef(null);
	const isWebsocketConnected = useCallback(() : boolean => websocketUrl && websocket.current && websocket.current.readyState === WebSocket.OPEN, [websocket, websocketUrl]);
	const disconnectWebsocket = useCallback(() => {
		try {
			websocket.current.close();
			websocket.current = null;
		} catch {}

		try {
			websocket.current.onmessage = null;
			websocket.current.onclose = null;
		} catch (ex) {}
	}, [websocket]);

	const { addToast } = useToasts();

	const addGood = (text: string) => {
		return httpPost(`${apiBaseUrl}/good`, {text}, getAuthHeaders(retroId))
			.then(checkHttpStatus);
	};
	const addBad = (text: string) => {
		return httpPost(`${apiBaseUrl}/bad`, {text}, getAuthHeaders(retroId))
			.then(checkHttpStatus);
	};
	const addAction = (text: string) => {
		return httpPost(`${apiBaseUrl}/action`, {text}, getAuthHeaders(retroId))
			.then(checkHttpStatus);
	};

	const upvoteItem = (id: string, type: RetrospectiveSection) => {
		httpPost(`${apiBaseUrl}/${type}/${id}/up`, {}, getAuthHeaders(retroId))
			.then(httpCheckParse)
			.then(res => {
				if (res.actionId) {
					setMyVotes([
						...myVotes,
						{
							type,
							itemId: id,
							up: true
						}
					])
				}
			})
			.catch(alert);
	};
	const downvoteItem = (id: string, type: RetrospectiveSection) => {
		httpPost(`${apiBaseUrl}/${type}/${id}/down`, {}, getAuthHeaders(retroId))
			.then(httpCheckParse)
			.then(res => {
				if (res.actionId) {
					setMyVotes([
						...myVotes,
						{
							type,
							itemId: id,
							up: false
						}
					])
				}
			})
			.catch(alert);
	};

	const updateItemText = (type: RetrospectiveSection, id: string, text: string) =>
		httpPatch(`${apiBaseUrl}/${type}/${id}`,
			{text},
			getAuthHeaders(retroId))
		.then(checkHttpStatus)
		.catch(err => showErrorToast(`Failed to update item: ${err?.message}`));

	const deleteItem = (type: RetrospectiveSection, id: string) =>
		httpDelete(`${apiBaseUrl}/${type}/${id}`,
			getAuthHeaders(retroId))
		.then(checkHttpStatus)
		.catch(err => showErrorToast(`Failed to delete item: ${err?.message}`));

	const authRequired = useCallback(() => {
		setAutorefresh(false);

		return httpPost(`${apiBaseUrl}/authenticate`, {})
			.then(res => res.json())
			.then(res => {
				if (res.token) {
					return cache.set(`${retroId}:token`, res.token);
				}

				return setPage(PAGES.ENTER_ACCESS_KEY);
			})
	}, [apiBaseUrl, setPage]);

	const refreshState = useCallback(() => fetch(apiBaseUrl, { headers: getAuthHeaders(retroId) })
		.catch(() => {
			throw Error('Failed to retrieve retrospective.');
		})
		.then(res => {
			if (![200, 201, 204].includes(res.status)) {
				return res.json()
					.then(body => {
						if (body.key) {
							switch (body.key) {
								case 'AUTH_REQUIRED':
									return authRequired();
								case 'INVALID_AUTH':
									return authRequired();
							}
						}

						if (body.message) {
							return setError(new Error(body.message));
						}

						return setError(`${res.status} ${res.statusText}`);
					});
			}

			return res.json()
				.then(({id, good, bad, actions, title, voteMode, socket}) => {
					setGood(good);
					setBad(bad);
					setActions(actions);
					setTitle(title);
					setVoteMode(voteMode);
					setWebsocketUrl(socket);
					setError(null);

					if (id) {
						cache.setIfModified(id, {id, good, bad, actions, title, voteMode})
							.catch(console.error);
					}
				});
		})
		.catch(setError),
		[apiBaseUrl, getAuthHeaders, authRequired, setGood, setBad, setActions, setTitle, setVoteMode,
			setWebsocketUrl, setError, setError]);

	// Hidden dev methods
	useEffect(() => {
		(window as any).wipeThisEntireRetroIOnlyUsedItForTestingPurposes = async (fast: boolean = false) => {
			if (window.confirm('Are you sure you want to wipe out this entire retrospective?')) {
				try {
					const functionsThatReturnPromises: (() => Promise<any>)[] = [
						...good.map(item => [SECTIONS.GOOD, item.id]),
						...bad.map(item => [SECTIONS.BAD, item.id]),
						...actions.map(item => [SECTIONS.ACTION, item.id])
					].map(([section, id]) => () => deleteItem(section, id));

					if (fast) {
						// All in parallel
						await Promise.all(functionsThatReturnPromises.map(func => func()));
					} else {
						// One at a time
						for (const func of functionsThatReturnPromises) {
							await func();
						}
					}

					return await refreshState();
				} catch (err) {
					showErrorToast(err);
				}
			}
		};

		(window as any).fillUpThisRetroWithRandomCrap = async (nGood: number | undefined = undefined,
															   nBad: number | undefined = undefined,
															   nActions: number | undefined = undefined,
															   fast: boolean = false) => {
			nGood = nGood ?? Math.ceil(Math.random() * 50);
			nBad = nBad ?? Math.ceil(Math.random() * 50);
			nActions = nActions ?? Math.ceil(Math.random() * 50);
			const nTotal = nGood + nBad + nActions;

			if (window.confirm(`Are you sure you want to fill up this retro with ${nTotal} random items?`)) {
				try {
					const functionsThatReturnPromises: (() => Promise<any>)[] = [
						...Array(nGood).fill(true).map(() => sentence()).map(x => () => addGood(x)),
						...Array(nBad).fill(true).map(() => sentence()).map(x => () => addBad(x)),
						...Array(nActions).fill(true).map(() => sentence()).map(x => () => addAction(x))
					];

					if (fast) {
						// All in parallel
						await Promise.all(functionsThatReturnPromises.map(func => func()));
					} else {
						// One at a time
						for (const func of functionsThatReturnPromises) {
							await func();
						}
					}

					return await refreshState();
				} catch (err) {
					showErrorToast(err);
				}
			}
		}
	}, [good, bad, actions, addGood, addBad, addAction, deleteItem, refreshState]);

	const wsSend = useCallback(message => {
		if (!websocket.current) {
			console.error('There is currently no websocket. Failed to send message.', { message });
			return;
		}

		console.log(`👨‍💻 ${message}`);
		websocket.current.send(message);
	}, [websocket]);

	const wsHandle = useCallback(message => {
		try {
			console.log(`💌 ${message.data}`);

			if (message.data === '👋') {
				// Connection established. Switch to relying on the websocket instead of polling.
				setAutorefreshInterval(10000);
				return;
			} else if (message.data.toLowerCase().startsWith('ping ')) {
				const pongValue = message.data.replace(/^ping\s+/i, '');
				wsSend(`PONG ${pongValue}`);
				return;
			} else if (message.data.toLowerCase().startsWith('pong ')) {
				if (lastPingSentTimestamp) {
					const latency = new Date().getTime() - lastPingSentTimestamp;
					setLatency(latency);
				}
				return;
			} else if (message.data.toLowerCase().startsWith('connected_to ')) {
				if (!advancedMode) {
					return;
				}

				const nodeName = message.data.replace(/^connected_to\s+/i, '');
				
				addToast(`Connected to: ${nodeName}`, {
					appearance: 'info',
					autoDismiss: true,
				});
				return;
			} else if (message.data.toLowerCase().startsWith('participants ')) {
				const n = parseInt(message.data.replace(/^participants\s+/i, ''));
				setNParticipants(n);
				return;
			} else if (message.data.toLowerCase().startsWith('avatars ')) {
				const avatarsStr = message.data.replace(/^avatars\s+/i, '');
				const avatars = avatarsStr.split(',');
				setParticipantAvatars(avatars);
				return;
			} else if (message.data.toLowerCase().startsWith('latency ')) {
				const x = parseInt(message.data.replace(/^latency\s+/i, ''));
				setLatency(x);
				return;
			} else if (message.data.toLowerCase().startsWith('typing ')) {
				const args : string[] = message.data.replace(/\n/, '')
					.split(/\s+/);
				if (args.length != 4) {
					console.warn(`Got TYPING message but ${args.length} arguments instead of the expected 4.`, { message });
					return;
				}

				const who = String(args[1]).toLowerCase();
				const what = String(args[2]).toLowerCase();
				const where = String(args[3]).toLowerCase();

				if (['start', 'still'].includes(what)) {
					setParticipantsTypingIn([...participantsTypingIn, {who, where}]);
				} else if (what === 'stop') {
					setParticipantsTypingIn(participantsTypingIn.filter(x => !(x.where === where && x.who === who)));
				}

				return;
			} else if (message.data.startsWith('#')) {
				if (!advancedMode) {
					return;
				}

				const websocketMessage = message.data.substr(1).trim();

				addToast(websocketMessage, {
					appearance: 'info',
					autoDismiss: true,
				});
				return;
			}

			try {
				const parsed = JSON.parse(message.data);
				const {
					retro,
					action,
					item,
					value
				} = parsed;

				if (retroId !== retro) {
					console.error('Received a message for the wrong retrospective.');
					return;
				}

				if (parsed?.action === 'set_access_key') {
					/*
					 * Try authenticate with the access key that is in cache.
					 * If it succeeds, we're the ones that set the access key.
					 * If it doesn't, disconnect.
					 */
					httpPost(`${apiBaseUrl}/authenticate`, {
						accessKey: lastSetAccessKey
					})
						.then(checkHttpStatus)
						.catch(() => {
							disconnectWebsocket();
							setWebsocketUrl(null);
							cache.remove(retroId);
							cache.remove(`${retroId}:token`);
						});
				}
			} catch (ex) {
				console.error('Invalid message.', {
					'message': message.data,
					'error': ex
				});
			}

			refreshState();
		} catch (err) {
			console.error('Failed to handle websocket message.', {
				'message': message?.data,
				'error': err
			});
		}
	}, [addToast, refreshState, retroId, wsSend, lastPingSentTimestamp, setLastPingSentTimestamp, setLatency,
		setAutorefreshInterval]);

	useInterval(() => {
		if (!autorefresh) {
			return;
		}

		refreshState().then(
			() => setAutorefresh(true));
	}, autorefreshInterval, false, [refreshState, autorefresh, setAutorefresh, autorefreshInterval]);

	useInterval(() => {
		if (!isWebsocketConnected()) {
			disconnectWebsocket();
			setParticipantsTypingIn([]);
			setLatency(null);
			setNParticipants(null);
			setParticipantAvatars([]);
			setAutorefreshInterval(1000);
			return;
		}

		setLastPingSentTimestamp(new Date().getTime());
		wsSend(`PING ${uuid()}`);
	}, advancedMode ? 2000 : 8000, false, [
		setLastPingSentTimestamp, advancedMode, setParticipantsTypingIn, setLatency, setNParticipants,
		setParticipantAvatars, setAutorefreshInterval]);

	// When websocket URL changes, disconnect and connect to it.
	useEffect(() => {
		if (!websocketUrl) {
			// There is no websocket URL to connect to.
			return;
		} else if (isWebsocketConnected()) {
			// Still connected to an active/open websocket.
			// One of wsHandle's dependencies probably just changed...
			return;
		}

		console.info(`🌐 Connecting to ${websocketUrl}...`);
		const socket = new WebSocket(websocketUrl);
		websocket.current = socket;

		websocket.current.onmessage = wsHandle;
		websocket.current.onclose = () => {
			console.log('Websocket connection closed.');
			setWebsocketUrl(null); // It'll get populated again on the next poll.

			setAutorefresh(true);
			setAutorefreshInterval(1000);
		};

		return () => {
			if (!websocket.current) {
				return;
			} else if (!isWebsocketConnected()) {
				if (debugLogging) {
					console.debug('Disconnecting from websocket...', {websocketUrl});
				}
				disconnectWebsocket();
			}
		};
	}, [websocketUrl, setWebsocketUrl, isWebsocketConnected, disconnectWebsocket, wsHandle,
		setAutorefresh, setAutorefreshInterval]);

	return <article>
		<WebsocketContext.Provider
			value={{ wsSend }}>
			<section id="good">
				<h2>What went well <span className="emoji" role="img" aria-label="">🤩</span></h2>
				<List
					section={SECTIONS.GOOD}
					items={good}
					addItem={addGood}
					voteMode={voteMode}
					myVotes={myVotes}
					upvoteItem={id => upvoteItem(id, 'good')}
					downvoteItem={id => downvoteItem(id, 'good')}
					updateItemText={(id, text) => updateItemText('good', id, text)}
					deleteItem={id => deleteItem('good', id)}
					participantTypingNewItem={participantsTypingIn.map(x => x.where).includes(SECTIONS_MAP_PLURALISED[SECTIONS.GOOD])}
				/>
			</section>
			<section id="bad">
				<h2>What could we improve <span className="emoji" role="img" aria-label="">🤨</span></h2>
				<List
					section={SECTIONS.BAD}
					items={bad}
					addItem={addBad}
					voteMode={voteMode}
					myVotes={myVotes}
					upvoteItem={id => upvoteItem(id, 'bad')}
					downvoteItem={id => downvoteItem(id, 'bad')}
					updateItemText={(id, text) => updateItemText('bad', id, text)}
					deleteItem={id => deleteItem('bad', id)}
					participantTypingNewItem={participantsTypingIn.map(x => x.where).includes(SECTIONS_MAP_PLURALISED[SECTIONS.BAD])}
				/>
			</section>
			<section id="actions">
				<h2>Actions for next sprint <span className="emoji" role="img" aria-label="">☑️</span></h2>
				<List
					section={SECTIONS.ACTION}
					items={actions}
					addItem={addAction}
					voteMode={voteMode}
					myVotes={myVotes}
					upvoteItem={id => upvoteItem(id, 'action')}
					downvoteItem={id => downvoteItem(id, 'action')}
					updateItemText={(id, text) => updateItemText('action', id, text)}
					deleteItem={id => deleteItem('action', id)}
					participantTypingNewItem={participantsTypingIn.map(x => x.where).includes(SECTIONS_MAP_PLURALISED[SECTIONS.ACTION])}
				/>
			</section>
			{nParticipants &&
				<div id="stats-n-participants">
					<span>{participantAvatars.map(avatar => <Avatar emoji={avatar} location={participantsTypingIn.find(x => x.who === avatar)?.where} />)}</span>
					{advancedMode && latency &&
						<span className={`latency ${latency > 100 ? 'bad' : ''}`}>{latency}ms</span>}
				</div>}
		</WebsocketContext.Provider>
	</article>;
};

export default Retrospective;
