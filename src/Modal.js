import React from 'react';
import ModalContext from './ModalContext';

const Modal = ({ children, closeable = false, closeModal = null }) => {
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
			{children}
		</ModalContext.Provider>
	</div>);
};

export default Modal;
