import React from 'react';
import Icon from '../Icon';

const ShareFallback = ({ copySucceeded }) => <div className="modal-share-fallback">
	<p className="modal-lede">Share the following URL to collaborate on this retrospective:</p>
	<input
		className="input"
		type="text"
		value={window.location}
		onFocus={e => e.target.select()}
		readOnly />
	{copySucceeded &&
		<p className="share-copied"><Icon name="check" /> The URL has been copied to your clipboard.</p>}
</div>;

export default ShareFallback;
