/**
 * Created by Administrator on 2016/4/22.
 */
avalon.ready(function () {
    //表单校验
    var validator = $("#register").validate({
        rules: {
            username: {required: true, maxlength: 20},
            passowrd: {required: true, maxlength: 32},
            secondPasswd: {required: true,isSame:true},
            agree: {require: true}
        },
        messages: {
            name: {required: "账号不能为空", maxlength: "账号长度不符合"},
            passowrd: {required: "密码不能为空", maxlength: "密码长度不符合"},
            secondPasswd: {required: "确认密码不能为空", isSame: "确认密码和密码不相符"},
            agree:{required: "您没有同意使用条款"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });
    var vm = avalon.define({
       $id: "register",

        register: function () {
            if(validator.form()){
                avalon.log("register!")
            }
        }

    });
    avalon.scan();
});