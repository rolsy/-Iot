<template>
  <div id="Point">
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
            <a-input placeholder="请输入要查询的点位名称" v-model="PointName"/>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" icon="search" @click="GetPointList">
              查询
            </a-button>
            <a-button type="primary" icon="plus" @click="add" :disabled="treeValue === undefined ? true: false">
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
          v-for="col in ['Name', 'Code', 'Remark']"
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
        <template slot="RobotName" slot-scope="text, record, index">
          <a-select
            style="width: 100%"
            v-if="record.editable"
            :value="text"
            placeholder="绑定机器人"
            @change="e =>colChange(e, record.key, 'RobotName')"
          >
            <a-select-option v-for="item in RobotCodeArray" :key="item.Id" :value="item.code">
              {{item.code}}
            </a-select-option>
          </a-select>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <div class="editable-row-operations">
            <span v-if="record.editable">
              <a @click="() => save(record)">保存</a>
              <a @click="() => cancel(record.key)">取消</a>
            </span>
            <span v-else>
              <a @click="() => edit(record)">编辑</a>
              <a-popconfirm title="确定删除这条点位信息嘛" @confirm="() => deletePoint(record)">
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
            <a-form-item label="点位名称">
              <a-input placeholder="请输入点位名称"
                       v-decorator="['Name', { rules: [{ required: true, message: '你得填名称丫~' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="卡号">
              <a-input placeholder="请输入卡号"
                       v-decorator="['Code', { rules: [{ required: true, message: '你得填卡号丫~' }] }]"
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
          <a-col :span="12">
            <a-form-item label="绑定机器人">
              <a-select
                v-decorator="[
          'IsRobotId',
          { rules: [{ required: true, message: '你得选择机器人丫~' }] },
        ]"
                placeholder="请选择绑定机器人"
              >
                <a-select-option v-for="item in RobotCodeArray" :key="item.Id" :value="item.Id">
                  {{item.code}}
                </a-select-option>
              </a-select>
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
        name: "Point",
        data() {
            return {
                // tree
                treeValue: undefined,
                ParentId: 0,
                ParentName: '',
                treeData: [],
                // 表单
                form: this.$form.createForm(this, {name: 'Point'}),
                addForm: this.$form.createForm(this, {name: 'AddForm'}),
                PointName: '',
                // 表格
                columns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align:'center'
                    },
                    {
                        title: '点位名称',
                        dataIndex: 'Name',
                        scopedSlots: {customRender: 'Name'},
                        align:'center'
                    },
                    {
                        title: '卡号',
                        dataIndex: 'Code',
                        scopedSlots: {customRender: 'Code'},
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
                    }, {
                        title: '绑定机器人',
                        dataIndex: 'RobotName',
                        scopedSlots: {customRender: 'RobotName'},
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
                RobotCodeArray: [
                    {
                        Id: '',
                        code: ''
                    }
                ],
            }
        },
        methods: {
            GetPointList() { // 获取点位查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetPointList',
                    data: {
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                        id: '',
                        PointName: that.PointName,
                        Roomid: that.ParentId,
                        Floorid: '',
                        Buildingid: '',
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map((o, index) => {
                            return {
                                key: index,
                                Id: o.Id,
                                Name: o.Name,
                                Code: o.Code,
                                BuildingName: o.BuildingName,
                                FloorName: o.FloorName,
                                RoomName: o.RoomName,
                                RobotName: o.RobotName,
                                Remark: o.Remark
                            }
                        });
                    }else {
                        that.$router.push({name: 'Error', params: {error: '获取点位查询失败，请检查GetPointList接口'}})
                    }
                })
            },
            GetRobotCodeArray() { // 获取机器人编码查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetRobotCodeList'
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.RobotCodeArray = res.data.data.rows
                    }else {
                        that.$router.push({name: 'Error', params: {error: '获取机器人编码查询失败，请检查GetRobotCodeList接口'}})
                    }
                })
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.GetPointList()
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
                        const dataArray = res.data.data;
                        that.treeData = dataArray.map(o => {
                            return {
                                id: o.Id,
                                pId: o.pid,
                                value: o.Id,
                                title: o.name,
                            }
                        });
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
                        const dataArray = res.data.data;
                        dataArray.map(o => {
                            that.treeData = that.treeData.concat([
                                {
                                    id: o.Id,
                                    pId: o.pid,
                                    value: o.Id,
                                    title: o.name,
                                    isLeaf: o.cid == 2 ? true : false,
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
                // 保存点位信息
                let RobotName;
                that.RobotCodeArray.map(o => {
                    if(record.RobotName === o.code){
                        RobotName = o.Id
                    }
                });
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetPointSave',
                    data: {
                        Id: record.Id,
                        Name:record.Name,
                        RoomId: that.ParentId,
                        Remark: record.Remark,
                        Code: record.Code,
                        IsIndex: 0,
                        IsRobotId: RobotName,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        if (target) {
                            delete target.editable;
                            that.GetPointList()
                        }
                    }else {
                        that.$router.push({name: 'Error', params: {error: '保存点位信息失败，请检查GetPointSave接口'}})
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
            deletePoint(record) { // 删除点位信息
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetPointDelete',
                    data: {
                        Id: record.Id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.GetPointList()
                    }else {
                        that.$router.push({name: 'Error', params: {error: '删除点位信息失败，请检查GetPointDelete接口'}})
                    }
                })
            },
            add() { // 新增房间Modal
                this.addModal = true;
            },
            addOk(e) { // 新增点位信息
                const that = this;
                e.preventDefault();
                this.addForm.validateFields((err, values) => {
                    if (!err) {
                        that.$axios({
                            method: 'post',
                            url: 'http://192.168.30.100/api/RobotApi/GetPointSave',
                            data: {
                                Id: '',
                                Name:values.Name,
                                RoomId: that.ParentId,
                                Remark: values.Remark,
                                Code: values.Code,
                                IsIndex: 0,
                                IsRobotId: values.IsRobotId,
                            }
                        }).then((res) => {
                            if (res.data.code === 200) {
                                that.addModal = false;
                                that.$message.info('添加成功！')
                                that.GetPointList();
                                that.addForm.resetFields();
                            }else {
                                that.$router.push({name: 'Error', params: {error: '新增点位信息失败，请检查GetPointSave接口'}})
                            }
                        })
                    }
                });
            },
            addCancel() { // 新增房间Modal取消
                this.addModal = false;
            },
            treeName(value, label, extra) { // 存房间名，Modal里不可编辑input用
                this.ParentName = label[0]
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
            that.GetRobotCodeArray();
        },
        watch: {
            treeValue(value) { // 存房间Id
                this.ParentId = value
            },
        },
    }
</script>

<style scoped>

</style>
