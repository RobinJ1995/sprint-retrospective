import React from 'react';
import { VOTE_MODES } from './constants';

const repeat = (n, content) => Array(n || 0).fill(false).map(() => content);

function Item({ id, children, up, down, upvoteItem, downvoteItem, voteMode }) {
  return (
    <li data-id={id} data-up={up} data-down={down}>
      {voteMode !== VOTE_MODES.NONE &&
        <div class="vote">
          <button onClick={upvoteItem}>👍</button>
          {voteMode === VOTE_MODES.UPVOTE_DOWNVOTE &&
            <button onClick={downvoteItem}>👎</button>
          }
        </div>
      }
      <div class="content">
        {children}
        <span class="votes">
          {voteMode !== VOTE_MODES.NONE &&
            [
              repeat(up, <span class="upvote">👍</span>),
              voteMode === VOTE_MODES.UPVOTE_DOWNVOTE &&
                repeat(down, <span class="downvote">👎</span>)
            ]
          }
        </span>
      </div>
    </li>
  );
}

export default Item;
export { repeat };