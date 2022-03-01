import React from 'react';

const Toast = ({ children, appearance }) => (
	<div class={`toast ${appearance}`}>{children}</div>
);

export default Toast;
