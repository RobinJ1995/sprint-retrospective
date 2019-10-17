import React, { useState } from 'react';
import Item from './Item';

function List({ items, addItem, upvoteItem, downvoteItem }) {
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
        .map(item => ({total: item.up - item.down, ...item}))
        .sort((a, b) => a.total < b.total ? 1 : -1)
        .map(({ id, text, up, down }) =>
          <Item
            up={up}
            down={down}
            upvoteItem={() => upvoteItem(id)}
            downvoteItem={() => downvoteItem(id)}
          >{text}</Item>)}
      <li class="newItem">
        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Add new item..."
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
          />
        </form>
      </li>
    </ul>
  );
}

export default List;
