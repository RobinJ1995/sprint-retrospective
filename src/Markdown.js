import React, { useState } from 'react';
import MarkdownParser from './MarkdownParser';

const mdParser = new MarkdownParser();

const Markdown = ({ children, onClick }) => (
	<span
		onClick={onClick}
		dangerouslySetInnerHTML={{__html: mdParser.parse(children)}}
	/>
);

export default Markdown;
