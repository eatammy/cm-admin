$(function () {
    //表单校验
    var validator = $("#editForm").validate({
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
        $id: "editAuthModule",
        data:{
            id: null,   //id
            name: "",    //名称
            level: 1,     //等级
            priority: null,//排序
            isMenu: 1,     //是否为菜单
            icon: "",      //图标
            url: "",       //地址
            pCode: 0 ,      //父code
            fullCode: ""

        },
        modules: [],    //模块
        //初始化
        init: function(){
            vm.data.id = CMADMIN.getParam("id");
            $.ajax({
                url: "/cm/admin/authModule/queryOne?id=" + vm.data.id,
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
                        vm.data.level = result.bizData.level;
                        vm.data.priority = result.bizData.priority;
                        vm.data.pCode = result.bizData.pCode;
                        vm.data.fullCode = result.bizData.fullCode;
                        vm.data.isMenu = result.bizData.isMenu==true?1:0;
                        vm.data.icon = result.bizData.icon;
                        vm.data.url = result.bizData.url;
                        vm.queryModules();
                    }
                }
            });
        },
        //加载应用对应的模块
        queryModules: function () {
            $.ajax({
                url: "/cm/admin/authModule/queryModulesWithoutChild?moduleFullCode="+vm.data.fullCode,
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
            vm.data.level = parseInt($(this).find('option:selected').attr("level"))+1;
        },
        //保存
        save: function () {
            if (validator.form()) {
                layer.confirm("更新会影响子模块，确定更新？",function(){
                    $.ajax({
                        url: "/cm/admin/authModule/update",
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
                });
            }
        },
        back: function () {
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#editAuthModule")[0], vm);
    vm.init();
});