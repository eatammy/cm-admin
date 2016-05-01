/**
 * Created by 郭旭辉 on 2016/4/15.
 */
$(function () {
    //表单校验
    var validator = $("#updateForm").validate({
        rules: {
            username: {required: true, maxlength: 20},
            password: {required: true, maxlength: 32},
            phone: {required: true, isPhone: true},
            userType: {required: true}
        },
        messages: {
            username: {required: "必填", maxlength: "最大输入20个字符长度"},
            password: {required: "必填", maxlength: "最大输入32个字符长度"},
            phone: {required: "必填"},
            userType: {required: "必选"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });
    // 将用户身份组合值拆分成整型数组
    function getUserTypeInt(userTypes) {
        var arr = [];
        if (typeof (userTypes) == "undefined") return arr;
        for (var i = 1; i <= 8; i *= 2) {
            var userType = userTypes & i;
            if (userType != 0) {
                arr.push(userType);
            }
        }
        return arr;
    };
    var vm = avalon.define({
        $id: 'editUser',
        data: {
            id: CMADMIN.getParam("id"),
            username: "",
            password: null,
            headIcon: "",
            code: "",
            address: "",
            nickname: "",
            userTypes: null,
            phone: "",
            sex: null
        },
        gender: null,
        userType: [],
        //回显示查询
        queryOne: function () {
            $.ajax({
                url: '/cm/admin/user/queryOne?id=' + vm.data.id,
                dataType: 'json',
                type: 'get',
                beforeSend: function () {
                    CMADMIN.openLoading();
                },
                complete: function () {
                    CMADMIN.closeLoading();
                },
                success: function (result) {
                    if (isSuccess(result)) {
                        vm.data.id = result.bizData.id;
                        vm.data.username = result.bizData.username;
                        //vm.data.password = result.bizData.password;
                        vm.data.headIcon = result.bizData.headIcon;
                        vm.data.code = result.bizData.code;
                        vm.data.address = result.bizData.address;
                        vm.data.nickname = result.bizData.nickname;
                        vm.data.userTypes = result.bizData.userTypes;
                        vm.data.phone = result.bizData.phone;
                        vm.data.sex = result.bizData.sex;
                        vm.gender = vm.data.sex;
                        vm.userType = getUserTypeInt(result.bizData.userTypes);
                    }
                }
            })

        },

        resetPasswd: function () {
            var index = layer.confirm("确定要重置该用户的密码？", {icon: 2}, function () {
                $.ajax({
                    url: "/cm/admin/user/resetPasswd",
                    dataType: "json",
                    type: "get",
                    data: {code: vm.data.code},
                    beforeSend: function () {
                        CMADMIN.openLoading();
                        layer.close(index);
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    success: function (result) {
                        if (isSuccess(result)) {
                            alert("密码修改成功！新密码为：" + result.bizData, 1);
                            vm.data.password = result.bizData;
                        } else {
                            alert("密码重置失败！", 2);
                        }
                    }
                })
            });
        },

        headIconIndex: 1,
        defaultHeadIcon: function () {

            var index = Math.floor(Math.random()*2+1);
            while(index == vm.headIconIndex){
                index = Math.floor(Math.random()*2+1);
            }
            vm.headIconIndex = index;

            vm.data.headIcon = "/images/headIcon/headIcon_default"+index+".png";
        },

        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/user/update?id=" + vm.data.id,
                    type: "POST",
                    dataType: 'json',
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    data: $("#updateForm").serialize(),
                    success: function (result) {
                        if (isSuccess(result)) {
                            layer.alert(result.bizData, {icon: 1});
                            CMADMIN.closeDialog();
                        } else {
                            layer.alert(result.msg, {icon: 2});
                        }
                    }
                });
            }
        },

        back: function () {
            CMADMIN.cancelDialog();
        }


    });
    avalon.scan($("#editUser")[0], vm);
    vm.queryOne();
});