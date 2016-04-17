/**
 * Created by simagle on 2016/4/12.
 */

/*ajax内容加载*/
jQuery(function ($) {
    if ('enable_ajax_content' in ace) {
        var options = {
            content_url: function (url) {
                if (url.indexOf("login") >= 0) {
                    return false;
                }
                return "/html" + url;
            },
            default_url: '/welcome.html',
            loading_icon: "fa-spinner fa-2x blue"
        };
        ace.enable_ajax_content($, options);
    }
});
var CMADMIN = avalon.define({
    $id: "CMADMIN",
    htmlRoot: '/html',
    currentDate: new Date(),
    currentUser: JSON.parse(sessionStorage.getItem("CURRENTUSER")),

    //打开loading
    openLoading: function () {
        layer.load(2);
    },
    //关闭loading
    closeLoading: function () {
        layer.closeAll('loading');
    },
    //读取参数
    getParam: function (name) {
        return JSON.parse($(".layui-layer-content #param").val())[name];
    },
    //打开弹窗
    index: 0,//记录弹窗
    openDialog: function (url, data, title, width, height, callBack) {
        $.get(CMADMIN.htmlRoot + url, {}, function (html) {
            var str = JSON.stringify(data);
            var hidden = "<input id='param' type='hidden' value='" + str + "' />";
            var area = [width, height];
            if (height == 'auto') {
                area = width;
            }
            CMADMIN.index = layer.open({
                type: 1,
                title: title,
                shift: 2,
                moveEnd: function () {
                    closeAllTip();
                },
                cancel: function () {
                    //取消时重置回调，避免刷新
                    callBack = function () {
                    };
                },
                end: function () {
                    closeAllTip();
                    //为了保存后刷新
                    callBack();
                },
                shadeClose: false,
                content: html + hidden,
                area: area
            });
        });
    },
    //退出弹窗（保存）
    closeDialog: function () {
        layer.closeAll('page');
    },
    //退出特定弹窗
    closeSDialog: function () {
        layer.close(CMADMIN.index);
    },
    //取消弹窗
    cancelDialog: function () {
        $(".layui-layer-close").trigger("click");
    },
    init: function () {
    },
    //退出
    logout: function () {
        layer.confirm("您确定要登出？",{icon: 5, title: "注销"}, function (index) {
            $.ajax({
                url: "/cm/admin/user/logout",
                dataType: 'json',
                type: 'get',
                success: function (result) {
                    if (isSuccess(result)) {
                        layer.alert(result.bizData, 1);
                        sessionStorage.clear();
                    } else {
                        layer.alert("操作失败！", 5);
                    }
                    window.setTimeout(function () {
                        window.location = "/login.html";
                    }, 1500);
                }
            });
            layer.close(index);
        })

    }
});
avalon.scan();
CMADMIN.init();
