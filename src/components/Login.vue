<template>
    <div class="loginc">
        <div class="card">
            <img width="150px" src="../assets/logo.png">
            <div>
                <el-form :model="formData" :rules="rules" ref="formData" class="form">
                    <el-form-item prop="username">
                        <el-input v-model='formData.username' class="input"
                                  prefix-icon="el-icon-s-custom"
                                  placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model='formData.password' class="input" prefix-icon="el-icon-key"
                                  placeholder="请输入密码"
                                  show-password></el-input>
                    </el-form-item>
                    <el-form-item class="button">
                        <el-button type="primary" @click="checkForm('formData')">登录</el-button>
                        <el-button type="info" @click="reset('formData')">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

    </div>
</template>

<script>

import qs from 'qs'

    export default {
        name: "Login",
        data() {
            return {
                formData: {
                    username: 'admin',
                    password: 'admin123'
                },
                rules: {
                    username: {required: true, message: '请输入用户名'},
                    password: [{required: true, message: '请输入密码'},
                        {min: 6, message: '密码长度不符'}]
                }
            };
        },
        methods: {
            checkForm(formName) {
                this.$refs[formName].validate(async (valid) => {
                    if (valid) {
                        const {data: res} = await this.$ajax.post('/login/',qs.stringify(this.formData)).catch(()=>{
                            return this.$notify.error({title:'错误',message:'请检查网络连接'})
                        })
                        if (res.access_token) {
                            window.sessionStorage.setItem('token', res.access_token)
                            window.sessionStorage.setItem('username',this.formData.username)
                            await this.$router.push('/index')
                        } else {
                            this.$message.error('用户名或密码错误')
                        }
                    }
                });
            },
            reset(formName) {
                this.$refs[formName].resetField;
            }
        }
    }
</script>

<style lang="less" scoped>
    .loginc {
        background-color: #2b4b6b;
        height: 100%;

        .card {
            background-color: #fff;
            height: 350px;
            width: 500px;
            border-radius: 5%;
            position: absolute;
            right: 50%;
            top: 50%;
            transform: translate(50%, -50%);

            img {
                background-color: #fff;
                height: 150px;
                width: 200px;
                padding: 20px;
                position: absolute;
                top: -20%;
                right: 50%;
                transform: translate(50%);
                border-radius: 80%;
            }

            .form {
                position: absolute;
                right: 50%;
                top: 50%;
                transform: translate(50%, -50%);

                .input {
                    width: 300px;
                }

                .button {
                    position: absolute;
                    right: 0;
                }

            }
        }
    }
</style>
