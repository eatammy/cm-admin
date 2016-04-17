/**
 * Created by 郭旭辉 on 2016/4/15.
 */
$(function () {
    //表单校验
    var validator = $("#updateForm").validate({
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
        $id: 'editCategory',
        category: {id: CMADMIN.getParam("id"), name: "", createDate: "", priority: null, type: null},
        type: [],
        //回显示查询
        queryOne: function () {
            //vm.category.id = CMADMIN.getParam("id");
            $.ajax({
                url: '/cm/admin/category/queryOne?id='+vm.category.id,
                dataType: 'json',
                type: 'get',
                beforeSend: function () {
                    CMADMIN.openLoading();
                },
                complete: function () {
                    CMADMIN.closeLoading();
                },
                success: function (result) {
                    if (isSuccess(result)){
                        vm.category.id = result.bizData.id;
                        vm.category.name = result.bizData.name;
                        vm.category.createDate = result.bizData.createDate;
                        vm.category.priority = result.bizData.priority;
                        vm.category.type = result.bizData.type;
                        vm.type.push(result.bizData.type);
                    }
                }
            })

        },
        save: function () {
            if (validator.form()) {
                $.ajax({
                    url: "/cm/admin/category/update",
                    type: "POST",
                    dataType: 'json',
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    data: $("#updateForm").serialize(),
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
    avalon.scan($("#editCategory")[0], vm);
    vm.queryOne();
});