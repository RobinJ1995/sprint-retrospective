import React from 'react';
import ModalContext from './ModalContext';

const Modal = ({ children, closeable = false, closeModal = null }) => {
	return (<div class="modal">
		{closeable &&
		<div
			class="modal-close"
			title="Close"
			onClick={closeModal}
		>X</div>}
		<ModalContext.Provider
			value={{ closeModal}}
		>
			{children}
		</ModalContext.Provider>
	</div>);
};

export default Modal;
