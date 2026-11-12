import React from 'react';
import {THEMES} from '../constants';
import Icon from '../Icon';

// Themes are picked by their preview alone. The names are internal, and only read out by screen readers.
const OPTIONS = Object.freeze([
	{ value: THEMES.DARK, label: 'Dark' },
	{ value: THEMES.COLOURFUL, label: 'Colourful' }
]);

const SetTheme = ({ setTheme, theme }) => {
	return (
		<form className="modal-set-theme">
			<ul>
				{OPTIONS.map(({ value, label }) => <li key={value}>
					<label className={`choice ${theme === value ? 'selected' : ''}`}>
						<input
							onChange={e => setTheme(e.target.value)}
							name="theme"
							type="radio"
							checked={theme === value}
							value={value}
							aria-label={label} />
						<span className={`theme-preview ${value}`} aria-hidden="true">
							<i className="bar" />
							<i className="col good" />
							<i className="col bad" />
							<i className="col actions" />
						</span>
						<span className="choice-check"><Icon name="check" /></span>
					</label>
				</li>)}
			</ul>
		</form>
	);
}

export default SetTheme;
