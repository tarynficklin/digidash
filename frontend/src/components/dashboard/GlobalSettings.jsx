import React, { Component } from 'react'
import './GlobalSettings.css'
import { connect } from 'react-redux'
import { setTheme, setFlavor, setCollision, setCompact } from '../../ducks/reducer'
import Bgp from './Bgp'

class GlobalSettings extends Component {
	constructor(props) {
		super(props)
		const { compact, collision } = props
		this.state = {
			color: '115, 164, 191',
			bg_image: 'https://images.unsplash.com/photo-1536130371825-ac75012d9b24?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=c1c97eb0f52f1174d7a8281dd8348828&auto=format&fit=crop&w=1050&q=80',
			compact: compact,
			collision: collision,
			bgPicker: false
		}
		this.bgPickerToggle = this.bgPickerToggle.bind(this)
	}

	bgPickerToggle() { this.setState({ bgPicker: !this.state.bgPicker }) }

	render() {
		const { setTheme, setFlavor, setCollision, setCompact } = this.props
		const { theme, flavor, compact, collision, globalOpen, globalToggle } = this.props
		return (
			<div className={globalOpen ? `global-settings-wrapper global-open` : `global-settings-wrapper`}>
				<div className="global-settings">
					{!this.state.bgPicker ?
						<div className="global-options">
							<h1>Settings</h1>
							<div className="global-main">
								<div className="globalThemes">
									<h2 className="globalItem">THEMES</h2>
									<div className="list">
										<div className="listItem" onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark') }}>
											<div className={theme === 'dark' ? `checkbox checked theme-color` : `checkbox`}>
												<i className="fas fa-check"></i>
											</div>
											<a>Dark Theme</a>
										</div>
										<div className="listItem" onClick={() => { setFlavor(flavor === 'modern' ? 'classic' : 'modern') }}>
											<div className={flavor === 'modern' ? `checkbox checked theme-color` : `checkbox`}>
												<i className="fas fa-check"></i>
											</div>
											<a>Accent Theme</a>
										</div>
										<div className="listItem">
											<button className="filled-button theme-color" onClick={() => this.bgPickerToggle()}>Change Background</button>
										</div>
									</div>
								</div>
								<div className="globalLayout">
									<h2 className="globalItem">LAYOUT</h2>
									<div className="list">
										<div className="listItem" onClick={() => { setCollision() }}>
											<div className={collision ? `checkbox` : `checkbox checked theme-color`}>
												<i className="fas fa-check"></i>
											</div>
											<a>Widget Collision</a>
										</div>
										<div className="listItem" onClick={() => { setCompact() }}>
											<div className={compact ? `checkbox checked theme-color` : `checkbox`}>
												<i className="fas fa-check"></i>
											</div>
											<a>Auto Compact Widgets</a>
										</div>
										<div className="listItem">
											<button className="filled-button" onClick={() => globalToggle()}>Save Changes</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						: <Bgp globalToggle={globalToggle} globalOpen={this.props.globalOpen} bgPickerToggle={this.bgPickerToggle} />}
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	const { flavor, theme, compact, collision } = state
	return { flavor, theme, compact, collision }
};
export default connect(mapStateToProps, { setFlavor, setTheme, setCollision, setCompact })(GlobalSettings);