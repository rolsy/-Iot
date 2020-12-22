<template>
  <div id="Result">
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
            <a-input placeholder="请输入要查询的巡检点名称" v-model="PointName"/>
          </a-col>
          <a-col :span="2">
            <a-button type="primary" icon="search" @click="getResult">
              查询
            </a-button>
          </a-col>
        </a-row>
      </a-form>
      <a-table :columns="columns" :data-source="data"
               :pagination="pagination" @change="tableChange"
               bordered
               style="margin: 1rem 0"
      >
        <template slot="IsAbnormal" slot-scope="text, record, index">
          <a-tag
            :color="record.IsAbnormal === 0 ? 'green' : 'red'"
          >
            {{ record.IsAbnormal === 0 ? '正常' : '异常' }}
          </a-tag>
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a-button type="link" @click="getIMG(record)">
            查看图片
          </a-button>
        </template>
      </a-table>
    </a-card>
    <a-spin :spinning="spinning" tip="努力加载中(￣▽￣)" style="position: fixed;top: 50%;left: 50%;z-index: 99999;">
    </a-spin>
  </div>
</template>

<script>
    import moment from "moment";
    import "moment/locale/zh-cn"

    export default {
        name: "Result",
        data() {
            return {
                form: this.$form.createForm(this, {name: 'Result'}),
                robotCodeArray: [
                    {
                        Id: 0,
                        code: ''
                    }
                ],
                robotCode: '',
                dateString: '2020-04-01', // 和我家亲爱的相遇的日子
                columns: [
                    {
                        title: '机器人编号',
                        dataIndex: 'RobotCode',
                        align: 'center'
                    },
                    {
                        title: '巡检点名称',
                        dataIndex: 'PointName',
                        align: 'center'
                    },
                    {
                        title: '创建时间',
                        dataIndex: 'CreateTime',
                        align: 'center'
                    },
                    {
                        title: '检测项',
                        dataIndex: 'TestItemName',
                        align: 'center'
                    },
                    {
                        title: '检测值',
                        dataIndex: 'ItemValue',
                        align: 'center'
                    },
                    {
                        title: '单位',
                        dataIndex: 'Unit',
                        align: 'center'
                    },
                    {
                        title: '是否异常',
                        dataIndex: 'IsAbnormal',
                        scopedSlots: {customRender: 'IsAbnormal'},
                        align: 'center'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        scopedSlots: {customRender: 'action'},
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
                PointName: '',
                //加载中
                spinning: false

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
            getResult() { // 获取巡检结果
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetXJJGList',
                    data: {
                        rows: that.pageSize,
                        page: that.currentPage,
                        sord: 'desc',
                        pointname: that.PointName,
                        robotcode: that.robotCode
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        that.pagination.total = res.data.data.records;
                        const dataArray = res.data.data.data;
                        that.data = dataArray.map(o => {
                            return {
                                key: o.rowNum,
                                RobotCode: o.RobotCode,
                                PointName: o.PointName,
                                CreateTime: o.CreateTime,
                                TestItemName: o.TestItemName,
                                ItemValue: o.ItemValue,
                                Unit: o.Unit,
                                Id: o.Id,
                                IsAbnormal: o.IsAbnormal,
                            }
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '获取巡检结果失败，请检查GetXJJGList接口'}})
                    }
                })
            },
            getIMG(record) { // 查看图片
                const that = this;
                const h = that.$createElement;
                that.spinning = !that.spinning;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/GetXJJGImg',
                    data: {
                        Id: record.Id,
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        that.spinning = !that.spinning;
                        that.$info({
                            title: '查看图片',
                            content: h('img',
                                {
                                    style: {
                                        width: '90%'
                                    },
                                    attrs: {
                                        src: 'data:image/bmp;base64,' + res.data.data.data[0].Image,
                                    }
                                }
                            ),
                            dangerouslyUseHTMLString: true,
                            onOk() {
                            },
                        });
                    } else {
                        that.$router.push({name: 'Error', params: {error: '查看图片失败，请检查GetXJJGImg接口'}})
                    }
                })
            },
            tableChange(e) { // 分页变化
                const that = this;
                that.pageSize = e.pageSize;
                that.currentPage = e.current;
                that.getResult()
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
