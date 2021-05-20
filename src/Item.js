import React, {useState, useEffect} from 'react';
import Markdown from './Markdown';
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH, KEY, VOTE_MODES} from './constants';
import {repeat} from './utils';
import Comment from "./Comment";

function Item({id, children, up, down, comments, section, upvoteItem, downvoteItem, voteMode, updateText, deleteItem, myVotes}) {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(children);
	
	const itemUpvoteActionId = myVotes.find(vote => vote.itemId === id && vote.up);
	const itemDownvoteActionId = myVotes.find(vote => vote.itemId === id && !vote.up);

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
		<li data-id={id} data-up={up} data-down={down} className={[
			!!editing && 'editing',
			comments?.length && 'has-comments'].filter(x => !!x).join(' ')}>
			<div className="item-content-main">
				{voteMode !== VOTE_MODES.NONE &&
					<div className="vote">
						<button onClick={upvoteItem} className={itemUpvoteActionId ? 'already-voted' : ''}><span role="img" aria-label="Thumb up">👍</span></button>
						{voteMode === VOTE_MODES.UPVOTE_DOWNVOTE &&
							<button onClick={downvoteItem} className={itemDownvoteActionId ? 'already-voted' : ''}><span role="img" aria-label="Thumb down">👎</span></button>
						}
					</div>}
				<div className="content">
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
						<span className="votes">
							{voteMode !== VOTE_MODES.NONE &&
								[
									repeat(up, <span className="upvote" role="img" aria-label="Thumb up">👍</span>),
									voteMode === VOTE_MODES.UPVOTE_DOWNVOTE &&
									repeat(down, <span className="downvote" role="img" aria-label="Thumb down">👎</span>)
								]
							}
						</span>
					}
				</div>
			</div>

			<ul className="comments">
				{comments.map(({ id: commentId, text }) => <Comment
					key={`comment::${commentId}`}
					id={commentId}
					section={section}
					itemId={id}>{text}</Comment>)}
				<Comment section={section} itemId={id} />
			</ul>
		</li>
	);
}

export default Item;
