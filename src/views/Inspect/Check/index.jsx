import React, { Component } from 'react';
import { Table, message, Modal  } from 'antd';

import ImageItem from '../../Business/components/ImageItem';

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

  showImg = (record) => {
    this.setState({
      imageList: [{
        title: '',
        images: record.attachment
      }],
      imageModal: true
    });
  }

  render() {
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'name'
      },
      {
        title: '检查日期',
        dataIndex: 'check_date'
      },
      {
        title: '检查人数',
        dataIndex: 'check_number'
      },
      {
        title: '仓储地点',
        dataIndex: 'store_area'
      },
      {
        title: '台锯数',
        dataIndex: 'bench_count'
      },
      {
        title: '检查地点',
        dataIndex: 'check_area'
      },
      {
        title: '车辆数量',
        dataIndex: 'car_count'
      },
      {
        title: '车牌',
        dataIndex: 'car_card'
      },
      {
        title: '是否合规',
        dataIndex: 'delivery_order_valid'
      },
      {
        title: '备注',
        dataIndex: 'remark'
      },
      {
        title: '图片',
        render: (text, record) => (
          <span>
            <a 
              key={ record.id}
              onClick={ 
                () => { this.showImg(record) } 
              }
            >
              查看
            </a>
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
      <div className="check">
        <Table 
          columns={ columns } 
          dataSource={ this.state.tableData } 
          pagination={ pagination } 
          bordered 
          loading={ this.state.loading }
          rowKey={ record => record.id }
        />

        <Modal 
          title="查看" 
          visible={ this.state.imageModal } 
          maskClosable={ false }
          destroyOnClose={true}
          onCancel={ () => { this.setState({imageModal: false}) } }
          footer={[]}
        >
          {
            this.state.imageList.map((item, index) => {
              return <ImageItem title={ '' } images={ item.images } key={ index }/>
            })
          }
        </Modal>


      </div>
    )
  }
}

export default Check;