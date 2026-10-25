import React, { Component } from 'react'
import axios from 'axios'
import {Line} from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Legend, Tooltip } from 'chart.js'
import {connect} from 'react-redux'
import './Stocks.css'

// chart.js 3+ is tree-shakeable: register what the line chart uses.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Legend, Tooltip)

class Stocks extends Component{
	constructor(props){
		const {o1,o2,o3,o4} = props.o
		console.log(o1)
		super(props)
		this.state={
			miniSettings:false,
			results:null,
			input:"",
			openData:[],
			highData:[],
			lowData:[],
			closeData:[],
			graphMin:null,
			graphMax:null,
			graphData:{
				labels:[],
				datasets:[
					{
						label:'Open',
						data:[o1?o1*1:null],
						backgroundColor:`rgba(${this.props.themeColor}, .8)`,
						fill:true
					},
					{
						label:'High',
						data:[o2?o2*1:null],
						backgroundColor:`rgba(${this.props.themeColor}, .6)`,
						fill:true
					},
					{
						label:'Low',
						data:[o3?o3*1:null],
						backgroundColor:`rgba(${this.props.themeColor}, .4)`,
						fill:true
					},
					{
						label:'Close',
						data:[o4?o4*1:null],
						backgroundColor:`rgba(${this.props.themeColor}, .2)`,
						fill:true
					},
				]
			}
		}
	}


	getStocks = () => {
    axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${this.state.input}&interval=5min&apikey=${import.meta.env.REACT_APP_ALPHAVANTAGE}`).then(res => {
			this.setState({ results: res.data});
			this.objMap();
			console.log('getting stocks...')
    }).catch(err => {
      console.log('Error happened during fetching!', err);
    });
	};
	
	handleInput(val){
		this.setState({input:val})
	}

	objMap(){
		let timeSeries = "Time Series (5min)";
		let open = "1. open"
		let openData = []
		let high = "2. high"
		let highData = []
		let low = "3. low"
		let lowData = []
		let close = "4. close"
		let closeData = []

		for(let i in this.state.results[timeSeries]){
			openData.push(this.state.results[timeSeries][i][open]*1)
			highData.push(this.state.results[timeSeries][i][high]*1)
			lowData.push(this.state.results[timeSeries][i][low]*1)
			closeData.push(this.state.results[timeSeries][i][close]*1)
		}

		let newlabels = []
		for (let i = 0 ; i < 100 ; i ++){
			newlabels.push(5 * i)}

		let min = Math.min(...lowData)
		let max = Math.max(...highData)

		const {o1,o2,o3,o4} = this.props


		let newState = {...this.state}
			newState.graphData.labels = newlabels
			newState.graphMin = min
			newState.graphMax = max

		this.setState({openData:openData,highData:highData,lowData:lowData,closeData:closeData})

			newState.graphData.datasets[0].data = o1?o1:openData
			newState.graphData.datasets[1].data = o2?o2:highData
			newState.graphData.datasets[2].data = o3?o3:lowData
			newState.graphData.datasets[3].data = o4?o4:closeData

		this.setState({...newState})
		this.saveData()
	}

	toggleSettings() {
		this.setState({ miniSettings: !this.state.miniSettings })
		this.saveData();
		this.getStocks();
	}

	saveData() {
		axios.put(`/widget/settings/${this.props.o.master_id}`, {
			o1:this.state.openData?this.state.graphData.datasets[0].data:null,
			o2:this.state.openData?this.state.graphData.datasets[1].data:null,
			o3:this.state.openData?this.state.graphData.datasets[2].data:null,
			o4:this.state.openData?this.state.graphData.datasets[3].data:null
		}).then(()=>{this.props.updateWidgets()})
	}

	render(){
		let {graphMax,graphMin,miniSettings} = this.state
		return (
			<div className="stocks standard-widget" >
				<button className="widget-settings-button" onClick={() => this.toggleSettings()}>•••</button>
				{miniSettings? 
					<div className="widget-settings">
						<input className="theme-input inputter" onChange={(e)=>this.handleInput(e.target.value)}/>
						<button onClick={()=>this.getStocks()} className="go-button">Retrieve</button>
					</div>
					:null}
				
				{this.state.results ?
				<div className='chart-wrapper' >
				<h1>{this.state.input}</h1>
				<Line
                    data={this.state.graphData}
                    options={{
                        maintainAspectRatio: true,
                        plugins:{
                            legend:{
                                labels:{
                                    color:'white',
                                    boxWidth:80,
                                    font:{ size:16, family:"'Arial'" },
                                }
                            }
                        },
                        scales:{
                            y:{
                                max:(graphMax *1)+1,
                                min:(graphMin *1)-1,
                                grid:{
                                    display:false,
                                    color:"rgba(255,255,255,.3)",
                                },
                                ticks:{
                                    stepSize:((graphMax - graphMin)/10),
                                    color:'rgba(255,255,255,.3)',
                                }
                            },
                            x:{
                                grid:{
                                    display:false,
                                    color:"rgba(255,255,255,.3)"
                                },
                                ticks:{
                                    color:'rgba(255,255,255,.3)'
                                }
                            },
                        }
                    }}
                />
								</div> : <div className="ghost-stock-icon"><i className="fas fa-chart-line"></i></div>}
								{/* Graph Ends One Line Above */}
					<div className="theme-glow"></div>
				<div className="theme-accent"><i className="fas fa-arrows-alt"></i></div>
			</div>
		)
	}
}

function mapStateToProps(state) {return { themeColor: state.color, flavor: state.flavor }};
export default connect(mapStateToProps)(Stocks);