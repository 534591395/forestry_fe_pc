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
  }
  // 原木类型选择
  callbackFn = (key) => {
    this.setState({type: key})
    
  }
  // handleAdd = () => {
    
  
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
    // if (this.state.type === 'firstVariety02') {
    //   data.wood_variety = this.state.addWoodsValue
    // }
    this.props.form.validateFields((err, values) => {
      // console.log(values);
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
        cid: this.props.info.id,
        plant_variety: values.plant_variety,
        amount: values.amount,
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
          this.setState({showAdd: false})
          let data = this.props.woodDetail
          data[this.state.type].push(res.data.data)
          this.props.addSuccess(data)
        }
      }
    });
  }
  // 表格中改变数量
  _changeValue = (e, record) => {
    // console.log(record);
    // console.log(e.target.value);
    let data = this.props.woodDetail
    data[this.state.type].map((item, index) => {
      // console.log(item);
      // console.log(record.id);
      if (item.id == record.id) {
        data[this.state.type][index].amount = e.target.value
      }
    })
    // console.log(data)
    this.props.changeTable(data)
    // this.props.setState({woodDetail: data})
    // record.address = 1
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const columns = [
      { title: '木材品种', dataIndex: 'first_variety', key: 'first_variety' },
      { title: '开证量(m³)', dataIndex: '', key: 'age', render: (text, record) => (
        <Input size="small" value={ record.amount } type="number" onChange ={value => this._changeValue(value, record)} />
        ) },
      { title: '更新时间', dataIndex: 'last_modify_time', key: 'last_modify_time' },
      {
        title: '操作', dataIndex: '', key: '', render: (text, record) => <a href="javascript:;" onClick={ () => { this.addReq('更新', record)}}>更新</a>,
      },
    ];
    const pagination = {
      pageSizeOptions: ['10', '20', '50'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total) => (`总共 ${total} 条`)
    }
    return (
      <div className="inventory-detail">
        <div className="info">
          <div className="label">
            <div>公司:{this.props.info.name}</div>
            <div>信用代码:{ this.props.info.code }</div>
          </div>
          <div className="num">
            <div>可用原木量: { this.props.info.firstVariety01Amount } m³</div>
            <div>可用板材量: { this.props.info.firstVariety02Amount } m³</div>
          </div>
        </div>
        <Tabs defaultActiveKey="first_variety_01" onChange={ this.callbackFn }>
          <TabPane tab="原木类" key="first_variety_01">

          </TabPane>
          <TabPane tab="板材类" key="first_variety_02">

          </TabPane>
        </Tabs>
        <div className="content">
          <Button onClick={ () => { this.setState({showAdd: true})} } type="primary" style={{ marginBottom: 16 }}>
            新增
          </Button>
          <Table
            bordered
            columns={columns}
            dataSource={ this.props.woodDetail[this.state.type] }
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
                              placeholder="Select a person"
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
            {/* {this.state.type === 'firstVariety02' ? <Form.Item>
                          { getFieldDecorator('woods', {
                            rules: [{ required: true, message: '请选择木材品种' }]
                          })(
                            <Select
                              showSearch
                              style={{ width: 200 }}
                              placeholder="Select a person"
                              optionFilterProp="children"
                              onChange={this.selWoodsChange}
                              onSearch={this.onSearch}
                              value={this.state.addValue}
                              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                              {this.props.woods.map (item => {
                                return <Option value={item.key}>{item.value}</Option>
                              })}
                            </Select>
                          ) }
            </Form.Item> : null} */}
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