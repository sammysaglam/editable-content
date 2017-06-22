import React from 'react';
import ToolbarIcon from './ToolbarIcon'

const INLINE_STYLE = 0;
const LINK         = 1;

const TOOLBAR_ITEMS = [
	{id_:'BOLD' , label:'B' , type:INLINE_STYLE} ,
	{id_:'ITALIC' , label:'I' , type:INLINE_STYLE} ,
	{id_:'UNDERLINE' , label:'U' , type:INLINE_STYLE} ,
	{id_:'STRIKETHROUGH' , label:'abc' , type:INLINE_STYLE} ,
	{id_:'LINK' , label:'url' , type:LINK}
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
		const currentStyle  = editorState.getCurrentInlineStyle();

		const selectionState = editorState.getSelection();
		const selectionKey   = selectionState.getStartKey();
		const contentState   = editorState.getCurrentContent();

		// get the block where the cursor is
		const block = contentState.getBlockForKey(selectionKey);

		// get the entity where the cursor is
		const entityKey = block.getEntityAt(selectionState.getStartOffset());

		let entityType = '';
		if ( entityKey ) {
			const entityInstance = contentState.getEntity(entityKey);
			entityType           = entityInstance.getType()
		}

		const {position = {top:0 , left:0}} = this.props;

		const styleExp = {
			top:      position.top ,
			left:     position.left ,
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
										key={item.id_}
										id_={item.id_}
										type={item.type}
										label={item.label}
										active={currentStyle.has(item.id_) || entityType === item.id_}
										onToggle={this.onToggle}
									/>
								)
							}
						</ul>
					) : null
				)}
			</div>
		);
	} ;
}