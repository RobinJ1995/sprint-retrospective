import React, { useState } from 'react';
import {ITEM_TEXT_MAX_LENGTH, ITEM_TEXT_MIN_LENGTH, VOTE_MODES} from './constants';

const repeat = (n, content) => Array(n || 0).fill(false).map(() => content);

function Item({ id, children, up, down, upvoteItem, downvoteItem, voteMode, updateText }) {
  const [ editing, setEditing ] = useState(false);
  const [ text, setText ] = useState(children);

  const submit = e => {
    e.preventDefault();

    if (!text) {
      return;
    }

    updateText(text);

    setText(children);
    setEditing(false);
  };

  const cancelEdit = e => {
    setText(children);
    setEditing(false);
  };

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
          <span onClick={() => setEditing(true)}>
            {children}
          </span> :
          <form onSubmit={submit}>
            <input
              type="text"
              value={text}
              minLength={ITEM_TEXT_MIN_LENGTH}
              maxLength={ITEM_TEXT_MAX_LENGTH}
              onChange={e => setText(e.target.value)}
              onBlur={cancelEdit}
              aria-label="Edit item" />
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
export { repeat };