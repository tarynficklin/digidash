import React from 'react';
import {connect} from 'react-redux';

function GridTheme (props) {
	const {themeColor} = props
	return (
		<style>
			{`.react-grid-item.react-grid-placeholder {
					background    : rgb(${themeColor});
					opacity       : .15;
					border-radius : 3px;
				}
				
				.react-grid-item > .react-resizable-handle::after {
						right: 5px;
						bottom: 5px;
						width: 5px;
						height: 5px;
						border-right: 2px solid rgba(255, 255, 255, .25);
						border-bottom: 2px solid rgba(255, 255, 255, .25);
						z-index: 3;
				}
			`}
		</style>
	)
}

function mapStateToProps (state) {return {themeColor: state.color}};
export default connect(mapStateToProps)(GridTheme);