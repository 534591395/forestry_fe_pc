import React, { Component } from 'react';
import { Table, message, Modal, Form, Input, Button, Select } from 'antd';

import SearchHeader from '../components/SearchHeader';
import ImageItem from '../components/ImageItem';

import './index.less';

class PlantCert extends Component {
  state = {
    tableData: [],
    imageModal: false,
    images: [],
    timeList: [],
    locationList: [],
    windowsList: [],
    info: {},
    showInfo: false,
    windows: [],
    show_refuse_reason: false,
    first_variety_01: [], // 原木
    first_variety_02: [],
    plants: {}
  }

  getPlantCertList = (data) => {
    window.$http({
      url: `/admin/business/getPlantCertList`,
      method: 'GET',
      params: {
        status: data.status || '',
        companyName: data.companyName || ''
      }
    }).then((res) => {
      if (res && res.data.code === 0) {
        this.setState({tableData: res.data.data.list});
        this.setState({windows: res.data.data.windows});
        this.setState({plants: res.data.data.plants});
      }
    });
  }

  operateRecord = (item, record, param) => {
    switch (item) {
      case '通过': {
        if (record.picture_url) {
          this.invokePlantCert(record.id, 2, null, record.cid);
        }
        else {
          this.invokePlantCert(record.id, 4, record.wood_json, record.cid, param);
        }

        break;
      }
      case '驳回': {
        // 若已经上传了证书图片，此时点击驳回后，状态改成 待上传图片
        if (record.picture_url) {
          // 这里约定 状态传 -2，由服务端重置状态为 4
          this.refuse(record.id, -2, param, record.cid);
        } else {
          this.refuse(record.id, 3, param, record.cid);
        }
        break;
      }
      case '查看': {
        this.setState({images: record.picture_url ? record.picture_url.split(',') : []});
        this.setState({timeList: record.picture_time ? record.picture_time.split('@') : []});
        this.setState({locationList: record.picture_location ? record.picture_location.split(',') : []});
        this.setState({info: record})
        // this.setState({imageModal: true});
        this.setState({showInfo: true});
        let woodList = JSON.parse(record.wood_json).woodList
        let first_variety_01 = []
        let first_variety_02 = []
        let plants = this.state.plants
        woodList.map(item => {
          if ( item.first_variety == 'first_variety_01') {
            first_variety_01.push({plants: plants[item.plant_variety], amount: item.amount})
          }
          if ( item.first_variety == 'first_variety_02') {
            first_variety_02.push({plants: plants[item.plant_variety], amount: item.amount})
          }
        })
        this.setState({first_variety_01: first_variety_01})
        this.setState({first_variety_02: first_variety_02})
        break;
      }
      default: {
        break;
      }
    }
  }
  // 设置窗口
  settingWindows = (e, record) => {
    window.$http({
      url: `/admin/business/windowPlantCert`,
      method: 'PUT',
      data: {
        id, status, first_variety, wood_json, cid
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        message.success('添加成功');
      }
    });
  }
  // 审核请求
  invokePlantCert = (id, status, wood_json, cid, windows) => {
    window.$http({
      url: `/admin/business/invokePlantCert`,
      method: 'PUT',
      data: {
        id, status, wood_json, cid, windows
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        message.success('审核成功');
        this.setState({
          showInfo: false
        }, () => {
          let tableData = this.state.tableData;
          tableData.map( (item, index) => {
            if (item.id == id) {
              item.status = status;
              if (windows) {
                item.windows = windows;
              }
            }
          } );
          this.setState({
            tableData: tableData
          });
        });
      }
    });
  }
  // 驳回请求
  refuse = (id, status, refuse_reason, cid) => {
    window.$http({
      url: `/admin/business/invokePlantCert`,
      method: 'PUT',
      data: {
        id, status, refuse_reason, cid
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        message.success('驳回成功');
        this.setState({
          showInfo: false
        }, () => {
          let tableData = this.state.tableData;
          tableData.map( (item, index) => {
            if (item.id == id) {
              item.status = status == -2 ? 1 : status;
              item.refuse_reason = refuse_reason;
            }
          } );
          this.setState({
            tableData: tableData
          });
        });
      }
    });
  }
  selChange() {

  }
   // 驳回
   handleCancel = () => {
    if (!this.state.show_refuse_reason) {
      this.setState({show_refuse_reason: true});
      return
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.operateRecord('驳回', this.state.info, values.refuse_reason)
      }
    });
  }
   // 第一次通过
   handleOk = () => {
    if (this.state.show_refuse_reason) {
      this.setState({show_refuse_reason: false});
      return
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // let info = this.state.info;
        this.operateRecord('通过', this.state.info, values.windows)
        // this.invokePlantCert(info.id, 4, info.first_variety, info.wood_json, info.cid, values.windows);
      }
    });
  }
  // 第二次通过
  imgHandleOk = () => {
    if (this.state.show_refuse_reason) {
      this.setState({show_refuse_reason: false});
      return
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.operateRecord('通过', this.state.info)
      }
    });
  }
  // // 第二次驳回
  // imgHandleCancel = () => {
  //   if (!this.state.show_refuse_reason) {
  //     this.setState({show_refuse_reason: true});
  //     return
  //   }
  //   this.props.form.validateFields((err, values) => {
  //     if (!err) {
  //       this.operateRecord('驳回', this.state.info, values.refuse_reason)
  //     }
  //   });
  // }
  render() {
    let info = this.state.info;
    let status = this.state.info.status;
    const { getFieldDecorator } = this.props.form;
    const statusMap = ['', '待审核', '已通过', '未通过', '待上传照片'];
    // const optMap = ['', ['查看', '通过', '驳回'], ['查看'], ['查看'], ['查看', '通过', '驳回']];

    const Option = Select.Option;
    const columns = [
      {
        title: '申请编号',
        dataIndex: 'number',
        width: 150,
        fixed: 'left'
      },
      {
        title: '企业名称',
        dataIndex: 'name'
      },
      {
        title: '日期',
        dataIndex: 'date_time'
      },
      {
        title: '申请人',
        dataIndex: 'apply_person'
      },
      {
        title: '承运人',
        dataIndex: 'transport_person'
      },
      {
        title: '相对应的报检单号',
        dataIndex: 'report_number'
      },
      {
        title: '状态',
        render: (text, record) => (
          <span>
            {
              statusMap[record.status]
            }
          </span>
        )
      },
      {
        title: '操作',
        fixed: 'right',
        width: 150,
        render: (text, record) => (
          // <span>
          //    <a 
          //           key={ index }
          //           style={{ marginLeft: 10 }} 
          //           onClick={ 
          //             () => { this.operateRecord(item, record) } 
          //           }
          //         >
          //           { item }
          //         </a>
          //   <a style={{ marginLeft: 10 }}>
          //     <select onChange={(e) => this.settingWindows(e, record)}>
          //       {
          //         this.state.windowsList.map( (item, key) => {
          //           // <option value={item.value} key={key}>{item.name}</option>
          //         })
          //       }
          //     </select>
          //   </a>
          // </span>
          <span>
            <a href="javascript: void(0);" style={{ marginRight: '15px' }} onClick={ ($event) => { this.operateRecord('查看', record) } }>查看</a>
          </span>
        )
      }
    ];
//窗口指定
    const pagination = {
      pageSizeOptions: ['10', '20', '50'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total) => (`总共 ${total} 条`)
    }

    return (
      <div className="plant-cert">
        <div style={{ marginBottom: 20 }}>
          <SearchHeader getList={ this.getPlantCertList } { ...this.props.location.params } type="plantCert" />
        </div>

        <Table 
          columns={ columns } 
          dataSource={ this.state.tableData } 
          pagination={ pagination } 
          bordered 
          rowKey={ record => record.number }
        />

        <Modal 
          title="查看" 
          visible={ this.state.showInfo } 
          maskClosable={ false }
          width={1000}
          onCancel={ () => { this.setState({showInfo: false}) } }
          footer={ status == 1 && this.state.images.length > 0 ? [<Button key="submit" type="primary" onClick={this.imgHandleOk}>通过</Button>,
          <Button key="back" onClick={this.handleCancel}>驳回</Button>] : null}
        >
        <Form>
          <div className="info"> 
            <div className="header">
              <div className="item">公司: {info.name}</div>
              <div className="item">信用代码： 234</div>
              <div className="item">单位负责人: {info.header_name}</div>
              <div className="item">姓名：</div>
              <div className="item">身份证： </div>
              <div className="item">联系电话: {info.phone}</div>
            </div>
            <div className="content">
              <div className="title">原木类</div>
              {this.state.first_variety_01.map((item, index) => {
                return <div className="item" key={index}>
                <div className="name">{item.plants}</div>
                <div className="num">{item.amount}</div>
              </div>
              })}
            </div>
            <div className="content">
              <div className="title">非原木类</div>
              {this.state.first_variety_02.map((item, index) => {
                return <div className="item" key={index}>
                <div className="name">{item.plants}</div>
                <div className="num">{item.amount}</div>
              </div>
              })}
            </div>
            <div className="content">
              <div className="title">运输信息</div>
              <div className="item">
                <div className="name">车船数</div>
                <div className="num">sdf m³</div>
                <div className="num">sdf m³</div>
              </div>
              <div className="item">
                <div className="name">包装方式</div>
                <div className="num">sdf m³</div>
              </div>
              <div className="item">
                <div className="name">规格</div>
                <div className="num">sdf m³</div>
              </div>
            </div>
            <div className="content">
              <div className="title">收货信息</div>
              <div className="item">
                <div className="name">收货单位（个人）</div>
                <div className="num">张三</div>
              </div>
              <div className="item">
                <div className="name">收货单位详细地址</div>
                <div className="num">太仓市太仓市太仓市太仓市太仓市</div>
              </div>
              <div className="item">
                <div className="name">收货单位个人（电话）</div>
                <div className="num">1232432 </div>
              </div>
              <div className="item">
                <div className="name">收货联系人身份证号码</div>
                <div className="num">1232432 </div>
              </div>
              <div className="item">
                <div className="name">日期</div>
                <div className="num">1232432 </div>
              </div>
              <div className="item">
                <div className="name">申请人</div>
                <div className="num">1232432 </div>
              </div>
              <div className="item">
                <div className="name">承运人</div>
                <div className="num">1232432 </div>
              </div>
              <div className="item">
                <div className="name">相应的报检单号</div>
                <div className="num">1232432 </div>
              </div>
            </div>
          </div>
            {!this.state.show_refuse_reason && status == 1 && this.state.images.length == 0 ? <Form.Item label="领证窗口: ">
                          { getFieldDecorator('windows', {
                            rules: [{ required: true, message: '请选择领证窗口' }]
                          })(
                            <Select
                              showSearch
                              style={{ width: 200 }}
                              placeholder="选择领证窗口"
                              optionFilterProp="children"
                              onChange={this.selChange}
                              onSearch={this.onSearch}
                              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                              {this.state.windows.map ((item, index) => {
                                return <Option value={item.key} key={index}>{item.value}</Option>
                              })}
                            </Select>
                          ) }
            </Form.Item> : null}
            { (this.state.show_refuse_reason && status == 1 && this.state.images.length == 0) ? <Form.Item label="驳回原因: ">
              { getFieldDecorator('refuse_reason', {
                rules: [{ required: true, message: '请填写驳回原因' }]
              })(
                <Input style={{ width: 300 }} />
              ) }
            </Form.Item> : null}
          {
            (status == 1 && this.state.images.length == 0)? <div style={{textAlign: 'right'}}>
            <Button key="submit" type="primary" onClick={this.handleOk}>通过</Button> 
            <Button key="back" onClick={this.handleCancel} style={{marginLeft: 8}}>驳回</Button>
          </div> : null
          }

          <div className="img-box">
            <ImageItem 
              title="装车图片" 
              images={ this.state.images } 
              timeList={ this.state.timeList } 
              locationList={ this.state.locationList } 
            />
             { (this.state.show_refuse_reason && status == 1 && this.state.images.length > 0) ? <Form.Item label="驳回原因: ">
              { getFieldDecorator('refuse_reason', {
                rules: [{ required: true, message: '请填写驳回原因' }]
              })(
                <Input style={{ width: 300 }} />
              ) }
            </Form.Item> : null}
          </div>
          </Form>
        </Modal>

        <Modal 
          title="查看" 
          visible={ this.state.imageModal } 
          maskClosable={ false }
          footer={ null }
          onCancel={ () => { this.setState({imageModal: false}) } }
        >
          <ImageItem 
            title="装车图片" 
            images={ this.state.images } 
            timeList={ this.state.timeList } 
            locationList={ this.state.locationList } 
          />
        </Modal>
      </div>
    )
  }
}

export default Form.create()(PlantCert);