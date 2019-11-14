import React, { useState } from 'react';
import './App.scss';
import uuid from 'uuid/v4';
import {VOTE_MODES, SUBMENUS, PATH_MAX_LENGTH, THEMES} from './constants';
import { exportToConfluenceWiki, exportToJson, exportToMarkdown } from './export';
import Cache from './Cache';
import Preferences from './Preferences';
import {copyToClipboard, httpPut} from './utils';
import Retrospective from './Retrospective';

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
  window.history.replaceState(null, 'Sprint Retrospective', `/${id}`);

  return id;
};

const RETRO_ID = getOrSetRetroId();

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:5432';
window.API_BASE = `${apiEndpoint}/${RETRO_ID}`;

const prefs = new Preferences();
const cache = new Cache();
const initialData = {
  title: null,
  good: [],
  bad: [],
  actions: [],
  voteMode: VOTE_MODES.UPVOTE,
  ...cache.get(RETRO_ID)
};

const shareFallback = () => copyToClipboard(window.location)
    .then(() => alert(`Share the following URL to collaborate on this retrospective:\n\n${window.location}\n\nFor your convenience, it has been copied to your clipboard.`))
    .catch(() => alert(`Share the following URL to collaborate on this retrospective:\n\n${window.location}`));

const alertAndCopy = text => copyToClipboard(text)
  .then(() => alert(text))
  .catch(() => alert(text));

function App({ updateAvailable }) {
  const [ good, setGood ] = useState(initialData.good);
  const [ bad, setBad ] = useState(initialData.bad);
  const [ actions, setActions ] = useState(initialData.actions);
  const [ title, setTitle ] = useState(initialData.title);
  const [ voteMode, setVoteMode ] = useState(initialData.voteMode);
  const [ openedSubmenu, setOpenedSubmenu ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ theme, setTheme ] = useState(prefs.get(Preferences.THEME, THEMES.DARK));

  const updateTitle = title => {
    httpPut(`${window.API_BASE}/title`, { title })
      .catch(alert);

    setTitle(title);
  };

  const updateVoteMode = voteMode => {
    httpPut(`${window.API_BASE}/voteMode`, { voteMode })
      .catch(alert);

    setVoteMode(voteMode);
  };

  const updateTheme = theme => {
    prefs.set(Preferences.THEME, theme);
    setTheme(theme);
  };

  const toggleOpenedSubmenu = submenu => {
    if (openedSubmenu === submenu) {
      setOpenedSubmenu(null);
      return;
    }

    setOpenedSubmenu(submenu);
  };

  const share = ({ title, good, bad, actions }) => {
    if (navigator.share) {
      const nItems = good.length + bad.length + actions.length;

      return navigator.share({
        title: title || 'Sprint Retrospective',
        text: `Collaborate on this sprint retrospective! It currently contains ${nItems} items.`,
        url: window.location
      })
        .catch(() => shareFallback());
    }

    return shareFallback();
  };

  return (
    <main className={[
      error && 'error',
      `theme-${theme}`
    ].filter(x => x).join(' ')}>
      <nav>
        <ul>
          <li onClick={() => updateTitle(prompt('Name this retrospective:', title || ''))}>{title ? 'Change' : 'Set'} name</li>
          <li onClick={() => toggleOpenedSubmenu(SUBMENUS.VOTE_MODE)}>Set voting mode
            {openedSubmenu === SUBMENUS.VOTE_MODE &&
              <ul class="submenu">
                <li onClick={() => updateVoteMode(VOTE_MODES.UPVOTE_DOWNVOTE)} title="Upvotes and downvotes">👍👎</li>
                <li onClick={() => updateVoteMode(VOTE_MODES.UPVOTE)} title="Upvotes only">👍</li>
                <li onClick={() => updateVoteMode(VOTE_MODES.NONE)} title="Disable votes">🚫</li>
              </ul>
            }
          </li>
          <li onClick={share}>Share</li>
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
          <li onClick={() => toggleOpenedSubmenu(SUBMENUS.THEMES)}>Change theme
            {openedSubmenu === SUBMENUS.THEMES &&
            <ul className="submenu">
              <li onClick={() => updateTheme(THEMES.DARK)} title="Dark">Dark</li>
              <li onClick={() => updateTheme(THEMES.LIGHT)} title="Light">Light</li>
            </ul>
            }
          </li>
        </ul>
      </nav>
      {!!title &&
        <h1>{title}</h1>}
      {!!error &&
        <p id="error">{error.message}</p>
      }
      <Retrospective
        good={good}
        setGood={setGood}
        bad={bad}
        setBad={setBad}
        actions={actions}
        setActions={setActions}
        setTitle={setTitle}
        voteMode={voteMode}
        setVoteMode={setVoteMode}
        setError={setError}
        cache={cache}
      />
      <footer>
        {updateAvailable &&
          <span>Update available</span>}
      </footer>
    </main>
  );
}

export default App;
