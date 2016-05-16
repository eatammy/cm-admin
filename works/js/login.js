/**
 * Created by 郭旭辉 on 2016/4/16.
 */
avalon.ready(function () {
    //表单校验
    var validator = $("#loginForm").validate({
        rules: {
            username: {required: true, maxlength: 20},
            passowrd: {required: true, digits: true, max: 999, min: 1},

        },
        messages: {
            name: {required: "账号不能为空", maxlength: "账号长度不符合"},
            passowrd: {required: "密码不能为空", maxlength: "密码长度不符合"},

        },
        errorPlacement: errorPlacement,
        success: "valid"
    });
    var vm = avalon.define({
        $id: 'login',
        username: "",
        password: '',
        rememberMe: false,
        //回车登录
        enter: function (event) {
            if (event.keyCode == 13) {
                vm.login();
            }
        },

        //登录
        login: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/user/login",
                    type: "POST",
                    dataType: 'json',
                    beforeSend: function () {
                        layer.load(0)
                    },
                    complete: function () {
                        layer.closeAll('loading');
                    },
                    data: $("#loginForm").serialize(),
                    success: function (result) {
                        if (isSuccess(result)) {
                            if (vm.rememberMe) {
                                var loginInfo = {
                                    username: vm.username,
                                    passowrd: vm.password,
                                    rememberMe: vm.rememberMe
                                };
                                avalon.log(loginInfo);
                                localStorage.setItem("LOGININFO", JSON.stringify(loginInfo));
                                sessionStorage.setItem("CURRENTUSER", JSON.stringify(result.bizData));
                                sessionStorage.setItem("ISLOAD", true);
                            }
                            layer.alert("登录成功", {icon: 1});
                            window.setTimeout(function () {//1.2秒后自动跳转
                                if (result.bizData.userTypes == 1) {  //只有普通用户身份，直接跳转至PC端
                                    window.location.href = "/";
                                } else {//具有多种用户身份
                                    window.location.href = "/html/role.html";
                                }
                            }, 1200);

                        } else {
                            layer.alert(result.msg, {icon: 2});
                        }
                    }
                });
            }
        },

        //初始化登录页面信息
        init: function () {
            var loginInfo = JSON.parse(localStorage.getItem("LOGININFO"));
            if (loginInfo != null) {
                vm.username = loginInfo.username;
                vm.password = loginInfo.passowrd;
                vm.rememberMe = loginInfo.rememberMe;
            }
        }
    });
    avalon.scan();
    vm.init();
});