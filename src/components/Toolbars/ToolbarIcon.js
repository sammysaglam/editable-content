import React from 'react';

export default class ToolbarIcon extends React.Component {
	constructor(props) {
		super(props);
		this.onMouseDown = this.onMouseDown.bind(this);
	}

	onMouseDown(event) {
		this.props.onToggle(this.props.type , this.props.styleType);
		event.preventDefault();
	}

	render() {
		return (
			<li className={this.props.active ? 'active' : ''} onMouseDown={this.onMouseDown}><span className={this.props.type.toLowerCase()}>{this.props.label}</span></li>
		)
	}
}