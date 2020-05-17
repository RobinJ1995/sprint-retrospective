import React, { useState } from 'react';
import {checkHttpStatus, httpDelete, httpPatch, httpPost} from './utils';


const AccessKeyInput = ({
                           cache,
                           validKeySubmitted,
					   }) => {
    const [ text, setText ] = useState('');
    const [ error, setError ] = useState(null);

    const tryAuthenticate = accessKey => httpPost(`${window.API_BASE}/authenticate`, {
        accessKey
    })
        .then(res => res.json())
        .then(res => {
            if (res.token) {
                return cache.set(`${window.RETRO_ID}:token`, res.token);
            } else if (res.message) {
                throw Error(res.message);
            }
    
            throw Error('Authentication failed');
        })
        .then(() => validKeySubmitted())
        .catch(setError);

    return (<form
            id="accessKeyInput"
            onSubmit={e => {
                e.preventDefault();
                tryAuthenticate(text);
            }}
        >
        <p>This retrospective requires an access key in order to view/collaborate on.</p>

        {!!error &&
			<p id="access-key-error">{error.message}</p>
        }

        <label>Enter access key:
            <input
                type="text"
                minLength="3"
                required
                text={text}
                onChange={e => setText(e.target.value)} />
        </label>

        <p>
            <button>Submit</button>
        </p>
    </form>);
};

export default AccessKeyInput;
