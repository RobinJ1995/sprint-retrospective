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
							title="Upvotes and downvotes">👍👎 Upvotes and downvotes
					</button>
					<button onClick={() => setModeAndCloseModal(VOTE_MODES.UPVOTE)}
							title="Upvotes only">👍 Upvotes only
					</button>
					<button onClick={() => setModeAndCloseModal(VOTE_MODES.NONE)}
							title="Disable voting">🚫 Disable voting
					</button>
				</div>)
			}}
		</ModalContext.Consumer>
	);
}

export default SetVoteMode;
