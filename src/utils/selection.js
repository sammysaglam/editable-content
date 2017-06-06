import {EditorState} from 'draft-js';

export const getSelection = () => {
	const selection = window.getSelection();
	return {
		isCollapsed:selection.isCollapsed ,
		range:      (selection.rangeCount === 0 ? null : selection.getRangeAt(0))
	}
}

export const getSelectedBlockElement = (selectionRange) => {
	let node = selectionRange.startContainer;
	do {
		const nodeIsDataBlock = node.getAttribute
			? node.getAttribute('data-block')
			: null;
		if ( nodeIsDataBlock ) return node;
		node = node.parentNode;
	} while ( node !== null );
	return null;
}

export const getSelectionCoords = (editor , selectionRange) => {
	const editorBounds = editor.getBoundingClientRect();
	const rangeBounds  = selectionRange.getBoundingClientRect();
	const rangeWidth   = rangeBounds.right - rangeBounds.left;
	const rangeHeight  = rangeBounds.bottom - rangeBounds.top;
	const offsetLeft   = (rangeBounds.left - editorBounds.left)
		+ (rangeWidth/2)
		// 175px is width of inline toolbar
		- (175/2);
	// 42px is height of inline toolbar (35px) + 5px center triangle and 2px for spacing
	const offsetTop    = rangeBounds.top - editorBounds.top - 42;

	return {top:offsetTop , left:offsetLeft};
};

export const getEntityRange = (editorState , entityKey) => {

	const blocks = editorState.getCurrentContent().getBlocksAsArray();

	let entityRange;
	blocks.some((block , index) => {
		block.findEntityRanges(
			value => value.get('entity') === entityKey ,
			(start , end) => {
				entityRange = {
					start ,
					end ,
					blockKey:block.getKey() ,
					text:    block.get('text').slice(start , end) ,
				};
			} ,
		);
		if ( entityRange ) return true;
	});

	return entityRange;
};

export const selectEntity = (editorState , entityKey) => {

	const entityRange = getEntityRange(editorState , entityKey);

	const selection       = editorState.getSelection();
	const entitySelection = selection.merge({
		anchorKey:   entityRange.blockKey ,
		anchorOffset:entityRange.start ,
		focusKey:    entityRange.blockKey ,
		focusOffset: entityRange.end ,
	});

	return EditorState.forceSelection(editorState , entitySelection);
};