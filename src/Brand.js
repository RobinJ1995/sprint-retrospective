import React from 'react';

const Brand = ({ compact = false }) => (
	<a className={`brand ${compact ? 'compact' : ''}`} href="/" title="Sprint Retrospective" aria-label="Sprint Retrospective home">
		<img src={`${process.env.PUBLIC_URL}/logo.png`} alt="" width="28" height="28" />
		<span>Sprint Retrospective</span>
	</a>
);

export default Brand;
