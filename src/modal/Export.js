import React, {useState} from 'react';
import {KEY} from '../constants';
import ModalContext from '../ModalContext';
import {exportToConfluenceWiki, exportToJson, exportToMarkdown} from '../export';

const OPTIONS = Object.freeze({
	JSON: 'json',
	MARKDOWN: 'markdown',
	CONFLUENCE_WIKI: 'confluence_wiki'
});

const ExportJson = ({ data }) => <textarea readOnly>{exportToJson(data)}</textarea>
const ExportMarkdown = ({ data }) => <textarea readOnly>{exportToMarkdown(data)}</textarea>
const ExportConfluenceWiki = ({ data }) => (<div>
	<p>In Confluence, go to <em>Insert</em> ➡️ <em>Markup</em>, select <em>"Confluence Wiki"</em>, and paste the exported data.</p>
	<textarea readOnly>{exportToConfluenceWiki(data)}</textarea>
</div>);

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
			default:
				return null;
		}
	}

	return (<div class="modal-export">
		<ModalContext.Consumer>
			{({closeModal}) => (
				<div>
					<p>Export to...</p>
					<div class="modal-export-tab-bar">
						<button
							className={selected === OPTIONS.JSON && 'selected'}
							onClick={() => setSelected(OPTIONS.JSON)}
						>JSON</button>
						<button
							className={selected === OPTIONS.MARKDOWN && 'selected'}
							onClick={() => setSelected(OPTIONS.MARKDOWN)}
						>Markdown</button>
						<button
							className={selected === OPTIONS.CONFLUENCE_WIKI && 'selected'}
							onClick={() => setSelected(OPTIONS.CONFLUENCE_WIKI)}
						>Confluence Wiki</button>
					</div>
					<div class="modal-export-content">{populate()}</div>
				</div>
			)}
		</ModalContext.Consumer>
	</div>);
}

export default Export;
