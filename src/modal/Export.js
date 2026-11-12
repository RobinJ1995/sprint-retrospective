import React, {useState} from 'react';
import {exportToConfluenceWiki, exportToHtml, exportToJson, exportToMarkdown} from '../export';

const OPTIONS = Object.freeze({
	JSON: 'json',
	MARKDOWN: 'markdown',
	CONFLUENCE_WIKI: 'confluence_wiki',
	HTML: 'html'
});

const ExportJson = ({ data }) => <textarea readOnly>{exportToJson(data)}</textarea>
const ExportMarkdown = ({ data }) => <textarea readOnly>{exportToMarkdown(data)}</textarea>
const ExportConfluenceWiki = ({ data }) => (<div>
	<p>In Confluence, go to <em>Insert</em> ➡️ <em>Markup</em>, select <em>"Confluence Wiki"</em>, and paste the exported data.</p>
	<textarea readOnly>{exportToConfluenceWiki(data)}</textarea>
</div>);
const ExportHTML = ({ data }) => <textarea readOnly>{exportToHtml(data)}</textarea>

const Export = ({ data }) => {
	const [ selected, setSelected ] = useState(null);

	const populate = () => {
		switch (selected) {
			case OPTIONS.JSON:
				return <ExportJson data={data} />;
			case OPTIONS.MARKDOWN:
				return <ExportMarkdown data={data} />;
			case OPTIONS.CONFLUENCE_WIKI:
				return <ExportConfluenceWiki data={data} />;
			case OPTIONS.HTML:
				return <ExportHTML data={data} />;
			default:
				return null;
		}
	}

	return (<div className="modal-export">
		<div>
			<p className="modal-lede">Export to...</p>
			<div className="modal-export-tab-bar">
				<button
					type="button"
					className={selected === OPTIONS.JSON ? 'selected' : ''}
					onClick={() => setSelected(OPTIONS.JSON)}
				>JSON</button>
				<button
					type="button"
					className={selected === OPTIONS.MARKDOWN ? 'selected' : ''}
					onClick={() => setSelected(OPTIONS.MARKDOWN)}
				>Markdown</button>
				<button
					type="button"
					className={selected === OPTIONS.CONFLUENCE_WIKI ? 'selected' : ''}
					onClick={() => setSelected(OPTIONS.CONFLUENCE_WIKI)}
				>Confluence Wiki</button>
				<button
					type="button"
					className={selected === OPTIONS.HTML ? 'selected' : ''}
					onClick={() => setSelected(OPTIONS.HTML)}
				>HTML</button>
			</div>
			<div className="modal-export-content">{populate()}</div>
		</div>
	</div>);
}

export default Export;
