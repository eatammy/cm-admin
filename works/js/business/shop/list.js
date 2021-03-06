/**
 * Created by simagle on 2016/4/13.
 */
//本页面脚本列表
var scripts = [null];
//加载完通用脚本后执行

ace.load_ajax_scripts(scripts, function () {
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "listShop",
            currentDate: new Date(),
            pageNo: 1,      //页码
            pageSize: 10,   //页大小
            records: 0,     //总数
            total: 0,       //页数
            data: [],
            //allChecked: false,  //是否全选，默认为false

            province: getProvince(),
            city: getCity(),
            town: getTown(),
            selectedCity: [],
            selectedTown: [],
            category: [],       //所有商店分类

            //省市联动
            changeCity: function (id) {
                vm.selectedCity = [];
                vm.selectedTown = [];
                vm.city.forEach(function (el) {
                    if (el.ProID == id) {
                        vm.selectedCity.push(el);
                    }
                });
                //layer.alert(vm.selectedCity.length);
            },

            //市区县联动
            changeTown: function (id) {
                vm.selectedTown = [];
                vm.town.forEach(function (el) {
                    if (el.CityID == id) {
                        vm.selectedTown.push(el);
                    }
                })
            },
            ////勾选
            //checkOne: function () {
            //    if (!this.checked) {
            //        vm.allChecked = false;
            //    } else {
            //        vm.allChecked = vm.data.every(function (el) {
            //            return isSelectedAll(el);
            //        });
            //    }
            //},
            ////全选
            //checkAll: function () {
            //    vm.data.forEach(function (el) {
            //        if (el.status == 1) {
            //            el.checked = vm.allChecked;
            //        } else {
            //            el.checked = false;
            //        }
            //    });
            //},
            //查询商店分类
            queryCategory: function () {
                $.ajax({
                    url: "/cm/admin/category/queryCategory?type=2",
                    dataType: 'json',
                    type: 'get',
                    success: function (result) {
                        if (isSuccess(result)) {
                            vm.category = result.bizData;
                        }
                    }
                })
            },
            //分页查询
            queryPage: function () {
                var data = $("#searchCondition").serialize();
                data += "&pageNo=" + vm.pageNo;
                data += "&pageSize=" + vm.pageSize;
                $.ajax({
                    url: '/cm/admin/shop/queryPage',
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
                            vm.data = result.bizData.rows;
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
                CMADMIN.openDialog("/business/shop/add.html", {}, "添加用户", "750px", "560px", function () {
                    vm.clear();    //重置
                });
            },

            //修改
            edit: function (code) {
                CMADMIN.openDialog("/business/shop/edit.html", {code: code}, "查看用户", "750px", "560px", function () {
                    vm.clear();    //重置
                });
            },

            //批量删除
            deleteBatch: function () {
                layer.confirm('确定要删除所选？', {icon: 2}, function (index) {
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
                        url: "/cm/admin/shop/deleteByIds",
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
                                layer.alert(result.msg, {icon: 2});
                            }
                        }
                    });
                });
            },

            //单个删除
            deleteOne: function (id,code) {
                layer.confirm('确定要删除该商店？', {icon: 2}, function (index) {
                    $.ajax({
                        url: "/cm/admin/shop/deleteOne",
                        type: "GET",
                        dataType: "json",
                        data: {id: id,code: code},
                        complete: function () {
                            layer.close(index);
                            vm.query(vm.pageNo);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert(result.bizData, {icon: 1});
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }
                        }
                    });
                });
            },

            //启用/停用
            disableOrEnable: function (status, id, flag) {
                var action = flag === 1 ? "审核" : "通过";
                var icon = flag === 1 ? 5 : 6
                layer.confirm('确定要' + action + '该商店！', {icon: icon}, function (index) {
                    $.ajax({
                        url: "/cm/admin/shop/disableOrEnable?id=" + id + "&status=" + status,
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
            init: function () {
                vm.queryCategory();
                vm.queryPage();
            }
        });
        avalon.scan($("#listShop")[0], vm);
        vm.init();
    });
});