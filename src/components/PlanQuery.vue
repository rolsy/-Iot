<template>
  <div id="PlanQuery">
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
            <a-date-picker name="date" v-decorator="['date',{ rules: [{ required: true, message: '请输入要查询的日期!' }] }]"
                           placeholder="请输入要查询的日期" @change="datePicker"/>
          </a-col>
          <a-col :span="2">
            <a-button type="primary" icon="search" @click="getPlan">
              查询
            </a-button>
          </a-col>
        </a-row>
      </a-form>
      <a-table :columns="columns" :data-source="data"
               :pagination="pagination" @change="tableChange"
               style="margin: 1rem 0"
               bordered>
      </a-table>
    </a-card>
  </div>
</template>

<script>
    import moment from "moment";
    import "moment/locale/zh-cn"

    export default {
        name: "PlanQuery",
        data() {
            return {
                form: this.$form.createForm(this, {name: 'PlanQuery'}),
                robotCodeArray: [
                    {
                        Id: 0,
                        code: ''
                    }
                ],
                robotCode: '',
                dateString: '',
                columns: [
                    {
                        title: '序号',
                        dataIndex: 'Id',
                        align:'center'
                    },
                    {
                        title: '机器人名称',
                        dataIndex: 'Code',
                        align:'center'
                    },
                    {
                        title: '日期',
                        dataIndex: 'Date',
                        align:'center'
                    },
                    {
                        title: '时间',
                        dataIndex: 'Time',
                        align:'center'
                    },
                    {
                        title: '星期',
                        dataIndex: 'Week',
                        align:'center'
                    },
                    {
                        title: '楼宇',
                        dataIndex: 'BuildingName',
                        align:'center'
                    },
                    {
                        title: '楼层',
                        dataIndex: 'FloorName',
                        align:'center'
                    },
                    {
                        title: '房间',
                        dataIndex: 'RoomName',
                        align:'center'
                    },
                    {
                        title: '点位',
                        dataIndex: 'Name',
                        align:'center'
                    }
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

            }
        },
        methods: {
            RobotCodeSelect(value) { // 选择机器人编码
                const that = this;
                that.robotCode = value
            },
            datePicker(date, dateString) { // 选择日期
                const that = this;
                that.dateString = dateString
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
            getPlan() { // 获取巡检计划
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetXJJHList',
                    data: {
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                        date: that.dateString,
                        robotcode: that.robotCode
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map(o => {
                            return {
                                key: o.rowNum,
                                Id: o.Id,
                                Code: o.Code,
                                Date: o.Date,
                                Time: o.Time,
                                Week: o.Week,
                                BuildingName: o.BuildingName,
                                FloorName: o.FloorName,
                                RoomName: o.RoomName,
                                Name: o.Name,
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取巡检计划失败，请检查GetXJJHList接口'}})
                    }
                })
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.getPlan()
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
