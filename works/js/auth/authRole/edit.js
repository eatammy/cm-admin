$(function () {
    //表单校验
    var validator = $("#editForm").validate({
        rules: {
            name: {
                required: true, maxlength: 10
            },
            priority: {required: true, digits: true, max: 999, min: 1}

        },
        messages: {
            name: {required: "必填", maxlength: "最大长度为10字符"},
            priority: {required: "必填", digits: "请输入数字", max: "不能大于999", min: "不能小于1"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "editAuthRole",
        appFunctions: [],    //全部应用
        //先列出绑定属性，保证绑定成功
        data: {
            id: null,
            code: "",
            name: "",        //角色名称
            priority: null,  //排序号
            description: "", //描述
            createDate: null,  //创建时间
            isSuper: false,    //是否拥有所有权限
            isDefault: false    //是否为默认角色
        },
        //初始化
        init: function () {
            vm.data.id = CMADMIN.getParam("id");
            $.ajax({
                url: "/cm/admin/authRole/queryOne?id=" + vm.data.id,
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
                        vm.data.code = result.bizData.code;
                        vm.data.name = result.bizData.name;
                        vm.data.priority = result.bizData.priority;
                        vm.data.description = result.bizData.description;
                        vm.data.appCode = result.bizData.appCode;
                        vm.data.createDate = result.bizData.createDate;
                        vm.data.isSuper = result.bizData.isSuper;
                        vm.data.isDefault = result.bizData.isDefault;
                    }
                }
            });
        },
        //保存
        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/authRole/update",
                    type: "POST",
                    dataType: 'json',
                    data: $("#editForm").serialize(),
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
    avalon.scan($("#editAuthRole")[0], vm);
    vm.init();
})