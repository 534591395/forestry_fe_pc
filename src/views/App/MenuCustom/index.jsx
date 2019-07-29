import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Menu, Icon } from 'antd';

import routes from '../../../routes';

const SubMenu = Menu.SubMenu;

class MenuCustom extends Component {

  setDefaultActiveMenuItem = () => {
    switch (this.props.location.pathname) {
      case '/app/company/companyDetail': {
        return ['/app/company/companyInfo'];
      }
      default: {
        return [this.props.location.pathname];
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

  render() {
    let routesArr = JSON.parse(JSON.stringify(routes));
    if (!this.isAdmin()) {
      delete routesArr.home;
    }
    return (
      <div className="menuCustom">
        <Menu mode="inline" theme="dark" selectedKeys={ this.setDefaultActiveMenuItem() } defaultOpenKeys={
          Object.keys(routesArr).map((item) => {
            return routesArr[item].key
          })
        }>
          {
            Object.keys(routesArr).map((item) => {
              if(window.$session.get('menu').indexOf(item) != -1) {
                if(routesArr[item].subs) {
                  return (
                    <SubMenu title={
                      <span>
                        <Icon type={ routes[item].icon } />
                        <span>{ routes[item].title }</span>
                      </span>
                    } key={ routes[item].key }>
                      {
                        routes[item].subs.map((item) => {
                          if(item.showInMenu) {
                            return (
                              <Menu.Item key={ item.key }>
                                <Link to={ item.key } replace>   
                                  <span>{ item.title }</span>
                                </Link>
                              </Menu.Item>
                            );
                          }
                          else {
                            return null;
                          }
                        })
                      }
                    </SubMenu>
                  );
                }
                else {
                  return (
                    <Menu.Item key={ routesArr[item].key }>{
                      <Link to={ routesArr[item].key } replace>
                        <span>
                          <Icon type={ routesArr[item].icon } />
                          <span>{ routesArr[item].title }</span>
                        </span>
                      </Link>
                    }</Menu.Item>
                  );
                }
              }
              return null;
            })
          }
          {
            this.isAdmin() ? 
            <Menu.Item >{
              <a href="http://47.105.67.161:8088/#/dashboard" target="_blank">
                <span>
                  <Icon type={ "area-chart" } />
                  <span>{ "报表查询" }</span>
                </span>
              </a>
            }</Menu.Item> : ''
          }
        </Menu>
      </div>
    )
  }
}

export default withRouter(MenuCustom);