import React, {useEffect} from 'react';
import ModalContext from './ModalContext';
import {KEY} from "./constants";

const Modal = ({ children, closeable = false, closeModal = null }) => {
	const closeByHittingEscapeKeyHandler = e => {
		if (e.key === KEY.ESCAPE) {
			closeModal();
		}
	};

	useEffect(() => {
		if (!closeable) {
			return;
		}

		window.addEventListener('keydown', closeByHittingEscapeKeyHandler);

		return () => window.removeEventListener('keydown', closeByHittingEscapeKeyHandler)
	})

	return (<div class="modal">
		{closeable &&
		<div
			class="modal-close"
			title="Close"
			onClick={closeModal}
		>
			<svg viewBox="0 0 12 12" version="1.1"
				 xmlns="http://www.w3.org/2000/svg">
				<line x1="3" y1="9"
					  x2="9" y2="3"
					  stroke="white"
					  stroke-width="2"/>
				<line x1="3" y1="3"
					  x2="9" y2="9"
					  stroke="white"
					  stroke-width="2"/>
			</svg>
		</div>}
		<ModalContext.Provider
			value={{ closeModal}}
		>
			<div className="modal-content">
				{children}
			</div>
		</ModalContext.Provider>
	</div>);
};

export default Modal;
