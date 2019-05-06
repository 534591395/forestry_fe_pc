import React, { Component } from 'react';
import { Button, Input, Table, Form, Select, Modal } from 'antd';


import InventoryDetail from './components/InventoryDetail';
import './index.less';

class CompanyInventory extends Component {
  state = {
    tableData: [],
    companyType: [],
    showDetail: false,
    woodDetail: {},
    info: {},
    plants: [],
    woods: [],
    companyList: []
  }

  async componentDidMount() {
    await this.getBasicInfo();
    this.getCompanyInfo(this.state.companyType[0], '', '', '');
  }

  getBasicInfo = () => {
    return new Promise((resolve) => {
      window.$http({
        url: '/admin/system/basic/getBasicInfo',
        method: 'GET',
        params: {
          basicName: ''
        }
      }).then((res) => {
        if(res && res.data.code == 0) {
          res.data.data['企业类型'].info.unshift('全部');
          this.setState({companyType: res.data.data['企业类型'].info}, () => {
            resolve();
          });
        }
      });
    });
  }

  getCompanyInfo = (companyType, name, status, store) => {
    window.$http({
      url: '/admin/company/getCompanyInventoryList',
      method: 'GET',
      params: {
        companyType: companyType === '全部' ? '' : companyType, 
        name, 
        status, 
        store
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        this.setState({tableData: res.data.data.list});
        this.setState({plants: res.data.data.plants});
        this.setState({woods: res.data.data.woods});
        this.setState({companyList: res.data.data.companyList});
      }
    });
  }

  search = () => {
    let value = this.props.form.getFieldsValue();
    this.getCompanyInfo(value.companyType, value.name ? value.name : '', value.status, value.store ? value.store : '');
  }

  editor = (record, type) => {
    if (type == 'editor') {
      this.setState({showDetail: true})
      this.setState({woodDetail: record.woodDetail})
      this.setState({info: record})
    } else 
    if (type == 'add') {
      this.setState({showDetail: true})
      this.setState({woodDetail: {'first_variety_01': [], 'first_variety_02': []}})
      this.setState({info: {}})
    }
  }
  changeTableDate = (val) => {
    // console.log(val);
    this.setState({woodDetail: val})
    
  }
  addSuccess = (val) => {
    // console.log(val);
    this.setState({woodDetail: val})
    
  }

  render() {
    const status = ['', '待审核', '已注册', '未通过', '已注销'];

    const { getFieldDecorator } = this.props.form;

    const columns = [
      {
        title: '企业名称',
        dataIndex: 'name'
      },
      {
        title: '企业法人',
        dataIndex: 'corporation'
      },
      {
        title: '联系电话',
        dataIndex: 'phone'
      },
      {
        title: '可用原木量',
        dataIndex: 'firstVariety01Amount'
      },
      {
        title: '可用板材量',
        dataIndex: 'firstVariety02Amount'
      },
      {
        title: '操作',
        width: 200,
        render: (text, record) => (
          <span>
            <a href="javascript: void(0);" style={{ marginRight: '15px' }} onClick={ ($event) => { this.editor(record, 'editor') } }>查看</a>
          </span>
        )
      }
    ];

    const pagination = {
      pageSizeOptions: ['10', '20', '50'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total) => (`总共 ${total} 条`)
    }

    return (
      <div className="company-info">
        <div className="company-info-header">
          <Form layout="inline">
            <Form.Item label="企业类型">
              {
                getFieldDecorator('companyType', {
                  initialValue: this.state.companyType[0]
                })(
                  <Select style={{ width: 170 }}>
                    {
                      this.state.companyType.map((item, index) => {
                        return (
                          <Select.Option value={ item } key={ index }>{ item }</Select.Option>
                        );
                      })
                    }
                  </Select>
                )
              }
            </Form.Item>

            <Form.Item label="企业名称">
              {
                getFieldDecorator('name')(
                  <Input style={{ width: 170 }} />
                )
              }
            </Form.Item>

            <Form.Item label="仓储地点">
              {
                getFieldDecorator('store')(
                  <Input style={{ width: 170 }} />
                )
              }
            </Form.Item>

            <Form.Item label="状态">
              {
                getFieldDecorator('status', {
                  initialValue: ""
                })(
                  <Select style={{ width: 170 }}>
                    <Select.Option value="">全部</Select.Option>
                    <Select.Option value={ 2 }>已注册</Select.Option>
                    <Select.Option value={ 1 }>待审核</Select.Option>
                    <Select.Option value={ 4 }>已注销</Select.Option>
                    <Select.Option value={ 3 }>未通过</Select.Option>
                  </Select>
                )
              }
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={ this.search }>搜索</Button>
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={ ($event) => { this.editor(null, 'add') } }>新增企业库存</Button>
            </Form.Item>
          </Form>
        </div>

        <Table columns={ columns } dataSource={ this.state.tableData } pagination={ pagination } bordered rowKey={ record => record.id } />
        <Modal
          title="查看"
          visible={this.state.showDetail}
          onOk={this.handleOk}
          onCancel={() => this.setState({showDetail: false})}
          width={1000}
        >
          <InventoryDetail woodDetail={ this.state.woodDetail } info={ this.state.info } plants={this.state.plants} woods={this.state.woods} changeTable={this.changeTableDate.bind(this)} addSuccess={this.addSuccess.bind(this)} companyList={this.state.companyList} ></InventoryDetail>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(CompanyInventory);