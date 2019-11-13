import React, { useState } from 'react';
import useInterval from 'use-interval';
import List from './List';
import { httpDelete, httpPatch, httpPost } from './utils';

const updateItemText = (type, id, text) => httpPatch(`${window.API_BASE}/${type}/${id}`, { text })
  .catch(alert);

const deleteItem = (type, id) => httpDelete(`${window.API_BASE}/${type}/${id}`)
  .catch(alert);

const Retrospective = ({ good, setGood,
                         bad, setBad,
                         actions, setActions,
                         setTitle,
                         voteMode, setVoteMode,
                         setError,
                         cache }) => {
  const addGood = text => {
    httpPost(`${window.API_BASE}/good`, { text })
      .catch(alert);

    setGood([...good, { text }]);
  };
  const addBad = text => {
    httpPost(`${window.API_BASE}/bad`, { text })
      .catch(alert);

    setBad([...bad, { text }]);
  };
  const addAction = text => {
    httpPost(`${window.API_BASE}/action`, { text })
      .catch(alert);

    setActions([...actions, { text }]);
  };

  const upvoteItem = (id, type, setter, list) => {
    httpPost(`${window.API_BASE}/${type}/${id}/up`)
      .catch(alert);

    setter(list.map(item => ({
      ...item,
      up: item.up + (item.id === id ? 1 : 0)
    })));
  };
  const downvoteItem = (id, type, setter, list) => {
    httpPost(`${window.API_BASE}/${type}/${id}/down`)
      .catch(alert);

    setter(list.map(item => ({
      ...item,
      down: item.down + (item.id === id ? 1 : 0)
    })));
  };

  useInterval(() => {
    fetch(window.API_BASE)
      .then(res => res.json())
      .then(({id, good, bad, actions, title, voteMode }) => {
        setGood(good);
        setBad(bad);
        setActions(actions);
        setTitle(title);
        setVoteMode(voteMode);
        setError(null);

        if (id) {
          cache.setIfModified(id, { id, good, bad, actions, title, voteMode })
            .catch(console.error);
        }
      }).catch(setError);
  }, 1000);

  return <article>
    <section id="good">
      <h2>Good 👍</h2>
      <List
        items={good}
        addItem={addGood}
        voteMode={voteMode}
        upvoteItem={id => upvoteItem(id, 'good', setGood, good)}
        downvoteItem={id => downvoteItem(id, 'good', setGood, good)}
        updateItemText={(id, text) => updateItemText('good', id, text)}
        deleteItem={id => deleteItem('good', id)}
      />
    </section>
    <section id="bad">
      <h2>Bad 👎</h2>
      <List
        items={bad}
        addItem={addBad}
        voteMode={voteMode}
        upvoteItem={id => upvoteItem(id, 'bad', setBad, bad)}
        downvoteItem={id => downvoteItem(id, 'bad', setBad, bad)}
        updateItemText={(id, text) => updateItemText('bad', id, text)}
        deleteItem={id => deleteItem('bad', id)}
      />
    </section>
    <section id="actions">
      <h2>Actions ☑️</h2>
      <List
        items={actions}
        addItem={addAction}
        voteMode={voteMode}
        upvoteItem={id => upvoteItem(id, 'action', setActions, actions)}
        downvoteItem={id => downvoteItem(id, 'action', setActions, actions)}
        updateItemText={(id, text) => updateItemText('actions', id, text)}
        deleteItem={id => deleteItem('actions', id)}
      />
    </section>
  </article>;
};

export default Retrospective;