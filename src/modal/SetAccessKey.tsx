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
		{show
			? <p onClick={() => setShow(false)}><span role="img" aria-label="Arrow down">⬇️</span> <strong>Collapse</strong></p>
			: <p onClick={() => setShow(true)}><span role="img" aria-label="Arrow right">➡️</span> <strong>More information</strong></p>}
		{show && [
			<p>For retrospectives that do not have an access key set, a user's session token is valid for 2 minutes before it needs to be renewed. At this stage, if an access key has been set, the user will need to enter it in order to continue.</p>,
			<p>Once a user has authenticated to a retrospective with an access key, their session token remains valid for 20 days. After this, they will not need to enter one for the next 20 days, regardless of whether the retrospective's access key has changed in the meantime.</p>
		]}
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
				<p>Set an access key for this retrospective:</p>,
				<form
					onSubmit={() => {
						setAccessKey(text);
						closeModal();
					}}
				>
					<p>
						<input
							type="text"
							value={text}
							minLength={RETRO_ACCESS_KEY_MIN_LENGTH}
							maxLength={RETRO_ACCESS_KEY_MAX_LENGTH}
							required
							onChange={e => setText(e.target.value)}
							onKeyUp={e => e.key === KEY.ESCAPE && closeModal()}
						/>
						<p
							className="access-key-generate"
							onClick={() => setText(generateRandom)}
						>Or <em>click here</em> to generate a random access key.</p>
					</p>
					<p>
						<button>Set access key</button>
					</p>
				</form>]}
		</ModalContext.Consumer>
	</div>);
}

export default SetAccessKey;
