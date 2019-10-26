import React, { useState } from 'react';
import useInterval from 'use-interval';
import './App.css';
import List from './List';
import uuid from 'uuid/v4';
import { VOTE_MODES, SUBMENUS, PATH_MAX_LENGTH } from './constants';
import {exportToConfluenceWiki, exportToJson, exportToMarkdown} from './export';

const trimSlashes = str => str.replace(/^\//, '').replace(/\/$/, '');
const getRetroIdFromUrl = () => {
  const path = trimSlashes(String(window.location.pathname));
  if (!path || path.length > PATH_MAX_LENGTH) {
    return false;
  }

  return path;
};
const getOrSetRetroId = () => {
  if (getRetroIdFromUrl()) {
    return getRetroIdFromUrl();
  }

  const id = uuid();
  window.history.pushState(null, 'Sprint Retrospective', `/${id}`);

  return id;
};

const RETRO_ID = getOrSetRetroId();

window.API_BASE = `http://localhost:5432/${RETRO_ID}`;

let data = {
  title: null,
  good: [],
  bad: [],
  actions: [],
  voteMode: VOTE_MODES.UPVOTE
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

const copyToClipboard = text => new Promise((resolve, reject) => {
  try {
    return resolve(navigator.clipboard.writeText(text));
  } catch (ex) {
    return reject(ex);
  }
});

const share = () => copyToClipboard(window.location)
  .then(() => alert(`Share the following URL to collaborate on this retrospective:\n\n${window.location}\n\nFor your convenience, it has been copied to your clipboard.`))
  .catch(() => alert(`Share the following URL to collaborate on this retrospective:\n\n${window.location}`));

const alertAndCopy = text => copyToClipboard(text)
  .then(() => alert(text))
  .catch(() => alert(text));

function App() {
  const [ title, setTitle ] = useState(data.title);
  const [ good, setGood ] = useState(data.good);
  const [ bad, setBad ] = useState(data.bad);
  const [ actions, setActions ] = useState(data.actions);
  const [ voteMode, setVoteMode ] = useState(data.voteMode);
  const [ openedSubmenu, setOpenedSubmenu ] = useState(null);
  const [ error, setError ] = useState(null);

  const addGood = text => {
    post(`${window.API_BASE}/good`, { text })
      .then(response => response.status)
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

  const updateVoteMode = voteMode => {
    put(`${window.API_BASE}/voteMode`, { voteMode })
      .catch(alert);

    setVoteMode(voteMode);
  };

  const toggleOpenedSubmenu = submenu => {
    if (openedSubmenu === submenu) {
      setOpenedSubmenu(null);
      return;
    }

    setOpenedSubmenu(submenu);
  };

  useInterval(() => {
    fetch(window.API_BASE)
      .then(res => res.json())
      .then(({good, bad, actions, title, voteMode }) => {
        setGood(good);
        setBad(bad);
        setActions(actions);
        setTitle(title);
        setVoteMode(voteMode);
        setError(null);
      }).catch(setError);
  }, 1000);

  return (
    <main className={!!error && 'error'}>
      <nav>
        <ul>
          {!!title ||
            <li onClick={() => updateTitle(prompt('Name this retrospective:'))}>Set name</li>}
          <li onClick={() => toggleOpenedSubmenu(SUBMENUS.VOTE_MODE)}>Set voting mode
            {openedSubmenu === SUBMENUS.VOTE_MODE &&
              <ul class="submenu">
                <li onClick={() => updateVoteMode(VOTE_MODES.UPVOTE_DOWNVOTE)} title="Upvotes and downvotes">👍👎</li>
                <li onClick={() => updateVoteMode(VOTE_MODES.UPVOTE)} title="Upvotes only">👍</li>
                <li onClick={() => updateVoteMode(VOTE_MODES.NONE)} title="Disable votes">🚫</li>
              </ul>
            }
          </li>
          <li onClick={() => toggleOpenedSubmenu(SUBMENUS.EXPORT)}>Export
            {openedSubmenu === SUBMENUS.EXPORT &&
              <ul class="submenu">
                <li onClick={() => alertAndCopy(exportToJson({ title, good, bad, actions }))}>JSON</li>
                <li onClick={() => alertAndCopy(exportToMarkdown({ title, good, bad, actions }))}>Markdown</li>
                <li onClick={() => {
                  const exported = exportToConfluenceWiki({ title, good, bad, actions });

                  copyToClipboard(exported)
                    .then(() => alert(`In Confluence, go to Insert ➡️ Markup, select "Confluence Wiki", and paste the exported data, which has been copied to your clipboard.\n\n${exported}`))
                    .catch(() => alert(`In Confluence, go to Insert ➡️ Markup, select "Confluence Wiki", and paste the exported data.\n\n${exported}`));
                }}>Confluence Wiki</li>
              </ul>
            }
          </li>
          <li onClick={share}>Share</li>
        </ul>
      </nav>
      {!!title &&
        <h1>{title}</h1>}
      {!!error &&
        <p id="error">{error.message}</p>
      }
      <article>
        <section id="good">
          <h2>Good 👍</h2>
          <List
            items={good}
            addItem={addGood}
            voteMode={voteMode}
            upvoteItem={id => upvoteItem(id, 'good', setGood, good)}
            downvoteItem={id => downvoteItem(id, 'good', setGood, good)}
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
          />
        </section>
      </article>
    </main>
  );
}

export default App;
