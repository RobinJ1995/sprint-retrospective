import React from 'react';

const Toast = ({ children, appearance }) => (
	<div className={`toast ${appearance}`} role="status">{children}</div>
);

export default Toast;
