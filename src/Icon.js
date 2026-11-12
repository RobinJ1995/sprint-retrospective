import React from 'react';

const PATHS = Object.freeze({
	edit: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
	vote: [
		<path key="a" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />,
		<path key="b" d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
	],
	share: [
		<circle key="a" cx="18" cy="5" r="3" />,
		<circle key="b" cx="6" cy="12" r="3" />,
		<circle key="c" cx="18" cy="19" r="3" />,
		<path key="d" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
	],
	export: [
		<path key="a" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />,
		<path key="b" d="M7 10l5 5 5-5M12 15V3" />
	],
	theme: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
	key: <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />,
	lock: [
		<rect key="a" x="3" y="11" width="18" height="11" rx="2" ry="2" />,
		<path key="b" d="M7 11V7a5 5 0 0 1 10 0v4" />
	],
	logs: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
	comment: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
	close: <path d="M18 6L6 18M6 6l12 12" />,
	check: <path d="M20 6L9 17l-5-5" />,
	chevron: <path d="M9 18l6-6-6-6" />,
	github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
});

const Icon = ({ name }) => (
	<svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{PATHS[name]}</svg>
);

export default Icon;
