import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Carousel, Icon } from 'antd';


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
    index: 0
  }

  setImageModalData = (imageSrc) => {
    this.setState({imageDetailModal: true});
    this.setState({imageSrc});
  }

  // 切换图片后触发
  onChange(e) {
    console.log(e);
    this.setState({
      index: e
    });
  }

  prev() {
    if (this.refs.Carousel) {
      this.refs.Carousel.prev();
    }
  }

  next() {
    if (this.refs.Carousel) {
      this.refs.Carousel.next();
    }
  }

  render() {
    const { index } = this.state;
    return (
      <div className="image-item">
        <span>{ this.props.title }</span>

        {/* <div style={{ marginTop: 15, marginBottom: 15, display: 'flex', flexWrap: 'wrap' }}> */}
          <Carousel afterChange={e => this.onChange(e)} ref="Carousel" dots={false}>
            {
              this.props.images.map((item, index) => {
                return (
                    <div key={ index }>
                      <img 
                        src={ item } 
                        alt="" 
                        style={{ height: 160, width: '100%', cursor: 'pointer'}}
                        onClick={ () => { this.setImageModalData(item) } } 
                      />
                      {/* <div>
                        <p>{ this.props.timeList && this.props.timeList[index] }</p>
                        <p>{ this.props.timeList && this.props.locationList[index] }</p>
                      </div> */}
                    </div>
                )
              })
            }
          </Carousel>
          <div>
            <p>{ this.props.timeList && this.props.timeList[index] }</p>
            <p>{ this.props.timeList && this.props.locationList[index] }</p>
          </div>
          <div className="carousel-left"><Icon type="arrow-left" onClick={e => this.prev()}/></div>
          <div className="carousel-right"><Icon type="arrow-right" onClick={e=> this.next()}/></div>
          <div className="carousel-num">{index+1}/{this.props.images.length}</div>
        {/* </div> */}

        <Modal 
          title="查看图片" 
          visible={ this.state.imageDetailModal } 
          footer={ null }
          onCancel={ () => { this.setState({imageDetailModal: false}) } }
        >
          <img src={ this.state.imageSrc } alt="" className="img_modal" />
        </Modal>
      </div>
    )
  }
}

export default ImageItem;