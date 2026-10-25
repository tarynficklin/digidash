import React from 'react';
import {connect} from 'react-redux';

function BitCoinTheme (props) {
	const {themeColor} = props
	return (
		<style>
			{`
				.linechart_area {fill: rgb(${themeColor})}
				.linechart_label {fill: rgb(${themeColor}) !important}
				.linechart_path {stroke: rgb(${themeColor}) !important}
				.label {fill: rgb(${themeColor})}
				.heading {color: rgb(${themeColor})}
				.subtext {color: rgb(${themeColor})}
			`}
		</style>
	)
}

function mapStateToProps (state) {return {themeColor: state.color}};
export default connect(mapStateToProps)(BitCoinTheme);