$(function () {
    var vm = avalon.define({
        $id: "editAuthRoleUser",
        uid: "",      //用户id
        baseUserDto: {},     //用户基础信息
        currentTag: "",     //当前选择身份
        appFunction: {},  //项目信息
        data: [],       //项目对应的应用
        allChecked: false, //全选
        roles : [],     //用户身份列表
        userType: 1,

        //初始化
        init: function () {
            vm.uid = CMADMIN.getParam("uid");
            vm.appCode = CMADMIN.getParam("appCode");
            vm.roles = [];
            var userTypes =  JSON.parse(sessionStorage.getItem("CURRENTUSER")).userTypes;
            var role = {userType:null, name: null};
            for (var i = 1; i <= 8; i *= 2) {
                var userType = userTypes & i;
                if (userType > 0) {
                    role.userType=i;
                    role.name = roleNames[(Math.log(i)) / (Math.log(2))]
                    vm.roles.push(role);
                }
            }
            $.ajax({
                url: "/cm/admin/authRoleUser/getUserInfoByUid?uid=" + vm.uid,
                type: "GET",
                cache: false,
                dataType: 'json',
                success: function (result) {
                    if (isSuccess(result)) {
                        vm.baseUserDto = result.bizData;
                        vm.changeUserType();
                    }
                }
            })
        },
        //查询角色
        changeUserType: function () {
            //获取身份信息
            $.ajax({
                url: "/cm/admin/authRoleUser/queryRolesForAuth",
                type: "POST",
                cache: false,
                data: {
                    uid: vm.uid,
                    userType: vm.userType,
                    isNeedDefault: false
                },
                dataType: 'json',
                beforeSend: function () {
                    CMADMIN.openLoading();
                },
                complete: function () {
                    CMADMIN.closeLoading();
                },
                success: function (result) {
                    if (isSuccess(result)) {
                        var selected = result.bizData.selected;
                        result.bizData.allRole.forEach(function (v) {
                            if (selected.indexOf(v['code']) != -1) {
                                v.checked = true;
                            } else {
                                v.checked = false;
                            }
                        });
                        vm.data = result.bizData.allRole;

                        vm.allChecked = vm.data.every(function (el) {
                            return el.checked;
                        });
                    }
                }
            })
        },
        //保存
        save: function () {
            //获取子应用
            var roleCodes = [];
            vm.data.forEach(function (el) {
                if (el.checked) {
                    roleCodes.push(el.code);
                }
            });
            $.ajax({
                url: "/cm/admin/authRoleUser/save",
                type: "POST",
                cache: false,
                data: {
                    uid: vm.uid,
                    userType: vm.userType,
                    roleCodes: roleCodes.join(",")
                },
                dataType: 'json',
                beforeSend: function () {
                    CMADMIN.openLoading();
                },
                complete: function () {
                    CMADMIN.closeLoading();
                },
                success: function (result) {
                    if (isSuccess(result)) {
                        layer.alert(result.bizData);
                        CMADMIN.closeDialog();
                    } else {
                        layer.alert("修改失败！" + result.msg);
                    }
                }
            })
        },
        back: function () {
            CMADMIN.cancelDialog();
        },
        //勾选
        checkOne: function () {
            if (!this.checked) {
                vm.allChecked = false;
            } else {
                vm.allChecked = vm.data.every(function (el) {
                    return el.checked;
                });
            }
        },
        //全选
        checkAll: function () {
            vm.data.forEach(function (el) {
                el.checked = vm.allChecked;
            });
        }
    });
    avalon.scan($("#editAuthRoleUser")[0], vm);
    vm.init();
})