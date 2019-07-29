import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';

import './index.less';

class Login extends Component {
  componentDidMount() {
    if(window.$session.get('user')) {
      if (this.isAdmin()) {
        this.props.history.push('/');
      } else {
        this.props.history.push('/app/business/plantCert');
      }
    }
  }

  isAdmin() {
    let bool = false;
    try {
      let user =  window.$session.get('user');
      let role = user.role;
      role.map( item => {
        if([1,2].indexOf(item.id) > -1) {
          bool = true;
        }
      });
    } catch (error) {
      bool = false;
    }
    return bool;
  }

  submit = () => {
    this.props.form.validateFields(async (err, values) => {
      if(!err) {
        await window.$service.login(values);
        await window.$service.getMenu();
        if(window.$session.get('user')) {
          if (this.isAdmin()) {
            this.props.history.push('/');
          } else {
            this.props.history.push('/app/business/plantCert');
          }
        }
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="login">
        <div className="login-content">
          <h1 className="login-title">林业有害生物检疫信息管理系统</h1>

          <Form className="login-form">
            <Form.Item>
              {
                getFieldDecorator('username', {
                  rules: [{ required: true, message: '请输入用户名' }]
                })(
                  <Input size="large" prefix={ <Icon type="user" /> } placeholder="请输入用户名" />
                )
              }        
            </Form.Item>
            <Form.Item>
              {
                getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入密码' }]
                })(
                  <Input size="large" prefix={ <Icon type="lock" /> } type="password" placeholder="请输入密码" />
                )
              }
            </Form.Item>
            <Form.Item>
              <Button block type="primary" size="large" onClick={ this.submit }>登陆</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(Login);