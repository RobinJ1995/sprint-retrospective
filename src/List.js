import React, {useMemo, useState} from 'react';
import Item from './Item';
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH, VOTE_MODES} from './constants';

function List({
				  section,
				  items,
				  addItem, updateItemText, deleteItem,
				  upvoteItem, downvoteItem,
				  voteMode,
				  myVotes
			  }) {
	const [newItemText, setNewItemText] = useState('');

	const submit = e => {
		e.preventDefault();

		if (!newItemText) {
			return;
		}

		addItem(newItemText)
			.then(() => setNewItemText(''))
			.catch(window.alert);
	};

	const sortedItems = useMemo(() => items.map(item => ({
			up: item.up || 0,
			down: item.down || 0,
			...item
		}))
			// Adjust scores based on vote mode
			.map(item => ({
				...item,
				up: (voteMode !== VOTE_MODES.NONE ? item.up : 0),
				down: (voteMode === VOTE_MODES.UPVOTE_DOWNVOTE ? item.down : 0)
			}))
			// Only show items that have an id or are not duplicates (by text)
			.filter((item, i, arr) => item.id || (arr.findIndex(val => val.text === item.text) === i))
			// Add a total to each item
			.map(item => ({total: item.up - item.down, ...item}))
			// Sort alphabetically
			.sort((a, b) => a.text < b.text ? -1 : 1)
			// Sort by total, descending
			.sort((a, b) => a.total < b.total ? 1 : -1),
		[items, voteMode]);

	return (
		<ul class="items">
			{sortedItems.map(({id, text, up, down, comments}) =>
				<Item
					key={text}
					id={id}
					section={section}
					up={up}
					down={down}
					comments={comments || []}
					voteMode={voteMode}
					myVotes={myVotes}
					upvoteItem={() => upvoteItem(id)}
					downvoteItem={() => downvoteItem(id)}
					updateText={text => updateItemText(id, text)}
					deleteItem={() => deleteItem(id)}
				>{text}</Item>)}
			<li className="newItem">
				<div className="item-content-main">
					<form onSubmit={submit}>
						<input
							type="text"
							placeholder="Add new item..."
							value={newItemText}
							onChange={e => setNewItemText(e.target.value)}
							minLength={ITEM_TEXT_MIN_LENGTH}
							maxLength={ITEM_TEXT_MAX_LENGTH}
							required
							aria-label="Add new item"
						/>
						<div className="markdown-formatting-hint">
							<span>Markdown formatting supported:</span>
							<wbr/>
							<span className="bold">**bold**</span>, <wbr/>
							<span className="italic">_italic_</span>, <wbr/>
							<span className="monospace">`monospace`</span>, <wbr/>
							<span className="checkbox"><kbd>[ ]</kbd>/<kbd>[X]</kbd> checkboxes (<input type="checkbox"
																										readOnly/>/<input
								type="checkbox" readOnly checked/>)</span>
						</div>
					</form>
				</div>
			</li>
		</ul>
	);
}

export default List;
