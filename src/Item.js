import React, {useState, useEffect} from 'react';
import Markdown from './Markdown';
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH, KEY, VOTE_MODES} from './constants';

const repeat = (n, content) => Array(n || 0).fill(false).map(() => content);

function Item({id, children, up, down, upvoteItem, downvoteItem, voteMode, updateText, deleteItem}) {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(children);

	const inputField = React.createRef();

	const submit = e => {
		e.preventDefault();

		setEditing(false);

		if (!text) {
			if (window.confirm('Delete this item?')) {
				return deleteItem();
			}

			setText(children);

			return;
		} else if (text === children) {
			return;
		}

		setText(children);

		return updateText(text)
			.catch(err => {
				window.alert(err);

				// Ensure input does not get lost
				setEditing(true);
				setText(text);
			});
	};

	const cancelEdit = e => {
		setText(children);
		setEditing(false);
	};

	useEffect(() => {
		if (inputField.current) {
			inputField.current.focus();
		}
	});

	return (
		<li data-id={id} data-up={up} data-down={down} className={!!editing && 'editing'}>
			{voteMode !== VOTE_MODES.NONE &&
			<div class="vote">
				<button onClick={upvoteItem}>👍</button>
				{voteMode === VOTE_MODES.UPVOTE_DOWNVOTE &&
				<button onClick={downvoteItem}>👎</button>
				}
			</div>
			}
			<div class="content">
				{!editing ?
					<Markdown
						onClick={() => setEditing(true)}
					>{children}</Markdown> :
					<form onSubmit={submit}>
						<input
							ref={inputField}
							type="text"
							value={text}
							minLength={ITEM_TEXT_MIN_LENGTH}
							maxLength={ITEM_TEXT_MAX_LENGTH}
							onChange={e => setText(e.target.value)}
							onBlur={cancelEdit}
							onKeyUp={e => e.key === KEY.ESCAPE && cancelEdit()}
							aria-label="Edit item"/>
					</form>
				}

				{!editing &&
					<span class="votes">
						{voteMode !== VOTE_MODES.NONE &&
							[
								repeat(up, <span class="upvote">👍</span>),
								voteMode === VOTE_MODES.UPVOTE_DOWNVOTE &&
								repeat(down, <span class="downvote">👎</span>)
							]
						}
					</span>
				}
			</div>
		</li>
	);
}

export default Item;
export {repeat};
