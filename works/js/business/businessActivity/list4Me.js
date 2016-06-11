/**
 * Created by simagle on 2016/4/13.
 */
//本页面脚本列表
var scripts = [null];
//加载完通用脚本后执行
var shop = JSON.parse(sessionStorage.getItem("CURRENTUSER"));
ace.load_ajax_scripts(scripts, function () {
    avalon.ready(function () {
        var start = {
            elem: '#startTime',
            format: 'YYYY-MM-DD hh:mm:ss',
            min: '1900-01-01 00:00:00', //设定最小日期为当前日期
            max: '2099-06-16 23:59:59', //最大日期
            istime: true,
            istoday: false,
            choose: function(datas){
                end.min = datas; //开始日选好后，重置结束日的最小日期
                end.start = datas //将结束日的初始值设定为开始日
            }
        };
        var end = {
            elem: '#endTime',
            format: 'YYYY-MM-DD hh:mm:ss',
            min: '1900-01-01 00:00:00',
            max: '2099-06-16 23:59:59',
            istime: true,
            istoday: false,
            choose: function(datas){
                start.max = datas; //结束日选好后，重置开始日的最大日期
            }
        };
        laydate(start);
        laydate(end);
        var vm = avalon.define({
            $id: "listActivity4Me",
            pageNo: 1,      //页码
            pageSize: 10,   //页大小
            records: 0,     //总数
            total: 0,       //页数
            data: [],
            category: queryCategory(8),
            allChecked: false,  //是否全选，默认为false
            //分页查询
            queryPage: function () {
                var data = $("#searchCondition").serialize();
                data += "&pageNo=" + vm.pageNo;
                data += "&pageSize=" + vm.pageSize;
                $.ajax({
                    url: '/cm/admin/businessActivity/queryPage4Me',
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
                                el.process = (el.sale/((el.sale+el.stock)*1.0)*100).toFixed(2);
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


            //修改
            edit: function (id) {
                CMADMIN.openDialog("/business/businessActivity/edit.html", {id: id}, "修改活动内容", "750px", "550px", function () {
                    vm.clear();    //重置
                });
            },


            //启用/停用
            disableOrEnable: function (status, id, flag) {
                var action = flag === 1 ? "停用" : "启用";
                var icon = flag === 1 ? 5 : 6
                layer.confirm('确定要' + action + '该活动！', {icon: icon}, function (index) {
                    $.ajax({
                        url: "/cm/admin/businessActivity/disableOrEnable?id=" + id + "&status=" + status,
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
                vm.queryPage();
            }
        });
        avalon.scan($("#listActivity4Me")[0], vm);
        vm.init();
    });
});