import { repeat } from './Item';

const exportToJson = ({ title, good, bad, actions }) => JSON.stringify({
  title, good, bad, actions
}, null, 4);

const mdItems = items => items.map(({ text, up = 0, down = 0 }) => `* ${text} ${repeat(up, '👍').join('')}${repeat(down, '👎').join('')}`).join('\n');
const exportToMarkdown = ({ title, good, bad, actions }) => `# ${title || 'Retrospective'}

## Good
${mdItems(good)}

## Bad
${mdItems(bad)}

## Actions
${mdItems(actions)}
`;

const confluenceItems = items => items.map(({ text, up = 0, down = 0 }) => `* ${text} ${repeat(up, '👍').join('')}${repeat(down, '👎').join('')}`).join('\n');
const exportToConfluenceWiki = ({ title, good, bad, actions }) => `h1. ${title || 'Retrospective'}

{section}
{column:width=50%}
{panel:title=Good|borderColor=#91c89c|backgroundColor=#f3f9f4}
${confluenceItems(good)}
{panel}
{column}

{column:width=50%}
{panel:title=Bad|borderColor=#d04437|backgroundColor=#fff8f7}
${confluenceItems(bad)}
{panel}
{column}
{section}

{section}
{panel:title=Actions}
${confluenceItems(actions)}
{panel}
{section}
`;

export { exportToJson, exportToMarkdown, exportToConfluenceWiki };