import React, {Component} from 'react';
import axios from 'axios'
import './Currency.css'


export default class Currency extends Component {
  constructor() {
    super();
    this.state = { 
    val1: "USD",
    val2: "EUR",
    val3: 1,
    convert: {},
    toggle: false
  };
  }
 

  getIn1(val){
    console.log(val)
    this.setState({
      val1: val
    })
  }
  getIn2(val){
    this.setState({
      val2: val
    })
  }
  getIn3(val){
    this.setState({
      val3: val
    })
  }
  getCurency(){
    console.log('this works')
    const {val1,val2} = this.state
    console.log(val1)
    axios.post('/api/getcurency',{val1,val2}).then(res=>{
      var key = val1+'_'+val2;
      console.log(res.data.results[key])
      this.setState({ 
        convert: res.data.results[key], 
        toggle: true
      });
    })}
  showcurrency(){
    const {val2,val3, convert} = this.state

    let num = convert.val*val3
    return(
      <div>
        <p>{new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 2 }).format(num)}</p>
      </div>
    )
  }

  render() {
    return (
     

      <div className="standard-widget currency" >
        
      <div style={{display: 'flex', color: 'white'}}>
        <div style={{display: 'flex',flexDirection: "column"}}>
          <select className='space' onChange={(e)=> this.getIn1(e.target.value)}>
            <option value='USD'>US Dollar</option>
            <option value='EUR'>Euro</option>
            <option value='RUB'>Russian ruble</option>
            <option value='AFN'>Afghan afghani</option>
            <option value='ALL'>Albanian lek</option>
            <option value='AUD'>Australian dollar</option>
            <option value='BSD'>Bahamian dollar</option>
            <option value='BRL'>Brazilian real</option>
            <option value='CLP'>Chilean peso</option>
            <option value='CLP'>Chinese yuan</option>
            <option value='CLC'>Costa Rican colón</option>
            <option value='GBP'>British pound</option>
            <option value='KRW'>South Korean won</option>
          </select>
          <select className='space' onChange={(e)=>this.getIn2(e.target.value)} placeholder='EUR'>
            <option value='EUR'>Euro</option>
            <option value='USD'>US Dollar</option>
            <option value='RUB'>Russian ruble</option>
            <option value='AFN'>Afghan afghani</option>
            <option value='ALL'>Albanian lek</option>
            <option value='AUD'>Australian dollar</option>
            <option value='BSD'>Bahamian dollar</option>
            <option value='BRL'>Brazilian real</option>
            <option value='CLP'>Chilean peso</option>
            <option value='CLP'>Chinese yuan</option>
            <option value='CLC'>Costa Rican colón</option>
            <option value='GBP'>British pound</option>
            <option value='KRW'>South Korean won</option>
          </select>
        </div>
        <div  className='space' style={{display: 'flex',flexDirection: "column" }}>
          <input className='theme-input' onChange={e=>this.getIn3(e.target.value)}/>
          {this.state.toggle ? <p>{this.showcurrency()}</p>: <p>0</p>}
        </div>
      </div>
      <div className='center'>
        <button className=" go-button" onClick={()=> this.getCurency()}>convert</button>
      </div>
      <div className="theme-glow"></div>
      <div className="theme-accent"><i className="fas fa-arrows-alt"></i></div>
      </div>


    );
  }
}