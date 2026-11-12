import React, {useEffect} from 'react';
import ModalContext from './ModalContext';
import Icon from './Icon';
import {KEY} from "./constants";

const Modal = ({ children, title = null, closeable = false, closeModal = null }) => {
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

	return (<div className="modal" role="dialog" aria-modal="true" aria-label={title}>
		{(title || closeable) &&
		<div className="modal-header">
			{title && <h2>{title}</h2>}
			{closeable &&
			<button
				type="button"
				className="modal-close"
				title="Close"
				aria-label="Close"
				onClick={closeModal}
			><Icon name="close" /></button>}
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
