/**
 * Created by simagle on 2016/8/12.
 */
//本页面脚本列表
var scripts = [null];
//加载完毕后执行
ace.load_ajax_scripts(scripts, function () {
    //对需要权限控制的元素进行渲染控制
    $('a[ac-authCode],input[ac-authCode]').authController({moduleUrl:'/cm/admin/auth/authModule'});
    //DOM加载完
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "listAuthModule",
            allChecked: false, //全选
            condition: [],       //查询条件
            modules: [],         //模块数据
            data: [],            //数据
            appCode: "",         //应用code
            moduleCode: 0,    //模块代码
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
                vm.queryModules();
            },
            //查询
            query: function (pageNum) {
                vm.condition = $("#searchCondition").serializeArray();
                vm.pageNo = pageNum;
                vm.queryPage(vm.condition);
            },
            //重置
            clear: function () {
                vm.data = [];
                $("#searchCondition")[0].reset();
                vm.appCode = "";
                vm.moduleCode = 0;
                vm.pageNo = 1;
                vm.total = 1;
                $('#selectPageNo').val(1);
                vm.records = 0;
                vm.pageSize = 10;
                vm.queryModules();
                vm.condition = $("#searchCondition").serializeArray();
            },
            //分页查询
            queryPage: function (data) {
                vm.allChecked = false;
                $.ajax({
                    url: "/cm/admin/authModule/queryPage?pageNo=" + vm.pageNo + "&pageSize=" + vm.pageSize,
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
                        }
                    }
                });
            },
            //选择应用
            queryModules: function () {
                //加载应用对应的模块
                $.ajax({
                    url: "/cm/admin/authModule/queryModules?status=0",
                    type: "GET",
                    dataType: "json",
                    success: function (result) {
                        if (isSuccess(result)) {
                            vm.modules = result.bizData;
                        }
                    }
                })
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
            //添加
            add: function (pageNum) {
                CMADMIN.openDialog("/auth/authModule/add.html", {appCode: vm.appCode}, "添加模块", "800px", "355px", function () {
                    if (vm.appCode != '') {
                        vm.query(pageNum);    //查询
                        vm.queryModules();
                    }
                });
            },
            //修改
            edit: function (pageNum, id) {
                CMADMIN.openDialog("/auth/authModule/edit.html", {id: id}, "修改模块", "800px", "350px", function () {
                    vm.query(pageNum);    //查询
                    vm.queryModules();
                });
            },
            //添加下级
            addNext: function (pageNum, appCode,pCode,level) {
                CMADMIN.openDialog("/auth/authModule/addNext.html", {
                    appCode: appCode,pCode: pCode,level:level
                }, "添加下级", "800px", "350px", function () {
                    vm.query(pageNum);    //查询
                    vm.queryModules();
                });
            },
            //批量删除
            deleteBatch: function () {
                layer.confirm('该操作会删除模块下的所有子模块，用户将不能再使用，确定要批量删除？', function (index) {
                    var ids = [];
                    vm.data.forEach(function (el) {
                        if (el.checked) {
                            ids.push(el.id);
                        }
                    });
                    if (ids.length <= 0) {
                        layer.alert("请勾选记录！");
                        return;
                    }

                    $.ajax({
                        url: "/cm/admin/authModule/deleteByIds",
                        type: "POST",
                        dataType: 'json',
                        data: {ids: ids.join(",")},
                        complete: function () {
                            layer.close(index);
                            vm.query(1);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert("删除成功！");
                                vm.queryModules();
                            } else {
                                layer.alert("删除失败！" + result.msg);
                            }
                        }
                    });
                });
            },
            //单个删除
            deleteOne: function (pageNum, id, roleCode) {
                layer.confirm('该操作会删除模块下的所有子模块，用户将不能再使用，确定要删除该模块？', function (index) {
                    $.ajax({
                        url: "/cm/admin/authModule/deleteOne?id=" + id,
                        type: "GET",
                        dataType: "json",
                        complete: function () {
                            layer.close(index);
                            vm.query(pageNum);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert("删除成功！");
                                vm.queryModules();
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
                layer.confirm('确定要' + action + '？该操作会' + action + '该模块下的所有子模块及对应功能！', function (index) {
                    $.ajax({
                        url: "/cm/admin/authModule/disableOrEnable?id=" + id,
                        type: "GET",
                        dataType: "json",
                        complete: function () {
                            layer.close(index);
                            vm.query(pageNum);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert("修改成功！");
                            }else {
                                layer.alert(result.msg);
                            }
                        }
                    });
                });
            }
        });
        avalon.scan($("#listAuthModule")[0], vm);
        vm.init();
    });
});

