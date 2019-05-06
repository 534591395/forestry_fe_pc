import React, { Component } from 'react';
import { Button, Input, Table, Modal, message, Form  } from 'antd';

import './index.less';

class Plants extends Component {
  state = {
    search: '',
    tableData: [],
    modalTitle: [],
    basicModal: false,
    currentBasic: {}
  }

  componentDidMount() {
    this.getBasicInfo(this.state.search);
  }

  getBasicInfo(basicName) {
    window.$http({
      url: '/admin/system/plants/getPlantsList',
      method: 'GET',
    }).then((res) => {
      if(res && res.data.code == 0) {
        this.setState({tableData: res.data.data});
      }
    });
  }

  handleSearch = (value) => {
    this.setState({search: value});
    this.getBasicInfo(value);
  }

  // 新增提交
  basicSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if(!err) {
        window.$http({
          url: `/admin/system/plants/addPlants`,
          method: 'POST',
          data: {
            param_name: values.param_name
          }
        }).then((res) => {
          if(res && res.data.code == 0) {
            message.success(`${this.state.modalTitle}成功`);
            this.toggleBasicModal();
            this.getBasicInfo(this.state.search);
          }
        });
      }
    });
  }

  toggleBasicModal = ($event, title, record) => {
    if(title) {
      this.setState({modalTitle: title});
    }

    record ? this.setState({currentBasic: record}) : this.setState({currentBasic: {}});

    this.setState({basicModal: !this.state.basicModal});
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout =  {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };

    const columns = [
      {
        title: '植物产品名称',
        dataIndex: 'param_name'
      },
      {
        title: '值',
        dataIndex: 'param_value'
      },
      // {
      //   title: '操作',
      //   width: 200,
      //   render: (text, record) => (
      //     <span>
      //       <a href="javascript: void(0);" style={{ marginRight: '15px' }} onClick={ ($event) => { this.toggleBasicModal($event, '编辑字典', record) } }>编辑</a>
      //       <a href="javascript: void(0);" onClick={ ($event) => { this.delBasic($event, record.id) } }>删除</a>
      //     </span>
      //   )
      // }
    ];

    const pagination = {
      pageSizeOptions: ['10', '20', '50'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total) => (`总共 ${total} 条`)
    }

    return (
      <div className="basic">
        <div className="basic-header flex-space-between">
          <Button type="primary" onClick={ ($event) => { this.toggleBasicModal($event, '新增植物产品') } }>新增植物产品</Button>
          
          {/* <div style={{ width: 300 }}>
            <Input.Search placeholder="请输入植物产品名称" onSearch={ this.handleSearch } enterButton allowClear />
          </div> */}
        </div>

        <Table columns={ columns } dataSource={ this.state.tableData } pagination={ pagination } bordered rowKey={ record => record.id } />

        <Modal title={ this.state.modalTitle } visible={ this.state.basicModal } maskClosable={ false } destroyOnClose={ true }
        onOk={ this.basicSubmit } onCancel={ this.toggleBasicModal }>
          <Form>
            <Form.Item label="植物产品名称" { ...formItemLayout }>
              {
                getFieldDecorator('param_name', {
                  initialValue: this.state.currentBasic.name,
                  rules: [{ required: true, message: '请输入植物产品名称' }]
                })(
                  <Input placeholder="请输入植物产品名称" />
                )
              }  
            </Form.Item>

            {/* <Form.Item label="值" { ...formItemLayout } extra="请在不同的选项中间加英文逗号">
              {
                getFieldDecorator('info', {
                  initialValue: this.state.currentBasic.info,
                  rules: [{ required: true, message: '请输入值' }]
                })(
                  <Input.TextArea  placeholder="请输入值" rows="3" />
                )
              }  
            </Form.Item> */}
          </Form>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(Plants);