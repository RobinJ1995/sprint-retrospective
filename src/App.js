import React, { useState } from 'react';
import './App.css';
import List from './List';

const data = {
  good: [
    { id: 1, text: 'world', up: 3, down: 2 },
    { id: 2, text: 'hello', up: 2, down: 0 }
  ],
  bad: [
    { id: 3, text: 'bleep', up: 0, down: 3 }
  ],
  actions: [{ id: 4, text: 'bloop', up: 1, down: 3}]
};

function App() {
  const [ good, setGood ] = useState(data.good);
  const [ bad, setBad ] = useState(data.bad);
  const [ actions, setActions ] = useState(data.actions);

  const addGood = text => setGood([...good, { text }]);
  const addBad = text => setBad([...bad, { text }]);
  const addAction = text => setActions([...actions, { text }]);

  const upvoteItem = (id, setter, list) => setter(list.map(item => ({
    ...item,
    up: item.up + (item.id === id ? 1 : 0)
  })));
  const downvoteItem = (id, setter, list) => setter(list.map(item => ({
    ...item,
    down: item.down + (item.id === id ? 1 : 0)
  })));

  return (
    <article>
      <section id="good">
        <h2>Good 👍</h2>
        <List
          items={good}
          addItem={addGood}
          upvoteItem={id => upvoteItem(id, setGood, good)}
          downvoteItem={id => downvoteItem(id, setGood, good)}
        ></List>
      </section>
      <section id="bad">
        <h2>Bad 👎</h2>
        <List
          items={bad}
          addItem={addBad}
          upvoteItem={id => upvoteItem(id, setBad, bad)}
          downvoteItem={id => downvoteItem(id, setBad, bad)}
        ></List>
      </section>
      <section id="actions">
        <h2>Actions ☑️</h2>
        <List
          items={actions}
          addItem={addAction}
          upvoteItem={id => upvoteItem(id, setActions, actions)}
          downvoteItem={id => downvoteItem(id, setActions, actions)}
        ></List>
      </section>
    </article>
  );
}

export default App;
