$(function () {
    //表单校验
    var validator = $("#addForm").validate({
        rules: {
            name: {
                required: true, maxlength: 10
            },
            appCode: {required: true},
            priority: {required: true, digits: true, max: 999, min: 1}

        },
        messages: {
            name: {required: "必填", maxlength: "最大长度为10字符"},
            appCode: {required: "必选"},//问题
            priority: {required: "必填", digits: "请输入数字", max: "不能大于999", min: "不能小于1"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "addAuthRole",
        currentDate: new Date(),  //当前时间

        //初始化
        init: function(){

        },
        //保存
        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/authRole/add",
                    type: "POST",
                    dataType: 'json',
                    data: $("#addForm").serialize(),
                    success: function (result) {
                        if (isSuccess(result)) {
                            layer.alert(result.bizData);
                            CMADMIN.closeDialog();
                        } else {
                            layer.alert(result.msg);
                        }
                    }
                });
            }
        },
        back: function () {
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#addAuthRole")[0], vm);
    vm.init();
})
