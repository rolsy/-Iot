<template>
  <div id="Permission">
    <a-card style="width: 100%">
      <a-form :form="form">
        <a-row type="flex" justify="start" :gutter="16">
          <a-col :span="4">
            <a-tree-select
              v-model="treeValue"
              tree-data-simple-mode
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="treeData"
              placeholder="请选择房间"
              :load-data="onLoadData"
              @change="treeName"
            />
          </a-col>
          <a-col :span="3">
            <a-input placeholder="请输入要查询的用户" v-model="F_Account"/>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" icon="search" @click="GetAccountList" :disabled="cid === 2 ? false: true">
              查询
            </a-button>
            <a-button type="primary" icon="plus" @click="add" :disabled="cid === 2 ? false: true">
              新增
            </a-button>
          </a-col>
        </a-row>
      </a-form>
      <a-table :columns="columns" :data-source="data"
               :pagination="pagination" @change="tableChange"
               bordered
               style="marginTop:1rem"
      >
        <template slot="operation" slot-scope="text, record, index">
          <div class="editable-row-operations">
            <span>
              <a-popconfirm title="确定删除这条信息嘛" @confirm="() => deletePoint(record)">
              <a>删除</a>
              </a-popconfirm>
            </span>
          </div>
        </template>
      </a-table>
    </a-card>

    <!--新增Modal-->
    <a-modal
      title="新增"
      :visible="addModal"
      :confirm-loading="addConfirmLoading"
      @ok="addOk"
      width="60%"
      @cancel="addCancel"
    >
      <a-form :form="addForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }" @submit="addOk">
        <a-row>
          <a-col :span="12">
            <a-form-item label="房间">
              <a-input :default-value="ParentName" disabled/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="登录账户"
                         :validate-status="validateStatus"
                         :help="help"
            >
              <a-input
                placeholder="请输入登录用户"
                @change="checkAccount"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="点位">
              <a-table :columns="pointColumns" :data-source="dataSource" :row-selection="rowSelection"
                       :pagination="pointPagination" @change="pointTableChange"
                       style="margin: .5rem 1rem">
              </a-table>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
    import moment from "moment";
    import "moment/locale/zh-cn"

    export default {
        name: "Permission",
        data() {
            return {
                // tree
                treeValue: undefined,
                ParentId: 0,
                ParentName: '',
                treeData: [],
                // 表单
                form: this.$form.createForm(this, {name: 'Permission'}),
                addForm: this.$form.createForm(this, {name: 'AddForm'}),
                F_Account: '',
                // 表格
                columns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align: 'center'
                    },
                    {
                        title: '用户',
                        dataIndex: 'F_Account',
                        scopedSlots: {customRender: 'F_Account'},
                        align: 'center'
                    },
                    {
                        title: '楼宇名称',
                        dataIndex: 'BuildingName',
                        scopedSlots: {customRender: 'BuildingName'},
                        align: 'center'
                    },
                    {
                        title: '楼层名称',
                        dataIndex: 'FloorName',
                        scopedSlots: {customRender: 'FloorName'},
                        align: 'center'
                    },
                    {
                        title: '房间名称',
                        dataIndex: 'RoomName',
                        scopedSlots: {customRender: 'RoomName'},
                        align: 'center'
                    },
                    {
                        title: '点位',
                        dataIndex: 'Name',
                        scopedSlots: {customRender: 'Name'},
                        align: 'center'
                    },
                    {
                        title: '操作',
                        dataIndex: 'operation',
                        scopedSlots: {customRender: 'operation'},
                        align: 'center'
                    },
                ],
                data: [],
                // 分页
                pagination: {
                    total: 0,
                    defaultPageSize: 10,
                    showTotal: total => `共 ${total} 条`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30'],
                    onShowSizeChange: (current, pageSize) => this.pageSize = pageSize
                },
                pageSize: 10,
                currentPage: 1,
                //Modal
                addModal: false,
                addConfirmLoading: false,
                // 点位数据源
                dataSource: [],
                cid: 0,
                help: '',
                // 校验状态
                validateStatus: 'validating',
                UserId: '',
                // 点位
                pointColumns: [
                    {
                        title: '点位',
                        dataIndex: 'Name',
                        align: 'center'
                    },
                ],
                rowSelection: {
                    onChange: this.onChange,
                },
                // 点位分页
                pointPagination: {
                    total: 0,
                    defaultPageSize: 10,
                    showTotal: total => `共 ${total} 条`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30'],
                    onShowSizeChange: (current, pageSize) => this.pointPageSize = pageSize
                },
                pointPageSize: 10,
                pointCurrentPage: 1,
                Points: ''
            }
        },
        methods: {
            GetBuildingList() { // 获取楼宇查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetBFRList',
                    data: {
                        Id: 0
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        const dataArray = res.data.data;
                        that.treeData = dataArray.map(o => {
                            return {
                                id: o.Id,
                                pId: o.pid,
                                value: o.Id,
                                title: o.name,
                                cid: 0,
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取楼宇查询失败，请检查GetBFRList接口'}})
                    }
                })
            },
            genTreeNode(id) { // 添加tree节点
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetBFRList',
                    data: {
                        Id: id
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        const dataArray = res.data.data;
                        dataArray.map(o => {
                            that.treeData = that.treeData.concat([
                                {
                                    id: o.Id,
                                    pId: o.pid,
                                    value: o.Id,
                                    title: o.name,
                                    cid: o.cid,
                                    isLeaf: o.cid == 2 ? true : false,
                                }
                            ]);
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '添加tree节点失败，请检查GetBFRList接口'}})
                    }
                });
            },
            onLoadData(treeNode) { // 异步加载tree数据
                const that = this;
                return new Promise(resolve => {
                    const {id} = treeNode.dataRef;
                    that.genTreeNode(id);
                    resolve();
                });
            },
            GetAccountList() { // 获取用户点位授权查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetSqPointList',
                    data: {
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                        Id: '',
                        Account: that.F_Account,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map((o, index) => {
                            return {
                                key: index,
                                Id: o.Id,
                                BuildingName: o.BuildingName,
                                FloorName: o.FloorName,
                                RoomName: o.RoomName,
                                Name: o.Name,
                                F_Account: o.F_Account
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取用户点位授权查询失败，请检查GetSqPointList接口'}})
                    }
                })
            },
            GetDataSource() { // 获取点位自动完成的数据源
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetAllPointList',
                    data: {
                        RoomId: that.treeValue,
                        RobotId: '',
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        const dataArray = res.data.data.rows;
                        that.dataSource = dataArray.map((o, index) => {
                            return {
                                key: index,
                                Id: o.Id,
                                Name: o.Name,
                                RoomId: o.RoomId,
                                IsRobotId: o.IsRobotId,
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取点位自动完成的数据源失败，请检查GetPointList接口'}})
                    }
                })
            },
            onChange(selectedRowKeys, selectedRows){ // 点位选择
                const that = this;
                that.Points = '';
                let a = [];
                selectedRows.forEach(function (i) {
                    a.push(i.Id);
                    that.Points = a.toString()
                });
                console.log(that.Points)
            },
            pointTableChange(e) { // 点位分页变化
                const that = this;
                that.pointPageSize = e.pageSize;
                that.pointCurrentPage = e.current;
                that.GetDataSource()
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.GetAccountList()
            },
            colChange(value, key, column) { // 行编辑
                const newData = [...this.data];
                const target = newData.filter(item => key === item.key)[0];
                if (target) {
                    target[column] = value;
                    this.data = newData;
                }
            },
            edit(record) { // 编辑
                const newData = [...this.data];
                const target = newData.filter(item => record.key === item.key)[0];
                if (target) {
                    target.editable = true;
                    this.data = newData;
                }
            },
            save(record) { // 保存
                const that = this;
                const newData = [...this.data];
                const target = newData.filter(item => record.key === item.key)[0];
                // 保存点位授权信息
                let Userid;
                that.AccountArray.map(o => {
                    if (record.F_Account === o.F_Account) {
                        Userid = o.Id
                    }
                });
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetSqPointSave',
                    data: {
                        Id: record.Id,
                        Userid: Userid,
                        Buildingid: '',
                        Floorid: '',
                        Roomid: that.treeValue,
                        Pointid: record.Name,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        if (target) {
                            delete target.editable;
                            that.GetAccountList()
                        }
                    }
                })
            },
            cancel(key) { // 取消
                const newData = [...this.data];
                const target = newData.filter(item => key === item.key)[0];
                if (target) {
                    delete target.editable;
                    this.data = newData;
                }
            },
            deletePoint(record) { // 删除点位授权信息
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetSqPointDelete',
                    data: {
                        Id: record.Id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.GetAccountList()
                    } else {
                        that.$router.push({name: 'Error', params: {error: '删除点位授权信息失败，请检查GetSqPointDelete接口'}})
                    }
                })
            },
            add() { // 新增房间Modal
                this.addModal = true;
            },
            checkAccount(e) { // 校验账户
                const that = this;
                console.log(e.target.value);
                console.log(that.help);
                console.log(that.validateStatus);
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetAccountList',
                    data: {
                        Id: e.target.value
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        console.log(res)
                        if(res.data.data !== ''){
                            that.validateStatus = 'success';
                            that.UserId = res.data.data;
                            that.help = ''
                        }else {
                            that.validateStatus = 'error';
                            that.help = '账户不存在！'
                        }
                    }else {
                        that.$router.push({name: 'Error', params: {error: '校验账户失败，请检查GetAccountList接口'}})
                    }
                })
            },
            addOk(e) { // 新增用户点位授权信息
                const that = this;
                e.preventDefault();
                this.addForm.validateFields((err, values) => {
                    if (!err) {
                        if(that.UserId !== ''){
                            that.$axios({
                                method: 'post',
                                url: 'http://192.168.30.100/api/RobotApi/GetSqPointSave',
                                data: {
                                    Id: '',
                                    Userid:that.UserId,
                                    Buildingid: '',
                                    Floorid: '',
                                    Roomid: that.treeValue,
                                    Pointid: that.Points,
                                }
                            }).then((res) => {
                                if (res.data.code === 200) {
                                    that.addModal = false;
                                    that.$message.info('添加成功！');
                                    that.GetAccountList();
                                    that.addForm.resetFields();
                                    that.validateStatus = 'validating';
                                    that.help = ''
                                }else {
                                    that.$router.push({name: 'Error', params: {error: '新增用户点位授权信息失败，请检查GetSqPointSave接口'}})
                                }
                            })
                        }
                    }
                });
            },
            addCancel() { // 新增房间Modal取消
                this.addModal = false;
            },
            filterOption(input, option) {
                return (
                    option.componentOptions.children[0].text.indexOf(input) >= 0
                );
            },
            treeName(value, label, extra) { // 存房间名，Modal里不可编辑input用
                const that = this;
                that.ParentName = label[0];
                that.treeData.map(o => {
                    if (label[0] === o.title) {
                        that.cid = o.cid
                    }
                })
            },
            checkToken(token, key) { // 检查token
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/Token',
                    data: {
                        token: token,
                        Key: key
                    }
                }).then(res => {
                    if (res.status === 200) {
                        if (res.data.info === 'true') {
                            return false
                        } else {
                            that.$router.push({name: 'Error', params: {error: '权限校验失败，请检查token&key'}})
                        }
                    }

                }).catch(error => {
                    console.log(error);
                    that.$router.push({name: 'Error', params: {error: '权限校验失败，请检查token&key'}})
                })
            },
        },
        mounted() {
            const that = this;
            // that.checkToken(that.$route.query.token,that.$route.query.key);
            that.GetBuildingList();
        },
        watch: {
            treeValue(value) { // 存房间Id
                this.ParentId = value
                if (value) {
                    this.GetDataSource();
                }
            },
        }
    }
</script>

<style scoped>

</style>
