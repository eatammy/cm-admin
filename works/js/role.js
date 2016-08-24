/**
 * Created by Administrator on 2016/5/16.
 */
avalon.ready(function () {
    //var url = $.getLocalStorage(URLCONFIG)["getRoles"];
    var vm = avalon.define({
        $id: "role",
        logo: '',
        copyRight: '',
        curUser: JSON.parse(sessionStorage.getItem("CURRENTUSER")),
        roleData: [],
        //获取角色列表
        getRoles: function () {
            var roleImg = {
                "普通用户": "/images/role/role0.jpg",
                "商家": "/images/role/role1.jpg",
                "管理员": "/images/role/role2.jpg",
                "超级管理员": "/images/role/role3.jpg"
            };
            var background = {
                "普通用户": "#33c06e",
                "商家": "#8183f1",
                "管理员": "#ffb810",
                "超级管理员": "#fb592d"
            };
            var userTypes = {
                "普通用户": 1,
                "商家": 2,
                "管理员": 4,
                "超级管理员": 8
            };
            var roles = [];
            for (var i = 1; i <= 8; i *= 2) {
                if ((vm.curUser.userTypes & i) > 0) {
                    var index = (Math.log(i)) / (Math.log(2));
                    roles.push(roleNames[index]);
                }
            }
            //筛选出角色集合
            vm.roleData = $.map(roles, function (item) {
                var img = roleImg[item];
                var backColor = background[item];
                var userType = userTypes[item];
                return {
                    "img": img,
                    "background": backColor,
                    "roleName": item,
                    "userType": userType
                }
            });
            avalon.log(vm.roleData);
            layer.closeAll('loading');
        },
        //选择角色
        selectRole: function (role) {
            layer.load(2);
            sessionStorage.setItem(CURRENTUSER, JSON.stringify({
                "uid": vm.curUser.uid,
                "salt": vm.curUser.salt,
                "username": vm.curUser.username,
                "headIcon": vm.curUser.headIcon,
                "description": vm.curUser.description,
                "nickname": vm.curUser.nickname,
                "phone": vm.curUser.phone,
                "userTypes": vm.curUser.userTypes,
                "userType": role.userType
            }));
            if (role.userType == 1) {//普通用户登入，跳转至PCuid
                window.location.href = "/login.html";
            } else {
                if (role.userType == 2) {//商家登录，查询出商家的信息
                    $.ajax({
                        url: '/cm/admin/shop/initShop?uid=' + vm.curUser.uid,
                        dataType: 'json',
                        type: 'get',

                        complete: function () {
                            layer.close('loading');
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                if (result.bizData.length == 0) {
                                    layer.alert("商店已经停用！", {icon: 2});
                                } else {
                                    sessionStorage.setItem(CURRENTSHOP, JSON.stringify(result.bizData));
                                }
                            }
                        }
                    });
                }
                $.ajax({
                    url: '/cm/admin/user/initUser?uid=' + vm.curUser.uid + '&userType=' + role.userType,
                    dataType: 'json',
                    type: 'get',
                    async: false,
                    success: function (result) {

                    }
                });
                window.setTimeout(function () {
                    window.location.href = "/index.html";
                }, 2000);
            }
        },
        init: function () {
            layer.load(2);
            vm.getRoles();
        }
    });
    avalon.scan();
    vm.init();
})