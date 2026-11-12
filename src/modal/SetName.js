import React, {useState} from 'react';
import {KEY, RETRO_TITLE_MAX_LENGTH, RETRO_TITLE_MIN_LENGTH} from '../constants';
import ModalContext from '../ModalContext';

const SetName = ({ setName, current = '' }) => {
	const [text, setText] = useState(current);

	return (<div className="modal-set-name">
		<ModalContext.Consumer>
			{({ closeModal }) => (
				<form
					onSubmit={() => {
						setName(text);
						closeModal();
					}}
				>
					<label>
						<span className="field-label">Name this retrospective:</span>
						<input
							className="input"
							type="text"
							value={text}
							minLength={RETRO_TITLE_MIN_LENGTH}
							maxLength={RETRO_TITLE_MAX_LENGTH}
							required
							autoFocus
							onChange={e => setText(e.target.value)}
							onKeyUp={e => e.key === KEY.ESCAPE && closeModal()}
						/>
					</label>
					<div className="modal-actions">
						<button className="button primary">Submit</button>
					</div>
				</form>)}
		</ModalContext.Consumer>
	</div>);
}

export default SetName;
