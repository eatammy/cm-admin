//本页面脚本列表
var scripts = [null];
//加载完毕后执行
ace.load_ajax_scripts(scripts, function () {
    //对需要权限控制的元素进行渲染控制
//        $('a[ac-authCode],input[ac-authCode]').authController({moduleUrl:'/cm/admin/authOperation'});
    //DOM加载完
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "listAuthOperation",
            allChecked: false, //全选
            condition: [],       //查询条件
            appFunctions: [],    //全部应用
            modules: [],         //模块数据
            data: [],              //数据
            appCode: "",        //所属应用
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
            //初始化（查询全部模块）
            init: function () {
                vm.queryModules();
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
                    url: "/cm/admin/authOperation/queryPage?pageNo=" + vm.pageNo + "&pageSize=" + vm.pageSize,
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
                CMADMIN.openDialog("/auth/authOperation/add.html", {appCode:vm.appCode}, "添加操作", "800px", "265px", function () {
                    if (vm.appCode != '') {
                        vm.query(pageNum);    //重置
                    }
                });
            },
            //修改
            edit: function (pageNum, id) {
                CMADMIN.openDialog("/auth/authOperation/edit.html", {id: id}, "修改操作", "800px", "265px", function () {
                    vm.query(pageNum);    //重置
                });
            },
            //批量删除
            deleteBatch: function () {
                layer.confirm('确定要删除所选？', function (index) {
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
                        url: "/cm/admin/authOperation/deleteByIds",
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
                            } else {
                                layer.alert("删除失败！" + result.msg);
                            }
                        }
                    });
                });
            },
            //单个删除
            deleteOne: function (pageNum, id,roleCode) {
                layer.confirm('确定要删除该记录？', function (index) {
                    $.ajax({
                        url: "/cm/admin/authOperation/deleteOne?id=" + id+"&roleCode="+roleCode,
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
                layer.confirm('确定要' + action + '该功能？', function (index) {
                    $.ajax({
                        url: "/cm/admin/authOperation/disableOrEnable?id=" + id,
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
        avalon.scan($("#listAuthOperation")[0], vm);
        vm.init();
    });
});
