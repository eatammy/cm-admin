/**
 * Created by simagle on 2016/4/15.
 */
var code = guid();
var token1 = getUploadToken(bucketType.AUTH, code + "_1");
var token2 = getUploadToken(bucketType.AUTH, code + "_2");
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
                CMADMIN.openLoading();
            },
            'UploadProgress': function (up, file) {
                // 每个文件上传时,处理相关的事情
                //console.log(file.percent)
            },
            'FileUploaded': function (up, file, info) {
                CMADMIN.closeLoading();
                var domain = up.getOption('domain');
                var res = JSON.parse(info);
                avalon(res);
                var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                vm.authImg1 = sourceLink;
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
                return code + "_1";
            }
        }
    });
    var Qiniu2 = new QiniuJsSDK();
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
                CMADMIN.openLoading();
            },
            'UploadProgress': function (up, file) {
                // 每个文件上传时,处理相关的事情
                //console.log(file.percent)
            },
            'FileUploaded': function (up, file, info) {
                CMADMIN.closeLoading();
                var domain = up.getOption('domain');
                var res = JSON.parse(info);
                avalon(res);
                var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                vm.authImg2 = sourceLink;
                $("#auth2").attr("src", sourceLink + "?" + new Date().getTime());
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                layer.alert("上传失败", 2);
            },
            'UploadComplete': function () {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key': function (up, file) {
                return code + "_2";
            }
        }
    });
//表单校验
    var validator = $("#addForm").validate({
        rules: {
            name: {required: true, maxlength: 20},
            province: {required: true},
            city: {required: true},
            town: {required: true},
            address: {required: true},
            ownerPaper: {required: true},
            shopName: {required: true},
            categoryId: {required: true},
            uid: {required: true}
        },
        messages: {
            name: {required: "必填", maxlength: "最大输入20字符长度"},
            province: {required: "未选择省份"},
            city: {required: "未选择城市"},
            town: {required: "未选择区县"},
            address: {required: "详细地址不能为空"},
            ownerPaper: {required: "身份证号不能为空"},
            shopName: {required: "商店名称不能为空"},
            categoryId: {required: "未选择分类"},
            uid: {required: "未选择归属用户"}
        },
        errorPlacement: errorPlacement,
        success: "valid"
    });

    var vm = avalon.define({
        $id: "addShop",
        currentDate: new Date(),
        user: [],
        curUsername: '',
        category: [],
        province: getProvince(),
        city: getCity(),
        town: getTown(),
        selectedCity: [],
        selectedTown: [],
        authImg1: '',   //身份证正面
        authImg2: '',   //身份证反面
        //省市联动
        changeCity: function (id) {
            vm.selectedCity = [];
            vm.selectedTown = [];
            vm.city.forEach(function (el) {
                if (el.ProID == id) {
                    vm.selectedCity.push(el);
                }
            });
        },

        //市区县联动
        changeTown: function (id) {
            vm.selectedTown = [];
            vm.town.forEach(function (el) {
                if (el.CityID == id) {
                    vm.selectedTown.push(el);
                }
            })
        },

        //查询商店用户
        queryUser4Shop: function () {
            $.ajax({
                url: "/cm/admin/user/queryUser4Shop",
                dataType: 'json',
                type: 'get',
                success: function (result) {
                    if (isSuccess(result)) {
                        vm.user = result.bizData;
                        vm.curUsername = vm.user[0].username;
                    }
                }
            })
        },

        //当前账号
        currentAccount: function () {
            var index = $(this).find("option:selected").attr("inx");
            vm.curUsername = vm.user[index].username;
        },

        //获取商店分类
        queryCategory: function () {
            $.ajax({
                url: "/cm/admin/category/queryCategory?type=2",
                dataType: 'json',
                type: 'get',
                success: function (result) {
                    if (isSuccess(result)) {
                        vm.category = result.bizData;
                    }
                }
            })
        },

        save: function () {
            if (validator.form()) {
                var data = $("#addForm").serialize();
                data += "&authImg1=" + vm.authImg1;
                data += "&authImg2=" + vm.authImg2;
                data += "&code=" + code;
                $.ajax({
                    url: "/cm/admin/shop/add",
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

        init: function () {
            vm.queryUser4Shop();
            vm.queryCategory();
        },
        back: function () {
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#addShop")[0], vm);
    vm.init();
})
;