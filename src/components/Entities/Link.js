import React from 'react';

export default class Link extends React.Component {

	constructor(props) {
		super(props);

		this.state = Object.assign(this.props.contentState.getEntity(this.props.entityKey).getData());

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onUrlChange = this.onUrlChange.bind(this);
		this.onNewWindowOptionChange = this.onNewWindowOptionChange.bind(this);
	}

	onMouseOver() {

		const {showLinkToolbar} = this.props;

		if ( showLinkToolbar ) {
			const linkPosition = this.refs.link.getBoundingClientRect();
			showLinkToolbar(linkPosition , this);
		}
	}

	onMouseLeave() {

		const {hideLinkToolbar} = this.props;

		if ( hideLinkToolbar ) {
			hideLinkToolbar();
		}
	}

	onUrlChange(newUrl) {
		this.props.contentState.mergeEntityData(this.props.entityKey , {url:newUrl});
		this.setState({url:newUrl});
	}

	onNewWindowOptionChange(newVal) {
		this.props.contentState.mergeEntityData(this.props.entityKey , {target:newVal});
		this.setState({target:newVal});
	}

	render() {
		return (
			<a ref="link" href={this.state.url} onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave} target={this.state.target}>{this.props.children}</a>
		);
	}

	static findLinkEntities(contentBlock , callback , contentState) {
		contentBlock.findEntityRanges(
			character => {
				const entityKey = character.getEntity();
				return (
					entityKey !== null &&
					contentState.getEntity(entityKey).getType() === 'LINK'
				);
			} ,
			callback
		);
	}
}