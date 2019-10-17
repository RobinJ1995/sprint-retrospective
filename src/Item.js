import React, { useState } from 'react';

function List({ children, up, down, upvoteItem, downvoteItem }) {
  return (
    <li>
      <div class="vote">
        <a href="#" onClick={upvoteItem}>👍</a>
        <a href="#" onClick={downvoteItem}>👎</a>
      </div>
      <div class="content">
        {children} {'👍'.repeat(up)} {'👎'.repeat(down)}
      </div>
    </li>
  );
}

export default List;
