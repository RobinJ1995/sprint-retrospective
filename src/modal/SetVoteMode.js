import React from 'react';
import {VOTE_MODES} from '../constants';
import ModalContext from '../ModalContext';

const SetVoteMode = ({ setMode }) => {
	return (
		<ModalContext.Consumer>
			{({ closeModal }) => {
				const setModeAndCloseModal = mode => {
					setMode(mode);
					closeModal();
				}

				return (<div class="modal-set-vote-mode">
					<button onClick={() => setModeAndCloseModal(VOTE_MODES.UPVOTE_DOWNVOTE)}
							title="Upvotes and downvotes"><span role="img" aria-label="Thumb up">👍</span><span role="img" aria-label="Thumb down">👎</span> Upvotes and downvotes
					</button>
					<button onClick={() => setModeAndCloseModal(VOTE_MODES.UPVOTE)}
							title="Upvotes only"><span role="img" aria-label="Thumb up">👍</span> Upvotes only
					</button>
					<button onClick={() => setModeAndCloseModal(VOTE_MODES.NONE)}
							title="Disable voting"><span role="img" aria-label="Prohibited symbol">🚫</span> Disable voting
					</button>
				</div>)
			}}
		</ModalContext.Consumer>
	);
}

export default SetVoteMode;
