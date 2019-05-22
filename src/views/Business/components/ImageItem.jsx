import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Carousel, Icon, Button } from 'antd';

import './index.less';


class ImageItem extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    images: PropTypes.array.isRequired,
    timeList: PropTypes.array,
    locationList: PropTypes.array
  }

  state = {
    imageDetailModal: false,
    imageSrc: '',
    index: 0,
    current: 90,
    transStyle: '',
    height: ''
  }

  setImageModalData = (imageSrc, index) => {
    this.setState({imageDetailModal: true});
    this.setState({imageSrc});
    this.setState({index});
  }

  // 切换图片后触发
  onChange(e) {
    console.log(e);
    this.setState({
      index: e
    });
  }
// 上一张
  prev = () => {
    let index = this.state.index
    index --
    this.setState({
      index: index
    })
  }

  next = () => {
    let index = this.state.index
    index ++
    this.setState({
      index: index
    })
  }
  constructor(props) {
    super(props);

    this.saveRef = ref => {this.refDom = ref};
    this.translate = this.translate.bind(this);
  }
  //  点击选择  设置当前current旋转角度为上一次+90°
  translate = (e) => {
    const {clientWidth, clientHeight} = this.refDom;
    console.log(clientWidth, clientHeight, this.refDom);
    this.setState({
        current:(this.state.current+90)%360,
        transStyle:'rotate('+this.state.current+'deg)'
    });
    if (this.state.current/90%2 == 0) {
      this.setState({
        height: '100%'
      });
    } else {
      this.setState({
        height: clientWidth + 'px'
      });
    }
  }
  render() {
    const { index } = this.state;
    return (
      <div className="image-item">
        <span>{ this.props.title }</span>

        {/* <div style={{ marginTop: 15, marginBottom: 15, display: 'flex', flexWrap: 'wrap' }}> */}
        <div className="carousel-box">
        </div> 
        {
          this.props.images.length ? <div className="img-box-h">
          {
              this.props.images.map((item, index) => {
                return (
                  <img key={ index }
                  src={ item } 
                  alt="" 
                  style={{ height: 160, cursor: 'pointer', marginRight: '10px' }}
                  onClick={ () => { this.setImageModalData(item, index) } } 
                />
                )
              })}
          </div> : null
        }   

        {
          this.props.type == 'plantCert' ? <div>
            <p>{ this.props.timeList.join(',') }</p>
            <p>{ this.props.locationList.join(',') }</p>
            <p>{ this.props.carNumberList.join(',') }</p>
          </div> : null
        }
        {/* </div> */}
 
        <Modal 
          width={1000} 
          title={ this.props.type == 'plantCert' ? this.props.version == 1 ?  '查看图片' : `查看图片 ${this.props.carNumberList[this.state.index]} ${this.props.timeList[this.state.index]} ${this.props.locationList[this.state.index]}` : '查看图片'}
          visible={ this.state.imageDetailModal } 
          footer={ null }
          onCancel={ () => { this.setState({imageDetailModal: false, current: 90, transStyle:'rotate('+0+'deg)'}) } }
        >
          <img ref={this.saveRef} src={ this.props.images[this.state.index] } alt="" className="img_modal" style={{ transform:this.state.transStyle, height: this.state.height}} />
          <div style={{textAlign: "center", marginTop: "24px"}}>
            <Button disabled={ this.state.index == 0 } onClick={ this.prev }>上一张</Button>
            <Button onClick ={ this.translate } style={{ margin : '0 20px' }}>旋转<Icon type="reload" theme="outlined"/></Button>
            <Button disabled={ this.state.index == this.props.images.length - 1 } onClick={ this.next }>下一张</Button>
          </div>
        </Modal>
      </div>
    )
  }
}

export default ImageItem;