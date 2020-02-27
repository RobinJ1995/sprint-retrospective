import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Updater from './Updater';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register({
    onUpdate: () => {
        ReactDOM.render(<Updater />, document.getElementById('root'));

        window.setTimeout(() => window.location.reload(), 2500);
    }
});
