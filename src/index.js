import React  from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Updater from './Updater';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register({
    onUpdate: registration => {
        ReactDOM.render(<Updater />, document.getElementById('root'));

        window.setTimeout(() => {
			if (! (registration && registration.waiting)) {
				window.location.reload();
				return;
			}

			registration.unregister()
				.catch(window.alert)
				.then(() => {
					window.location.reload(true);
				});
		}, 1500);
    }
});
