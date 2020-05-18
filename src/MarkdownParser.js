import MarkdownIt from 'markdown-it';
import EmojiParser from 'markdown-it-emoji';

const MARKDOWNIT_OPTIONS = Object.freeze({
	html: false, // No HTML input
	breals: false, // Don't allow line breaks
	linkify: true, // Automatically detect links
	typographer: false, // Smart quotes, ellipses, dashes, ...
	maxNesting: 10, // Recursion limit
});
const MARKDOWNIT_RULES_DISABLE = Object.freeze([
	'newline', // No newlines
	'image', // No images
	'html_inline', // No HTML input
	'entity', // Don't parse HTML entities (e.g. &eur;)
]);

class MarkdownParser {
	constructor() {
		this.parser = new MarkdownIt(MARKDOWNIT_OPTIONS)
			.disable(MARKDOWNIT_RULES_DISABLE)
			.use(EmojiParser);
	}

	parse = markdown => this.parser.renderInline(markdown);
}

export default MarkdownParser;
