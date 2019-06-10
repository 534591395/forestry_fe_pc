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
    height: '',
    width: ''
  }

  setImageModalData = (imageSrc, index) => {
    // this.imgTool()
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
    this.imgTool = this.imgTool.bind(this);
  }
  //  点击选择  设置当前current旋转角度为上一次+90°
  translate = () => {
    // const {clientWidth, clientHeight} = this.refDom;
    // console.log(clientWidth, clientHeight, this.refDom);
    this.setState({
        current:(this.state.current+90)%360,
        transStyle:'rotate('+this.state.current+'deg)'
    });
    this.imgTool()
    
  }
  imgTool = () => {
    const {clientWidth, clientHeight} = this.refDom;
    let bodyClientHeight = document.body.clientHeight
    // 正
    if (this.state.current/90%2 == 0) {
      let height = clientHeight > bodyClientHeight ? bodyClientHeight - 160 : clientHeight
      this.setState({
        height: height + 'px',
        width: '100%'
      });
    } else { // 旋转
      let width = clientHeight > bodyClientHeight ? bodyClientHeight : clientHeight
      this.setState({
        width: width + 'px',
        height: '100%'
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
          centered
          onCancel={ () => { this.setState({imageDetailModal: false, current: 90, transStyle:'rotate('+0+'deg)'}) } }
        >
          <div className="image-detail-box" style={{ transform:this.state.transStyle, height: this.state.height, width: this.state.width }}>
            <img ref={this.saveRef} src={ this.props.images[this.state.index] } alt="" className="img_modal"  onLoad={e => this.imgTool()} />
            {
              this.props.images.length > 1 ? 
              <div className="arrow-box">
                {/* 判断是否第一张 */}
                {
                  this.state.index == 0 ? 
                  <Icon type="left-circle" style={{ fontSize: '40px', color: '#ccc', cursor: 'not-allowed' }} />
                  : <Icon onClick={ this.prev } type="left-circle" style={{ fontSize: '40px', color: '#fff', cursor: 'pointer' }} />
                }
                {/* 判断是否为最后一张 */}
                {
                  this.state.index == this.props.images.length - 1 ? 
                  <Icon type="right-circle" style={{ fontSize: '40px', color: '#ccc', cursor: 'not-allowed' }} />
                  : <Icon onClick={ this.next } type="right-circle" style={{ fontSize: '40px', color: '#fff', cursor: 'pointer' }} />
                }
              </div>
              : null
            }
          </div>
          <div style={{textAlign: "center", marginTop: "24px"}}>
            {/* <Button disabled={ this.state.index == 0 } onClick={ this.prev }>上一张</Button> */}
            <Button onClick ={ this.translate } style={{ margin : '0 20px' }}>旋转<Icon type="reload" theme="outlined"/></Button>
            {/* <Button disabled={ this.state.index == this.props.images.length - 1 } onClick={ this.next }>下一张</Button> */}
          </div>
        </Modal>
      </div>
    )
  }
}

export default ImageItem;