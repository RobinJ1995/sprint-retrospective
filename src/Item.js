import React, {useState, useEffect, useContext} from 'react';
import Markdown from './Markdown';
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH, KEY, VOTE_MODES} from './constants';
import Comment from "./Comment";
import RetrospectiveContext from "./RetrospectiveContext";
import Icon from "./Icon";

function Item({id, children, up, down, comments, section, upvoteItem, downvoteItem, voteMode, updateText, deleteItem, myVotes}) {
	const { showErrorToast } = useContext(RetrospectiveContext);

	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(children);
	const [commenting, setCommenting] = useState(false);

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
				showErrorToast(err);

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
			comments?.length > 0 && 'has-comments'].filter(x => !!x).join(' ')}>
			<div className="item-content-main">
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
				</div>
				{!editing &&
					<div className="item-meta">
						<button
							type="button"
							className="comment-toggle"
							title="Add comment"
							aria-label="Add comment"
							onClick={() => setCommenting(true)}><Icon name="comment" /></button>
						{voteMode !== VOTE_MODES.NONE &&
							<div className="vote">
								<button
									type="button"
									onClick={upvoteItem}
									title="Upvote"
									className={[itemUpvoteActionId && 'already-voted', up > 0 && 'has-votes'].filter(x => !!x).join(' ')}>
									<span className="thumb emoji" role="img" aria-label="Thumb up">👍</span>
									{up > 0 && <span key={up} className="count upvote">{up}</span>}
								</button>
								{voteMode === VOTE_MODES.UPVOTE_DOWNVOTE &&
									<button
										type="button"
										onClick={downvoteItem}
										title="Downvote"
										className={[itemDownvoteActionId && 'already-voted', down > 0 && 'has-votes'].filter(x => !!x).join(' ')}>
										<span className="thumb emoji" role="img" aria-label="Thumb down">👎</span>
										{down > 0 && <span key={down} className="count downvote">{down}</span>}
									</button>
								}
							</div>}
					</div>}
			</div>

			{(comments.length > 0 || commenting) &&
				<ul className="comments">
					{comments.map(({ id: commentId, text }) => <Comment
						key={`comment::${commentId}`}
						id={commentId}
						section={section}
						itemId={id}>{text}</Comment>)}
					{commenting &&
						<Comment section={section} itemId={id} onClose={() => setCommenting(false)} />}
				</ul>}
		</li>
	);
}

export default Item;
