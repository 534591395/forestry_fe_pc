import React, { Component } from 'react';
import { Tabs, Form, Table, Button } from 'antd';

import './index.less';
const TabPane = Tabs.TabPane;
class InventoryDetail extends Component {
  state = {
  }
  callbackFn = (key) => {
    console.log(key);
    
  }
  handleAdd = () => {
    
  }
  render() {
    const columns = [
      { title: '木材品种', dataIndex: 'name', key: 'name' },
      { title: '开证量(mm³)', dataIndex: 'age', key: 'age' },
      { title: '更新时间', dataIndex: 'address', key: 'address' },
      {
        title: '操作', dataIndex: '', key: 'x', render: () => <a href="javascript:;">更新</a>,
      },
    ];
    const data = [
      {
        key: 1, name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park'
      },
      {
        key: 2, name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park', description: 'My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.',
      },
      {
        key: 3, name: 'Joe Black', age: 32, address: 'Sidney No. 1 Lake Park', description: 'My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.',
      },
    ];
        
    return (
      <div className="inventory-detail">
        <div className="info">
          <div className="label">
            <div>公司</div>
            <div>信用代码：12312312</div>
          </div>
          <div className="num">
            <div>可用原木量: { }m³</div>
            <div>可用板材量: { }m³</div>
          </div>
        </div>
        <Tabs defaultActiveKey="1" onChange={ this.callbackFn }>
          <TabPane tab="原木类" key="1">

          </TabPane>
          <TabPane tab="板材类" key="2">

          </TabPane>
        </Tabs>
        <div className="content">
          <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
            新增
          </Button>
          <Table
            bordered
            columns={columns}
            dataSource={data}
          />
        </div>
      </div>
    )
  }
}

export default Form.create()(InventoryDetail);