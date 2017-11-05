import React from 'react';
import ToolbarIcon from './ToolbarIcon'

export default class SideToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.promptForImage = this.promptForImage.bind(this);
	}

	onMouseOver() {
		this.props.expandSideToolbar();
	}

	onMouseLeave() {
		this.props.collapseSideToolbar();
	}

	onMouseDown(event) {
		event.preventDefault();
	}

	showUnderConstruction() {
		alert('Still under development!');
	}

	promptForImage(event) {
		const url = prompt('Enter URL' , 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png');
		if ( url !== null ) {
			this.props.addImage(url);
		}
		event.preventDefault();
	}

	render() {
		const {editorState , isExpanded} = this.props;

		return (
			<div className="side-toolbar" style={{top:this.props.position.top}}>
				<div className={'media-buttons' + (isExpanded ? ' expanded' : '')} onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave}>
					<span className="add-image" onClick={this.promptForImage}><img src={require('./img/add-image.png')}/></span>
					<span className="add-video" onClick={this.showUnderConstruction}><img src={require('./img/add-video.png')}/></span>
					<span className="add-audio" onClick={this.showUnderConstruction}><img src={require('./img/add-audio.png')}/></span>
				</div>
				<span className="expand-icon" onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave} onMouseDown={this.onMouseDown}>
					≡
				</span>
				{isExpanded
					?
					<BlockSettings
						editorState={editorState}
						toggleBlockType={this.props.toggleBlockType}
						expandSideToolbar={this.onMouseOver}
						collapseSideToolbar={this.onMouseLeave}
						sideToolbarState={this.state}
					/>
					:
					null
				}
			</div>
		)

	}
}

const BLOCK_TYPES = [
	{
		typeId:'header-one' ,
		label:'H1'
	} ,
	{
		typeId:'header-two' ,
		label:'H2'
	} ,
	{
		typeId:'header-three' ,
		label:'H3'
	} ,
	{
		typeId:'header-four' ,
		label:'H4'
	} ,
	{
		typeId:'header-five' ,
		label:'H5'
	} ,
	{
		typeId:'header-six' ,
		label:'H6'
	} ,
	{
		typeId:'blockquote' ,
		label:'"'
	} ,
	{
		typeId:'ordered-list-item' ,
		label:<img src={require('./img/ol-list.png')}/>
	} ,
	{
		typeId:'unordered-list-item' ,
		label:<img src={require('./img/ul-list.png')}/>
	} ,
	{
		typeId:'code-block' ,
		label:'<code>'
	}
];

class BlockSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sideToolbarState:props.sideToolbarState
		}

		this.onToggle = this.onToggle.bind(this);
	}

	onToggle(id) {
		this.props.toggleBlockType(id);
	}

	render() {

		const {editorState} = this.props;
		const selection = editorState.getSelection();
		const currentBlockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();

		return (
			<div className="block-settings toolbar" onMouseOver={this.props.expandSideToolbar} onMouseLeave={this.props.collapseSideToolbar}>
				<ul className="toolbar-icons">
					{
						BLOCK_TYPES.map(blockType =>
							<ToolbarIcon
								key={blockType.typeId}
								type={blockType.typeId}
								label={blockType.label}
								active={currentBlockType === blockType.typeId}
								onToggle={this.onToggle}
							/>
						)
					}
				</ul>
			</div>
		)
	}
}