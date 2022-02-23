import React, {useState, useRef, useEffect, useContext, useCallback} from 'react';
import useInterval from 'use-interval';
import { useToasts } from 'react-toast-notifications';
import { v4 as uuid } from 'uuid';
import List from './List';
import {PAGES, SECTIONS, WS_ACTIONS} from './constants';
import {checkHttpStatus, httpCheckParse, httpDelete, httpPatch, httpPost, repeat} from './utils';
import RetrospectiveContext from "./RetrospectiveContext";
import RetrospectiveSection from "./type/RetrospectiveSection";
import useCache from "./useCache";

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
	const { apiBaseUrl, retroId, lastSetAccessKey, advancedMode } = useContext(RetrospectiveContext);
	
	const [autorefresh, setAutorefresh] = useState(true);
	const [autorefreshInterval, setAutorefreshInterval] = useState(1000);
	const [nParticipants, setNParticipants] = useState(null);
	const [participantAvatars, setParticipantAvatars] = useState([]);
	const [latency, setLatency] = useState<number | null>(null);
	const [myVotes, setMyVotes] = useCache(`${retroId}:votes`, []);

	const websocket = useRef(null);
	const isWebsocketConnected = () : boolean => websocketUrl && websocket.current && websocket.current.readyState === WebSocket.OPEN;
	const disconnectWebsocket = useCallback(() => {
		websocket.current.close();
		websocket.current = null;
	}, [websocket]);

	const { addToast } = useToasts();

	const addGood = (text: string) => {
		return httpPost(`${apiBaseUrl}/good`, {text}, getAuthHeaders())
			.then(checkHttpStatus);
	};
	const addBad = (text: string) => {
		return httpPost(`${apiBaseUrl}/bad`, {text}, getAuthHeaders())
			.then(checkHttpStatus);
	};
	const addAction = (text: string) => {
		return httpPost(`${apiBaseUrl}/action`, {text}, getAuthHeaders())
			.then(checkHttpStatus);
	};

	const upvoteItem = (id: string, type: RetrospectiveSection) => {
		httpPost(`${apiBaseUrl}/${type}/${id}/up`, {}, getAuthHeaders())
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
		httpPost(`${apiBaseUrl}/${type}/${id}/down`, {}, getAuthHeaders())
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
			getAuthHeaders())
		.then(checkHttpStatus);

	const deleteItem = (type: RetrospectiveSection, id: string) =>
		httpDelete(`${apiBaseUrl}/${type}/${id}`,
			getAuthHeaders())
		.then(checkHttpStatus)
		.catch(alert);

	const authRequired = () => {
		setAutorefresh(false);

		return httpPost(`${apiBaseUrl}/authenticate`, {})
			.then(res => res.json())
			.then(res => {
				if (res.token) {
					return cache.set(`${retroId}:token`, res.token);
				}

				return setPage(PAGES.ENTER_ACCESS_KEY);
			})
	};

	const refreshState = () => fetch(apiBaseUrl, { headers: getAuthHeaders() })
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
		.catch(setError);

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
			} else if (message.data.startsWith('#')) {
				if (!advancedMode) {
					return;
				}

				const nodeName = message.data.substr(1).trim();

				addToast(`Connected to: ${nodeName}`, {
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
	}, [addToast, refreshState, retroId, wsSend]);

	useInterval(() => {
		if (!autorefresh) {
			return;
		}

		refreshState().then(
			() => setAutorefresh(true));
	}, autorefreshInterval);

	useInterval(() => {
		if (!isWebsocketConnected()) {
			return;
		}

		wsSend(`PING ${uuid()}`);
	}, 8000);

	useEffect(() => {
		if (!websocketUrl) {
			// There is no websocket URL to connect to.
			return;
		} else if (isWebsocketConnected()) {
			// Still connected to an active/open websocket.
			return;
		}

		const socket = new WebSocket(websocketUrl);
		socket.onmessage = wsHandle;
		socket.onclose = () => {
			console.log('Websocket connection closed.');
			setWebsocketUrl(null); // It'll get populated again on the next poll.

			setAutorefresh(true);
			setAutorefreshInterval(1000);
		};
		websocket.current = socket;

		return () => {
			if (!websocket.current) {
				return;
			} else if (!isWebsocketConnected()) {
				disconnectWebsocket();
			}
		};
	}, [websocketUrl, setWebsocketUrl, wsHandle]);

	return <article>
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
			/>
		</section>
		{nParticipants &&
			<div id="stats-n-participants">
				<span>{participantAvatars.map(avatar => <span role="img">{avatar}</span>)}</span>
				{advancedMode && latency &&
					<span className={`latency ${latency > 100 ? 'bad' : ''}`}>{latency}ms</span>}
			</div>}
	</article>;
};

export default Retrospective;
