import React, { useState, useRef, useEffect } from 'react';
import useInterval from 'use-interval';
import { useToasts } from 'react-toast-notifications';
import { v4 as uuid } from 'uuid';
import List from './List';
import {PAGES, WS_ACTIONS} from './constants';
import {checkHttpStatus, httpDelete, httpPatch, httpPost} from './utils';

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
	const [ autorefresh, setAutorefresh ] = useState(true);
	const [ autorefreshInterval, setAutorefreshInterval] = useState(1000);

	const websocket = useRef(null);

	const { addToast } = useToasts();

	const addGood = text => {
		return httpPost(`${window.API_BASE}/good`, {text}, getAuthHeaders())
			.then(checkHttpStatus);
	};
	const addBad = text => {
		return httpPost(`${window.API_BASE}/bad`, {text}, getAuthHeaders())
			.then(checkHttpStatus);
	};
	const addAction = text => {
		return httpPost(`${window.API_BASE}/action`, {text}, getAuthHeaders())
			.then(checkHttpStatus);
	};

	const upvoteItem = (id, type) => {
		httpPost(`${window.API_BASE}/${type}/${id}/up`, {}, getAuthHeaders())
			.then(checkHttpStatus)
			.catch(alert);
	};
	const downvoteItem = (id, type) => {
		httpPost(`${window.API_BASE}/${type}/${id}/down`, {}, getAuthHeaders())
			.then(checkHttpStatus)
			.catch(alert);
	};

	const updateItemText = (type, id, text) => httpPatch(`${window.API_BASE}/${type}/${id}`,
		{text},
		getAuthHeaders())
		.then(checkHttpStatus);

	const deleteItem = (type, id) => httpDelete(`${window.API_BASE}/${type}/${id}`,
		getAuthHeaders())
		.then(checkHttpStatus)
		.catch(alert);

	const authRequired = () => {
		setAutorefresh(false);

		return httpPost(`${window.API_BASE}/authenticate`, {})
			.then(res => res.json())
			.then(res => {
				if (res.token) {
					return cache.set(`${window.RETRO_ID}:token`, res.token);
				}

				return setPage(PAGES.ENTER_ACCESS_KEY);
			})
	};

	const refreshState = () => fetch(window.API_BASE, { headers: getAuthHeaders() })
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

	const wsSend = message => {
		console.log(`<< ${message}`);
		websocket.current.send(message);
	}

	const wsHandle = message => {
		console.log(`>> ${message.data}`);

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
		} else if (message.data.startsWith('#')) {
			const text = message.data.substr(1).trim();

			addToast(text, {
				appearance: 'info',
				autoDismiss: true,
			});
		}

		try {
			const parsed = JSON.parse(message.data);
			const {
				retro,
				action,
				item,
				value
			} = parsed;

			if (window.RETRO_ID !== retro) {
				console.error('Received a message for the wrong retrospective.');
				return;
			}
		} catch (ex) {
			console.error('Invalid message.', {
				'message': message.data,
				'error': ex
			});
		}

		refreshState();
	};

	useInterval(() => {
		if (!autorefresh) {
			return;
		}

		refreshState().then(
			() => setAutorefresh(true));
	}, autorefreshInterval);

	useInterval(() => {
		if (!websocketUrl || !websocket.current || websocket.current.readyState !== WebSocket.OPEN) {
			return;
		}

		wsSend(`PING ${uuid()}`);
	}, 8000);

	useEffect(() => {
		if (!websocketUrl) {
			return;
		}

		websocket.current = new WebSocket(websocketUrl);
		websocket.current.onmessage = wsHandle;
		websocket.current.onclose = () => {
			console.log('Websocket connection closed.');
			setWebsocketUrl(null); // It'll get populated again on the next poll.
			websocket.current = null;

			setAutorefresh(true);
			setAutorefreshInterval(1000);
		}

		return () => {
			if (!websocket.current) {
				return;
			}
			websocket.current.close();
		};
	}, [websocketUrl, setWebsocketUrl]);

	return <article>
		<section id="good">
			<h2>What went well <span className="emoji" role="img" aria-label="">🤩</span></h2>
			<List
				items={good}
				addItem={addGood}
				voteMode={voteMode}
				upvoteItem={id => upvoteItem(id, 'good')}
				downvoteItem={id => downvoteItem(id, 'good')}
				updateItemText={(id, text) => updateItemText('good', id, text)}
				deleteItem={id => deleteItem('good', id)}
			/>
		</section>
		<section id="bad">
			<h2>What could we improve <span className="emoji" role="img" aria-label="">🤨</span></h2>
			<List
				items={bad}
				addItem={addBad}
				voteMode={voteMode}
				upvoteItem={id => upvoteItem(id, 'bad')}
				downvoteItem={id => downvoteItem(id, 'bad')}
				updateItemText={(id, text) => updateItemText('bad', id, text)}
				deleteItem={id => deleteItem('bad', id)}
			/>
		</section>
		<section id="actions">
			<h2>Actions for next sprint <span className="emoji" role="img" aria-label="">☑️</span></h2>
			<List
				items={actions}
				addItem={addAction}
				voteMode={voteMode}
				upvoteItem={id => upvoteItem(id, 'action')}
				downvoteItem={id => downvoteItem(id, 'action')}
				updateItemText={(id, text) => updateItemText('action', id, text)}
				deleteItem={id => deleteItem('action', id)}
			/>
		</section>
	</article>;
};

export default Retrospective;
