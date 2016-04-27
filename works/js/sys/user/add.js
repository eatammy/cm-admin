/**
 * Created by simagle on 2016/4/15.
 */
var uploader;
$(function () {
    //七牛云上传

    uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4', // 上传模式,依次退化
        browse_button: 'selectImg', // 上传选择的点选按钮，**必需**
        uptoken_func: function (file) {    // 在需要获取 uptoken 时，该方法会被调用
            var uptoken = "";
            $.ajax({
                url: "/cm/admin/common/generalUploadToken",
                dataType: "json",
                type: "get",
                async: false,
                success: function (result) {
                    if (isSuccess(result)) {
                        uptoken = result.bizData;
                        avalon.log(uptoken);
                    } else {
                        layer.alert("获取上传凭证失败", 2);
                    }
                }
            });
            return uptoken;
        },
        get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的 uptoken
        domain: 'http://7xnnot.com1.z0.glb.clouddn.com/', // bucket 域名，下载资源时用到，**必需**
        container: 'showImg', // 上传区域 DOM ID，默认是 browser_button 的父元素，
        max_file_size: '5mb', // 最大文件体积限制
        flash_swf_url: 'libs/upload/plupload/Moxie.swf', //引入 flash,相对路径
        max_retries: 3, // 上传失败最大重试次数
        dragdrop: true, // 开启可拖曳上传
        drop_element: 'headIcon', // 拖曳上传区域元素的 ID，拖曳文件或文件夹后可触发上传
        chunk_size: '2mb', // 分块上传时，每块的体积
        auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传,
        filters: [{
            title: "Image files",
            extensions: "jpg,gif,png"
        }],
        init: {
            'FilesAdded': function (up, files) {
                plupload.each(files, function (file) {
                    // 文件添加进队列后,处理相关的事情
                    previewImage(file, function (imgsrc) {
                        $("#headIcon").attr("src", imgsrc);
                    })
                });
            },
            'BeforeUpload': function (up, file) {
                // 每个文件上传前,处理相关的事情
            },
            'UploadProgress': function (up, file) {
                // 每个文件上传时,处理相关的事情
                //console.log(file.percent)
            },
            'FileUploaded': function (up, file, info) {
                // 每个文件上传成功后,处理相关的事情
                // 其中 info 是文件上传成功后，服务端返回的json，形式如
                // {
                //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                //    "key": "gogopher.jpg"
                //  }
                // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html

                var domain = up.getOption('domain');
                var res = JSON.parse(info);
                avalon(res);
                var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                $("#headIcon").attr("src",sourceLink);
                //document.getElementById("img").setAttribute("src",
                //    sourceLink);

            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                layer.alert("头像上传失败",2);
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key': function (up, file) {
                // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                // 该配置必须要在 unique_names: false , save_key: false 时才生效
                var uid =
                var key = "";
                key = "萌萌哒"
                return key
            }
        }

    });
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
        $id: "addUser",
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
    avalon.scan($("#addUser")[0], vm);
});