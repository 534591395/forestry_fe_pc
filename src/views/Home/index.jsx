import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Statistic, Row, Col, Radio, Icon, Card } from 'antd';

import './index.less';

class Home extends Component {
  state = {
    height: '1000px',
    width: '100%'
  }

  componentDidMount() {
    
  }

  render() {
    return (
      <div className="home">
        <iframe src="http://47.105.67.161:8088/#/dashboard" style={{border: 0, width: this.state.width, height: this.state.height}} ref="dashboard"></iframe>
      </div>
    )
  }
}

export default Home;