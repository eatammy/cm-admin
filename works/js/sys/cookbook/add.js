/**
 * Created by simagle on 2016/4/15.
 */
var uploader;
$(function () {
    //上传
    uploader = Qiniu.uploader({
        runtimes : 'html5,flash,html4', // 上传模式,依次退化
        browse_button : 'pickFiles', // 上传选择的点选按钮，**必需**
        // 在初始化时，uptoken, uptoken_url, uptoken_func 三个参数中必须有一个被设置
        // 切如果提供了多个，其优先级为 uptoken > uptoken_url > uptoken_func
        // 其中 uptoken 是直接提供上传凭证，uptoken_url 是提供了获取上传凭证的地址，如果需要定制获取 uptoken 的过程则可以设置 uptoken_func
        // uptoken : '<Your upload token>', // uptoken 是上传凭证，由其他程序生成
        uptoken_url : '/cm/admin/common/generalUploadToken', // Ajax 请求 uptoken 的 Url，**强烈建议设置**（服务端提供）
        // uptoken_func: function(file){    // 在需要获取 uptoken 时，该方法会被调用
        //    // do something
        //    return uptoken;
        // },
        get_new_uptoken : false, // 设置上传文件的时候是否每次都重新获取新的 uptoken
        // downtoken_url: '/downtoken',
        // Ajax请求downToken的Url，私有空间时使用,JS-SDK 将向该地址POST文件的key和domain,服务端返回的JSON必须包含`url`字段，`url`值为该文件的下载地址
        unique_names : true, // 默认 false，key 为文件名。若开启该选项，JS-SDK 会为每个文件自动生成key（文件名）
        // save_key: true,                  // 默认 false。若在服务端生成 uptoken 的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
        domain : 'http://7xnnot.com1.z0.glb.clouddn.com/', // bucket 域名，下载资源时用到，**必需**
        container : 'headIcon', // 上传区域 DOM ID，默认是 browser_button 的父元素，
        max_file_size : '100mb', // 最大文件体积限制
        flash_swf_url : 'libs/upload/plupload/Moxie.swf', //引入 flash,相对路径
        max_retries : 3, // 上传失败最大重试次数
        dragdrop : true, // 开启可拖曳上传
        drop_element : 'headIcon', // 拖曳上传区域元素的 ID，拖曳文件或文件夹后可触发上传
        chunk_size : '4mb', // 分块上传时，每块的体积
        auto_start : false, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传,
        filters : [ {
            title : "Image files",
            extensions : "jpg,gif,png"
        } ],
        //x_vars : {
        //    自定义变量，参考http://developer.qiniu.com/docs/v6/api/overview/up/response/vars.html
        //    'time' : function(up,file) {
        //        var time = (new Date()).getTime();
        // do something with 'time'
        //        return time;
        //    },
        //    'size' : function(up,file) {
        //        var size = file.size;
        // do something with 'size'
        //        return size;
        //    }
        //},
        init : {
            'FilesAdded' : function(up, files) {
                plupload.each(files, function(file) {
                    // 文件添加进队列后,处理相关的事情
                    previewImage(file, function (imgsrc) {
                        $("#img").attr("src",imgsrc);
                    })
                });
            },
            'BeforeUpload' : function(up, file) {
                // 每个文件上传前,处理相关的事情
            },
            'UploadProgress' : function(up, file) {
                // 每个文件上传时,处理相关的事情
                console.log(file.percent)
            },
            'FileUploaded' : function(up, file, info) {
                // 每个文件上传成功后,处理相关的事情
                // 其中 info 是文件上传成功后，服务端返回的json，形式如
                // {
                //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                //    "key": "gogopher.jpg"
                //  }
                // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html

                var domain = up.getOption('domain');
                var res = JSON.parse(info);
                var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                document.getElementById("img").setAttribute("src",
                    sourceLink);

            },
            'Error' : function(up, err, errTip) {
                //上传出错时,处理相关的事情
            },
            'UploadComplete' : function() {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key' : function(up, file) {
                // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                // 该配置必须要在 unique_names: false , save_key: false 时才生效

                var key = "";
                // do something with key here
                return key
            }
        }

    });
    function xx() {
        uploader.start();
    }

    function previewImage(file, callback) {//file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
        if (!file || !/image\//.test(file.type)) return; //确保文件是图片
        if (file.type == 'image/gif') {//gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
            var fr = new mOxie.FileReader();
            fr.onload = function () {
                callback(fr.result);
                fr.destroy();
                fr = null;
            }
            fr.readAsDataURL(file.getSource());
        } else {
            var preloader = new mOxie.Image();
            preloader.onload = function () {
                //preloader.downsize(550, 400);//先压缩一下要预览的图片,宽300，高300
                var imgsrc = preloader.type == 'image/jpeg'? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
                callback && callback(imgsrc); //callback传入的参数为预览图片的url
                preloader.destroy();
                preloader = null;
            };
            preloader.load(file.getSource());
        }
    }
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
        $id: "addCategory",
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
    avalon.scan($("#addCategory")[0], vm);
});