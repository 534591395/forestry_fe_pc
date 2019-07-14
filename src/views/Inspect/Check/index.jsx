import React, { Component } from 'react';
import { Table, message  } from 'antd';

import './index.less';

class Check extends Component {
  state = {
    page: {
      current: 1,
      size: 10,
      total: 0
    },
    tableData: [],
    imageModal: false,
    imageList: [
      {
        title: '',
        images: []
      }
    ],
    loading: false
  }

  componentDidMount() {
    this.getList();
  }

  getList = (data, isSearch) => {
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
      url: `/admin/inspect/getCheckList`,
      method: 'GET',
      params: {
        pageNum: this.state.page.current,
        pageSize: this.state.page.size
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        let list = res.data.data.list;
        list.map(item => {
          
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

  // 分页
  changePageNum = (pageNum) => {
    let data = Object.assign({}, this.state.page, {current: pageNum})
    this.setState({page: data}, () => {
      this.getList();
    });
  }
  changePageSize = (current, size) => {
    let data = Object.assign({}, this.state.page, {current: 1, size})
    this.setState({page: data}, () => {
      this.getList();
    });
  }

  render() {
    const columns = [
      {
        title: '企业名称',
        dataIndex: '1'
      },
      {
        title: '检查日期',
        dataIndex: '2'
      },
      {
        title: '检查人数',
        dataIndex: '3'
      },
      {
        title: '仓储地点',
        dataIndex: '4'
      },
      {
        title: '台锯数',
        dataIndex: '5'
      },
      {
        title: '检查地点',
        dataIndex: '6'
      },
      {
        title: '车辆数量',
        dataIndex: '7'
      },
      {
        title: '车牌',
        dataIndex: '8'
      },
      {
        title: '图片',
        dataIndex: '9'
      },
      {
        title: '备注',
        dataIndex: '10'
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
      <div className="check">
        <Table 
          columns={ columns } 
          dataSource={ this.state.tableData } 
          pagination={ pagination } 
          bordered 
          loading={ this.state.loading }
          rowKey={ record => record.id }
        />
      </div>
    )
  }
}

export default Check;