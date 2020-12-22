<template>
  <div id="PlanLog">
    <a-card style="width: 100%">
      <a-form :form="form">
        <a-row type="flex" justify="start" :gutter="16">
          <a-col :span="4">
            <a-select
              name="robot"
              v-decorator="['robot',{ rules: [{ required: true, message: '请输入要查询的机器人编号!' }] }]"
              placeholder="请输入要查询的机器人编号"
              @change="RobotCodeSelect"
            >
              <a-select-option v-for="item in robotCodeArray" :key="item.Id" :value="item.Id">
                {{item.code}}
              </a-select-option>
            </a-select>

          </a-col>
          <a-col :span="3">
            <a-range-picker @change="dateRangePicker"/>
          </a-col>
          <a-col :span="8">
            <a-button type="primary" icon="search" @click="getDayLog(''),getPlanLog">
              查询
            </a-button>
            <a-button type="primary" @click="getDayLog(3)">
              近三天
            </a-button>
            <a-button type="primary" @click="getDayLog(7)">
              近一周
            </a-button>
            <a-button type="primary" @click="getDayLog(30)">
              近一月
            </a-button>
          </a-col>
        </a-row>
      </a-form>
      <a-table :columns="columns" :data-source="data"
               :pagination="pagination" @change="tableChange"
               style="margin: 1rem 0"
               bordered>
        <template slot="IsSure" slot-scope="text, record, index">
          <a-tag
            :color="record.IsSure === 1 ? 'green' : 'red'"
          >
            {{ record.IsSure === 1 ? '已接收' : '未接收' }}
          </a-tag>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
    import moment from "moment";
    import "moment/locale/zh-cn"

    export default {
        name: "PlanLog",
        data() {
            return {
                // 表单
                form: this.$form.createForm(this, {name: 'PlanLog'}),
                robotCodeArray: [
                    {
                        Id: 0,
                        code: ''
                    }
                ],
                robotCode: '',
                StartTime: '',
                EndTime: '',
                Day: '',
                // 表格
                columns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align: 'center'
                    },
                    {
                        title: '机器人编码',
                        dataIndex: 'RobotId',
                        align: 'center'
                    },
                    {
                        title: '下发时间',
                        dataIndex: 'LastTime',
                        align: 'center'
                    },
                    {
                        title: '是否确认',
                        dataIndex: 'IsSure',
                        scopedSlots: {customRender: 'IsSure'},
                        align: 'center'
                    }
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
            }
        },
        methods: {
            RobotCodeSelect(value) { // 选择机器人编码
                const that = this;
                that.robotCode = value
            },
            getRobotCodeArray() { // 获取机器人编码
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetRobotCodeList'
                }).then(res => {
                    if (res.status === 200) {
                        that.robotCodeArray = res.data.data.rows
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取机器人编码失败，请检查GetRobotCodeList接口'}})
                    }
                })
            },
            dateRangePicker(date, dateString) {
                const that = this;
                console.log(dateString);
                that.StartTime = dateString[0];
                that.EndTime = dateString[1];
            },
            getPlanLog() { // 获取计划下发日志
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetJHXFList',
                    data: {
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                        RobotName: that.robotCode,
                        StartTime: that.StartTime,
                        EndTime: that.EndTime,
                        Day: that.Day,
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map(o => {
                            return {
                                key: o.rowNum,
                                Id: o.Id,
                                IsSure: o.IsSure,
                                LastTime: that.formatTime(o.LastTime),
                                RobotId: o.RobotId,
                            }
                        });
                    }else {
                        that.$router.push({name: 'Error', params: {error: '获取计划下发日志失败，请检查GetJHXFList接口'}})
                    }
                })
            },
            getDayLog(day) { // 获取以天为节点的日志
                const that = this;
                that.Day = day;
                that.getPlanLog();
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.getPlanLog()
            },
            formatTime(time) { // 时间转换
                var d = time ? new Date(time) : new Date();
                var year = d.getFullYear();
                var month = d.getMonth() + 1;
                var day = d.getDate();
                var hours = d.getHours();
                var min = d.getMinutes();
                var seconds = d.getSeconds();

                if (month < 10) month = '0' + month;
                if (day < 10) day = '0' + day;
                if (hours < 0) hours = '0' + hours;
                if (min < 10) min = '0' + min;
                if (seconds < 10) seconds = '0' + seconds;

                return (year + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + seconds);
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
            that.getRobotCodeArray();
        }
    }
</script>

<style scoped>

</style>
