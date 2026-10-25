import React from 'react';
import {connect} from 'react-redux';

function ClockTheme (props) {
	const {themeColor} = props
	const theme = `background: rgba(255,255,255,.5)`
	return (
		<style>
			{`
				.react-clock                    {box-sizing: content-box;}
				.react-clock__face              {border: 0;}
				.react-clock__hand__body        {${theme}}
				.react-clock__minute-mark__body {${theme}}
				.react-clock__hour-mark__body   {${theme}}
				.react-clock__minute-hand__body {${theme}}
				.react-clock__hour-hand__body   {${theme}}
				.react-clock__second-hand__body {background-color: rgb(${themeColor})}
			`}
		</style>
	)
}

function mapStateToProps (state) {return {themeColor: state.color}};
export default connect(mapStateToProps)(ClockTheme);