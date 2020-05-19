import React, {useState} from 'react';
import {KEY, RETRO_TITLE_MAX_LENGTH, RETRO_TITLE_MIN_LENGTH} from '../constants';
import ModalContext from '../ModalContext';

const SetName = ({ setName, current = '' }) => {
	const [text, setText] = useState(current);

	return (<div class="modal-set-name">
		<ModalContext.Consumer>
			{({ closeModal }) => [
				<p>Name this retrospective:</p>,
				<form
					onSubmit={() => {
						setName(text);
						closeModal();
					}}
				>
					<p>
						<input
							type="text"
							value={text}
							minLength={RETRO_TITLE_MIN_LENGTH}
							maxLength={RETRO_TITLE_MAX_LENGTH}
							required
							onChange={e => setText(e.target.value)}
							onKeyUp={e => e.key === KEY.ESCAPE && closeModal()}
						/>
					</p>
					<p>
						<button>Submit</button>
					</p>
				</form>]}
		</ModalContext.Consumer>
	</div>);
}

export default SetName;
