import React, { useState } from 'react';
import useInterval from 'use-interval';
import './App.css';
import List from './List';
import uuid from 'uuid/v4';

window.API_BASE = `http://localhost:5432/${uuid()}`;

let data = {
  title: null,
  good: [],
  bad: [],
  actions: []
};

const post = (url, data = {}) => fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});
const put = (url, data = {}) => fetch(url, {
  method: 'PUT',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});


function App() {
  const [ title, setTitle ] = useState(data.title);
  const [ good, setGood ] = useState(data.good);
  const [ bad, setBad ] = useState(data.bad);
  const [ actions, setActions ] = useState(data.actions);

  const addGood = text => {
    post(`${window.API_BASE}/good`, { text })
      .catch(alert);

    setGood([...good, { text }]);
  };
  const addBad = text => {
    post(`${window.API_BASE}/bad`, { text })
      .catch(alert);

    setBad([...bad, { text }]);
  };
  const addAction = text => {
    post(`${window.API_BASE}/action`, { text })
      .catch(alert);

    setActions([...actions, { text }]);
  };

  const upvoteItem = (id, type, setter, list) => {
    post(`${window.API_BASE}/${type}/${id}/up`)
      .catch(alert);

    setter(list.map(item => ({
      ...item,
      up: item.up + (item.id === id ? 1 : 0)
    })));
  };
  const downvoteItem = (id, type, setter, list) => {
    post(`${window.API_BASE}/${type}/${id}/down`)
      .catch(alert);

    setter(list.map(item => ({
      ...item,
      down: item.down + (item.id === id ? 1 : 0)
    })));
  };

  const updateTitle = title => {
    put(`${window.API_BASE}/title`, { title })
      .catch(alert);

    setTitle(title);
  };

  useInterval(() => {
    fetch(window.API_BASE)
      .then(res => res.json())
      .then(({good, bad, actions, title}) => {
        setGood(good);
        setBad(bad);
        setActions(actions);
        setTitle(title);
      });
  }, 1000);

  return (
    <main>
      <nav>
        <ul>
          {!!title ||
            <li onClick={() => updateTitle(prompt('Name this retrospective:'))}>Set name</li>}
          <li onClick={() => alert(JSON.stringify({ title, good, bad, actions }, null,4))}>Export</li>
        </ul>
      </nav>
      {!!title &&
        <h1>{title}</h1>}
      <article>
        <section id="good">
          <h2>Good 👍</h2>
          <List
            items={good}
            addItem={addGood}
            upvoteItem={id => upvoteItem(id, 'good', setGood, good)}
            downvoteItem={id => downvoteItem(id, 'good', setGood, good)}
          ></List>
        </section>
        <section id="bad">
          <h2>Bad 👎</h2>
          <List
            items={bad}
            addItem={addBad}
            upvoteItem={id => upvoteItem(id, 'bad', setBad, bad)}
            downvoteItem={id => downvoteItem(id, 'bad', setBad, bad)}
          ></List>
        </section>
        <section id="actions">
          <h2>Actions ☑️</h2>
          <List
            items={actions}
            addItem={addAction}
            upvoteItem={id => upvoteItem(id, 'action', setActions, actions)}
            downvoteItem={id => downvoteItem(id, 'action', setActions, actions)}
          ></List>
        </section>
      </article>
    </main>
  );
}

export default App;
