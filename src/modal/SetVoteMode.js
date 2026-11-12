import React from 'react';
import {VOTE_MODES} from '../constants';
import ModalContext from '../ModalContext';
import Icon from '../Icon';

const SetVoteMode = ({ setMode, current = null }) => {
	return (
		<ModalContext.Consumer>
			{({ closeModal }) => {
				const setModeAndCloseModal = mode => {
					setMode(mode);
					closeModal();
				}

				const option = (mode, icon, label) => (
					<button
						type="button"
						className={`choice ${current === mode ? 'selected' : ''}`}
						aria-pressed={current === mode}
						onClick={() => setModeAndCloseModal(mode)}
						title={label}>
						<span className="choice-icon emoji" role="img" aria-hidden="true">{icon}</span>
						<span className="choice-text">{label}</span>
						<span className="choice-check"><Icon name="check" /></span>
					</button>
				);

				return (<div className="modal-set-vote-mode">
					{option(VOTE_MODES.UPVOTE_DOWNVOTE, '👍👎', 'Upvotes and downvotes')}
					{option(VOTE_MODES.UPVOTE, '👍', 'Upvotes only')}
					{option(VOTE_MODES.NONE, '🚫', 'Disable voting')}
				</div>)
			}}
		</ModalContext.Consumer>
	);
}

export default SetVoteMode;
