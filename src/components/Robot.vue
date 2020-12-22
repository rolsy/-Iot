<template>
  <div id="Robot">
    <a-card style="width: 100%">
      <a-form :form="form">
        <a-row type="flex" justify="start" :gutter="16">
          <a-col :span="3">
            <a-input placeholder="请输入要查询的机器人名称" v-model="RobotName"/>
          </a-col>
          <a-col :span="3">
            <a-select
              name="robot"
              v-decorator="['robot',{ rules: [{ required: true, message: '请选择要查询的机器人类型!' }] }]"
              placeholder="请选择要查询的机器人类型"
              @change="RobotTypeSelect"
            >
              <a-select-option v-for="item in RobotTypeArray" :key="item.Id" :value="item.Id">
                {{item.Name}}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" icon="search" @click="GetRobotList">
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
        <span slot="IsRestart" slot-scope="text, record, index">
         {{ record.IsRestart === 0 ? '否' : '是' }}
        </span>
        <template
          v-for="col in ['Code', 'Ip', 'Remark']"
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
        <template slot="TypeName" slot-scope="text, record, index">
          <a-select
            style="width: 100%"
            v-if="record.editable"
            :value="text"
            placeholder="选择机器人类型"
            @change="e =>colChange(e, record.key, 'TypeName')"
          >
            <a-select-option v-for="item in RobotTypeArray" :key="item.Id" :value="item.Name">
              {{item.Name}}
            </a-select-option>
          </a-select>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template slot="ServerIpPort" slot-scope="text, record, index">
          <a-select
            style="width: 100%"
            v-if="record.editable"
            :value="text"
            placeholder="选择服务器"
            @change="e =>colChange(e, record.key, 'ServerIpPort')"
          >
            <a-select-option v-for="item in ServerIpPortArray" :key="item.Id" :value="item.ServerIpPort">
              {{item.ServerIpPort}}
            </a-select-option>
          </a-select>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template slot="StatusName" slot-scope="text, record, index">
          <a-select
            style="width: 100%"
            v-if="record.editable"
            :value="text"
            placeholder="选择状态"
            @change="e =>colChange(e, record.key, 'StatusName')"
          >
            <a-select-option v-for="item in StatusArray" :key="item.Id" :value="item.Name">
              {{item.Name}}
            </a-select-option>
          </a-select>
          <template v-else>
            <a-tag
              :color="record.StatusName === '未启用' ? 'red' : 'green'"
            >
              {{ text }}
            </a-tag>
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
              <a-popconfirm title="确定删除这条机器人信息嘛" @confirm="() => deleteRobot(record)">
              <a>删除</a>
              </a-popconfirm>
              <a-popconfirm title="真的要重启嘛" @confirm="() => reStart(record)">
              <a>重启</a>
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
            <a-form-item label="机器人编码">
              <a-input placeholder="请输入机器人编码"
                       v-decorator="['Code', { rules: [{ required: true, message: '你得填机器人编码丫~' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="机器人类型">
              <a-select
                v-decorator="[
          'Type',
          { rules: [{ required: true, message: '你得选择机器人类型丫~' }] },
        ]"
                placeholder="请选择机器人类型"
              >
                <a-select-option v-for="item in RobotTypeArray" :key="item.Id" :value="item.Id">
                  {{item.Name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="服务器">
              <a-select
                v-decorator="[
          'ServerId',
          { rules: [{ required: true, message: '你得选择服务器丫~' }] },
        ]"
                placeholder="请选择服务器"
              >
                <a-select-option v-for="item in ServerIpPortArray" :key="item.Id" :value="item.Id">
                  {{item.ServerIpPort}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="IP">
              <a-input placeholder="请输入IP"
                       v-decorator="['Ip', { rules: [{ required: true, message: '你得填IP丫~' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="机器人状态">
              <a-select
                v-decorator="[
          'Status',
          { rules: [{ required: true, message: '你得选择机器人状态丫~' }] },
        ]"
                placeholder="请选择机器人状态"
              >
                <a-select-option v-for="item in StatusArray" :key="item.Id" :value="item.Id">
                  {{item.Name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注">
              <a-input placeholder="请输入备注"
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
        name: "Robot",
        data() {
            return {
                // 表单
                form: this.$form.createForm(this, {name: 'Robot'}),
                addForm: this.$form.createForm(this, {name: 'AddForm'}),
                RobotName: '',
                RobotTypeId: '',
                RobotTypeArray: [
                    {
                        Id: 0,
                        Name: ''
                    }
                ],
                ServerIpPortArray: [
                    {
                        Id: 0,
                        ServerIpPort: ''
                    }
                ],
                StatusArray: [
                    {
                        Id: 0,
                        Name: ''
                    }
                ],
                //表格
                columns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align:'center'
                    },
                    {
                        title: '机器人名称',
                        dataIndex: 'Code',
                        scopedSlots: {customRender: 'Code'},
                        align:'center'
                    },
                    {
                        title: '机器人类型',
                        dataIndex: 'TypeName',
                        scopedSlots: {customRender: 'TypeName'},
                        align:'center'
                    },
                    {
                        title: 'Ip',
                        dataIndex: 'Ip',
                        scopedSlots: {customRender: 'Ip'},
                        align:'center'
                    },
                    {
                        title: '服务器',
                        dataIndex: 'ServerIpPort',
                        scopedSlots: {customRender: 'ServerIpPort'},
                        align:'center'
                    },
                    {
                        title: '机器人状态',
                        dataIndex: 'StatusName',
                        scopedSlots: {customRender: 'StatusName'},
                        align:'center'
                    },
                    {
                        title: '是否重启',
                        dataIndex: 'IsRestart',
                        scopedSlots: {customRender: 'IsRestart'},
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
                //分页
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
            RobotTypeSelect(value) { // 选择机器人类型
                const that = this;
                that.RobotTypeId = value
            },
            getRobotTypeArray() { // 获取机器人类型下拉
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetRobotTypeList'
                }).then(res => {
                    if (res.status === 200) {
                        that.RobotTypeArray = res.data.data.rows
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取机器人类型下拉失败，请检查GetRobotTypeList接口'}})
                    }
                })
            },
            getServerIpPortArray() { // 获取服务器下拉
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetServerList'
                }).then(res => {
                    if (res.status === 200) {
                        that.ServerIpPortArray = res.data.data.rows
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取服务器下拉失败，请检查GetServerList接口'}})
                    }
                })
            },
            getStatusArray() { // 获取机器人状态下拉
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetStatusList'
                }).then(res => {
                    if (res.status === 200) {
                        that.StatusArray = res.data.data.rows
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取机器人状态下拉失败，请检查GetStatusList接口'}})
                    }
                })
            },
            GetRobotList() { // 获取机器人信息查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetJQRXXList',
                    data: {
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                        Id: '',
                        robotname: that.RobotName,
                        TypeId: that.RobotTypeId,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map((o, index) => {
                            return {
                                key: o.rowNum,
                                Id: o.Id,
                                Code: o.Code,
                                Ip: o.Ip,
                                ServerIpPort: o.ServerIpPort,
                                IsRestart: o.IsRestart, // 是否重启，1是0否
                                Remark: o.Remark, // 备注
                                StatusName: o.StatusName, // 机器人状态
                                TypeName: o.TypeName, // 机器人类型
                            }
                        });
                    }else {
                        that.$router.push({name: 'Error', params: {error: '获取机器人信息查询失败，请检查GetJQRXXList接口'}})
                    }
                })
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.GetRobotList()
            },
            reStart(record) { // 重启机器人
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetCq',
                    data: {
                        Id: record.Id,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.$message.info(res.data.info);
                    }else {
                        that.$router.push({name: 'Error', params: {error: '重启机器人失败，请检查GetCq接口'}})
                    }
                })
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
                // 保存机器人信息
                let StatusName;
                let TypeName;
                let ServerIpPort;
                that.StatusArray.map(o => {
                    if(record.StatusName === o.Name){
                        StatusName = o.Id
                    }
                });
                that.RobotTypeArray.map(o => {
                    if(record.TypeName === o.Name){
                        TypeName = o.Id
                    }
                });
                that.ServerIpPortArray.map(o => {
                    if(record.ServerIpPort === o.ServerIpPort){
                        ServerIpPort = o.Id
                    }
                });
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetJQRXXSave',
                    data: {
                        Id: record.Id,
                        IsRestart: record.IsRestart,
                        // Status: record.StatusName,
                        Status: StatusName,
                        Code: record.Code,
                        // Type: record.TypeName,
                        Type: TypeName,
                        Ip: record.Ip,
                        // ServerId: record.ServerIpPort,
                        ServerId: ServerIpPort,
                        Remark: record.Remark,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        if (target) {
                            delete target.editable;
                            that.GetRobotList()
                        }
                    }else {
                        that.$router.push({name: 'Error', params: {error: '保存机器人信息失败，请检查GetJQRXXSave接口'}})
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
            add() { // 新增机器人信息Modal
                this.addModal = true;
            },
            addOk(e) { // 新增机器人信息
                const that = this;
                e.preventDefault();
                this.addForm.validateFields((err, values) => {
                    if (!err) {
                        that.$axios({
                            method: 'post',
                            url: 'http://192.168.30.100/api/RobotApi/GetJQRXXSave',
                            data: {
                                Id: '',
                                IsRestart: '',
                                Code: values.Code,
                                Ip: values.Ip,
                                Remark: values.Remark,
                                ServerId: values.ServerId,
                                Status: values.Status,
                                Type: values.Type,
                            }
                        }).then((res) => {
                            if (res.data.code === 200) {
                                that.addModal = false;
                                that.$message.info('添加成功！');
                                that.GetRobotList();
                                that.addForm.resetFields();
                            }else {
                                that.$router.push({name: 'Error', params: {error: '新增机器人信息失败，请检查GetJQRXXSave接口'}})
                            }
                        })
                    }
                });
            },
            addCancel() { // 新增机器人信息Modal取消
                this.addModal = false;
            },
            deleteRobot(record) { // 删除机器人信息
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetJQRXXDelete',
                    data: {
                        Id: record.Id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.GetRobotList()
                    }else {
                        that.$router.push({name: 'Error', params: {error: '删除机器人信息失败，请检查GetJQRXXDelete接口'}})
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
                    that.$router.push({name: 'Error', params: {error: '权限校验失败，请检查token&key'}})
                })
            },
        },
        mounted() {
            const that = this;
            // that.checkToken(that.$route.query.token,that.$route.query.key);
            that.getRobotTypeArray();
            that.getServerIpPortArray();
            that.getStatusArray();
        }
    }
</script>

<style scoped>

</style>
