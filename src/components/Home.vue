<template>
  <dir>
    <el-button type="info" @click="logout">退出</el-button>
  </dir>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    logout () {
      sessionStorage.removeItem('token') // 移除token
      this.$router.push('/login') // 跳转到登录页面
    }
  }
}
</script>

<style lang="less" scoped></style>
