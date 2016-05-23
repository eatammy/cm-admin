/**
 * Created by simagle on 2016/4/15.
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
    var validator = $("#addForm").validate({
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
        $id: "addActivity",
        category: queryCategory(8),

        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/activity/add",
                    type: "POST",
                    dataType: 'json',
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    data: $("#addForm").serialize(),
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
    avalon.scan($("#addActivity")[0], vm);
});