/**
 * Created by 郭旭辉 on 2016/4/15.
 */
$(function () {

    //初始化时间选择器
    var start = {
        elem: '#start',
        format: 'YYYY-MM-DD hh:mm:ss',
        min: laydate.now(), //设定最小日期为当前日期
        max: '2099-06-16 23:59:59', //最大日期
        istime: true,
        istoday: false,
        choose: function(datas){
            end.min = datas; //开始日选好后，重置结束日的最小日期
            end.start = datas; //将结束日的初始值设定为开始日
        }
    };
    var end = {
        elem: '#end',
        format: 'YYYY-MM-DD hh:mm:ss',
        min: laydate.now(),
        max: '2099-06-16 23:59:59',
        istime: true,
        istoday: false,
        choose: function(datas){
            start.max = datas; //结束日选好后，重置开始日的最大日期
        }
    };
    laydate(start);
    laydate(end);

    //表单校验
    var validator = $("#updateForm").validate({
        rules: {
            name: {required: true, maxlength: 20},
            categoryId: {min: 1},
            startTime: {required:true},
            endTime: {required: true}
        },
        messages: {
            name: {required: "活动名称不能为空", maxlength: "名称过长"},
            categoryId: {min: "分类不能为空"},
            startTime: {required:"开始日期不能为空"},
            endTime: {required: "结束日期不能为空"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });
    var vm = avalon.define({
        $id: 'editActivity',
        data: {
            id: CMADMIN.getParam("id"),
            name: "",
            categoryId: null,
            startTime: "",
            endTime: ""
        },
        category: queryCategory(8),
        //回显示查询
        queryOne: function () {
            $.ajax({
                url: '/cm/admin/activity/queryOne?id=' + vm.data.id,
                dataType: 'json',
                type: 'get',
                async: false,
                beforeSend: function () {
                    CMADMIN.openLoading();
                },
                complete: function () {
                    CMADMIN.closeLoading();
                },
                success: function (result) {
                    if (isSuccess(result)) {
                        vm.data.id = result.bizData.id;
                        vm.data.name = result.bizData.name;
                        vm.data.categoryId = result.bizData.categoryId;
                        vm.data.startTime = result.bizData.startTime;
                        vm.data.endTime = result.bizData.endTime;
                        start.min = vm.data.startTime;
                        end.min = vm.data.endTime;
                    }
                }
            })
        },

        save: function () {
            if (validator.form()) {
                var data = $("#updateForm").serialize();
                data += "&code=" + vm.data.code;
                data += "&id=" + vm.data.id;
                data += "&picture="+ vm.picture;
                $.ajax({
                    url: "/cm/admin/activity/update?id=" + vm.data.id,
                    type: "POST",
                    dataType: 'json',
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    data: data,
                    success: function (result) {
                        if (isSuccess(result)) {
                            layer.alert(result.bizData, {icon: 1});
                            CMADMIN.closeDialog();
                        } else {
                            layer.alert(result.msg, {icon: 2});
                        }
                    }
                });
            }
        },
        back: function () {
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#editActivity")[0], vm);
    vm.queryOne();
});