
$(function () {
    //表单校验
    var validator = $("#addForm").validate({
        rules: {
            name: {required: true, maxlength: 10},
            moduleCode: {required: true},
            authCode: {required: true, isAuthCode: true}
        },
        messages: {
            name: {required: "必填", maxlength: "最大长度为10字符"},
            moduleCode: {required: "必选"},
            authCode: {required: "必填"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "addAuthOperation",
        appCode: "",  //appCode
        appFunctions: [],    //全部应用
        modules: [],    //所有模块
        currentDate: new Date(),  //当前时间

        //初始化
        init: function(){
            vm.selectModule();
        },
        //选择应用
        selectModule: function () {
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
        //保存
        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/authOperation/add",
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
    avalon.scan($("#addAuthOperation")[0], vm);
    vm.init();
})