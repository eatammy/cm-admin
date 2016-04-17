/**
 * Created by simagle on 2016/4/13.
 */
//本页面脚本列表
var scripts = [null];
//加载完通用脚本后执行

ace.load_ajax_scripts(scripts, function () {
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "listCookbook",
            pageNo: 1,      //页码
            pageSize: 10,   //页大小
            records: 0,     //总数
            total: 0,       //页数
            category: [],   //食谱分类
            allChecked: false,  //是否全选，默认为false
            cookbook: [],  //食谱数据源
            //勾选
            checkOne: function () {
                if (!this.checked) {
                    vm.allChecked = false;
                } else {
                    vm.allChecked = vm.category.every(function (el) {
                        return isSelectedAll(el);
                    });
                }
            },
            //全选
            checkAll: function () {
                vm.category.forEach(function (el) {
                    if (el.status == 1) {
                        el.checked = vm.allChecked;
                    } else {
                        el.checked = false;
                    }
                });
            },
            //分页查询
            queryPage: function () {
                var data = $("#searchCondition").serialize();
                data += "&pageNo=" + vm.pageNo;
                data += "&pageSize=" + vm.pageSize;
                $.ajax({
                    url: '/cm/admin/category/queryPage',
                    dataType: 'json',
                    type: 'post',
                    data: data,
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
                            vm.category = result.bizData.rows;
                            vm.total = result.bizData.total;
                            vm.records = result.bizData.records;
                        }
                    }
                })
            },

            //点击查询
            query: function (pageNo) {
                vm.pageNo = pageNo;
                vm.queryPage();
            },

            //回车查询
            enter: function (event) {
                vm.pageNo = 1;
                vm.pageSize = 10;
                if (event.keyCode == 13) {
                    vm.queryPage();
                }
            },

            //重置
            clear: function () {
                $("#searchCondition")[0].reset();
                vm.pageNo = 1;
                vm.pageSize = 10;
                vm.queryPage();
            },

            //添加
            add: function () {
                CMADMIN.openDialog("/sys/category/add.html", {}, "添加分类", "700px", "270px", function () {
                    vm.clear();    //重置
                });
            },

            //修改
            edit: function (id) {
                CMADMIN.openDialog("/sys/category/edit.html", {id: id}, "添加分类", "700px", "270px", function () {
                    vm.clear();    //重置
                });
            },

            //批量删除
            deleteBatch: function () {
                layer.confirm('确定要删除所选？', {icon: 2},function (index) {
                    var ids = [];
                    vm.category.forEach(function (el) {
                        if (el.checked) {
                            ids.push(el.id);
                        }
                    });
                    if (ids.length <= 0) {
                        layer.alert("请勾选记录！");
                        return;
                    }
                    $.ajax({
                        url: "/cm/admin/category/deleteByIds",
                        type: "POST",
                        dataType: 'json',
                        data: {ids: ids.join(",")},
                        complete: function () {
                            layer.close(index);
                            vm.query(1);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert(result.bizData, {icon: 1});
                            } else {
                                layer.alert(result.msg , {icon: 2});
                            }
                        }
                    });
                });
            },

            //单个删除
            deleteOne: function (id) {
                layer.confirm('确定要删除该分类？', {icon: 2}, function (index) {
                    $.ajax({
                        url: "/cm/admin/category/deleteOne?id=" + id,
                        type: "GET",
                        dataType: "json",
                        complete: function () {
                            layer.close(index);
                            vm.query(vm.pageNo);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert(result.bizData, {icon: 1});
                            } else {
                                layer.alert(result.msg , {icon: 2});
                            }
                        }
                    });
                });
            },

            //启用/停用
            disableOrEnable: function (status, id, flag) {
                var action = flag === 1 ? "停用" : "启用";
                var icon = flag === 1 ? 5 : 6
                layer.confirm('确定要' + action + '该分类！', {icon: icon}, function (index) {
                    $.ajax({
                        url: "/cm/admin/category/disableOrEnable?id=" + id + "&status=" + status,
                        type: "GET",
                        dataType: "json",
                        complete: function () {
                            layer.close(index);
                            vm.query(vm.pageNo);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert(action + "成功！", {icon: 1});
                            }
                        }
                    });
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
                vm.queryPage();
            },

            //每页大小
            selectSize: function () {
                vm.pageSize = parseInt($("#pageSize").val());
                vm.pageNo = 1;
                vm.queryPage(vm.condition);
                $("#pageSize").val(vm.pageSize);
            },

            //跳转到某页
            toPage: function () {
                var val = $(this).val();
                if (isNaN(val) || val < 1 || val > vm.total) {
                    layer.alert("请输入正确的页号！", {icon: 5});
                    return;
                }
                vm.pageNo = parseInt(val);
                vm.queryPage();
            },

        });
        avalon.scan($("#listCookbook")[0], vm);
    });
});