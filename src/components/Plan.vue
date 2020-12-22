<template>
  <div id="Plan">
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
          <a-col :span="2">
            <a-button type="primary" icon="search" @click="GetRobotList">
              查询
            </a-button>
<!--            <a-button type="primary" icon="plus" @click="add">-->
<!--              新增-->
<!--            </a-button>-->
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
        <span slot="StatusName" slot-scope="text, record, index">
          <a-tag
            :color="record.StatusName === '未启用' ? 'red' : 'green'"
          >
            {{ text }}
          </a-tag>
        </span>
        <template slot="CalendarName" slot-scope="text, record, index">
          <a-select
            style="width: 100%"
            v-if="record.editable"
            :value="text"
            placeholder="选择日历"
            @change="e =>colChange(e, record.key, 'CalendarName')"
          >
            <a-select-option v-for="item in CalendarArray" :key="item.Id" :value="item.Name">
              {{item.Name}}
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
              <a @click="() => editPlan(record)">任务</a>
            </span>
          </div>
        </template>
      </a-table>
    </a-card>

    <!--任务Modal-->
    <a-modal
      title="任务"
      :visible="planModal"
      :confirm-loading="planConfirmLoading"
      @ok="planOk"
      width="60%"
      @cancel="planCancel"
    >
      <a-row type="flex" justify="start" :gutter="16">
        <a-col :span="2">
          <a-button type="primary" icon="plus" @click="addPlan">
            新增
          </a-button>
        </a-col>
      </a-row>
      <a-table :columns="planColumns" :data-source="PlanData"
               :pagination="PlanPagination" @change="planTableChange"
               bordered
               style="marginTop:1rem"
      >
        <span slot="StopType" slot-scope="text, record, index">
         {{ record.StopType === '0' ? '否' : '是' }}
        </span>
        <span slot="MotorDirection" slot-scope="text, record, index">
         {{ record.MotorDirection === '1' ? '前进' : '停止' }}
        </span>
        <template slot="operation" slot-scope="text, record, index">
          <div class="editable-row-operations">
              <span>
              <a-popconfirm title="确定删除这条任务信息嘛" @confirm="() => deletePlan(record)">
              <a>删除</a>
              </a-popconfirm>
            </span>
          </div>
        </template>
      </a-table>
    </a-modal>

    <!--新增任务Modal-->
    <a-modal
      title="新增"
      :visible="addPlanModal"
      :confirm-loading="addPlanConfirmLoading"
      @ok="addPlanOk"
      width="50%"
      @cancel="addPlanCancel"
    >
      <a-form :form="addPlanForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }" @submit="addPlanOk">
        <a-row type="flex" justify="start">
          <a-col :span="12">
            <a-form-item label="是否停止">
              <a-select
                v-decorator="[
          'StopType',
          { rules: [{ required: true, message: '你需要选择是否停止' }]},
        ]"
                placeholder="请选择是否停止"
              >
                <a-select-option value="1">
                  是
                </a-select-option>
                <a-select-option value="0">
                  否
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="停止时间">
              <a-time-picker format="HH:mm"
                             v-decorator="['StopTime', { rules: [{ required: true, message: '你需要填停止时间' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="电机转速">
              <a-input placeholder="请输入电机转速"
                       v-decorator="['MotorSpeed', { rules: [{ required: true, message: '你需要填电机转速' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="云台">
              <a-input placeholder="请输入云台"
                       v-decorator="['PTZ', { rules: [{ required: true, message: '你需要填云台' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="点位">
              <a-auto-complete
                placeholder="请输入点位"
                v-decorator="['PointName', { rules: [{ required: true, message: '你需要填点位' }] }]"
                :filter-option="filterOption"
              >
                <template slot="dataSource">
                  <a-select-option v-for="item in dataSource" :key="item.Id" :value="item.Id">
                    {{item.Name}}
                  </a-select-option>
                </template>
              </a-auto-complete>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注">
              <a-input placeholder="请输入备注"
                       v-decorator="['Remark', { rules: [{ required: true, message: '你需要填备注' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-table :columns="TestItemNamesColumns" :data-source="TestItemNamesData" :row-selection="rowSelection"
                       :pagination="TestItemNamesPagination" @change="TestItemNamesTableChange"/>
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
        name: "Plan",
        data() {
            return {
                // 表单
                form: this.$form.createForm(this, {name: 'Plan'}),
                addPlanForm: this.$form.createForm(this, {name: 'addPlanForm'}),
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
                CalendarArray: [
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
                        align: 'center'
                    },
                    {
                        title: '机器人名称',
                        dataIndex: 'Code',
                        scopedSlots: {customRender: 'Code'},
                        align: 'center'
                    },
                    {
                        title: '机器人类型',
                        dataIndex: 'TypeName',
                        scopedSlots: {customRender: 'TypeName'},
                        align: 'center'
                    },
                    {
                        title: 'Ip',
                        dataIndex: 'Ip',
                        scopedSlots: {customRender: 'Ip'},
                        align: 'center'
                    },
                    {
                        title: '服务器',
                        dataIndex: 'ServerIpPort',
                        scopedSlots: {customRender: 'ServerIpPort'},
                        align: 'center'
                    },
                    {
                        title: '机器人状态',
                        dataIndex: 'StatusName',
                        scopedSlots: {customRender: 'StatusName'},
                        align: 'center'
                    },
                    {
                        title: '是否重启',
                        dataIndex: 'IsRestart',
                        scopedSlots: {customRender: 'IsRestart'},
                        align: 'center'
                    },
                    {
                        title: '日历',
                        dataIndex: 'CalendarName',
                        scopedSlots: {customRender: 'CalendarName'},
                        align: 'center'
                    },
                    {
                        title: '备注',
                        dataIndex: 'Remark',
                        scopedSlots: {customRender: 'Remark'},
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
                planColumns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align: 'center'
                    },
                    {
                        title: '巡检点',
                        dataIndex: 'PointName',
                        align: 'center'
                    },
                    {
                        title: '检测项',
                        dataIndex: 'TestItemNames',
                        align: 'center'
                    },
                    {
                        title: '是否停止',
                        dataIndex: 'StopType',
                        scopedSlots: {customRender: 'StopType'},
                        align: 'center'
                    },
                    {
                        title: '停止时间',
                        dataIndex: 'StopTime',
                        align: 'center'
                    },
                    {
                        title: '电机转速',
                        dataIndex: 'MotorSpeed',
                        align: 'center'
                    },
                    {
                        title: '电机方向',
                        dataIndex: 'MotorDirection',
                        scopedSlots: {customRender: 'MotorDirection'},
                        align: 'center'
                    },
                    {
                        title: '云台',
                        dataIndex: 'PTZ',
                        align: 'center'
                    },
                    {
                        title: '备注',
                        dataIndex: 'Remark',
                        align: 'center'
                    },
                    {
                        title: '操作',
                        dataIndex: 'operation',
                        scopedSlots: {customRender: 'operation'},
                        align: 'center'
                    },
                ],
                PlanData: [],
                // 检测项
                TestItemNamesColumns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align: 'center'
                    },
                    {
                        title: '名称',
                        dataIndex: 'Name',
                        align: 'center'
                    }
                ],
                TestItemNamesData: [],
                TestItemNamesPagination: {
                    total: 0,
                    defaultPageSize: 10,
                    showTotal: total => `共 ${total} 条`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30'],
                    onShowSizeChange: (current, pageSize) => this.TestItemNamesPageSize = pageSize
                },
                TestItemNamesPageSize: 10,
                TestItemNamesCurrentPage: 1,
                TestItemNames: '',
                rowSelection:{
                    onSelect: this.onSelect
                },
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
                PlanPagination: {
                    total: 0,
                    defaultPageSize: 10,
                    showTotal: total => `共 ${total} 条`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30'],
                    onShowSizeChange: (current, pageSize) => this.PlanPageSize = pageSize
                },
                PlanPageSize: 10,
                PlanCurrentPage: 1,
                //任务Modal
                planModal: false,
                planConfirmLoading: false,
                // 哪条数据打开的任务Modal,机器人Id
                Rid: 0,
                // 任务的Id
                PlanId: '',
                //新增，编辑任务Modal
                addPlanModal: false,
                addPlanConfirmLoading: false,
                // 机器人类型Id
                TypeIdid: 0,
                // 自动完成
                dataSource: [],
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
            getCalendarArray() { // 获取日历下拉
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/Calendar'
                }).then(res => {
                    if (res.status === 200) {
                        that.CalendarArray = res.data.data.rows
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取日历下拉失败，请检查Calendar接口'}})
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
                                CalendarName: o.CalendarName, // 机器人类型
                            }
                        });
                    } else {
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
            planTableChange(e) { // 任务分页变化
                const that = this;
                that.PlanPageSize = e.pageSize;
                that.PlanCurrentPage = e.current;
                that.GetPlanList(that.Rid)
            },
            TestItemNamesTableChange(e) { // 检测项分页变化
                const that = this;
                that.TestItemNamesPageSize = e.pageSize;
                that.TestItemNamesCurrentPage = e.current;
                this.GetTestItemNamesList()
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
                let Calendar;
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
                that.CalendarArray.map(o => {
                    if(record.CalendarName === o.Name){
                        Calendar = o.Id
                    }
                });
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetJQRXXSave',
                    data: {
                        Id: record.Id,
                        IsRestart: record.IsRestart,
                        Status: StatusName,
                        Code: record.Code,
                        Type: TypeName,
                        Ip: record.Ip,
                        ServerId: ServerIpPort,
                        Remark: record.Remark,
                        CalendarId: Calendar,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        if (target) {
                            delete target.editable;
                            that.GetRobotList()
                        }
                    } else {
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
            editPlan(record) {
                const that = this;
                that.RobotTypeArray.map(o => {
                    if (record.TypeName === o.Name) {
                        that.TypeIdid = o.Id
                    }
                });
                that.planModal = true;
                that.Rid = record.Id;
                that.GetPlanList(that.Rid)
            },
            planOk(e) {
                this.planModal = false;
            },
            planCancel() {
                this.planModal = false;
            },
            GetPlanList(id) { // 获取任务查询
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetInspectionPlanList',
                    data: {
                        rows: that.PlanPageSize,
                        page: that.PlanCurrentPage,
                        sord: 'desc',
                        Rid: id,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.PlanPagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.PlanData = dataArray.map((o, index) => {
                            return {
                                key: o.Id,
                                Id: o.Id,
                                PointName: o.PointName, // 点位名称
                                TestItemNames: o.TestItemNames, // 检测项
                                StopType: o.StopType, // 是否停止0否1是
                                StopTime: o.StopTime, // 停止时间
                                MotorSpeed: o.MotorSpeed, // 电机转速
                                MotorDirection: o.MotorDirection, // 转动方向，1前进
                                PTZ: o.PTZ, // 云台
                                Remark: o.Remark, // 备注
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取机器人信息查询失败，请检查GetJQRXXList接口'}})
                    }
                })
            },
            deletePlan(record) {
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetInspectionPlanDelete',
                    data: {
                        Id: record.Id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.GetPlanList(that.Rid)
                    }else {
                        that.$router.push({name: 'Error', params: {error: '删除任务失败，请检查GetInspectionPlanDelete接口'}})
                    }
                })
            },
            addPlan() { // 新增任务Modal
                // 这里初始化数据
                this.PlanId = '';
                this.addPlanModal = true;
                this.GetTestItemNamesList()
                this.GetDataSource()
            },
            GetTestItemNamesList() { // 获取检测项
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetTypeList',
                    data: {
                        rows: that.TestItemNamesPageSize,
                        page: that.TestItemNamesCurrentPage,
                        sord: 'desc',
                        TypeIdid: that.TypeIdid,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.TestItemNamesPagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.TestItemNamesData = dataArray.map((o, index) => {
                            return {
                                key: o.rowNum,
                                Id: o.Id,
                                Name: o.Name
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取检测项失败，请检查GetTypeList接口'}})
                    }
                })
            },
            onSelect(record, selected, selectedRows) { // 检测项
                const that = this;
                let a = [];
                selectedRows.forEach(function(i){
                    a.push(i.Id);
                    that.TestItemNames = a.toString()
                })
            },
            addPlanOk(e) { // 新增编辑任务信息
                const that = this;
                e.preventDefault();
                that.addPlanForm.validateFields((err, values) => {
                    if (!err) {
                        that.$axios({
                            method: 'post',
                            url: 'http://192.168.30.100/api/RobotApi/GetInspectionPlanSave',
                            data: {
                                Id: that.PlanId,
                                RPId: that.Rid,
                                PointId: values.PointName,
                                TestItemIds: that.TestItemNames,
                                Remark: values.Remark,
                                StopTime: values.StopTime.format('HH:mm'),
                                StopType: values.StopType,
                                MotorSpeed: values.MotorSpeed,
                                PTZ: values.PTZ,
                            }
                        }).then((res) => {
                            if (res.data.code === 200) {
                                that.addPlanModal = false;
                                that.GetPlanList(that.Rid);
                                that.addPlanForm.resetFields();

                            } else {
                                that.$router.push({
                                    name: 'Error',
                                    params: {error: '新增编辑任务信息失败，请检查GetInspectionPlanSave接口'}
                                })
                            }
                        })
                    }
                });
            },
            addPlanCancel() { // 新增任务Modal取消
                this.addPlanModal = false;
            },
            filterOption(input, option) {
                return (
                    option.componentOptions.children[0].text.indexOf(input)>=0
                );
            },
            GetDataSource() { // 获取点位自动完成的数据源
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetAllPointList',
                    data: {
                        RoomId: '',
                        RobotId: that.Rid,
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
            that.getRobotTypeArray();
            that.getServerIpPortArray();
            that.getStatusArray();
            that.getCalendarArray();
        },
        created() {
        },
        computed: {
            resData() {
                return this.$store.state.token
            }
        }
    }
</script>

<style scoped>

</style>
