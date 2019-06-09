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
    companyList: [],
    loading: false,
    filter: {},
    page: {
      current: 1,
      size: 10,
      total: 0
    },
  }

  async componentDidMount() {
    await this.getBasicInfo();
    this.getCompanyInfo(this.state.companyType[0], '', '', '', true);
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

  setWoodDetail = (woodDetail) => {
    this.setState({
      woodDetail: woodDetail
    });
  }

  getCompanyInfo = (companyType, name, status, store, isSearch) => {
    this.setState({
      loading: true
    });
    if (isSearch) {
      let page = this.state.page;
      page.current = 1;
      page.total = 0;
      this.setState({
        filter: {companyType, name, status, store} || {},
        page: page
      });
    }
    window.$http({
      url: '/admin/company/getCompanyInventoryList',
      method: 'GET',
      params: {
        companyType: isSearch ? (companyType === '全部' ? '' : companyType) : ((this.state.filter.companyType === '全部' ? '' : this.state.filter.companyType)), 
        name : isSearch ? name : this.state.filter.name, 
        status : isSearch ? status : this.state.filter.status,
        store:  isSearch ? status : this.state.filter.status,
        pageNum: this.state.page.current,
        pageSize: this.state.page.size
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        this.setState({tableData: res.data.data.list});
        this.setState({plants: res.data.data.plants});
        this.setState({woods: res.data.data.woods});
        this.setState({companyList: res.data.data.companyList});
        let page = this.state.page;
        page.total = res.data.data.total || 0;
        this.setState({ page: page});
        this.setState({
          loading: false
        });
      } else {
        this.setState({
          loading: false
        });
      }
    });
  }

  ok = () => {
    this.setState({showDetail: false});
    this.getCompanyInfo('','','','');
  }

  search = () => {
    let value = this.props.form.getFieldsValue();
    this.getCompanyInfo(value.companyType, value.name ? value.name : '', value.status, value.store ? value.store : '', true);
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
  // 分页
  changePageNum = (pageNum) => {
    let data = Object.assign({}, this.state.page, {current: pageNum})
    this.setState({page: data}, () => {
      this.getCompanyInfo();
    });
    
  }

  changePageSize = (current, size) => {
    let data = Object.assign({}, this.state.page, {current: 1, size})
    this.setState({page: data}, () => {
      this.getCompanyInfo();
    });
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

        <Table 
          columns={ columns }
          dataSource={ this.state.tableData }
          loading={ this.state.loading }
          pagination={ pagination } 
          bordered rowKey={ record => record.id } />
        <Modal
          title="查看"
          visible={this.state.showDetail}
          onOk={() => this.ok()}
          onCancel={() => this.ok()}
          width={1000}
        >
          <InventoryDetail woodDetail={ this.state.woodDetail } info={ this.state.info } plants={this.state.plants} woods={this.state.woods} changeTable={this.changeTableDate.bind(this)} addSuccess={this.addSuccess.bind(this)} companyList={this.state.companyList} setWoodDetail={this.setWoodDetail.bind(this)} ></InventoryDetail>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(CompanyInventory);