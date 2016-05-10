/**
 * Created by simagle on 2016/4/15.
 */
var code = guid();
var token1 = getUploadToken(bucketType.AUTH, code+"_1");
var token2 = getUploadToken(bucketType.AUTH, code+"_2");
$(function () {
    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4', // 上传模式,依次退化
        browse_button: 'auth1', // 上传选择的点选按钮，**必需**
        uptoken: token1,
        get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的 uptoken
        domain: bucket.auth, // bucket 域名，下载资源时用到，**必需**
        container: 'showAuth1', // 上传区域 DOM ID，默认是 browser_button 的父元素，
        max_file_size: '5mb', // 最大文件体积限制
        flash_swf_url: 'libs/upload/plupload/Moxie.swf', //引入 flash,相对路径
        max_retries: 3, // 上传失败最大重试次数
        dragdrop: false, // 开启可拖曳上传
        drop_element: null, // 拖曳上传区域元素的 ID，拖曳文件或文件夹后可触发上传
        chunk_size: '2mb', // 分块上传时，每块的体积
        auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传,
        filters: [{
            title: "Image files",
            extensions: "jpg,png"
        }],
        init: {
            'FilesAdded': function (up, files) {
                plupload.each(files, function (file) {
                    // 文件添加进队列后,处理相关的事情
                    previewImage(file, function (imgsrc) {
                        $("#auth1").attr("src", imgsrc);
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

                var domain = up.getOption('domain');
                var res = JSON.parse(info);
                avalon(res);
                var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                $("#auth1").attr("src", sourceLink + "?" + new Date().getTime());
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                layer.alert("上传失败", {icon: 2});
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key': function (up, file) {

                return code+"_1";
            }
        }
    });
    var Qiniu2 = new  QiniuJsSDK();
    var uploader2 = Qiniu2.uploader({
        runtimes: 'html5,flash,html4', // 上传模式,依次退化
        browse_button: 'auth2', // 上传选择的点选按钮，**必需**
        uptoken: token2,
        get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的 uptoken
        domain: bucket.auth, // bucket 域名，下载资源时用到，**必需**
        container: 'showAuth2', // 上传区域 DOM ID，默认是 browser_button 的父元素，
        max_file_size: '5mb', // 最大文件体积限制
        flash_swf_url: 'libs/upload/plupload/Moxie.swf', //引入 flash,相对路径
        max_retries: 3, // 上传失败最大重试次数
        dragdrop: false, // 开启可拖曳上传
        drop_element: null, // 拖曳上传区域元素的 ID，拖曳文件或文件夹后可触发上传
        chunk_size: '2mb', // 分块上传时，每块的体积
        auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传,
        filters: [{
            title: "Image files",
            extensions: "jpg,png"
        }],
        init: {
            'FilesAdded': function (up, files) {
                plupload.each(files, function (file) {
                    // 文件添加进队列后,处理相关的事情
                    previewImage(file, function (imgsrc) {
                        $("#auth2").attr("src", imgsrc);
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

                var domain = up.getOption('domain');
                var res = JSON.parse(info);
                avalon(res);
                var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                $("#auth2").attr("src",sourceLink+"?"+new Date().getTime());
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                layer.alert("上传失败", 2);
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key': function (up, file) {

                return code+"_2";
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

    var uploader = null;
    var count = 0;
    var vm = avalon.define({
        $id: "addShop",
        currentDate: new Date(),
        //code: guid(),
        //uploadToken: getUploadToken(bucketType.AUTH, code),//获取上传凭证

        test1: function () {
            layer.alert("触发");
            var qiniu = new QiniuJsSDK();
            qiniu.uploader({
                runtimes: 'html5,flash,html4', // 上传模式,依次退化
                browse_button: 'auth1', // 上传选择的点选按钮，**必需**
                uptoken: token,
                get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的 uptoken
                domain: bucket.auth, // bucket 域名，下载资源时用到，**必需**
                container: 'showAuth1', // 上传区域 DOM ID，默认是 browser_button 的父元素，
                max_file_size: '5mb', // 最大文件体积限制
                flash_swf_url: 'libs/upload/plupload/Moxie.swf', //引入 flash,相对路径
                max_retries: 3, // 上传失败最大重试次数
                dragdrop: false, // 开启可拖曳上传
                drop_element: null, // 拖曳上传区域元素的 ID，拖曳文件或文件夹后可触发上传
                chunk_size: '2mb', // 分块上传时，每块的体积
                auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传,
                filters: [{
                    title: "Image files",
                    extensions: "jpg,png"
                }],
                init: {
                    'FilesAdded': function (up, files) {
                        plupload.each(files, function (file) {
                            // 文件添加进队列后,处理相关的事情
                            previewImage(file, function (imgsrc) {
                                $("#auth1").attr("src", imgsrc);
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

                        var domain = up.getOption('domain');
                        var res = JSON.parse(info);
                        avalon(res);
                        var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                        $("#auth1").attr("src", sourceLink);
                    },
                    'Error': function (up, err, errTip) {
                        //上传出错时,处理相关的事情
                        layer.alert("上传失败", 2);
                    },
                    'UploadComplete': function () {
                        //队列文件处理完毕后,处理相关的事情
                    },
                    'Key': function (up, file) {

                        return code;
                    }
                }
            });
            qiniu = null;
        },

        uploadAuthImg: function (imgID, showAuthID) {
            layer.alert(imgID, showAuthID);
            uploader = null;


            var key = {
                runtimes: 'html5,flash,html4', // 上传模式,依次退化
                browse_button: 'auth1', // 上传选择的点选按钮，**必需**
                uptoken: vm.uploadToken,
                get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的 uptoken
                domain: bucket.auth, // bucket 域名，下载资源时用到，**必需**
                container: 'showAuth1', // 上传区域 DOM ID，默认是 browser_button 的父元素，
                max_file_size: '5mb', // 最大文件体积限制
                flash_swf_url: 'libs/upload/plupload/Moxie.swf', //引入 flash,相对路径
                max_retries: 3, // 上传失败最大重试次数
                dragdrop: false, // 开启可拖曳上传
                drop_element: null, // 拖曳上传区域元素的 ID，拖曳文件或文件夹后可触发上传
                chunk_size: '2mb', // 分块上传时，每块的体积
                auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传,
                filters: [{
                    title: "Image files",
                    extensions: "jpg,png"
                }],
                init: {
                    'FilesAdded': function (up, files) {
                        plupload.each(files, function (file) {
                            // 文件添加进队列后,处理相关的事情
                            previewImage(file, function (imgsrc) {
                                $("#" + imgID).attr("src", imgsrc);
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

                        var domain = up.getOption('domain');
                        var res = JSON.parse(info);
                        avalon(res);
                        var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                        $("#" + imgID).attr("src", sourceLink);
                    },
                    'Error': function (up, err, errTip) {
                        //上传出错时,处理相关的事情
                        layer.alert("上传失败", 2);
                    },
                    'UploadComplete': function () {
                        //队列文件处理完毕后,处理相关的事情
                    },
                    'Key': function (up, file) {

                        return code;
                    }
                }
            }
            uploader = new QiniuJsSDK();
            uploader.uploader(key);
            avalon.log(count);
        },
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
        }

        ,

        back: function () {
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#addShop")[0], vm);
})
;