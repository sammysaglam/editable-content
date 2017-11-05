import React from 'react';

export default class LinkToolbar extends React.Component {

	constructor(props) {
		super(props);

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onUrlChange = this.onUrlChange.bind(this);
		this.onNewWindowOptionChange = this.onNewWindowOptionChange.bind(this);
		this.onDeleteLink = this.onDeleteLink.bind(this);
	}

	onMouseOver() {
		this.props.showLinkToolbar();
	}

	onMouseLeave() {
		this.props.hideLinkToolbar();
	}

	onDeleteLink() {
		this.props.removeLink(this.props.linkComponent.props.entityKey);
		this.props.hideLinkToolbar(false);
	}

	onUrlChange(event) {
		const newVal = event.target.value;
		this.props.linkComponent.onUrlChange(newVal);
		this.props.onChange();
	}

	onNewWindowOptionChange(event) {
		const newVal = event.target.checked ? '_blank' : '_self';
		this.props.linkComponent.onNewWindowOptionChange(newVal);
		this.props.onChange();
	}

	render() {
		return (
			<div
				className="toolbar link-toolbar"
				style={this.props.position}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
			>
				<div>
					<input type="text" value={this.props.linkComponent.state.url} onChange={this.onUrlChange} onClick={this.onInputClick}/>
					<button onClick={this.onDeleteLink}>Remove</button>
					<div className="option">
						<input type="checkbox" checked={this.props.linkComponent.state.target === '_blank'} onChange={this.onNewWindowOptionChange} onClick={this.onInputClick}/>
						<span>Open in new window</span>
					</div>
				</div>
			</div>
		)
	}

}