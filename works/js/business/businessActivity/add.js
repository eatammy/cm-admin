/**
 * Created by simagle on 2016/4/15.
 */
var uploader;
var code = guid();  //产生guid
var token = getUploadToken(bucketType.BUSINESS, code);
$(function () {
    //七牛云上传
    uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4', // 上传模式,依次退化
        browse_button: 'selectImg', // 上传选择的点选按钮，**必需**
        uptoken: token,
        get_new_uptoken: false, // 设置上传文件的时候是否每次都重新获取新的 uptoken
        //domain: 'http://7xnnot.com1.z0.glb.clouddn.com/', // bucket 域名，下载资源时用到，**必需**
        domain: bucket.business, // bucket 域名，下载资源时用到，**必需**
        container: 'showImg', // 上传区域 DOM ID，默认是 browser_button 的父元素，
        max_file_size: '5mb', // 最大文件体积限制
        flash_swf_url: 'libs/upload/plupload/Moxie.swf', //引入 flash,相对路径
        max_retries: 3, // 上传失败最大重试次数
        dragdrop: true, // 开启可拖曳上传
        drop_element: 'picture', // 拖曳上传区域元素的 ID，拖曳文件或文件夹后可触发上传
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
                        $("#picture").attr("src", imgsrc);
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
                var sourceLink = domain + "/" + res.key; //获取上传成功后的文件的Url
                vm.picture = sourceLink;
                $("#picture").attr("src", sourceLink + "?" + new Date().getTime());
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                layer.alert(" 活动封面上传失败", {icon: 2});
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key': function (up, file) {
                return code;
            }
        }
    });

    //初始化时间选择器
    var start = {
        elem: '#start',
        format: 'YYYY-MM-DD hh:mm:ss',
        min: laydate.now(), //设定最小日期为当前日期
        max: '2099-06-16 23:59:59', //最大日期
        istime: true,
        istoday: false,
        choose: function (datas) {
            end.min = datas; //开始日选好后，重置结束日的最小日期
            end.start = datas //将结束日的初始值设定为开始日
        }
    };
    var end = {
        elem: '#end',
        format: 'YYYY-MM-DD hh:mm:ss',
        min: laydate.now(),
        max: '2099-06-16 23:59:59',
        istime: true,
        istoday: false,
        choose: function (datas) {
            start.max = datas; //结束日选好后，重置开始日的最大日期
        }
    };
    laydate(start);
    laydate(end);
    //表单校验
    var validator = $("#addForm").validate({
        rules: {
            name: {required: true, maxlength: 20},
            price: {isNumber: true, min: 0},
            stock: {isNumber: true, min: 0},
            pNum: {isNumber: true, min: 0},
            startTime: {required: true},
            endTime: {required: true}
        },
        messages: {
            name: {required: "活动名称不能为空", maxlength: "名称过长"},
            price: {isNumber: "填入值必须为数字", min: "价格不能小于0"},
            stock: {min: "库存不能小于0"},
            pNum: {min: "人数上限不能小于0"},
            startTime: {required: "开始日期不能为空"},
            endTime: {required: "结束日期不能为空"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "addBusinessActivity",
        category: queryCategory(8),
        currentDate: new Date(),
        shop: JSON.parse(sessionStorage.getItem(CURRENTSHOP)),
        picture: '/images/public/empty140px.png',   //默认图片
        save: function () {
            if (validator.form()) {
                avalon.log(vm.shop);
                var data = $("#addForm").serialize();
                data += "&picture=" + vm.picture;
                data += "&code=" + code;
                data += "&shopId=" + vm.shop.id;
                data += "&activityId=" + CMADMIN.getParam("id");
                $.ajax({
                    url: "/cm/admin/businessActivity/add",
                    type: "POST",
                    dataType: 'json',
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    data: data,
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
            deleteImg(bucketType.BUSINESS, code);
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#addBusinessActivity")[0], vm);
});