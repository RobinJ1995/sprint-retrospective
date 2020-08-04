import React from 'react';
import {THEMES} from '../constants';
import ModalContext from '../ModalContext';

const SetTheme = ({ setTheme, theme }) => {
	return (
		<ModalContext.Consumer>
			{({ closeModal }) => {
				return (<form class="modal-set-theme">
					<ul>
						<li>
							<label>
								<input
									onChange={e => setTheme(e.target.value)}
									name="theme"
									type="radio"
									checked={theme === THEMES.DARK}
									value={THEMES.DARK} />
								Dark (default)</label>
						</li>
						<li>
							<label>
								<input
									onChange={e => setTheme(e.target.value)}
									name="theme"
									type="radio"
									checked={theme === THEMES.COLOURFUL}
									value={THEMES.COLOURFUL} />
								Colourful</label>
						</li>
					</ul>
				</form>)
			}}
		</ModalContext.Consumer>
	);
}

export default SetTheme;
