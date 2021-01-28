import { repeat } from './utils';
import MarkdownParser from './MarkdownParser';
import React from 'react';

const mdParser = new MarkdownParser();

const exportToJson = ({ title, good, bad, actions }) => JSON.stringify({
  title, good, bad, actions
}, null, 4);

const mdItems = items => items.map(({ text, up = 0, down = 0 }) => `* ${text} ${repeat(up, '👍').join('')}${repeat(down, '👎').join('')}`).join('\n');
const exportToMarkdown = ({ title, good, bad, actions }) => `# ${title || 'Retrospective'}

## What went well
${mdItems(good)}

## What could we improve
${mdItems(bad)}

## Actions for next sprint
${mdItems(actions)}
`;

const confluenceItems = items => items.map(({ text, up = 0, down = 0 }) => {
	const newText = text.replace('[ ] ', '⬜ ')
		.replace('[X] ', '☑️ ')
		.replace('[x] ', '☑️ ');
	const thumbs = repeat(up, '👍').join('') + repeat(down, '👎').join('');

	return `* ${newText} ${thumbs}`;
}).join('\n');
const exportToConfluenceWiki = ({ title, good, bad, actions }) => `h1. ${title || 'Retrospective'}

{section}
{column:width=50%}
{panel:title=What went well|borderColor=#91c89c|backgroundColor=#f3f9f4}
${confluenceItems(good)}
{panel}
{column}

{column:width=50%}
{panel:title=What could we improve|borderColor=#d04437|backgroundColor=#fff8f7}
${confluenceItems(bad)}
{panel}
{column}
{section}

{section}
{panel:title=Actions for next sprint}
${confluenceItems(actions)}
{panel}
{section}
`;

const htmlItems = items => items.map(({ text, up, down }) => {
	const renderedText = mdParser.parse(text);
	const thumbs = repeat(up, '<span role="img" aria-label="Thumb up">👍</span>').join('')
		+ repeat(down, '<span role="img" aria-label="Thumb down">👎</span>').join('');

	return `<li>${renderedText} ${thumbs}</li>`;
}).join('\n');
const exportToHtml = ({ title, good, bad, actions }) => `<h1>${title || 'Retrospective'}</h1>

<article style="display: flex; flex-direction: row;">
	<section style="flex: 1;">
		<h2>What went well</h2>
		<ul>
			${htmlItems(good)}
		</ul>
	</section>
	<section style="flex: 1;">
		<h2>What could we improve</h2>
		<ul>
			${htmlItems(bad)}
		</ul>
	</section>
	<section style="flex: 1;">
		<h2>Actions for next sprint</h2>
		<ul>
			${htmlItems(actions)}
		</ul>
	</section>
</article>
`;

export { exportToJson, exportToMarkdown, exportToConfluenceWiki, exportToHtml };
