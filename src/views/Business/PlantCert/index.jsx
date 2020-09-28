import React, { Component } from 'react';
import { Table, message, Modal, Form, Input, Button, Select, Checkbox, Row, Col } from 'antd';

import SearchHeader from '../components/SearchHeader';
import ImageItem from '../components/ImageItem';

import './index.less';

class PlantCert extends Component {
  state = {
    page: {
      current: 1,
      size: 10,
      total: 0
    },
    tableData: [],
    imageModal: false,
    images: [],
    timeList: [],
    locationList: [],
    carNumberList: [],
    windowsList: [],
    info: {},
    showInfo: false,
    windows: [],
    show_refuse_reason: false,
    first_variety_01: [], // 原木
    first_variety_02: [],
    plants: {},
    woods: {},
    employeeList: [],
    showEmployeeModel: false,
    nowRecord: null,
    selectEmployeeId: null,
    showCarNumberModel: false,
    choiceCarNumbers: '',
    loading: false,
    filter: {}
  }
  // 获取运输证列表
  getPlantCertList = (data, isSearch) => {
    this.setState({
      loading: true
    });
    if (isSearch) {
      let page = this.state.page;
      page.current = 1;
      page.total = 0;
      this.setState({
        filter: data || {},
        page: page
      });
    }
    window.$http({
      url: `/admin/business/getPlantCertList`,
      method: 'GET',
      params: {
        status: isSearch ? (data.status || '') : (this.state.filter.status || ''),
        companyName: isSearch ? (data.companyName || '') : (this.state.filter.companyName || ''),
        createTime: isSearch? (data.createTime && data.createTime.format('YYYY-MM-DD') || '') : (this.state.filter.createTime && this.state.filter.createTime.format('YYYY-MM-DD') || ''),
        carNumber: isSearch ? (data.carNumber || '') : (this.state.filter.carNumber || ''),
        pageNum: this.state.page.current,
        pageSize: this.state.page.size
      }
    }).then((res) => {
      if (res && res.data.code === 0) {
        this.setState({windows: res.data.data.windows});
        this.setState({plants: res.data.data.plants});
        this.setState({woods: res.data.data.woods});
        
        // 遍历木材品种
        let list = res.data.data.list
        list.map(item => {
          let woodList = JSON.parse(item.wood_json).woodList
          let first_variety_01 = []
          let first_variety_02 = []
          let plants = this.state.plants;
          let woods = this.state.woods;
          let producing_areaArr = item.producing_area.split(',');
          woodList.map( (innerItem, index) => {
            innerItem.producing_area = producing_areaArr[index];
            if ( innerItem.first_variety == 'first_variety_01') {
              first_variety_01.push({plants: plants[innerItem.plant_variety], amount: innerItem.amount, woods: woods[innerItem.wood_variety], producing_area: innerItem.producing_area})
            }
            if ( innerItem.first_variety == 'first_variety_02') {
              first_variety_02.push({plants: plants[innerItem.plant_variety], amount: innerItem.amount, woods: woods[innerItem.wood_variety], producing_area: innerItem.producing_area})
            }
          })
          item.first_variety_01 = first_variety_01
          item.first_variety_02 = first_variety_02
        });
        let page = this.state.page;
        page.total = res.data.data.total || 0;
        this.setState({tableData: list, page: page}, () => {
          this.setState({
            loading: false
          });
        });
      } else {
        this.setState({
          loading: false
        });
      }
    });
  }

  // 获取业务员列表（纯粹的业务员角色）
  getEmployeeList = () => {
    window.$http({
      url: `/admin/system/user/getEmployeeList`,
      method: 'GET'
    }).then((res) => {
      if (res && res.data.code === 0) {
        this.setState({
          employeeList: res.data.data
        });
      }
    });
  }

  // 分派给业务员
  setToEmployee = (title, record) => {
    this.getEmployeeList();
    this.setState({
      showEmployeeModel: true,
      nowRecord: record,
      selectEmployeeId: record.operator_id || null
    });
  }
  // 选择业务员
  selectEmployee = (value)  =>{
    this.setState({
      selectEmployeeId: value
    });

  }
  // 业务员设置下去 
  setEmployee = () => {
    window.$http({
      url: `/admin/business/setEmployee`,
      method: 'PUT',
      data: {
        id: this.state.nowRecord.id,
        employeeId: this.state.selectEmployeeId
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        message.success('分派成功');
        let tableData = this.state.tableData || [];
        tableData.map(item => {
          if (item.id === this.state.nowRecord.id) {
            item.operator_id = this.state.selectEmployeeId;
            if (window.$session.get('user')) {
              item.operator_admin_Name = window.$session.get('user').username;
              item.operator_admin_id = window.$session.get('user').uid;
            }
          }
        });
        this.setState({
          tableData: tableData,
          showEmployeeModel: false,
          nowRecord: null,
          selectEmployeeId: null
        });
      }
    });
  }

  operateRecord = (item, record, param) => {
    switch (item) {
      case '通过': {
        if (record.status == 5) {
          this.invokePlantCert(record.id, 2, null, record.cid);
        }
        else {
          this.invokePlantCert(record.id, 4, record.wood_json, record.cid, param);
        }

        break;
      }
      case '驳回': {
        // 若已经上传了证书图片，此时点击驳回后，状态改成 待上传图片
        if (record.status == 5) {
          // 这里约定 状态传 -2，由服务端重置状态为 4
          this.refuse(record.id, -2, param, record.cid);
        } else {
          this.refuse(record.id, 3, param, record.cid);
        }
        break;
      }
      case '回签': {
        this.invokePlantCert(record.id, 7, null, record.cid);
        break;
      }
      case '回签驳回': {
        // -3 ，后台区分一下（实际状态改成3）
        this.huiqianBohui(record.id, -3, record.cid);
        break;
      }
      case '查看': {
        this.setState({images: record.picture_url ? record.picture_url.split(',') : []});
        this.setState({timeList: record.picture_time ? record.picture_time.split(';') : []});
        this.setState({locationList: record.picture_location ? record.picture_location.split(',') : []});
        this.setState({carNumberList: record.car_number ? record.car_number.split(',') : []});
        this.setState({info: record})
        // this.setState({imageModal: true});
        this.setState({showInfo: true});
        let woodList = JSON.parse(record.wood_json).woodList
        let first_variety_01 = []
        let first_variety_02 = []
        let plants = this.state.plants;
        let woods = this.state.woods;
        let producing_areaArr = record.producing_area.split(',');
        woodList.map((item, index) => {
          item.producing_area = producing_areaArr[index];
          if ( item.first_variety == 'first_variety_01') {
            first_variety_01.push({plants: plants[item.plant_variety], amount: item.amount, woods: woods[item.wood_variety], producing_area: item.producing_area})
          }
          if ( item.first_variety == 'first_variety_02') {
            first_variety_02.push({plants: plants[item.plant_variety], amount: item.amount, woods: woods[item.wood_variety], producing_area: item.producing_area})
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
        if (status == 7) {
          message.success('回签成功');
        } else {
          message.success('审核成功');
        }
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
              item.status = status == -2 ? 4 : status;
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
  // 车牌作废,弹出框
  cancelCarNumber = (title, record) => {
    this.setState({
      showCarNumberModel: true,
      nowRecord: record
    });
  }
  checkboxChange = (values) => {
    this.setState({
      choiceCarNumbers: values.join(',')
    });
  }
  // 作废 下发
  setCarNumberCancel() {
    window.$http({
      url: `/admin/business/setCarNumberCancel`,
      method: 'PUT',
      data: {
        id: this.state.nowRecord.id,
        choiceCarNumbers: this.state.choiceCarNumbers
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        message.success('作废操作成功');
        let tableData = this.state.tableData || [];
        tableData.map(item => {
          if (item.id === this.state.nowRecord.id) {
            let arr3 = [];
            let arr = item.car_number.split(',');
            let arr2 = this.state.choiceCarNumbers.split(',');
            arr.map(item => {
              if (arr2.indexOf(item) === -1) {
                arr3.push(item);
              }
            });
            item.car_number = arr3.join(',');
            item.car_amount = arr3.length;
            if (!arr3.length) {
              item.status = 3;
            }
            let amount = 0;
            let woodList = JSON.parse(item.wood_json).woodList;
            let wood = woodList[0];
            let levelAmount = Number(wood.amount)/arr.length;
            amount = levelAmount * arr2.length;
            wood.amount = Math.round((Number(wood.amount) - amount)*100)/100;
            item.wood_json = JSON.stringify({woodList: woodList});


            let first_variety_01 = []
            let first_variety_02 = []
            let plants = this.state.plants;
            let woods = this.state.woods;
            let producing_areaArr = item.producing_area.split(',');
            woodList.map( (innerItem, index) => {
              innerItem.producing_area = producing_areaArr[index];
              if ( innerItem.first_variety == 'first_variety_01') {
                first_variety_01.push({plants: plants[innerItem.plant_variety], amount: innerItem.amount, woods: woods[innerItem.wood_variety], producing_area: innerItem.producing_area})
              }
              if ( innerItem.first_variety == 'first_variety_02') {
                first_variety_02.push({plants: plants[innerItem.plant_variety], amount: innerItem.amount, woods: woods[innerItem.wood_variety], producing_area: innerItem.producing_area})
              }
            })
            item.first_variety_01 = first_variety_01
            item.first_variety_02 = first_variety_02


          }
        });
        this.setState({
          tableData: tableData,
          showCarNumberModel: false,
          nowRecord: null,
          choiceCarNumbers: null
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

  // 返回当前登录用户角色 ,id=3 表示业务员
  getRole() {
    let roleArr = [];
    const user = window.$session.get('user') || {};
    if (user.role) {
      user.role.map(item => {
        roleArr.push(item.id);
      });
    }
    return roleArr;
  }
  // 回签
  signBack = () => {
    this.operateRecord('回签', this.state.info)
  }

  // 待回签驳回请求
  huiqianBohui = (id, status, cid) => {
    window.$http({
      url: `/admin/business/invokePlantCert`,
      method: 'PUT',
      data: {
        id, status, cid
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
              item.status = 3;
            }
          } );
          this.setState({
            tableData: tableData
          });
        });
      }
    });
  }
  
  changePageNum = (pageNum) => {
    let data = Object.assign({}, this.state.page, {current: pageNum})
    this.setState({page: data}, () => {
      this.getPlantCertList();
    });
    
  }

  changePageSize = (current, size) => {
    let data = Object.assign({}, this.state.page, {current: 1, size})
    this.setState({page: data}, () => {
      this.getPlantCertList();
    });
  }

  render() {
    let info = this.state.info;
    let status = this.state.info.status;
    const { getFieldDecorator } = this.props.form;
    const statusMap = ['', '待审核', '已通过', '未通过', '待上传照片', '待审核照片', '待回签', '已回签'];
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
        title: '创建日期',
        dataIndex: 'create_time'
      },
      {
        title: '企业名称',
        dataIndex: 'name'
      },
      {
        title: '目的地',
        dataIndex: 'receive_address'
      },
      {
        title: '收货单位（个人）',
        dataIndex: 'receive_person'
      },
      {
        title: '木材品种',
        render: (text, record) => (
          <div className="info table-info">
            {
              record.first_variety_01.length > 0 ? <div className="content">
              <div className="title">原木类</div>
                {record.first_variety_01.map((item, index) => {
                  return <div className="item" key={index}>
                  <div className="name">{item.producing_area}</div>
                  <div className="name">{item.plants}</div>
                  <div className="num">{item.amount}</div>
                </div>
                })}
              </div> : null
            }
            {
              record.first_variety_02.length > 0 ? <div className="content">
              <div className="title">非原木类</div>
                {record.first_variety_02.map((item, index) => {
                  return <div className="item" key={index}>
                  <div className="name">{item.producing_area}</div>
                  <div className="name">{item.woods}</div>
                  <div className="name">{item.plants}</div>
                  <div className="num">{item.amount}</div>
                </div>
                })}
              </div> : null
            }
            
          </div>
        )
      },
      {
        title: '车牌号',
        dataIndex: 'car_number'
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
          <div>
            <span>
              <a href="javascript: void(0);" style={{ marginRight: '5px' }} onClick={ ($event) => { this.operateRecord('查看', record) } }>查看</a>
            </span>
            <span>
              {
                this.getRole().indexOf(1)  > -1 || this.getRole().indexOf(2)  > -1 ? 
                <a href="javascript: void(0);" style={{ marginRight: '5px' }} onClick={ ($event) => { this.setToEmployee('分派到业务员', record) } }>{ typeof record.operator_id !== 'undefined' && record.operator_id != "" && record.operator_id !== null ? '已分派': '分派'}</a> : ''
              }
            </span>
            <span>
              {
                ((record.status == 4 || record.status == 2) && JSON.parse(record.wood_json).woodList.length == 1 && record.version == 2) ? <a href="javascript: void(0);" style={{ marginRight: '5px' }} onClick={ ($event) => { this.cancelCarNumber('作废', record) } }>作废</a> : ''
              }
            </span>
            <span>
              {
                // 待回签 ==》 点击驳回，状态改为 未通过
                record.status == 6 ? <a href="javascript: void(0);" style={{ marginRight: '5px' }} onClick={ ($event) => { this.operateRecord('回签驳回', record) } }>驳回</a> : ''
              }
            </span>
          </div>
        )
      }
    ];
    //窗口指定
    const pagination = {
      pageSizeOptions: ['1', '10', '20', '50'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total) => (`总共 ${this.state.page.total} 条`),
      onShowSizeChange: (current, size) => {this.changePageSize(current, size)},
      onChange: pageNum => { this.changePageNum(pageNum) },
      current: this.state.page.current,
      total: this.state.page.total
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
          loading={ this.state.loading }
          bordered 
          rowKey={ record => record.number }
          
        />

        <Modal
          title="分派业务员"
          destroyOnClose={true}
          visible={ this.state.showEmployeeModel }
          maskClosable={ false }
          onCancel={ () => { this.setState({showEmployeeModel: false}) } }
          onOk={ () => { this.setEmployee() } }
          >
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="选择业务员"
              defaultValue={ this.state.nowRecord && this.state.nowRecord.operator_id }
              onChange={ value=> { this.selectEmployee(value) } }
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {this.state.employeeList.map ((item, index) => {
                return <Option value={item.id} key={index}>{item.username}</Option>
              })}
            </Select>
            <span style={{marginLeft: '10px'}}>分派人：{this.state.nowRecord && this.state.nowRecord.operator_admin_Name}</span>  
          
          </Modal>

          <Modal
          title="作废车牌号"
          destroyOnClose={true}
          visible={ this.state.showCarNumberModel }
          maskClosable={ false }
          onCancel={ () => { this.setState({showCarNumberModel: false}) } }
          onOk={ () => { this.setCarNumberCancel() } }
          >
            <Checkbox.Group style={{ width: '100%' }} onChange={ values => this.checkboxChange(values)}>
              <Row>
              {
                this.state.nowRecord && this.state.nowRecord.car_number.split(',').map( (car_number, index) => {
                 return <Col span={8} key={index}>
                    <Checkbox value={car_number}>{car_number}</Checkbox>
                  </Col>
                } ) 
              }
              </Row>
            </Checkbox.Group>
          
          </Modal>

        <Modal 
          title="查看" 
          visible={ this.state.showInfo } 
          maskClosable={ false }
          width={1000}
          onCancel={ () => { this.setState({showInfo: false}) } }
          footer={ 
            status == 5 ? 
            [<Button key="submit" type="primary" onClick={this.imgHandleOk}>通过</Button>,
             <Button key="back" onClick={this.handleCancel}>驳回</Button>] : 
            status == 6 ? 
            [<Button key="signBack" type="primary" onClick={this.signBack}>回签</Button>] : null}
        >
        <Form>
          <div className="info"> 
            <div className="header">
              <div className="item">公司: {info.name}</div>
              <div className="item">信用代码： {info.code}</div>
              <div className="item">单位负责人（承办人）姓名: {info.header_name}</div>
              <div className="item">身份证： {info.header_identity}</div>
              <div className="item">联系电话: {info.header_phone}</div>
            </div>
            <div className="content">
              <div className="title">原木类</div>
              {this.state.first_variety_01.map((item, index) => {
                return <div className="item" key={index}>
                <div className="name">{item.producing_area}</div>
                <div className="name">{item.plants}</div>
                <div className="num">{item.amount}</div>
              </div>
              })}
            </div>
            <div className="content">
              <div className="title">非原木类</div>
              {this.state.first_variety_02.map((item, index) => {
                return <div className="item" key={index}>
                <div className="name">{item.producing_area}</div>
                <div className="name">{item.woods}</div>
                <div className="name">{item.plants}</div>
                <div className="num">{item.amount}</div>
              </div>
              })}
            </div>
            <div className="content">
              <div className="title">运输信息</div>
              <div className="item">
                <div className="name">车船数</div>
                <div className="num">{info.car_amount} 辆</div>
                <div className="num">{info.every_car_amount} m³/车</div>
              </div>
              <div className="item">
                <div className="name">包装方式</div>
                <div className="num">{info.packaging} </div>
              </div>
              <div className="item">
                <div className="name">规格</div>
                <div className="num">{info.standard} </div>
              </div>
            </div>
            <div className="content">
              <div className="title">收货信息</div>
              <div className="item">
                <div className="name">收货单位（个人）</div>
                <div className="num">{info.receive_person}</div>
              </div>
              <div className="item">
                <div className="name">收货单位详细地址</div>
                <div className="num">{info.receive_address}</div>
              </div>
              <div className="item">
                <div className="name">收货单位个人（电话）</div>
                <div className="num">{info.phone} </div>
              </div>
              <div className="item">
                <div className="name">收货联系人身份证号码</div>
                <div className="num">{info.person_id} </div>
              </div>
              <div className="item">
                <div className="name">日期</div>
                <div className="num">{info.date_time} </div>
              </div>
              <div className="item">
                <div className="name">申请人</div>
                <div className="num">{info.apply_person} </div>
              </div>
              <div className="item">
                <div className="name">承运人</div>
                <div className="num">{info.transport_person} </div>
              </div>
              <div className="item">
                <div className="name">相应的报检单号</div>
                <div className="num">{info.report_number} </div>
              </div>
              <div className="item">
                <div className="name">领取窗口号</div>
                <div className="num">{info.windows || ''} </div>
              </div>
            </div>
          </div>
            {!this.state.show_refuse_reason && status == 1 ? <Form.Item label="领证窗口: ">
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
            { (this.state.show_refuse_reason && status == 1) ? <Form.Item label="驳回原因: ">
              { getFieldDecorator('refuse_reason', {
                rules: [{ required: true, message: '请填写驳回原因' }]
              })(
                <Input style={{ width: 300 }} />
              ) }
            </Form.Item> : null}
          {
            (status == 1)? <div style={{textAlign: 'right'}}>
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
              carNumberList={ this.state.carNumberList }
              version={ info.version }
              type="plantCert"
            />
             { (this.state.show_refuse_reason && status == 5) ? <Form.Item label="驳回原因: ">
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
          destroyOnClose={true}
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