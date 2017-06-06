import React from 'react';
import ImageToolbar from '../Toolbars/ImageToolbar';

export default class Image extends React.Component {

	constructor(props) {
		super(props);
		this.state = {align:this.props.align ? this.props.align : 'left'};

		this.alignLeft           = this.alignLeft.bind(this);
		this.alignCenter         = this.alignCenter.bind(this);
		this.alignRight          = this.alignRight.bind(this);
		this.scaleToOriginalSize = this.scaleToOriginalSize.bind(this);
		this.scaleOut            = this.scaleOut.bind(this);
		this.scaleIn             = this.scaleIn.bind(this);
		this.removeImage         = this.removeImage.bind(this);

		this.onImageLoaded = this.onImageLoaded.bind(this);
	}

	alignLeft() {
		this.props.contentState.mergeEntityData(this.props.entityKey , {align:'left'});
		this.setState({
			align:'left'
		});
	}

	alignCenter() {
		this.props.contentState.mergeEntityData(this.props.entityKey , {align:'center'});
		this.setState({
			align:'center'
		});
	}

	alignRight() {
		this.props.contentState.mergeEntityData(this.props.entityKey , {align:'right'});
		this.setState({
			align:'right'
		});
	}

	scaleToOriginalSize() {
		if ( this.state.originalWidth ) {
			this.setState({
				imageWidth:this.state.originalWidth
			})
		}
	}

	scaleOut() {
		if ( this.state.originalWidth ) {
			this.setState({
				imageWidth:this.state.imageWidth + 50
			})
		}
	}

	scaleIn() {
		if ( this.state.originalWidth ) {
			this.setState({
				imageWidth:this.state.imageWidth - 50
			})
		}
	}

	removeImage() {
		if ( confirm('Delete image?') ) {
			this.props.removeImage(this.props.entityKey);
		}
	}

	onMouseDown(e) {
		e.preventDefault();
	}

	onKeyPress(e) {
		e.preventDefault();
	}

	onImageLoaded() {
		this.setState({
			originalWidth:this.refs.image.width ,
			imageWidth:   this.refs.image.width
		})
	}

	render() {

		let alignStyle;
		switch (this.state.align) {
			case 'left':
				alignStyle = {
					float:'left'
				}
				break;

			case 'right':
				alignStyle = {
					float:'right'
				}
				break;

			case 'center':
				alignStyle = {
					float:    'none' ,
					textAlign:'center' ,
					width:    '100%'
				}
				break;
		}

		let imageStyle;
		if ( this.state.originalWidth ) {
			imageStyle = {
				width: this.state.imageWidth ,
				zIndex:-1
			}
		} else {
			imageStyle = {
				zIndex:-1
			}
		}

		return (
			<div onMouseDown={this.onMouseDown} className={'image-entity align-' + this.state.align} style={alignStyle}>
				<div>
					<div>
						<img onLoad={this.onImageLoaded} ref="image" src={this.props.src} style={imageStyle}/>
						<ImageToolbar
							scaleToOriginalSize={this.scaleToOriginalSize}
							scaleIn={this.scaleIn}
							scaleOut={this.scaleOut}
							alignLeft={this.alignLeft}
							alignCenter={this.alignCenter}
							alignRight={this.alignRight}
							removeImage={this.removeImage}
						/>
					</div>
				</div>
			</div>
		);
	}
};