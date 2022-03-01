import React  from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Updater from './Updater';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import Toast from "./Toast";
import {ToastProvider} from "react-toast-notifications";

ReactDOM.render(
	<ToastProvider
		components={{Toast}}
		autoDismissTimeout={5_000}>
		<App/>
	</ToastProvider>,
	document.getElementById('root'));

serviceWorkerRegistration.register({
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.debug);
