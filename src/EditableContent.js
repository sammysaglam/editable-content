import React from 'react';
import jQuery from 'jquery';
import {Editor , EditorState , ContentState , Modifier , RichUtils , AtomicBlockUtils , CompositeDecorator , convertToRaw , convertFromRaw , convertFromHTML} from 'draft-js';
import {convertToHTML} from 'draft-convert';

import Link from './components/Entities/Link';
import Image from './components/Entities/Image';
import LinkToolbar from './components/Toolbars/LinkToolbar';
import InlineToolbar from './components/Toolbars/InlineToolbar';
import SideToolbar from './components/Toolbars/SideToolbar';

import {utils} from './utils/entry.js';

class EditableContent extends React.Component {
	constructor(props) {
		super(props);

		this.sideToolbarTimeout = null;
		this.linkToolbarTimeout = null;

		this.state = {
			inlineToolbar:{show:false} ,
			linkToolbar:{show:false} ,
			sideToolbar:{isExpanded:false}
		};

		this.handleKeyCommand = this.handleKeyCommand.bind(this);
		this.onTab = this.onTab.bind(this);
		this.onChange = this.onChange.bind(this);
		this.toggleStyle = this.toggleStyle.bind(this);
		this.toggleLink = this.toggleLink.bind(this);
		this.toggleBlockType = this.toggleBlockType.bind(this);
		this.addImage = this.addImage.bind(this);
		this.removeImage = this.removeImage.bind(this);
		this.removeLink = this.removeLink.bind(this);
		this.updateSelection = this.updateSelection.bind(this);
		this.contentStateToHTML = this.contentStateToHTML.bind(this);

		this.expandSideToolbar = this.expandSideToolbar.bind(this);
		this.collapseSideToolbar = this.collapseSideToolbar.bind(this);
		this.showLinkToolbar = this.showLinkToolbar.bind(this);
		this.hideLinkToolbar = this.hideLinkToolbar.bind(this);

		this.handlePastedText = this.handlePastedText.bind(this);
		this.blockRenderer = this.blockRenderer.bind(this);
		this.mediaBlockRenderer = this.mediaBlockRenderer.bind(this);
	}

	onChange(editorState) {

		const {updateContents , saveContents} = this.props;

		// is selection is not collapsed, show the inlineToolbar for formatting the selection
		const selection = utils.selection.getSelection();
		if ( !selection.isCollapsed && !editorState.getSelection().isCollapsed() && selection.range ) {

			const offset = utils.selection.getSelectionCoords(this.container , selection.range);

			this.setState({
				inlineToolbar:{
					show:true ,
					position:{
						top:offset.top ,
						left:offset.left
					}
				}
			});

		} else {
			this.setState({inlineToolbar:{show:false}});
		}

		const newContentState = editorState.getCurrentContent();
		const newHtmlContent = this.contentStateToHTML(newContentState);
		const oldHtmlContent = this.state.htmlContent;
		const rawContent = convertToRaw(editorState.getCurrentContent());

		this.setState({
			htmlContent:newHtmlContent
		});

		// update redux state
		updateContents(this.addCompositeDecorators(editorState));

		// call save function on change
		if ( saveContents && newHtmlContent !== oldHtmlContent ) {
			saveContents(rawContent , newHtmlContent);
		}

		setTimeout(this.updateSelection , 0);
	}

	componentWillReceiveProps(nextProps) {

		// call onChange to add composite decorators if they dont exist yet
		if ( nextProps.editorState.getDecorator() === null ) {
			this.onChange(nextProps.editorState);
		}
	}

	contentStateToHTML(contentState) {
		const html = convertToHTML({

			// eslint-disable-next-line consistent-return
			styleToHTML:style => {
				if ( style === 'BOLD' ) {
					return <strong/>;
				} else if ( style === 'UNDERLINE' ) {
					return <span style={{textDecoration:'underline'}}/>;
				} else if ( style === 'STRIKETHROUGH' ) {
					return <span style={{textDecoration:'line-through'}}/>;
				}
			} ,

			// eslint-disable-next-line consistent-return
			blockToHTML:block => {
				if ( block.type === 'code-block' ) {
					return {
						start:'<code class="code-line">' ,
						end:'</code>' ,
						nestStart:'<pre>' ,
						nestEnd:'</pre>'
					}
				} else if ( block.type === 'atomic' ) {
					return <div/>;

				} else if ( block.type === 'unstyled' ) {
					return {
						start:'<div class="paragraph">' ,
						end:'</div>' ,
						empty:'<div class="paragraph">&nbsp;</div>'
					}
				}
			} ,
			entityToHTML:(entity , originalText) => {

				if ( entity.type === 'LINK' ) {
					return `<a href="${entity.data.url}" target="${entity.data.target}">${originalText}</a>`;

				} else if ( entity.type === 'IMAGE' ) {

					let alignStyle = null;
					let floatStyle = null;
					switch (entity.data.align) {
						case 'left':
							alignStyle = '';
							floatStyle = 'float:left ;';
							break;

						case 'right':
							alignStyle = '';
							floatStyle = 'float:right ;';
							break;

						case 'center':
							alignStyle = 'text-align:center ;';
							floatStyle = 'float:none ;';
							break;

						// error
						default:
							return null;
					}

					return `<div style="${alignStyle}"><img src='${entity.data.src}' style='${floatStyle}' /></div>`;
				}

				return originalText;
			}
		})(contentState);

		return html;
	}

	updateSelection() {
		const selectionRange = utils.selection.getSelection().range;
		let selectedBlock = null;
		if ( selectionRange ) {
			selectedBlock = utils.selection.getSelectedBlockElement(selectionRange);
		}
		this.setState({
			selectedBlock ,
			selectionRange
		});
	}

	handleKeyCommand(command) {

		const {editorState} = this.props;

		const newState = RichUtils.handleKeyCommand(editorState , command);
		if ( newState ) {
			this.onChange(newState);
			return 'handled';
		}

		return 'not-handled';
	}

	onTab(event) {

		const {editorState} = this.props;
		const contentState = editorState.getCurrentContent();
		const selectionState = editorState.getSelection();
		const selectionKey = selectionState.getStartKey();
		const currentBlock = contentState.getBlockForKey(selectionKey);
		const blockType = currentBlock.getType();

		if ( blockType === 'ordered-list-item' || blockType === 'unordered-list-item' ) {
			const maxDepth = 9;
			this.onChange(RichUtils.onTab(event , editorState , maxDepth));

		} else {

			const rangeRemoved = Modifier.removeRange(
				contentState ,
				selectionState ,
				'backward'
			);
			const rangeRemovedState = EditorState.push(editorState , rangeRemoved , 'selection-removed');

			const tabAdded = Modifier.insertText(
				rangeRemovedState.getCurrentContent() ,
				rangeRemovedState.getSelection() ,
				'   '
			);

			const newState = EditorState.push(editorState , tabAdded , 'tab-added');
			this.onChange(newState);

			event.preventDefault();
		}
	}

	toggleStyle(id) {
		const {editorState} = this.props;

		const newState = RichUtils.toggleInlineStyle(editorState , id);
		this.onChange(newState);
	}

	toggleLink(url) {
		const {editorState} = this.props;
		const contentState = editorState.getCurrentContent();
		const contentStateWithEntity = contentState.createEntity(
			'LINK' ,
			'MUTABLE' ,
			{
				url ,
				target:'_self'
			}
		);
		const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
		const newEditorState = EditorState.set(editorState , {currentContent:contentStateWithEntity});
		const newState = RichUtils.toggleLink(
			newEditorState ,
			newEditorState.getSelection() ,
			entityKey
		);
		this.onChange(newState);
	}

	removeLink(entityKey) {
		const {editorState} = this.props;

		const entityRange = utils.selection.getEntityRange(editorState , entityKey);
		const selection = editorState.getSelection();
		const entitySelection = selection.merge({
			anchorKey:entityRange.blockKey ,
			anchorOffset:entityRange.start ,
			focusKey:entityRange.blockKey ,
			focusOffset:entityRange.end
		});
		const newState = RichUtils.toggleLink(editorState , entitySelection , null);
		this.onChange(newState);
		setTimeout(() => {
			this.refs.editor.focus();
		} , 0);

	}

	addImage(url) {
		const {editorState} = this.props;
		const contentState = editorState.getCurrentContent();
		const contentStateWithEntity = contentState.createEntity(
			'IMAGE' ,
			'IMMUTABLE' ,
			{
				src:url ,
				align:'left'
			}
		);
		const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
		const newEditorState = EditorState.set(editorState , {currentContent:contentStateWithEntity});
		const newState = AtomicBlockUtils.insertAtomicBlock(
			newEditorState ,
			entityKey ,
			' '
		);
		this.onChange(newState);
	}


	removeImage(entityKey) {
		const {editorState} = this.props;

		const entityRange = utils.selection.getEntityRange(editorState , entityKey);
		const selection = editorState.getSelection();
		const entitySelection = selection.merge({
			anchorKey:entityRange.blockKey ,
			anchorOffset:entityRange.start ,
			focusKey:entityRange.blockKey ,
			focusOffset:entityRange.end
		});

		const withoutImage = Modifier.removeRange(editorState.getCurrentContent() , entitySelection , 'backward');
		const resetBlock = Modifier.setBlockType(
			withoutImage ,
			withoutImage.getSelectionAfter() ,
			'unstyled'
		);
		const newState = EditorState.push(editorState , resetBlock , 'remove-range');

		this.onChange(EditorState.forceSelection(newState , resetBlock.getSelectionAfter()));
		setTimeout(() => {
			this.refs.editor.focus();
		} , 0);

	}

	toggleBlockType(id) {
		const {editorState} = this.props;

		const newState = RichUtils.toggleBlockType(editorState , id);
		this.onChange(newState);
	}

	expandSideToolbar() {
		this.setState({sideToolbar:{isExpanded:true}});
		clearTimeout(this.sideToolbarTimeout);
	}

	collapseSideToolbar() {

		const TIME_TO_HIDE = 200;

		this.sideToolbarTimeout = setTimeout(() => {
			this.setState({sideToolbar:{isExpanded:false}});
		} , TIME_TO_HIDE);
	}

	// eslint-disable-next-line consistent-return
	showLinkToolbar(linkPosition , linkComponent) {

		if ( !this ) {
			return false;
		}

		const {linkToolbar} = this.state;
		const TOOLBAR_OFFSET_TOP = -45;

		if ( linkComponent ) {

			const containerPosition = this.container.getBoundingClientRect();
			const toolbarPosition = {
				top:linkPosition.top - containerPosition.top + TOOLBAR_OFFSET_TOP ,
				left:linkPosition.left - containerPosition.left
			};

			this.setState({
				linkToolbar:{
					show:true ,
					position:toolbarPosition ,
					linkComponent
				}
			});

		} else {

			const linkToolbarSettings = linkToolbar;
			linkToolbarSettings.show = true;
			this.setState({
				linkToolbar:linkToolbarSettings
			});
		}

		clearTimeout(this.linkToolbarTimeout);
	}

	// eslint-disable-next-line consistent-return
	hideLinkToolbar(timeout = true) {

		if ( !this ) {
			return false;
		}

		const TIME_TO_HIDE = 400;

		this.linkToolbarTimeout = setTimeout(() => {
			this.setState({linkToolbar:{show:false}});
		} , timeout ? TIME_TO_HIDE : 0);
	}

	render() {
		const {editorState , disabled , className} = this.props;
		const {selectedBlock , inlineToolbar , sideToolbar , linkToolbar} = this.state;
		const editor = this.container;

		// get selectedBlock, and make sure it is the child of the editor
		let sideToolbarOffsetTop = 0;
		if ( selectedBlock && ((parent , child) => {

				let node = child.parentNode;
				while ( node !== null ) {
					if ( node === parent ) {
						return true;
					}
					node = node.parentNode;
				}
				return false;

			})(editor , selectedBlock)
		) {

			// calculate sideToolbar coordinates
			const editorBounds = editor.getBoundingClientRect();
			const blockBounds = selectedBlock.getBoundingClientRect();

			// eslint-disable-next-line no-magic-numbers
			sideToolbarOffsetTop = (blockBounds.top - editorBounds.top) - ((blockBounds.top - blockBounds.bottom) / 2) - 16;
		}

		// classNames
		const classNames = [
			'editable-content' ,
			disabled === true ? 'disabled' : null ,
			className

		].filter(classNameItem => classNameItem).join(' ');

		// if editorState not defined then is loading
		if ( !editorState ) {
			return <div className={classNames}>loading...</div>;
		}

		// return
		return (
			<div className={classNames} ref={container => {
				this.container = container;
			}}>
				{
					disabled !== true && <InlineToolbar
						editorState={editorState}
						showToolbar={inlineToolbar.show && !sideToolbar.isExpanded}
						toggleStyle={this.toggleStyle}
						toggleLink={this.toggleLink}
						position={inlineToolbar.position}
					/>
				}
				{
					disabled !== true && selectedBlock ?

						<SideToolbar
							editorState={editorState}
							position={{top:sideToolbarOffsetTop}}
							toggleBlockType={this.toggleBlockType}
							addImage={this.addImage}
							expandSideToolbar={this.expandSideToolbar}
							collapseSideToolbar={this.collapseSideToolbar}
							isExpanded={sideToolbar.isExpanded}
						/>

						:

						null
				}
				{
					disabled !== true && linkToolbar.show && !sideToolbar.isExpanded && !inlineToolbar.show ?

						<LinkToolbar
							position={linkToolbar.position}
							linkComponent={linkToolbar.linkComponent}
							removeLink={this.removeLink}
							showLinkToolbar={this.showLinkToolbar}
							hideLinkToolbar={this.hideLinkToolbar}
							onChange={() => this.onChange(editorState)}
						/>

						:

						null
				}
				<Editor
					editorState={editorState}
					spellCheck={true}
					blockRendererFn={this.blockRenderer}
					blockStyleFn={this.myBlockStyleFn}
					handlePastedText={this.handlePastedText}
					onChange={this.onChange}
					onTab={this.onTab}
					readOnly={disabled === true}
					handleKeyCommand={this.handleKeyCommand}
					ref="editor"
					placeholder={disabled ? '' : 'Enter some text...'}
				/>
			</div>
		);
	}

	// eslint-disable-next-line consistent-return
	handlePastedText(text , html) {

		// build html into DOM elements
		const {editorState} = this.props;
		const domObject = jQuery(html);

		let newHtml = null;

		/* eslint-disable no-magic-numbers */

		// check if code is being pasted
		if ( jQuery(domObject).eq(1).prop('tagName') && jQuery(domObject).eq(1).prop('tagName').toLowerCase() === 'pre' ) {

			// retrieve pasted HTML and convert all line breaks to <pre> tags
			newHtml = domObject.eq(1).html();
			newHtml = '<pre>' + newHtml.split('<br>').join('</pre><pre>') + '</pre>';

		} else if ( domObject.eq(2).prop('tagName') && domObject.eq(2).prop('tagName').toLowerCase() === 'pre' ) {

			// loop through all code lines, and convert to simple text
			newHtml = '';
			domObject.eq(2).find('> pre').each((index , element) => {
				newHtml += '<pre>' + jQuery(element).text() + '</pre>';
			});

			// if the above didnt work, try the following
			if ( !newHtml ) {
				newHtml = domObject.eq(2).html();
				newHtml = newHtml.split('\n').join('</code><code>');
				newHtml = newHtml.replace(/<code/g , '<pre').replace(/<\/code>/g , '</pre>');
			}

		} else if ( domObject.eq(2).prop('tagName') && domObject.eq(2).prop('tagName').toLowerCase() === 'code' ) {

			// retrieve pasted HTML and convert all line breaks to <pre> tags
			newHtml = domObject.eq(2).html();
			newHtml = '<pre>' + newHtml.split('<br>').join('</pre><pre>') + '</pre>';
			newHtml = newHtml.replace(/<code/g , '<pre').replace(/<\/code>/g , '</pre>');

		} else if ( domObject.eq(2).find('> .phpcode > code').length === 1 ) {

			// retrieve pasted HTML and convert all line breaks to <pre> tags
			newHtml = domObject.eq(2).find('> .phpcode > code').html();
			newHtml = '<pre>' + newHtml.split('<br>').join('</pre><pre>') + '</pre>';
			newHtml = newHtml.split('\n').join('</pre><pre>');
			newHtml = newHtml.replace(/<code/g , '<pre').replace(/<\/code>/g , '</pre>');
		}

		/* eslint-enable no-magic-numbers */

		// if a new HTML is defined, override default paste behaviour
		if ( newHtml ) {

			// add empty block before code - or else, for some unknown reason, Draft tends to hang if not
			newHtml = '<div>&nbsp;</div>' + newHtml;

			// keep empty code lines
			newHtml = newHtml.replace(/<pre><\/pre>/g , '<pre>&nbsp; </pre>')

			// create blocks from modified HTML
			const blocksFromHTML = convertFromHTML(newHtml);
			const pastedDataState = ContentState.createFromBlockArray(
				blocksFromHTML.contentBlocks ,
				blocksFromHTML.entityMap
			);
			const blockMap = pastedDataState.getBlockMap();

			// insert new blocks into current selection
			const newState = Modifier.replaceWithFragment(editorState.getCurrentContent() , editorState.getSelection() , blockMap);
			this.onChange(EditorState.push(editorState , newState , 'insert-fragment'));

			// return true, to let Draft know we have handled the paste event
			return true;
		}
	}

	// eslint-disable-next-line consistent-return
	blockRenderer(block) {

		if ( block.getType() === 'atomic' ) {
			return {
				component:this.mediaBlockRenderer ,
				editable:false
			};
		}
	}

	// eslint-disable-next-line consistent-return
	myBlockStyleFn(contentBlock) {
		const type = contentBlock.getType();

		if ( type === 'code-block' ) {
			return 'code-line';

		} else if ( type === 'unstyled' ) {
			return 'paragraph';
		}
	}

	mediaBlockRenderer(props) {
		const entityKey = props.block.getEntityAt(0);
		const entity = props.contentState.getEntity(entityKey);
		const entityData = entity.getData();
		const entityType = entity.getType();

		let media = null;
		if ( entityType === 'IMAGE' ) {
			media = <Image src={entityData.src} align={entityData.align} entityKey={entityKey} contentState={props.contentState} removeImage={this.removeImage}/>;
		}

		return media;
	}

	componentWillUnmount() {
		if ( this.props.updateContents ) {
			this.props.updateContents(this.removeCompositeDecorators(this.props.editorState));
		}
	}

	componentDidMount() {
		if ( this.props.updateContents ) {
			this.onChange(this.props.editorState);
		}
	}

	removeCompositeDecorators(editorState) {
		return EditorState.set(editorState , {decorator:null});
	}

	addCompositeDecorators(editorState) {

		if ( editorState.getDecorator() !== null ) {
			return editorState;
		}

		const decorators = new CompositeDecorator([
			{
				strategy:Link.findLinkEntities ,
				component:props => (
					<Link
						showLinkToolbar={this.showLinkToolbar}
						hideLinkToolbar={this.hideLinkToolbar}
						{...props}
					/>
				)
			}
		]);

		return EditorState.set(editorState , {decorator:decorators});
	}

	rawContentToEditorState(rawContentInput) {

		// check if empty object
		const editorStateWithoutDecorators = (rawContent => {

			// check if empty object
			if ( Object.keys(rawContent).length === 0 ) {
				return EditorState.createEmpty();
			}

			// add empty entity map if doesnt exist
			if ( !rawContent.entityMap ) {
				rawContent.entityMap = {};
			}

			// decode html chars function
			const decodeHTML = text => {

				let newText = text;

				/* eslint-disable array-element-newline */
				const entities = [
					['amp' , '&'] ,
					['apos' , '\''] ,
					['#x27' , '\''] ,
					['#x2F' , '/'] ,
					['#39' , '\''] ,
					['#47' , '/'] ,
					['lt' , '<'] ,
					['gt' , '>'] ,
					['nbsp' , ' '] ,
					['quot' , '"']
				];
				/* eslint-enable array-element-newline */

				// eslint-disable-next-line semi-spacing
				for ( let index = 0 , max = entities.length ; index < max ; ++index ) {
					newText = newText.replace(new RegExp('&' + entities[index][0] + ';' , 'g') , entities[index][1]);
				}

				return newText;
			};

			// process blocks
			rawContent.blocks.forEach(block => {

				// convert HTML special chars to normal chars - e.g. '&lt;' ==> '<'
				block.text = decodeHTML(block.text);

				// make sure depth properties are integers, or else Draft hangs
				block.depth = parseInt(block.depth);
			});

			// create editorState
			return EditorState.createWithContent(convertFromRaw(rawContent));

		})(rawContentInput);

		return this.addCompositeDecorators(editorStateWithoutDecorators);
	}

}

module.exports = EditableContent;