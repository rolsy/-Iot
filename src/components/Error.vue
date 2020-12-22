<template>
  <div id="Error">
    <a-card style="width: 100%">
      <a-row type="flex" justify="start" :gutter="16">
        <a-col :span="24">
          <div>
            错误信息:
          </div>
          <div id=msg>
            {{ $route.params.error }}
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
    export default {
        name: "Error",
        data() {
            return {
            }
        },
        methods: {
        },
        mounted() {
            const a = this.$route.params.error;
            console.log(a)
        }
    }
</script>

<style scoped>

</style>
