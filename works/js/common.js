/**
 * Created by 郭旭辉 on 2016/4/13.
 */

/** 分类**/
var categoryType = ["食谱", "商店", "商品", "活动"];


/** 产生guid **/
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
function guid() {
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
};

/** 判断是否登录 **/
function isLoad() {
    return sessionStorage.getItem("ISLOAD");
}

/** 复选框是否全选 **/
function isSelectedAll(item) {
    if (item.status == 1) {
        return item.checked;
    } else {
        return true;
    }
}

/**通用方法**/
function isSuccess(result) {
    var rtnCode = result.rtnCode;
    if (rtnCode == '0000000')
        return true;
    if (rtnCode == '0100041') {
        if (layer) {
            layer.alert(result.msg, {icon: 5});
        } else {
            alert(result.msg);
        }
    }
    return false;
}

//获取省份
function getProvince() {
    var province = [];
    $.ajax({
        url: "/libs/province.json",
        type: "get",
        dataType: "json",
        async: false,
        success: function (result) {
            province = result;
        }
    });
    return province;
}
//获取城市
function getCity() {
    var city = [];
    $.ajax({
        url: "/libs/city.json",
        type: "get",
        dataType: "json",
        async: false,
        success: function (result) {
            city = result;
        }
    });
    return city;
}
//获取区县
function getTown() {
    var town = [];
    $.ajax({
        url: "/libs/town.json",
        type: "get",
        dataType: "json",
        async: false,
        success: function (result) {
            town = result;
        }
    });
    return town;
}

/**qtip最顶部**/
$.fn.qtip.zindex = 99999999;

/**错误显示**/
function errorPlacement(error, element) {
    if (element.is(':radio') || element.is(':checkbox')) { //如果是radio或checkbox
        var eid = element.attr('name'); //获取元素的name属性
        element = $("input[name='" + eid + "']").last().parent(); //将错误信息添加当前元素的父结点后面
    }
    if (!error.is(':empty')) {
        $(element).not('.valid').qtip({
            overwrite: false,
            content: error,
            hide: false,
            show: {
                event: false,
                ready: true
            },
            style: {
                classes: 'qtip-cream qtip-shadow qtip-rounded'
            },
            position: {
                my: 'top left',
                at: 'bottom right'
            }
        }).qtip('option', 'content.text', error);
    }
    else {
        element.qtip('destroy');
    }
}
/** 拓展验证规则 **/
jQuery.validator.addMethod("isPhone", function (value, element) {
    return this.optional(element) || /^1\d{10}$/.test(value);
}, "电话号码不正确");
//关闭所有提示
function closeAllTip() {
    $('.qtip').each(function () {
        $(this).data('qtip').destroy();
    })
}
/** 过滤器 **/
avalon.filters.categoryTypeFilter = function (value, args, args2) {
    var str = "";
    if (value == 1) {
        str = categoryType[0];
    } else if (value == 2) {
        str = categoryType[1];
    } else if (value == 4) {
        str = categoryType[2];
    } else {
        str = categoryType[3];
    }
    return str;
};
/** 七牛云上传 **/
var bucket = {
    "headIcon": "http://7xtefm.com2.z0.glb.qiniucdn.com/",
    "auth": "http://o6kyy6co9.bkt.clouddn.com/"
};
var bucketType = {
    "BUSINESS": 1,
    "COOKBOOK": 2,
    "DISCOVER": 3,
    "HEADICON": 4,
    "AUTH": 5
};

function getUploadToken(type, key) {
    var uptoken = "";
    $.ajax({
        url: "/cm/admin/common/generalUploadToken?type=" + type + "&key=" + key,
        dataType: "json",
        type: "get",
        async: false,
        success: function (result) {
            if (isSuccess(result)) {
                uptoken = result.bizData;
            } else {
                layer.alert("获取上传凭证失败", 2);
            }
        }
    });
    return uptoken;
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
            var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc); //callback传入的参数为预览图片的url
            preloader.destroy();
            preloader = null;
        };
        preloader.load(file.getSource());
    }
}

function deleteImg(type, key) {
    $.ajax({
        url: '/cm/admin/common/deleteImg',
        dataType: 'json',
        type: 'get',
        data: {type: type, key: key},
        success: function () {

        }
    })
}