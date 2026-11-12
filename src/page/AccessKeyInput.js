import React, { useState } from 'react';
import {httpPost} from '../utils';
import Brand from '../Brand';
import Icon from '../Icon';


const AccessKeyInput = ({
						   cache,
						   validKeySubmitted,
						   retroId,
						   apiBaseUrl
					   }) => {
	const [ text, setText ] = useState('');
	const [ error, setError ] = useState(null);

	const tryAuthenticate = accessKey => httpPost(`${apiBaseUrl}/authenticate`, {
		accessKey
	})
		.then(res => res.json())
		.then(res => {
			if (res.token) {
				return cache.set(`${retroId}:token`, res.token);
			} else if (res.message) {
				throw Error(res.message);
			}
    
			throw Error('Authentication failed');
		})
		.then(() => validKeySubmitted())
		.catch(setError);

	return (<>
		<header className="app-bar"><Brand /></header>
		<main id="access-key-page">
		<form
			id="accessKeyInput"
			onSubmit={e => {
				e.preventDefault();
				tryAuthenticate(text);
			}}
		>
		<div className="lock"><Icon name="lock" /></div>
		<h2>Access key required</h2>
		<p>This retrospective requires an access key in order to view/collaborate on.</p>

		{!!error &&
			<p id="access-key-error">{error.message}</p>
		}

		<label>
			<span className="field-label">Enter access key:</span>
			<input
				className="input"
				type="text"
				autoFocus
				minLength="3"
				required
				text={text}
				onChange={e => setText(e.target.value)} />
		</label>

		<button className="button primary">Submit</button>
	</form>
		</main>
	</>);
};

export default AccessKeyInput;
