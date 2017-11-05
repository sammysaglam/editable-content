import React from 'react';
import ToolbarIcon from './ToolbarIcon'

const INLINE_STYLE = 0;
const LINK = 1;

const TOOLBAR_ITEMS = [
	{
		typeId:'BOLD' ,
		label:'B' ,
		styleType:INLINE_STYLE
	} ,
	{
		typeId:'ITALIC' ,
		label:'I' ,
		styleType:INLINE_STYLE
	} ,
	{
		typeId:'UNDERLINE' ,
		label:'U' ,
		styleType:INLINE_STYLE
	} ,
	{
		typeId:'STRIKETHROUGH' ,
		label:'abc' ,
		styleType:INLINE_STYLE
	} ,
	{
		typeId:'LINK' ,
		label:'url' ,
		styleType:LINK
	}
];

export default class InlineToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.onToggle = this.onToggle.bind(this);
	}

	onToggle(id , type) {
		if ( type === INLINE_STYLE ) {
			this.props.toggleStyle(id);

		} else if ( type === LINK ) {
			const url = prompt('Enter URL' , 'http://www.');
			if ( url !== null ) {
				this.props.toggleLink(url);
			}
		}
	}

	render() {
		const {editorState} = this.props;
		const currentStyle = editorState.getCurrentInlineStyle();

		const selectionState = editorState.getSelection();
		const selectionKey = selectionState.getStartKey();
		const contentState = editorState.getCurrentContent();

		// get the block where the cursor is
		const block = contentState.getBlockForKey(selectionKey);

		// get the entity where the cursor is
		const entityKey = block.getEntityAt(selectionState.getStartOffset());

		let entityType = '';
		if ( entityKey ) {
			const entityInstance = contentState.getEntity(entityKey);
			entityType = entityInstance.getType()
		}

		const {
			position = {
				top:0 ,
				left:0
			}
		} = this.props;

		const styleExp = {
			top:position.top ,
			left:position.left ,
			transform:'scale(' + (this.props.showToolbar ? '1' : '0') + ')'
		};

		return (
			<div className="inline-toolbar toolbar" style={styleExp}>
				{(
					this.props.showToolbar ? (
						<ul className="toolbar-icons">
							{
								TOOLBAR_ITEMS.map(item =>
									<ToolbarIcon
										key={item.typeId}
										type={item.typeId}
										styleType={item.styleType}
										label={item.label}
										active={currentStyle.has(item.typeId) || entityType === item.typeId}
										onToggle={this.onToggle}
									/>
								)
							}
						</ul>
					) : null
				)}
			</div>
		);
	}
}