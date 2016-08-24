$(function () {
    //表单校验
    var validator = $("#editForm").validate({
        rules: {
            name: {
                required: true, maxlength: 10
            },
            moduleCode: {required: true},
            authCode: {required: true,isAuthCode:true}
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
        $id: "editAuthOperation",
        modules: [],    //所有模块
        //先列出绑定属性，保证绑定成功
        data: {
            id: null,
            appCode: "",     //子应用code
            moduleCode: "",     //模块code
            name: "",        //功能名称
            authCode: "",        //功能代码
            createDate: null  //创建时间
        },
        //初始化
        init: function(){
            vm.data.id = CMADMIN.getParam("id");
            $.ajax({
                url: "/cm/admin/authOperation/queryOne?id=" + vm.data.id,
                type: "GET",
                cache: false,
                dataType: 'json',
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
                        vm.data.authCode = result.bizData.authCode;
                        vm.data.appCode = result.bizData.appCode;
                        vm.data.moduleCode = result.bizData.moduleCode;
                        vm.data.createDate = result.bizData.createDate;
                        vm.queryModules();
                    }
                }
            });
        },
        //加载应用对应的模块
        queryModules: function(){
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
                    url: "/cm/admin/authOperation/update",
                    type: "POST",
                    dataType: 'json',
                    data: $("#editForm").serialize(),
                    success: function (result) {
                        avalon.log(result);
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
    avalon.scan($("#editAuthOperation")[0], vm);
    vm.init();
})

