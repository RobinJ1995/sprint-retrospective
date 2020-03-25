import React, { useState } from 'react';
import useInterval from 'use-interval';
import List from './List';
import {checkHttpStatus, httpDelete, httpPatch, httpPost} from './utils';

const Retrospective = ({
						   good, setGood,
						   bad, setBad,
						   actions, setActions,
						   setTitle,
						   voteMode, setVoteMode,
						   setError,
						   cache,
						   getAuthHeaders
					   }) => {
	const [ autorefresh, setAutorefresh ] = useState(true);

	const addGood = text => {
		return httpPost(`${window.API_BASE}/good`, {text}, getAuthHeaders())
			.then(checkHttpStatus)
			.then(() => setGood([...good, {text}]));
	};
	const addBad = text => {
		return httpPost(`${window.API_BASE}/bad`, {text}, getAuthHeaders())
			.then(checkHttpStatus)
			.then(() => setBad([...bad, {text}]));
	};
	const addAction = text => {
		return httpPost(`${window.API_BASE}/action`, {text}, getAuthHeaders())
			.then(checkHttpStatus)
			.then(() => setActions([...actions, {text}]));
	};

	const upvoteItem = (id, type, setter, list) => {
		httpPost(`${window.API_BASE}/${type}/${id}/up`, null, getAuthHeaders())
			.catch(alert);

		setter(list.map(item => ({
			...item,
			up: item.up + (item.id === id ? 1 : 0)
		})));
	};
	const downvoteItem = (id, type, setter, list) => {
		httpPost(`${window.API_BASE}/${type}/${id}/down`, null, getAuthHeaders())
			.catch(alert);

		setter(list.map(item => ({
			...item,
			down: item.down + (item.id === id ? 1 : 0)
		})));
	};

	const updateItemText = (type, id, text) => httpPatch(`${window.API_BASE}/${type}/${id}`,
		{text},
		getAuthHeaders());

	const deleteItem = (type, id) => httpDelete(`${window.API_BASE}/${type}/${id}`,
		getAuthHeaders())
		.catch(alert);

	const authRequired = () => {
		setAutorefresh(false);

		return httpPost(`${window.API_BASE}/authenticate`, {})
			.then(res => res.json())
			.then(res => {
				if (res.token) {
					return cache.set(`${window.RETRO_ID}:token`, res.token);
				}

				return httpPost(`${window.API_BASE}/authenticate`, {
					accessKey: window.prompt('This retrospective requires an access key.')
				})
					.then(res => res.json())
					.then(res => {
						if (res.token) {
							return cache.set(`${window.RETRO_ID}:token`, res.token);
						} else if (res.message) {
							window.alert(res.message);
							throw Error(res.message);
						}

						throw Error('Authentication failed');
					});
			})
	};

	useInterval(() => {
		if (!autorefresh) {
			return;
		}

		fetch(window.API_BASE, { headers: getAuthHeaders() })
			.catch(ex => {
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
					.then(({id, good, bad, actions, title, voteMode}) => {
						setGood(good);
						setBad(bad);
						setActions(actions);
						setTitle(title);
						setVoteMode(voteMode);
						setError(null);

						if (id) {
							cache.setIfModified(id, {id, good, bad, actions, title, voteMode})
								.catch(console.error);
						}
					});
			})
			.catch(setError)
			.then(() => setAutorefresh(true));
	}, 1000);

	return <article>
		<section id="good">
			<h2>What went well 🤩</h2>
			<List
				items={good}
				addItem={addGood}
				voteMode={voteMode}
				upvoteItem={id => upvoteItem(id, 'good', setGood, good)}
				downvoteItem={id => downvoteItem(id, 'good', setGood, good)}
				updateItemText={(id, text) => updateItemText('good', id, text)}
				deleteItem={id => deleteItem('good', id)}
			/>
		</section>
		<section id="bad">
			<h2>What could we improve 🤨</h2>
			<List
				items={bad}
				addItem={addBad}
				voteMode={voteMode}
				upvoteItem={id => upvoteItem(id, 'bad', setBad, bad)}
				downvoteItem={id => downvoteItem(id, 'bad', setBad, bad)}
				updateItemText={(id, text) => updateItemText('bad', id, text)}
				deleteItem={id => deleteItem('bad', id)}
			/>
		</section>
		<section id="actions">
			<h2>Actions for next sprint ☑️</h2>
			<List
				items={actions}
				addItem={addAction}
				voteMode={voteMode}
				upvoteItem={id => upvoteItem(id, 'action', setActions, actions)}
				downvoteItem={id => downvoteItem(id, 'action', setActions, actions)}
				updateItemText={(id, text) => updateItemText('action', id, text)}
				deleteItem={id => deleteItem('action', id)}
			/>
		</section>
	</article>;
};

export default Retrospective;
