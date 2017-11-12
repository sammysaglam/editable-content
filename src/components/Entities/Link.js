import React from 'react';
import {NavLink} from 'react-router-dom';

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

		const {children} = this.props;
		const {url , target} = this.state;
		const {onMouseOver , onMouseLeave} = this;

		const isExternalUrl = target === '_blank' || url.startsWith('http');

		return (
			<span ref="link">
				{
					isExternalUrl ?
						<a href={url} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} target={target}>{children}</a>
						:
						<NavLink to={url} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>{children}</NavLink>
				}
			</span>
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