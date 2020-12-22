<template>
  <div id="Calendar">
    <a-card style="width: 100%">
      <a-form :form="form">
        <a-row type="flex" justify="start" :gutter="16">
          <a-col :span="3">
            <a-input placeholder="请输入要查询的日历" v-model="CalendarName"/>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" icon="search" @click="getCalendar">
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
               style="margin: 1rem 0"
      >
        <template
          v-for="col in ['Remark']"
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
            <span>
              <a @click="() => addCalendar(record)">编辑</a>
              <a-popconfirm title="确定删除这条信息嘛" @confirm="() => deleteCalendar(record)">
                <a>删除</a>
              </a-popconfirm>
            </span>
          </div>
        </template>
      </a-table>
    </a-card>
    <!--新增Modal-->
    <a-modal
      title="新增日历"
      :visible="addModal"
      :confirm-loading="addConfirmLoading"
      @ok="addOk"
      width="60%"
      @cancel="addCancel"
    >
      <a-row type="flex" justify="start" :gutter="2">
        <a-col :span="12">
          <a-form-item label="日历名称">
            <a-input placeholder="请输入日历名称" v-model="addCalendarName"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="备注">
            <a-input placeholder="请输入备注" v-model="addCalendarRemark"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-modal>

    <!--新增日历Modal-->
    <a-modal
      title="新增日历"
      :visible="addCalendarModal"
      :confirm-loading="addCalendarConfirmLoading"
      @ok="addCalendarOk"
      width="60%"
      @cancel="addCalendarCancel"
    >
      <a-row type="flex" justify="start" :gutter="2">
        <a-col :span="15">
          <a-calendar @select="selectedDate">
            <div slot="dateCellRender" slot-scope="value">
              <div v-for="item in getListData(value)" :key="item.id" style="text-align: left;color: #303133">
                <a-popconfirm placement="rightBottom" title="确定删除这条信息嘛" @confirm="delCalendarTime(item.id)">
                  <i class="iconfont">&#xe6b7;</i>
                </a-popconfirm>
                <span>{{item.time}}</span>
              </div>
            </div>
          </a-calendar>
        </a-col>
        <a-col :span="9" style="text-align:center;overflow-y: auto;" id="rightTime">
          <a-time-picker @change="timePicker" :open="timeOpen" @openChange="timeChange" format="HH:mm"
                         style="width: 80%;">
            <a-button slot="addon" size="small" type="primary" @click="timeClose">
              添加时间
            </a-button>
          </a-time-picker>
          <a-range-picker @change="dateRangePicker" style="width: 80%;margin-bottom: .2rem;margin-top: .2rem"/>
          <a-button type="primary" style="width: 80%;" @click="BatchAdd">
            批量添加
          </a-button>

          <a-table :columns="TimesColumns" :data-source="TimesData" :row-selection="rowSelection"
                   :pagination="TimesPagination" @change="TimesTableChange"
                   style="margin: .5rem 1rem">

            <template slot="operation" slot-scope="text, record, index">
              <div class="editable-row-operations">
                <span>
                  <a @click="() => addTime(record.Time)">添加</a>
                  <a @click="() => delTime(record.Id)">删除</a>
                </span>
              </div>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script>
    import "moment/locale/zh-cn"

    export default {
        name: "Calendar",
        data() {
            return {
                // 表单
                form: this.$form.createForm(this, {name: 'Calendar'}),
                CalendarName: '',
                addCalendarName: '',
                addCalendarRemark: '',
                columns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align: 'center'
                    },
                    {
                        title: '日历名称',
                        dataIndex: 'Name',
                        width: 200,
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
                data: [],
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
                //新增Modal
                addModal: false,
                addConfirmLoading: false,
                //新增日历Modal
                addCalendarModal: false,
                addCalendarConfirmLoading: false,
                // 时间
                selectDate: '',
                time: '',
                timeArray: [],
                timeOpen: false,
                // 日历数据
                CalendarDateTimeList: [
                    {
                        CalendarListId: 0,
                        Date: '2020-04-01',
                        Id: 0,
                        Time: '00:00:00',
                    }
                ],
                CalendarListId: 0,
                // 时间
                TimesColumns: [
                    {
                        title: '时间',
                        dataIndex: 'Time',
                        align: 'center'
                    },
                    {
                        title: '操作',
                        dataIndex: 'operation',
                        scopedSlots: {customRender: 'operation'},
                        align: 'center'
                    }
                ],
                TimesData: [],
                rowSelection: {
                    onChange: this.onChange,
                },
                TimesPagination: {
                    total: 0,
                    defaultPageSize: 10,
                    showTotal: total => `共 ${total} 条`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30'],
                    onShowSizeChange: (current, pageSize) => this.TimesPageSize = pageSize
                },
                TimesPageSize: 10,
                TimesCurrentPage: 1,
                Times: '',
                StartTime: '',
                EndTime: '',
            }
        },
        methods: {
            getCalendar() { // 获取日历
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetCalendarList',
                    data: {
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                        Name: that.CalendarName
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map(o => {
                            return {
                                key: o.rowNum,
                                Id: o.Id,
                                Name: o.Name,
                                Remark: o.Remark,
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取日历失败，请检查GetCalendarList接口'}})
                    }
                })
            },
            // 新增日历
            add() {
                this.addModal = true;
            },
            addOk() { // 添加日历 + 添加日历及时间
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetCalendarSave',
                    data: {
                        Id: '',
                        Name: that.addCalendarName,
                        Remark: that.addCalendarRemark
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.addModal = false;
                        that.$message.info('添加成功！');
                        that.getCalendar();
                        that.addCalendarName = '';
                        that.addCalendarRemark = '';
                    } else {
                        that.$router.push({name: 'Error', params: {error: '添加日历失败，请检查GetCalendarSave接口'}})
                    }
                })
            },
            addCancel() {
                this.addModal = false;
            },
            // 新增日历
            addCalendar(record) {
                const that = this;
                that.addCalendarModal = true;
                that.CalendarListId = record.Id;
                that.getTimeList();
                that.GetCalendarDateTimeList(record.Id);
                // 异步计算右边添加时间栅格的高度，添加滚动条高度
                setTimeout(function () {
                    const calendarHeight = document.getElementsByClassName('ant-fullcalendar-fullscreen');
                    const rightTime = document.getElementById('rightTime');
                    rightTime.style.cssText += 'height:' + calendarHeight[0].clientHeight + 'px';
                }, 1)
            },
            addCalendarOk() {
                this.addCalendarModal = false;
                this.CalendarListId = 0
            },
            addCalendarCancel() {
                this.addCalendarModal = false;
                this.CalendarListId = 0
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.getCalendar()
            },
            GetCalendarDateTimeList(id) { // 查询日历数据
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetCalendarDateTimeList',
                    data: {
                        Id: id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.CalendarDateTimeList = res.data.data;
                    } else {
                        that.$router.push({name: 'Error', params: {error: '查询日历数据失败，请检查GetCalendarDateTimeList接口'}})
                    }
                })
            },
            // 日历
            selectedDate(date) {
                this.selectDate = '';
                this.selectDate = date.format('YYYY-MM-DD');
            },
            getListData(value) {
                const that = this;
                that.CalendarValue = value;
                let listData = [];
                that.CalendarDateTimeList.map(o => {
                    if (o.Date === value.format('YYYY-MM-DD')) {
                        listData.push({
                            time: o.Time,
                            id: o.Id
                        });
                    }
                });
                return listData
            },
            // 生成时间
            timePicker(time, timeString) {
                this.time = timeString
            },
            timeChange(open) {
                this.timeOpen = open;
            },
            timeClose() { // 添加时间
                const that = this;
                that.timeOpen = false;
                if (that.time !== '') {
                    that.$axios({
                        method: 'post',
                        url: 'http://192.168.30.100/api/RobotApi/GetTimeSave',
                        data: {
                            Id: '',
                            Time: that.time,
                        }
                    }).then((res) => {
                        if (res.data.code === 200) {
                            console.log(res)
                            that.getTimeList();
                        } else {
                            that.$router.push({name: 'Error', params: {error: '添加时间失败，请检查GetTimeSave接口'}})
                        }
                    })
                }
            },
            getTimeList() { // 获取时间列表
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetTimeList'
                }).then((res) => {
                    if (res.data.code === 200) {
                        console.log('时间列表', res);
                        that.TimesPagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.TimesData = dataArray.map(o => {
                            return {
                                key: o.rowNum,
                                Id: o.Id,
                                Time: o.Time
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取时间列表失败，请检查GetTimeList接口'}})
                    }
                })
            },
            addTime(time) { // 添加日历
                if (this.selectDate !== '') {
                    const that = this;
                    that.$axios({
                        method: 'post',
                        url: 'http://192.168.30.100/api/RobotApi/GetCalendarDateTimeSave',
                        data: {
                            Date: that.selectDate,
                            Time: time,
                            CalendarListId: that.CalendarListId
                        }
                    }).then((res) => {
                        if (res.data.code === 200) {
                            that.GetCalendarDateTimeList(that.CalendarListId);
                        } else {
                            that.$router.push({name: 'Error', params: {error: '添加日历失败，请检查GetCalendarDateTimeSave接口'}})
                        }
                    })
                }
            },
            delCalendarTime(id) { // 删除日历中的某一时间
                console.log('删除Id', id)
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetCalendarDateTimeDelete',
                    data: {
                        Id: id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.$message.info('删除成功！')
                        that.GetCalendarDateTimeList(that.CalendarListId);
                    } else {
                        that.$router.push({name: 'Error', params: {error: '删除日历时间失败，请检查GetCalendarDateTimeDelete接口'}})
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
            edit(key) { // 编辑
                const newData = [...this.data];
                const target = newData.filter(item => key === item.key)[0];
                if (target) {
                    target.editable = true;
                    this.data = newData;
                }
            },
            save(record) { // 保存
                const that = this;
                const newData = [...this.data];
                const target = newData.filter(item => record.key === item.key)[0];
                // 保存楼层信息
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetFloorSave',
                    data: {
                        Id: record.Id,
                        BuildingId: that.ParentId,
                        FloorName: record.FloorName,
                        Remark: record.Remark,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        if (target) {
                            delete target.editable;
                            that.GetFloorList()
                        }
                    } else {
                        that.$router.push({name: 'Error', params: {error: '保存楼层信息失败，请检查GetFloorSave接口'}})
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
            deleteCalendar(record) { // 删除日历信息
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetCalendarDelete',
                    data: {
                        Id: record.Id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.$message.info('删除成功！')
                        that.getCalendar()
                    } else {
                        that.$router.push({name: 'Error', params: {error: '删除日历信息失败，GetCalendarDelete接口'}})
                    }
                })
            },
            delTime(id) { // 删除时间
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetTimeDelete',
                    data: {
                        Id: id
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.$message.info('删除成功！')
                        that.getTimeList()
                    } else {
                        that.$router.push({name: 'Error', params: {error: '删除时间失败，请检查GetTimeDelete接口'}})
                    }
                })
            },
            onChange(selectedRowKeys, selectedRows){
                const that = this;
                that.Times = '';
                let a = [];
                selectedRows.forEach(function (i) {
                    a.push(i.Time);
                    that.Times = a.toString()
                });
                console.log(that.Times)
            },
            TimesTableChange(e) { // 时间列表分页变化
                const that = this;
                that.TimesPageSize = e.pageSize;
                that.TimesCurrentPage = e.current;
                that.getTimeList()
            },
            dateRangePicker(date, dateString) {
                const that = this;
                that.StartTime = dateString[0];
                that.EndTime = dateString[1];
            },
            BatchAdd() { // 批量添加时间
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetCalendarSaveBatch',
                    data: {
                        StartTime: that.StartTime,
                        EndTime: that.EndTime,
                        Times: that.Times,
                        CalendarListId: that.CalendarListId,
                    }
                }).then((res) => {
                    if (res.data.code === 200) {
                        that.GetCalendarDateTimeList(that.CalendarListId);
                    } else {
                        that.$router.push({name: 'Error', params: {error: '批量添加时间失败，请检查GetCalendarSaveBatch接口'}})
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
            // that.checkToken(that.$route.query.token,that.$route.query.key)
        },
    }
</script>

<style scoped>
  @font-face {
    font-family: 'iconfont';
    src: url('../../static/font/font_2248817_n0397fqoasf.eot');
    src: url('../../static/font/font_2248817_n0397fqoasf.eot?#iefix') format('embedded-opentype'),
    url('../../static/font/font_2248817_n0397fqoasf.woff2') format('woff2'),
    url('../../static/font/font_2248817_n0397fqoasf.woff') format('woff'),
    url('../../static/font/font_2248817_n0397fqoasf.ttf') format('truetype'),
    url('../../static/font/font_2248817_n0397fqoasf.svg#iconfont') format('svg');
  }

  .iconfont {
    font-family: "iconfont" !important;
    font-size: 0.6rem;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: 0.2px;
    -moz-osx-font-smoothing: grayscale;
    color: #00b566;
  }
</style>
