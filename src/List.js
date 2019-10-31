import React, { useState } from 'react';
import Item from './Item';
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH} from './constants';

function List({ items, addItem, upvoteItem, downvoteItem, voteMode, updateItemText }) {
  const [newItemText, setNewItemText] = useState('');

  const submit = e => {
    e.preventDefault();

    if (!newItemText) {
      return;
    }

    addItem(newItemText);
    setNewItemText('');
  };

  return (
    <ul class="items">
      {items.map(item => ({
          up: item.up || 0,
          down: item.down || 0,
          ...item
        }))
        // Only show items that have an id or are not duplicates (by text)
        .filter((item, i, arr) => item.id || (arr.findIndex(val => val.text === item.text) === i))
        // Add a total to each item
        .map(item => ({total: item.up - item.down, ...item}))
        // Sort by total, descending
        .sort((a, b) => a.total < b.total ? 1 : -1)
        .map(({ id, text, up, down }) =>
          <Item
            key={text}
            id={id}
            up={up}
            down={down}
            voteMode={voteMode}
            upvoteItem={() => upvoteItem(id)}
            downvoteItem={() => downvoteItem(id)}
            updateText={text => updateItemText(id, text)}
          >{text}</Item>)}
      <li class="newItem">
        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Add new item..."
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            minLength={ITEM_TEXT_MIN_LENGTH}
            maxLength={ITEM_TEXT_MAX_LENGTH}
            aria-label="Add new item"
          />
        </form>
      </li>
    </ul>
  );
}

export default List;
