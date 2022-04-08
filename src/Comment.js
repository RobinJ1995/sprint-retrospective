import Markdown from "./Markdown";
import React, {useContext, useEffect, useState} from "react";
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH, KEY} from "./constants";
import {checkHttpStatus, httpDelete, httpPatch, httpPost} from "./utils";
import RetrospectiveContext from "./RetrospectiveContext";
import {getAuthHeaders} from "./utils";

const Comment = ({ id, children = '', section, itemId }) => {
	const {
		apiBaseUrl,
		retroId
	} = useContext(RetrospectiveContext);
	const isNew = !id;

	const [editing, setEditing] = useState(isNew);
	const [text, setText] = useState(children);

	const inputField = React.createRef();

	const submit = e => {
		e.preventDefault();

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

		if (isNew) {
			return httpPost(`${apiBaseUrl}/${section}/${itemId}/comment`,
				{text},
				getAuthHeaders(retroId))
				.then(checkHttpStatus)
				.catch(err => {
					window.alert(err);

					// Ensure input does not get lost
					setEditing(true);
					setText(text);
				});
		}

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
	};

	const cancelEdit = e => {
		if (isNew) {
			return;
		}

		setText(children);
		setEditing(false);
	};

	useEffect(() => {
		if (inputField.current && !isNew) {
			inputField.current.focus();
		}
	});

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
					onKeyUp={e => e.key === KEY.ESCAPE && cancelEdit()}
					aria-label="Edit comment" />
			</form>
		}
	</li>;
}

export default Comment;
