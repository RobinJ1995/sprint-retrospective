import React from 'react';

const ShareFallback = ({ copySucceeded }) => <div class="modal-share-fallback">
	<p>Share the following URL to collaborate on this retrospective:</p>
	<input
		type="text"
		value={window.location}
		readOnly />
	{copySucceeded &&
		<p>The URL has been copied to your clipboard.</p>}
</div>;

export default ShareFallback;
