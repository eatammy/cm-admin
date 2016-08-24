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
            appCode: {required: "必选"},
            priority: {required: "必填", digits: "请输入数字", max: "不能大于999", min: "不能小于1"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "addNextAuthModule",
        data: {
            name: "",    //名称
            level: 1,     //等级
            priority: null,//排序
            isMenu: 1,     //是否为菜单
            appCode: "",   //appCode
            url: "",       //地址
            pCode: 0       //父code
        },
        modules: [],    //模块
        //初始化
        init: function () {
            vm.data.appCode = CMADMIN.getParam("appCode");
            vm.data.pCode = CMADMIN.getParam("pCode");
            vm.data.level = parseInt(CMADMIN.getParam("level")) + 1;
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
        //选择模块
        selectModule: function () {
            vm.data.level = parseInt($(this).find('option:selected').attr("level")) + 1;
        },
        //保存
        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/authModule/add",
                    type: "POST",
                    dataType: 'json',
                    data: $("#addForm").serialize(),
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
    avalon.scan($("#addNextAuthModule")[0], vm);
    vm.init();
})