import React, { Component } from 'react';
import { Table, message, Modal, Input, Button, Form } from 'antd';

import SearchHeader from '../components/SearchHeader';
import ImageItem from '../components/ImageItem';

import './index.less';

class Cert extends Component {
  state = {
    tableData: [],
    imageModal: false,
    imageList: [
      {
        title: '',
        images: []
      }
    ],
    woods: [],
    plants: {},
    loading: false,
    record: {},
    show_refuse_reason: false
  }

  getCertList = (data) => {
    window.$http({
      url: `/admin/business/getCertList`,
      method: 'GET',
      params: {
        certType: data.certType || '',
        status: data.status || '',
        companyName: data.companyName || ''
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        res.data.data.list.map(item => {
          if (item.first_variety === 'first_variety_01') {
            item.cert_type = '原木类开证';
          } else
          if (item.first_variety === 'first_variety_02') {
            item.cert_type = '板材类开证';
          }
          if (item.wood_json) {
            const wood_json = JSON.parse(item.wood_json);
            item.variety = wood_json.woodList.length;
          }
          
        });
        this.setState({tableData: res.data.data.list});
        this.setState({plants: res.data.data.plants});
      }
    });
  }

  operateRecord = (item, type, record, refuse_reason) => {
    switch (item + type) {
      case '通过原木类开证': {
        this.invokeCert(record.id, 'wood_cert', 2, 1, record.first_variety, record.wood_json, record.cid);

        break;
      }
      case '通过板材类开证': {
        this.invokeCert(record.id, 'wood_cert', 2, 2, record.first_variety, record.wood_json, record.cid);

        break;
      }
      case '驳回原木类开证': {
        // this.invokeCert(record.id, 'wood_cert', 3);
        this.refuse(record.id, 'wood_cert', 3, record.first_variety, refuse_reason, record.cid);

        break;
      }
      case '驳回板材类开证': {
        // this.invokeCert(record.id, 'wood_cert', 3);
        this.refuse(record.id, 'wood_cert', 3, record.first_variety, refuse_reason, record.cid);

        break;
      }
      case '查看板材类开证': {
        let imageList = [
          {
            title: '1.通关无纸化放行通知单',
            images: record.noticePic ? record.noticePic.split(',') : []
          },
          {
            title: '2.中华人民共和国海关进口货物报关单',
            images: record.declarationPic ? record.declarationPic.split(',') : []
          },
          {
            title: '3.合同或销售证明',
            images: record.contractPic ? record.contractPic.split(',') : []
          }
        ];
        //this.setState({imageList});

        this.setState({record: record, imageModal: true, imageList: imageList}, () => {
          this.defautModule();
        });

        break;
      }
      case '查看原木类开证': {
        let imageList = [
          {
            title: '1.太仓出入境检验检疫局进境散装木材准运通知单',
            images: record.noticePic ? record.noticePic.split(',') : []
          },
          {
            title: '2.进口小提单',
            images: record.ladingPic ? record.ladingPic.split(',') : []
          },
          {
            title: '3.中华人民共和国海关进口货物报关单',
            images: record.declarationPic ? record.declarationPic.split(',') : []
          }
        ];
        //this.setState({imageList});

        this.setState({record: record, imageModal: true, imageList: imageList}, () => {
          this.defautModule();
        });

        break;
      }
      default: {
        break;
      }
    }

  }
  // 弹出框里重置信息
  defautModule = () => {
      // 转换类型
      let woods = JSON.parse(this.state.record.wood_json).woodList;
      woods.map(item => {
        item.plant_variety_txt = this.state.plants[item.plant_variety];
      })
      console.log(woods)
      this.setState({woods: woods});
  }
  // 驳回
  refuse(id, table, status, first_variety, refuse_reason, cid) {
    window.$http({
      url: `/admin/business/invokeCert`,
      method: 'PUT',
      data: {
        id, table, status, first_variety, refuse_reason, cid
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        message.success('驳回成功');
        window.$pubsub.publish('Cert_refreshCertList');
      }
    });
  }
  // 通过请求
  invokeCert = (id, table, status, wood_type, first_variety, wood_json, cid) => {
    window.$http({
      url: `/admin/business/invokeCert`,
      method: 'PUT',
      data: {
        id, table, status, wood_type, first_variety, wood_json, cid
      }
    }).then((res) => {
      if(res && res.data.code == 0) {
        // if (status == 3) {
        // message.success('驳回成功');
        // }
        // if (status == 2) {
        // message.success('审核成功');
        // }
        message.success('审核成功');
        window.$pubsub.publish('Cert_refreshCertList');
      }
      // TODO 提示
    });
  }
  _changeValue = (e, index) => {
    console.log(index);
    let woods = this.state.woods;
    woods[index].amount = e.target.value;
    this.setState({woods: woods})
    
  }
  // 弹出查看后审核按钮
  handleOk = () => {
    let record = this.state.record;
    let woods = this.state.woods
    // console.log(woods);
    woods.map(item => {
      delete item.plant_variety_txt
    })
    record.wood_json = JSON.stringify({woodList: woods});
    // console.log(record);
    this.operateRecord('通过', record.cert_type, record);

    this.setState({imageModal: false});
  }
  // 弹出查看后驳回按钮
  handleCancel = () => {
    if (!this.state.show_refuse_reason) {
      this.setState({show_refuse_reason: true});
      return
    }
    let record = this.state.record;
    // this.setState({imageModal: false});
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.operateRecord('驳回', record.cert_type, record, values.refuse_reason);
        this.setState({imageModal: false});
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const statusMap = ['', '待审核', '已通过', '未通过'];
    const optMap = ['', ['查看'], ['查看'], ['查看']];
    const { loading, record } = this.state;
    const columns = [
      {
        title: '开证单编号',
        dataIndex: 'number'
      },
      {
        title: '企业名称',
        dataIndex: 'name'
      },
      {
        title: '开证类型',
        dataIndex: 'cert_type'
      },
      {
        title: '产品种类',
        dataIndex: 'variety'
      },
      {
        title: '开证时间',
        dataIndex: 'create_time'
      },
      {
        title: '状态',
        render: (text, record) => (
          <span>
            {
              statusMap[record.status]
            }
          </span>
        )
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
            {
              optMap[record.status].map((item, index) => {
                return (
                  <a 
                    key={ index }
                    style={{ marginLeft: 10 }} 
                    onClick={ 
                      () => { this.operateRecord(item, record.cert_type, record) } 
                    }
                  >
                    { item }
                  </a>
                );
              })
            }
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
      <div className="cert">
        <div style={{ marginBottom: 20 }}>
          <SearchHeader getList={ this.getCertList } { ...this.props.location.params } />
        </div>

        <Table 
          columns={ columns } 
          dataSource={ this.state.tableData } 
          pagination={ pagination } 
          bordered 
          rowKey={ record => record.number }
        />

        <Modal 
          title="查看" 
          visible={ this.state.imageModal } 
          maskClosable={ false }
          destroyOnClose={true}
          onCancel={ () => { this.setState({imageModal: false}) } }
          footer={ record.status !== 1 ? [

            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>通过</Button>,
            <Button key="back" onClick={this.handleCancel}>驳回</Button>
          ]: []}
        >
          {
            this.state.imageList.map((item, index) => {
              return <ImageItem title={ item.title } images={ item.images } key={ index }/>
            })
          }
          <Form className="detail">
            {
              this.state.woods.map((item, index) => {
                return (
                        <div className="detail-group" key={ index }>
                          <div className="name">{ item.plant_variety_txt }</div>
                          <Input size="small" value={ item.amount } type="number" disabled={record.status != 1} onChange ={value => this._changeValue(value, index)} />
                          <span>m³</span>
                        </div>
                        )
              })
            }
            {
              (record.status !== 1 && this.state.show_refuse_reason) ? 
                <Form.Item label="驳回原因: ">
                        { getFieldDecorator('refuse_reason', {
                          rules: [{ required: true, message: '请填写驳回原因' }]
                        })(
                          <Input style={{ width: 300 }} />
                        ) }
                </Form.Item> : null
            }
          </Form>
        </Modal>
      </div>
    )
  }
}

export default Form.create()(Cert);