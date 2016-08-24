/**
 * Created by simagle on 2016/8/12.
 */
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
        $id: "addAuthModule",
        appCode: "",  //appCode
        appFunctions: [],    //全部应用
        modules: [],    //模块
        moduleLevel: 1, //菜单等级

        //初始化
        init: function(){
            //vm.appCode = CMADMIN.getParam("appCode");
            //if(vm.appCode!=''){
            //    vm.selectApp();
            //}
            //$.ajax({
            //    url: "/admin/qky/app/appFunction/getAppsForSuper",
            //    type: "GET",
            //    dataType: "json",
            //    success: function (result) {
            //        if (isSuccess(result)) {
            //            var data = result.bizData;
            //            vm.appFunctions = data;
            //        }
            //    }
            //})
        },
        //选择应用
        selectApp: function () {
            //加载应用对应的模块
            $.ajax({
                url: "/admin/qky/auth/authModule/queryModuleList?appCode="+vm.appCode,
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
        selectModule: function(){
            vm.moduleLevel = parseInt($(this).find('option:selected').attr("level"))+1;
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
    avalon.scan($("#addAuthModule")[0], vm);
    vm.init();
})
