<template>
  <div id="Room">
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
              placeholder="请选择楼层"
              :load-data="onLoadData"
              @change="treeName"
            />
          </a-col>
          <a-col :span="3">
            <a-input placeholder="请输入要查询的房间名称" v-model="RoomName"/>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" icon="search" @click="GetRoomList" :disabled="cid === 1 ? false: true">
              查询
            </a-button>
            <a-button type="primary" icon="plus" @click="add" :disabled="cid === 1 ? false: true">
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
        <template
          v-for="col in ['RoomName', 'Remark']"
          :slot="col"
          slot-scope="text, record, index"
        >
          <div :key="col">
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="e => colChange(e.target.value, record.key, col)"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <div class="editable-row-operations">
            <span v-if="record.editable">
              <a @click="() => save(record)">保存</a>
              <a @click="() => cancel(record.key)">取消</a>
            </span>
            <span v-else>
              <a @click="() => edit(record)">编辑</a>
              <a-popconfirm title="确定删除这条房间信息嘛" @confirm="() => deleteRoom(record)">
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
            <a-form-item label="楼层">
              <a-input :default-value="ParentName" disabled/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="房间名称">
              <a-input placeholder="请输入房间名称"
                       v-decorator="['RoomName', { rules: [{ required: true, message: '你得填名称丫~' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注">
              <a-input placeholder="请输入房间备注"
                       v-decorator="['Remark', { rules: [{ required: true, message: '你得填备注丫~' }] }]"
              />
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
        name: "Room",
        data() {
            return {
                // tree
                treeValue: undefined,
                ParentId: 0,
                ParentName: '',
                treeData: [],
                // 表单
                form: this.$form.createForm(this, {name: 'Room'}),
                addForm: this.$form.createForm(this, {name: 'AddForm'}),
                RoomName: '',
                // 表格
                columns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align:'center'
                    },
                    {
                        title: '楼宇名称',
                        dataIndex: 'BuildingName',
                        scopedSlots: {customRender: 'BuildingName'},
                        align:'center'
                    },
                    {
                        title: '楼层名称',
                        dataIndex: 'FloorName',
                        scopedSlots: {customRender: 'FloorName'},
                        align:'center'
                    },
                    {
                        title: '房间名称',
                        dataIndex: 'RoomName',
                        scopedSlots: {customRender: 'RoomName'},
                        align:'center'
                    },
                    {
                        title: '备注',
                        dataIndex: 'Remark',
                        scopedSlots: {customRender: 'Remark'},
                        align:'center'
                    },
                    {
                        title: '操作',
                        dataIndex: 'operation',
                        scopedSlots: {customRender: 'operation'},
                        align:'center'
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
                cid: 0
            }
        },
        methods: {
            GetRoomList() { // 获取房间查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetRoomList',
                    data: {
                        Id: '',
                        Name: that.RoomName,
                        ParentId: that.ParentId,
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
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
                                Remark: o.Remark
                            }
                        });
                    }else {
                        that.$router.push({name: 'Error', params: {error: '获取房间查询失败，请检查GetRoomList接口'}})
                    }
                })
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.GetRoomList()
            },
            colChange(value, key, column) { // 行编辑
                const newData = [...this.data];
                const target = newData.filter(item => key === item.key)[0];
                if (target) {
                    target[column] = value;
                    this.data = newData;
                }
            },
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
                        console.log(res)
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
                        console.log(that.treeData)
                    }else {
                        that.$router.push({name: 'Error', params: {error: '获取楼宇查询失败，请检查GetBFRList接口'}})
                    }
                })
            },
            GetFloorList() { // 获取楼层查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetFloorList',
                    data: {
                        Id: '',
                        Name: '',
                        ParentId: that.BuildingId
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        that.FloorArray = res.data.data
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取楼层查询失败，请检查GetFloorList接口'}})
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
                        console.log(res)
                        const dataArray = res.data.data;
                        dataArray.map(o => {
                            that.treeData = that.treeData.concat([
                                {
                                    id: o.Id,
                                    pId: o.pid,
                                    value: o.Id,
                                    title: o.name,
                                    cid: o.cid,
                                    isLeaf: o.cid == 1 ? true : false,
                                }
                            ]);
                        });
                    }else {
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
                // 保存房间信息
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetRoomSave',
                    data: {
                        Id: record.Id,
                        RoomName: record.RoomName,
                        FloorId: that.ParentId,
                        Remark: record.Remark,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        if (target) {
                            delete target.editable;
                            that.GetRoomList()
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
            deleteRoom(record) { // 删除房间信息
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetRoomDelete',
                    data: {
                        Id: record.Id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.GetRoomList()
                    }else {
                        that.$router.push({name: 'Error', params: {error: '删除房间信息失败，请检查GetRoomDelete接口'}})
                    }
                })
            },
            add() { // 新增房间Modal
                this.addModal = true;
            },
            addOk(e) { // 新增房间信息
                const that = this;
                e.preventDefault();
                this.addForm.validateFields((err, values) => {
                    if (!err) {
                        that.$axios({
                            method: 'post',
                            url: 'http://192.168.30.100/api/RobotApi/GetRoomSave',
                            data: {
                                Id: '',
                                FloorId:that.ParentId,
                                RoomName: values.RoomName,
                                Remark: values.Remark,
                            }
                        }).then((res) => {
                            if (res.data.code === 200) {
                                that.addModal = false;
                                that.$message.info('添加成功！')
                                that.GetRoomList();
                                that.addForm.resetFields();
                            }else {
                                that.$router.push({name: 'Error', params: {error: '新增房间信息失败，请检查GetRoomSave接口'}})
                            }
                        })
                    }
                });
            },
            addCancel() { // 新增房间Modal取消
                this.addModal = false;
            },
            treeName(value, label, extra) { // 存楼层名，Modal里不可编辑input用
                const that = this;
                that.ParentName = label[0]
                that.treeData.map(o => {
                    if(label[0] === o.title){
                        that.cid = o.cid
                    }
                })
            },

            checkToken(token,key) { // 检查token
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
            treeValue(value) { // 存楼层Id
                this.ParentId = value
            },
        },
    }
</script>

<style scoped>

</style>
