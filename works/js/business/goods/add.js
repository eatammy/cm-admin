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
                var sourceLink = domain +"/"+ res.key; //获取上传成功后的文件的Url
                vm.picture = sourceLink;
                $("#picture").attr("src",sourceLink+"?"+new Date().getTime());
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                layer.alert(" 头像上传失败",{icon: 2});
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key': function (up, file) {
                return code;
            }
        }
    });
    //表单校验
    var validator = $("#addForm").validate({
        rules: {
            goodsName: {required: true, maxlength: 20},
            categoryId: {min: 1},
            price: {required:true, min: 0},
            stock: {required: true, min: 0},
            description: {maxlength: 180}
        },
        messages: {
            goodsName: {required: "商品名称不能为空", maxlength: "名称过长"},
            categoryId: {min: "分类不能为空"},
            price: {required:"价格不能为空", min: "价格不能小于0"},
            stock: {required: "库存不能为空", min: "库存不能小于0"},
            description: {maxLength: "描述过长"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "addGoods",
        category: queryCategory(4),
        picture: '',
        shop: JSON.parse(sessionStorage.getItem(CURRENTSHOP)),
        save: function () {
            if (validator.form()) {
                var data = $("#addForm").serialize();
                data += "&picture="+vm.picture;
                data += "&code="+code;
                data += "&shopId="+vm.shop.code;
                $.ajax({
                    url: "/cm/admin/goods/add",
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
    avalon.scan($("#addGoods")[0], vm);
});