<template>
  <div id="Index">
    <a-card title="前创机器人" style="width: 100%">
      <a-button type="link" @click="toPlan">
        巡检计划
      </a-button>
      <a-button type="link" @click="toCalendar">
        日历
      </a-button>
      <a-button type="link" @click="toPlanQuery">
        计划查询
      </a-button>
      <a-button type="link" @click="toResult">
        巡检结果
      </a-button>
      <a-button type="link" @click="toPlanLog">
        计划下发
      </a-button>
      <a-button type="link" @click="toRobot">
        机器人信息
      </a-button>
      <a-button type="link" @click="toBuilding">
        楼宇管理
      </a-button>
      <a-button type="link" @click="toFloor">
        楼层管理
      </a-button>
      <a-button type="link" @click="toRoom">
        房间管理
      </a-button>
      <a-button type="link" @click="toPoint">
        点位管理
      </a-button>
      <a-button type="link" @click="toPermission">
        点位授权
      </a-button>
    </a-card>


    测试用:
    <br>
    <br>
    <a-input placeholder="用户" v-model="T_Account"/>
    <br>
    <br>
    <a-input placeholder="密码" v-model="T_Password"/>
    <br>
    <br>
    <a-input placeholder="key" v-model="T_Key"/>
    <br>
    <br>
    <a-button @click="Test">
      登录
    </a-button>
    <br>
    <br>
    token={{T_Token}}&
    key={{T_Key}}
  </div>
</template>

<script>
    export default {
        name: 'Index',
        data() {
            return {
                T_Account: '',
                T_Password: '',
                T_Key: '',
                T_Token: '',
            }
        },
        methods: {
            toPlanQuery() {
                this.$router.push({name: 'PlanQuery'})
            },
            toPlan() {
                this.$router.push({name: 'Plan'})
            },
            toCalendar() {
                this.$router.push({name: 'Calendar'})
            },
            toResult() {
                this.$router.push({name: 'Result'})
            },
            toPlanLog() {
                this.$router.push({name: 'PlanLog'})
            },
            toBuilding() {
                this.$router.push({name: 'Building'})
            },
            toFloor() {
                this.$router.push({name: 'Floor'})
            },
            toRoom() {
                this.$router.push({name: 'Room'})
            },
            toPoint() {
                this.$router.push({name: 'Point'})
            },
            toRobot() {
                this.$router.push({name: 'Robot'})
            },
            toPermission() {
                this.$router.push({name: 'Permission'})
            },
            Test() {
                const that = this;
                that.$axios({
                    method: 'post',
                    url: 'http://192.168.30.100/api/RobotApi/Login',
                    data: {
                        Account: that.T_Account,
                        Password: that.T_Password,
                        Key: that.T_Key,
                    }
                }).then((res) => {
                    that.T_Token = res.data.info
                })
            }
        }
    }
</script>

<style scoped>
</style>
