/**
 * Created by simagle on 2016/4/15.
 */
$(function () {
    //表单校验
    var validator = $("#addForm").validate({
        rules: {
            name: {required: true, maxlength: 20},
            priority: {required: true, digits: true, max: 999, min: 1},
            type: {required: true}
        },
        messages: {
            name: {required: "必填", maxlength: "最大输入20字符长度"},
            priority: {required: "必填", digits: "请输入数字", max: "不能大于999", min: "不能小于1"},
            type: {required: "必选"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "addCategory",
        currentDate: new Date(),

        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/category/add",
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
    avalon.scan($("#addCategory")[0], vm);
});