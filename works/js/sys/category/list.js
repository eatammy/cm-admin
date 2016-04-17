/**
 * Created by simagle on 2016/4/13.
 */
//本页面脚本列表
var scripts = [null];
//加载完通用脚本后执行

ace.load_ajax_scripts(scripts, function () {
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "listCategory",
            currentDate: new Date(),
            pageNo: 1,      //页码
            pageSize: 10,   //页大小
            records: 0,     //总数
            total: 0,       //页数
            category: [],
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
                vm.queryPage();
            }
        });
        avalon.scan($("#listCategory")[0], vm);
        vm.init();
    });
});