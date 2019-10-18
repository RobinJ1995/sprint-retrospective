import React, { useState } from 'react';

const repeat = (n, content) => Array(n || 0).fill(false).map(() => content);

function Item({ id, children, up, down, upvoteItem, downvoteItem }) {
  return (
    <li>
       <div class="vote">
         <a href="#" onClick={upvoteItem}>👍</a>
         <a href="#" onClick={downvoteItem}>👎</a>
      </div>
      <div class="content">
        {children} {repeat(up, <span class="upvote">👍</span>)} {repeat(down, <span class="downvote">👎</span>)}
      </div>
    </li>
  );
}

export default Item;
