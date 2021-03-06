import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
  Form,
  Select,
  Input,
  Button,
  DatePicker
} from 'antd';

class SearchHeader extends Component {
  static propTypes = {
    getList: PropTypes.func.isRequired,
    status: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    companyName: PropTypes.string,
    type: PropTypes.string,
    carNumber: PropTypes.string
  }

  static defaultProps  = {
    status: '',
    companyName: '',
    type: 'cert',
    carNumber: ''
  }

  state = {
    
  }

  componentDidMount () {
    this.props.getList(this.props.form.getFieldsValue());
    window.$pubsub.subscribe('Cert_refreshCertList', () => {
      this.props.getList(this.props.form.getFieldsValue());
    });
  }

  render () {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="search-header">
        <Form layout="inline">
          {
            this.props.type === 'plantCert' ? null : (
              <Form.Item label="开证类型">
                { 
                  getFieldDecorator('certType', {
                    initialValue: ''
                  })(
                    <Select style={{ width: 170 }}>
                      <Select.Option value="">全部</Select.Option>
                      <Select.Option value="板材类开证">板材类开证</Select.Option>
                      <Select.Option value="原木类开证">原木类开证</Select.Option>
                    </Select>
                  )
                }
              </Form.Item>
            )
          }


          {
            this.props.type === 'plantCert' ?
            <Form.Item label="状态">
            {
              getFieldDecorator('status', {
                initialValue: this.props.status
              })(
                <Select style={{ width: 170 }}>
                  <Select.Option value="">全部</Select.Option>
                  <Select.Option value={ 1 }>待审核</Select.Option>
                  <Select.Option value={ 2 }>已通过</Select.Option>
                  <Select.Option value={ 3 }>未通过</Select.Option>
                  <Select.Option value={ 4 }>待上传照片</Select.Option>
                  <Select.Option value={ 5 }>待审核照片</Select.Option>
                  <Select.Option value={ 6 }>待回签</Select.Option>
                  <Select.Option value={ 7 }>已回签</Select.Option>
                </Select>
              )
            }
           </Form.Item> : 
            <Form.Item label="状态">
            {
              getFieldDecorator('status', {
                initialValue: this.props.status
              })(
                <Select style={{ width: 170 }}>
                  <Select.Option value="">全部</Select.Option>
                  <Select.Option value={ 1 }>待审核</Select.Option>
                  <Select.Option value={ 2 }>已通过</Select.Option>
                  <Select.Option value={ 3 }>未通过</Select.Option>
                </Select>
              )
            }
           </Form.Item>
          }

          <Form.Item label="企业名称">
            {
              getFieldDecorator('companyName', {
                initialValue: this.props.companyName
              })(
                <Input style={{ width: 170 }} />
              )
            }
          </Form.Item>
          {
            this.props.type === 'plantCert' ?
            <Form.Item label="车牌">
            {
              getFieldDecorator('carNumber', {
                initialValue: this.props.carNumber
              })(
                <Input style={{ width: 170 }} />
              )
            }
          </Form.Item> : ''
          } 


          <Form.Item label={this.props.type === 'plantCert' ? "创建时间": "开证时间"}>
            {
              getFieldDecorator('createTime', {
                
              })(
                <DatePicker />
              )
            }
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              onClick={
                () => { this.props.getList(this.props.form.getFieldsValue(), true) }
              }
            >
              搜索
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

export default Form.create()(SearchHeader);