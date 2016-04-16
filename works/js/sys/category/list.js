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
            pageNo: 1,
            pageSize: 10,
            category: [],
            //分页查询
            queryPage: function () {
                var data = $("#searchCondition").serialize();
                data.pageNo = vm.pageNo;
                data.pageSize = vm.pageSize;
                $.ajax({
                    url: '/cm/admin/category/queryPage',
                    dataType: 'json',
                    type: 'get',
                    data: data,
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    success: function (result) {
                        if(isSuccess(result)){
                            vm.category = result.bizData.rows;
                        }
                    }
                })
            },
            //添加
            add: function () {
                CMADMIN.openDialog("/sys/category/add.html", {}, "添加分类", "700px", "270px", function () {
                    //vm.clear();    //重置
                });
            },
            //修改
            edit: function () {
                CMADMIN.openDialog("/sys/category/edit.html", {}, "添加分类", "700px", "270px", function () {
                    //vm.clear();    //重置
                });
            },
            init: function(){
                vm.queryPage();
            }
        });
        avalon.scan($("#listCategory")[0], vm);
        vm.init();
    });
});