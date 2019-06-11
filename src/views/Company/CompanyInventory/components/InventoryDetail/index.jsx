import React, { Component } from 'react';
import { Tabs, Form, Table, Button, Input, Modal, Select, InputNumber, message } from 'antd';

import './index.less';
const TabPane = Tabs.TabPane;
const Option = Select.Option;
class InventoryDetail extends Component {
  state = {
    tableData: [],
    type: 'first_variety_01',
    showAdd: false,
    // 新增的时候选择的企业
    nowChoiceCompany: {
      woodDetail: {'first_variety_01': [], 'first_variety_02': []},
      firstVariety01Amount: 0,
      firstVariety02Amount: 0
    }
  }
  // 原木类型选择
  callbackFn = (key) => {
    this.setState({type: key})
    
  }
  // handleAdd = () => {
    
  // 选择当前企业
  selCompanyChange = (value) => {
    this.props.form.setFieldsValue({
      nowChoiceCompany: value
    })
    let val = JSON.parse(value);
    if (!val.woodDetail) {
      val.woodDetail = {'first_variety_01': [], 'first_variety_02': []};
      val.firstVariety01Amount = 0;
      val.firstVariety02Amount = 0;
    }
    this.setState({
      nowChoiceCompany: val
    }, () => {
      if (this.state.nowChoiceCompany.name) {
        window.$http({
          url: '/admin/company/getCompanyInventoryById',
          method: 'GET',
          params: {
            id: this.state.nowChoiceCompany.id
          }
        }).then((res) => {
          if(res && res.data.code == 0) {
            let nowChoiceCompany = this.state.nowChoiceCompany;
            nowChoiceCompany.woodDetail = res.data.data.info.woodDetail || {'first_variety_01': [], 'first_variety_02': []};
            if (typeof res.data.data.info.firstVariety01Amount !== 'undefined') {
              nowChoiceCompany.firstVariety01Amount = res.data.data.info.firstVariety01Amount; 
            }
            if (typeof res.data.data.info.firstVariety02Amount !== 'undefined') {
              nowChoiceCompany.firstVariety02Amount = res.data.data.info.firstVariety02Amount;
            }
            
            this.setState({
              nowChoiceCompany: nowChoiceCompany
            });
          }
        });
      }
    });
  }
  // 选择木材品种
  selChange = (value) => {
    this.props.form.setFieldsValue({
      plant_variety: value
    })
  }
  // 选择木材品种
  selWoodsChange = (value) => {
    this.setState({addWoodsValue: value})
  }
  onSearch = (value) => {
    
  }
  // 添加时开证量改变
  countChange = (value) => {
    this.props.form.setFieldsValue({
      amount: value
    })
  }
  // 添加
  addOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.addReq('添加', values)
      }
    });
  }
  addReq(type, values) {
    let data
    // console.log(type)
    if (type == '更新') {
      data = {
        amount: values.amount,
        id: values.id
      }
    } else {
      data = {
        first_variety: this.state.type,
        cid: typeof this.props.info.id !== 'undefined' ? this.props.info.id :  this.state.nowChoiceCompany.id,
        plant_variety: values.plant_variety,
        amount: values.amount
      }
    }
    window.$http({
      url: '/admin/company/editorCompanyInventory',
      method: 'POST',
      data: data
    }).then((res) => {
      if(res && res.data.code == 0) {
        message.success(`${type}成功`);
        if (type == '添加') {
          this.setState({showAdd: false});
          let data;
          if (typeof this.props.info.id !== 'undefined') {
            data = this.props.woodDetail;
            if (res.data.data.type == 'add') {
              data[this.state.type].push(res.data.data);
            }
          } else {
            let nowChoiceCompany = this.state.nowChoiceCompany;
            data = nowChoiceCompany.woodDetail;
            if (res.data.data.type == 'add') {
              data[this.state.type].push(res.data.data);
            }
            this.setState({
              nowChoiceCompany: nowChoiceCompany
            });
          }
          this.props.addSuccess(data);
        }
        this.getRecord();
      }
    });
  }

  // 重新拉取数据更新记录
  getRecord = () => {
    window.$http({
      url: '/admin/company/getCompanyInventoryById',
      method: 'GET',
      params: {
        id: typeof this.props.info.id !== 'undefined' ? this.props.info.id :  this.state.nowChoiceCompany.id
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        if (typeof this.props.info.id !== 'undefined') {
          if (typeof res.data.data.info.firstVariety01Amount !== 'undefined') {
            this.props.info.firstVariety01Amount  = res.data.data.info.firstVariety01Amount; 
          } 
          if (typeof res.data.data.info.firstVariety02Amount !== 'undefined') {
            this.props.info.firstVariety02Amount  = res.data.data.info.firstVariety02Amount; 
          }
          this.props.setWoodDetail(res.data.data.info.woodDetail); 
        } else {
          let nowChoiceCompany = this.state.nowChoiceCompany;
          nowChoiceCompany.woodDetail = res.data.data.info.woodDetail || {'first_variety_01': [], 'first_variety_02': []};
          if (typeof res.data.data.info.firstVariety01Amount !== 'undefined') {
            nowChoiceCompany.firstVariety01Amount = res.data.data.info.firstVariety01Amount; 
          }
          if (typeof res.data.data.info.firstVariety02Amount !== 'undefined') {
            nowChoiceCompany.firstVariety02Amount = res.data.data.info.firstVariety02Amount;
          }
          this.setState({
            nowChoiceCompany: nowChoiceCompany
          });
        }
      }
    });
  }

  // 表格中改变数量
  _changeValue = (e, record) => {
    let data ;
    if (typeof this.props.info.id !== 'undefined') {
      data = this.props.woodDetail;
      data[this.state.type].map((item, index) => {
        if (item.id == record.id) {
          data[this.state.type][index].amount = e.target.value
        }
      })
      this.props.changeTable(data);
    } else {
      let nowChoiceCompany = this.state.nowChoiceCompany;
      data = nowChoiceCompany.woodDetail;
      data[this.state.type].map((item, index) => {
        if (item.id == record.id) {
          data[this.state.type][index].amount = e.target.value
        }
      });
      this.setState({
        nowChoiceCompany: nowChoiceCompany
      });
    }
  }
  
  // 新增，弹出框
  add = () => {
    // 编辑
    if (typeof this.props.info.id !== 'undefined') {
      this.setState({showAdd: true})
    } else {
      // 新增
      if (this.state.nowChoiceCompany.name) {
        this.setState({showAdd: true})
      } else {
        this.props.form.validateFields();
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let columns = [
      { title: '木材品种', dataIndex: 'first_variety', key: 'first_variety' },
      { title: '开证量(m³)', dataIndex: '', key: 'age', render: (text, record) => (
        <Input size="small" value={ record.amount } type="number" onChange ={value => this._changeValue(value, record)} />
        ) },
      { title: '更新时间', dataIndex: 'last_modify_time', key: 'last_modify_time' },
      {
        title: '操作', dataIndex: '', key: '操作', render: (text, record) => <a href="javascript:;" onClick={ () => { this.addReq('更新', record)}}>更新</a>,
      }
    ];

    if (this.state.type == 'first_variety_02') {
      columns.splice(2, 0, { title: '类型', dataIndex: 'wood_variety_zh', key: 'wood_variety_zh' },);
    }

    const pagination = {
      pageSizeOptions: ['10', '20', '50'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total) => (`总共 ${total} 条`)
    }

    let dataArr = [];
    if (typeof this.props.info.id !== 'undefined') {
      dataArr = this.props.woodDetail[this.state.type];
    } else {
      dataArr = this.state.nowChoiceCompany.woodDetail[this.state.type];
    }
    
    dataArr.map(item => {
      (this.props.woods || []).map( wood => {
        if (item.wood_variety == wood.key) {
          item.wood_variety_zh = wood.value;
        }
      });
    });
    
    return (
      <div className="inventory-detail">
        <div className="info">
          {
            typeof this.props.info.id !== 'undefined'  ? 
            <div className="label">
              <div>公司:{this.props.info.name}</div>
              <div>信用代码:{ this.props.info.code }</div>
            </div> : 
            <div className="label">
              <div style={{height: '30px'}}> 
                <Form layout="inline">
                  <Form.Item label="公司: ">
                      { getFieldDecorator('nowChoiceCompany', {
                        rules: [{ required: true, message: '请选择企业' }]
                      })(
                        <Select
                          showSearch
                          style={{ width: 200 }}
                          placeholder="请选择企业"
                          optionFilterProp="children"
                          onChange={this.selCompanyChange}
                          onSearch={this.onSearch}
                          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                          {this.props.companyList.map ((item, index) => {
                            return <Option value={JSON.stringify(item)} key={index}>{item.name}</Option>
                          })}
                        </Select>
                      ) }
                  </Form.Item>
                </Form>
              </div>
              <div>信用代码:{ this.state.nowChoiceCompany.code }</div>
            </div>
          }
          {
            typeof this.props.info.id !== 'undefined'  ? 
            <div className="num">
              <div>可用原木量: { this.props.info.firstVariety01Amount } m³</div>
              <div>可用板材量: { this.props.info.firstVariety02Amount } m³</div>
            </div> :
            <div className="num">
              <div>可用原木量: { this.state.nowChoiceCompany.firstVariety01Amount } m³</div>
              <div>可用板材量: { this.state.nowChoiceCompany.firstVariety02Amount } m³</div>
            </div>
          }

        </div>
        <Tabs defaultActiveKey="first_variety_01" onChange={ this.callbackFn }>
          <TabPane tab="原木类" key="first_variety_01">

          </TabPane>
          <TabPane tab="板材类" key="first_variety_02">

          </TabPane>
        </Tabs>
        <div className="content">
          <Button onClick={ () => { this.add() }} type="primary" style={{ marginBottom: 16 }}>
            新增
          </Button>
          <Table
            bordered
            columns={columns}
            dataSource={ dataArr }
            pagination={ pagination }
          />
        </div>

        <Modal
          title="新增"
          visible={this.state.showAdd}
          onOk={this.addOk}
          onCancel={() => this.setState({showAdd: false})}
          width={500}
        >
          <Form>
            <Form.Item label="木材品种: ">
                          { getFieldDecorator('plant_variety', {
                            rules: [{ required: true, message: '请选择木材品种' }]
                          })(
                            <Select
                              showSearch
                              style={{ width: 200 }}
                              placeholder="请选择木材品种"
                              optionFilterProp="children"
                              onChange={this.selChange}
                              onSearch={this.onSearch}
                              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                              {this.props.plants.map ((item, index) => {
                                return <Option value={item.key} key={index}>{item.value}</Option>
                              })}
                            </Select>
                          ) }
            </Form.Item>
            <Form.Item label="开证量: ">
                          { getFieldDecorator('amount', {
                            rules: [{ required: true, message: '请填写开证量' }]
                          })(
                            <InputNumber min={1} onChange={this.countChange} />
                          ) }
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(InventoryDetail);