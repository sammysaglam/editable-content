import React from 'react';

export default class ToolbarIcon extends React.Component {
	constructor(props) {
		super(props);
		this.onMouseDown = this.onMouseDown.bind(this);
	}

	onMouseDown(e) {
		this.props.onToggle(this.props.id_,this.props.type);
		e.preventDefault() ;
	}

	render() {
		return (
			<li className={this.props.active ? 'active' : ''} onMouseDown={this.onMouseDown}><span className={this.props.id_.toLowerCase()}>{this.props.label}</span></li>
		)
	}
}