//本页面脚本列表
var scripts = [null];
//加载完毕后执行
ace.load_ajax_scripts(scripts, function () {
    //对需要权限控制的元素进行渲染控制
    //$('a[ac-authCode],input[ac-authCode]').authController({moduleUrl: '/admin/qky/auth/authRole'});
    //DOM加载完
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "listAuthRole",
            allChecked: false, //全选
            condition: [],       //查询条件
            data: [],              //数据
            pageNo: 1,         //页码
            pageSize: 10,    //每页条数
            records: 0,         //总记录
            total: 1,           //总页数
            //回车查询
            enter: function (event) {
                if (event.keyCode == 13) {
                    vm.query(1);
                }
            },
            //勾选
            checkOne: function () {
                if (!this.checked) {
                    vm.allChecked = false;
                } else {
                    vm.allChecked = vm.data.every(function (el) {
                        return isSelectedAll(el);
                    });
                }
            },
            //全选
            checkAll: function () {
                vm.data.forEach(function (el) {
                    if (el.status == 1) {
                        el.checked = vm.allChecked;
                    } else {
                        el.checked = false;
                    }
                });
            },
            //初始化（查询全部应用）
            init: function () {
                //$.ajax({
                //    url: "/admin/qky/app/appFunction/getAppsForSuper",
                //    type: "GET",
                //    dataType: "json",
                //    success: function (result) {
                //        if (isSuccess(result)) {
                //            vm.appFunctions = result.bizData;
                //        }
                //    }
                //})
            },
            //查询
            query: function (pageNum) {
                //if (vm.appCode == '') {
                //    layer.alert("请选择所属应用！");
                //    return;
                //}
                vm.condition = $("#searchCondition").serializeArray();
                vm.pageNo = pageNum;
                vm.queryPage(vm.condition);
            },
            //重置
            clear: function () {
                vm.data = [];
                $("#searchCondition")[0].reset();
                vm.appCode = "";
                vm.pageNo = 1;
                vm.total = 1;
                $('#selectPageNo').val(1);
                vm.records = 0;
                vm.pageSize = 10;
                vm.condition = $("#searchCondition").serializeArray();
            },
            //分页查询
            queryPage: function (data) {
                vm.allChecked = false;
                $.ajax({
                    url: "/cm/admin/authRole/queryPage?pageNo=" + vm.pageNo + "&pageSize=" + vm.pageSize,
                    type: "POST",
                    data: data,
                    dataType: "json",
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    success: function (result) {
                        if (isSuccess(result)) {
                            result.bizData.rows.forEach(function (el) {
                                el.checked = false;
                            });
                            vm.data = result.bizData.rows;
                            vm.records = result.bizData.records;
                            vm.total = result.bizData.total;
                            $('#btnInit').toggle(vm.records === 0 && $.trim($('#txtName').val()) == '');
                        }
                    }
                });
            },
            //首页，上下页，尾页
            selectPage: function (value) {
                vm.pageNo += parseInt(value);
                if (vm.pageNo < 1) {
                    vm.pageNo = 1;
                }
                if (vm.pageNo > vm.total) {
                    vm.pageNo = vm.total;
                }
                vm.queryPage(vm.condition);
            },
            //每页大小
            selectSize: function () {
                vm.pageNo = 1;
                vm.queryPage(vm.condition);
            },
            //跳转到某页
            toPage: function () {
                var val = $(this).val();
                if (isNaN(val) || val < 1 || val > vm.total) {
                    layer.alert("请输入正确的页号！");
                    return;
                }
                vm.pageNo = parseInt(val);
                vm.queryPage(vm.condition);
            },
            //分配用户
            assignUsers: function (pageNum, roleCode, name) {
                CMADMIN.openDialog("/auth/authRole/assignUsers.html", {
                    roleCode: roleCode
                }, "为【" + name + "】角色分配用户", "850px", "auto", function () {
                    vm.query(pageNum);    //查询
                });
            },
            //授权
            auth: function (pageNum, appCode, roleCode, name) {
                CMADMIN.openDialog("/auth/authRole/auth.html", {
                    appCode: appCode,
                    roleCode: roleCode
                }, "【" + name + "】角色授权", "500px", "580px", function () {
                    //清理权限缓存
                    jQuery.fn.authController('clearPermissions');
                    vm.query(pageNum);    //查询
                });
            },
            //添加
            add: function (pageNum) {
                CMADMIN.openDialog("/auth/authRole/add.html", {appCode: vm.appCode}, "角色添加", "700px", "350px", function () {
                    if (vm.appCode != '') {
                        vm.query(pageNum);    //查询
                    }
                });
            },
            //修改
            edit: function (pageNum, id) {
                CMADMIN.openDialog("/auth/authRole/edit.html", {id: id}, "修改", "700px", "auto", function () {
                    vm.query(pageNum);    //查询
                });
            },
            //初始化角色
            //initRoles: function(){
            //    $.ajax({
            //        url: "/admin/qky/auth/authRole/initRoles",
            //        type: "POST",
            //        dataType: 'json',
            //        data: {appCode:vm.appCode},
            //        complete: function () {
            //            vm.query(1);
            //        },
            //        success: function (result) {
            //            if (isSuccess(result)) {
            //                layer.alert("初始化成功！");
            //            } else {
            //                layer.alert("初始化失败！" + result.msg);
            //            }
            //        }
            //    });
            //},
            //批量删除
            deleteBatch: function () {
                layer.confirm('确定要删除所选？', function (index) {
                    var ids = [];
                    var roleCodes = [];
                    vm.data.forEach(function (el) {
                        if (el.checked) {
                            ids.push(el.id);
                            roleCodes.push(el.code);
                        }
                    });
                    if (ids.length <= 0) {
                        layer.alert("请勾选记录！");
                        return;
                    }

                    $.ajax({
                        url: "/cm/admin/authRole/deleteByIds",
                        type: "POST",
                        dataType: 'json',
                        data: {ids: ids.join(","), roleCodes: roleCodes.join(",")},
                        complete: function () {
                            layer.close(index);
                            vm.query(1);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert("删除成功！");
                            } else {
                                layer.alert("删除失败！" + result.msg);
                            }
                        }
                    });
                });
            },
            //单个删除
            deleteOne: function (pageNum, id, roleCode) {
                layer.confirm('确定要删除该记录？', function (index) {
                    $.ajax({
                        url: "/cm/admin/authRole/deleteOne?id=" + id + "&roleCode=" + roleCode,
                        type: "GET",
                        dataType: "json",
                        complete: function () {
                            layer.close(index);
                            vm.query(pageNum);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert("删除成功！");
                            } else {
                                layer.alert("删除失败！" + result.msg);
                            }
                        }
                    });
                });
            },
            //启用/停用
            disableOrEnable: function (pageNum, id, flag) {
                var action = flag === 1 ? "停用" : "启用";
                layer.confirm('确定要' + action + '？该操作会' + action + '该角色下所有！', function (index) {
                    $.ajax({
                        url: "/cm/admin/authRole/disableOrEnable?id=" + id+"&status="+flag,
                        type: "GET",
                        dataType: "json",
                        complete: function () {
                            layer.close(index);
                            vm.query(pageNum);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert("修改成功！");
                            }
                        }
                    });
                });
            }
        });
        avalon.scan($("#listAuthRole")[0], vm);
        vm.init();
    });

});