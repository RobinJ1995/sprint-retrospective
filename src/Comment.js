import Markdown from "./Markdown";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH, KEY} from "./constants";
import {checkHttpStatus, httpDelete, httpPatch, httpPost} from "./utils";
import RetrospectiveContext from "./RetrospectiveContext";
import {getAuthHeaders} from "./utils";

const Comment = ({ id, children = '', section, itemId, onClose = () => {} }) => {
	const {
		apiBaseUrl,
		retroId
	} = useContext(RetrospectiveContext);
	const isNew = !id;

	const [editing, setEditing] = useState(isNew);
	const [text, setText] = useState(children);

	const inputField = React.createRef();

	const submit = useCallback(e => {
		e.preventDefault();

		if (isNew) {
			if (!text) {
				return onClose();
			}

			// The input stays open until the comment has been saved, so that it does not get lost on failure.
			return httpPost(`${apiBaseUrl}/${section}/${itemId}/comment`,
				{text},
				getAuthHeaders(retroId))
				.then(checkHttpStatus)
				.then(() => onClose())
				.catch(window.alert);
		}

		setEditing(false);

		if (!text) {
			if (window.confirm('Delete this comment?') && !isNew) {
				return httpDelete(`${apiBaseUrl}/${section}/${itemId}/comment/${id}`, getAuthHeaders(retroId))
					.then(checkHttpStatus)
					.catch(window.alert);
			}

			setText(children);

			return;
		} else if (text === children) {
			return;
		}

		setText(children);

		return httpPatch(`${apiBaseUrl}/${section}/${itemId}/comment/${id}`,
			{text},
			getAuthHeaders(retroId))
			.then(checkHttpStatus)
			.catch(err => {
				window.alert(err);

				// Ensure input does not get lost
				setEditing(true);
				setText(text);
			});
		},
		[setText, setEditing, apiBaseUrl, section, itemId, id, isNew, text, children, retroId, onClose]);

	const cancelEdit = useCallback(e => {
			if (isNew) {
				if (!text) {
					onClose();
				}

				return;
			}

			setText(children);
			setEditing(false);
		},
	[isNew, text, children, setText, setEditing, onClose]);

	useEffect(() => {
		if (inputField.current && !isNew) {
			inputField.current.focus();
		}
	}, [inputField, isNew]);

	useEffect(() => {
		setText(children);
	}, [children]);

	return <li
		className={[
			'comment',
			isNew && 'new-comment',
			!!editing && 'editing'].filter(x => !!x).join(' ')}
		data-comment-id={id}>
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
					onKeyUp={e => e.key === KEY.ESCAPE && (isNew ? onClose() : cancelEdit())}
					placeholder={isNew ? 'Add comment...' : undefined}
					autoFocus={isNew}
					aria-label={isNew ? 'Add comment' : 'Edit comment'} />
			</form>
		}
	</li>;
}

export default Comment;
