<template>
  <div id="Building">
    <a-card style="width: 100%">
      <a-form :form="form">
        <a-row type="flex" justify="start" :gutter="16">
          <a-col :span="3">
            <a-input placeholder="请输入要查询的楼宇名称" v-model="BuildingName"/>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" icon="search" @click="GetBuildingList">
              查询
            </a-button>
            <a-button type="primary" icon="plus" @click="add">
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
          v-for="col in ['Id', 'BuildingName', 'Remark']"
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
          <a @click="() => edit(record.key)">编辑</a>
              <a-popconfirm title="确定删除这条楼宇信息嘛" @confirm="() => deleteBuilding(record)">
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
            <a-form-item label="楼宇名称">
              <a-input placeholder="请输入楼宇名称"
                       v-decorator="['BuildingName', { rules: [{ required: true, message: '你得填名称丫~' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注">
              <a-input placeholder="请输入楼宇备注"
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
        name: "Building",
        data() {
            return {
                // 表单
                form: this.$form.createForm(this, {name: 'Building'}),
                addForm: this.$form.createForm(this, {name: 'AddForm'}),
                BuildingName: '',
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
            }
        },
        methods: {
            GetBuildingList() { // 获取楼宇查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetBuildingList',
                    data: {
                        Id: '',
                        Name: that.BuildingName,
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                    }
                }).then((res) => {
                    if(res.data.code === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map((o, index) => {
                            return {
                                key: index,
                                Id: o.Id,
                                BuildingName: o.BuildingName,
                                Remark: o.Remark
                            }
                        });
                    }else {
                        that.$router.push({name: 'Error', params: {error: '获取楼宇查询失败，请检查GetBuildingList接口'}})
                    }
                })
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.GetBuildingList()
            },
            colChange(value, key, column) { // 行编辑
                const newData = [...this.data];
                const target = newData.filter(item => key === item.key)[0];
                if (target) {
                    target[column] = value;
                    this.data = newData;
                }
            },
            edit(key) { // 表格编辑
                const newData = [...this.data];
                const target = newData.filter(item => key === item.key)[0];
                if (target) {
                    target.editable = true;
                    this.data = newData;
                }
            },
            save(record) { // 表格保存
                const that = this;
                const newData = [...this.data];
                const target = newData.filter(item => record.key === item.key)[0];
                // 保存楼宇信息
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetBuildingSave',
                    data: {
                        Id: record.Id,
                        BuildingName: record.BuildingName,
                        Remark: record.Remark,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        if (target) {
                            delete target.editable;
                            that.GetBuildingList()
                        }
                    }else {
                        that.$router.push({name: 'Error', params: {error: '保存楼宇信息失败，请检查GetBuildingSave接口'}})
                    }
                })
            },
            cancel(key) { // 表格取消
                const newData = [...this.data];
                const target = newData.filter(item => key === item.key)[0];
                if (target) {
                    delete target.editable;
                    this.data = newData;
                }
            },
            add() { // 新增楼宇弹出Modal
                this.addModal = true;
            },
            addOk(e) { // 新增楼宇信息
                const that = this;
                e.preventDefault();
                this.addForm.validateFields((err, values) => {
                    if (!err) {
                        that.$axios({
                            method: 'post',
                            url: 'http://192.168.30.100/api/RobotApi/GetBuildingSave',
                            data: {
                                Id: '',
                                BuildingName: values.BuildingName,
                                Remark: values.Remark,
                            }
                        }).then((res) => {
                            if (res.data.code === 200) {
                                that.addModal = false;
                                that.$message.info('添加成功！')
                                that.GetBuildingList();
                                that.addForm.resetFields();
                            }else {
                                that.$router.push({name: 'Error', params: {error: '新增楼宇信息失败，请检查GetBuildingSave接口'}})
                            }
                        })
                    }
                });
            },
            addCancel() { // 新增楼宇Modal取消
                this.addModal = false;
            },
            deleteBuilding(record) { // 删除楼宇信息
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetBuildingDelete',
                    data: {
                        Id: record.Id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.GetBuildingList()
                    }else {
                        that.$router.push({name: 'Error', params: {error: '删除楼宇信息失败，请检查GetBuildingDelete接口'}})
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
            // that.checkToken(that.$route.query.token,that.$route.query.key)
        },
    }
</script>

<style scoped>

</style>
