import React, {useState} from 'react';
import {
	uniqueNamesGenerator,
	adjectives,
	animals
} from 'unique-names-generator';
import {
	KEY,
	RETRO_ACCESS_KEY_MAX_LENGTH,
	RETRO_ACCESS_KEY_MIN_LENGTH,
} from '../constants';
import ModalContext from '../ModalContext';
import Icon from '../Icon';

const generateRandom = () => uniqueNamesGenerator({
	dictionaries: [
		adjectives,
		animals
	],
	separator: ' ',
	style: 'lowerCase'
});

const MoreInformation = ({ setShow, show = false }) => (
	<div className="modal-set-access-key-more-info">
		<button
			type="button"
			className={`disclosure ${show ? 'open' : ''}`}
			aria-expanded={show}
			onClick={() => setShow(!show)}
		><Icon name="chevron" /> {show ? 'Collapse' : 'More information'}</button>
		{show && <div className="disclosure-body">
			<p>For retrospectives that do not have an access key set, a user's session token is valid for 2 minutes before it needs to be renewed. At this stage, if an access key has been set, the user will need to enter it in order to continue.</p>
			<p>Once a user has authenticated to a retrospective with an access key, their session token remains valid for 20 days. After this, they will not need to enter one for the next 20 days, regardless of whether the retrospective's access key has changed in the meantime.</p>
		</div>}
	</div>
);

const SetAccessKey = ({ setAccessKey }) => {
	const [text, setText] = useState('');
	const [moreInfo, setMoreInfo] = useState(false);

	return (<div className="modal-set-access-key">
		<ModalContext.Consumer>
			{({ closeModal }) => [
				<p>An access key allows you to prevent this retrospective from being viewed/edited by anyone who does not have the access key for it.</p>,
				<p>Once you set or change an access key on a retrospective, any new participant will need to enter the key in order to continue.<br />
				If a user already had the retrospective opened before the key was set/changed, they will continue to have access to the retrospective until their <em title="JWT token">session</em> expires.</p>,
				<MoreInformation
					show={moreInfo}
					setShow={setMoreInfo}
				/>,
				<p>Once an access key is set on a retrospective, it can be changed but it can not be removed.</p>,
				<form
					onSubmit={() => {
						setAccessKey(text);
						closeModal();
					}}
				>
					<label>
						<span className="field-label">Set an access key for this retrospective:</span>
						<input
							className="input"
							type="text"
							value={text}
							minLength={RETRO_ACCESS_KEY_MIN_LENGTH}
							maxLength={RETRO_ACCESS_KEY_MAX_LENGTH}
							required
							onChange={e => setText(e.target.value)}
							onKeyUp={e => e.key === KEY.ESCAPE && closeModal()}
						/>
					</label>
					<p className="access-key-generate">Or <button
						type="button"
						className="button link"
						onClick={() => setText(generateRandom)}
					>click here</button> to generate a random access key.</p>
					<div className="modal-actions">
						<button className="button primary">Set access key</button>
					</div>
				</form>]}
		</ModalContext.Consumer>
	</div>);
}

export default SetAccessKey;
