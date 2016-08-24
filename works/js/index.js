/**
 * Created by simagle on 2016/4/12.
 */

/*ajax内容加载*/

/*动态菜单加载*/
var currentUser = JSON.parse(sessionStorage.getItem("CURRENTUSER"));
jQuery(function ($) {
    $.ajax({
        url: "/cm/admin/auth/getModules?uid="+currentUser.uid+"&userType="+currentUser.userType,
        type: "GET",
        dataType: "json",
        async: false,
        success: function (result) {
            if (isSuccess(result)) {
                var modules  = result.bizData;
                var $moduleContainer = $('ul.nav-list');
                modules.forEach(function (el) {
                    var pageUrl = el.url.replace("/cm/admin/","/")+"/list.html";
                    if(el.level == 1 && el.name != '主页'){
                        $moduleContainer.append('<li id="'+el.id+'"><a href="javascript:void(0)">' +
                            '<i class="menu-icon fa '+el.icon+'"></i><span class="menu-text">'+el.name+'</span> </a><b class="arrow"></b></li>')
                    }else {
                        var $moduleLi = $moduleContainer.find('li[id="'+el.pId+'"]');
                        if($moduleLi.size()>0 ){
                            $moduleLi.find('>a').removeClass("dropdown-toggle").addClass("dropdown-toggle");
                            if($moduleLi.find('b.fa-angle-down').size()==0){
                                $moduleLi.find('>a').append('<b class="arrow fa fa-angle-down"></b>');
                            }
                            var $moduleUL = $moduleLi.find('>ul');
                            if($moduleUL.size()==0){
                                $moduleLi.append('<ul class="submenu"></ul>');
                                $moduleUL = $moduleLi.find('>ul');
                            }
                            $moduleUL.append('<li id="'+el.id+'"><a data-url="'+pageUrl+'" href="#'+pageUrl+'" ac-moduleUrl="'+el.url+'">'
                                +'<i class="menu-icon fa fa-caret-right"></i>'+el.name+' </a><b class="arrow"></b></li>');
                        }
                    }
                });

            }
        }
    })
});

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

//页面加载完成后初始化权限控制器
jQuery(function(){
    //清理权限缓存
    jQuery.fn.authController('clearPermissions');
    //根据具体项目应用情况，覆盖默认配置
    jQuery.extend(jQuery.fn.authController.defaults,{
        ctrlMode : 'available',
        serviceUrl: '/cm/admin/auth/getPermissions?uid='+currentUser.uid+"&userType="+currentUser.userType,
        //对受控元素渲染之后的额外操作
        afterRender : function($obj,hasPermission){
            if(!hasPermission){
                $obj.removeAttr('ms-click').attr('title','你没有该操作权限');
            }
        }
    });
});

//在这里通过监听ace框架动态加载页面事件来初始化所有受控元素，省去在每个页面单独编写初始化代码
jQuery(document).on('ajaxloadcomplete',function(event,data){
    $('.page-content-area').find('a[ac-authCode],input[ac-authCode]').authController({
        //从触发该事件的菜单链接中取moduleUrl
        moduleUrl:$('a[data-url="'+data.hash+'"]').attr('ac-moduleUrl'),
        ctrlMode:'visible'
    });
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
        if(!isLoad()){
            window.location = "/login.html";
        }else{//在此处做初始化的事务

        }
    },
    //退出
    logout: function () {
        layer.confirm("您确定要登出？",{icon: 5, title: "注销"}, function (index) {
            $.ajax({
                url: "/cm/admin/user/logout",
                dataType: 'json',
                type: 'get',
                success: function (result) {
                    //if (isSuccess(result)) {
                    //    layer.alert(result.bizData, 1);
                    //    sessionStorage.clear();
                    //} else {
                    //    layer.alert("操作失败！", 5);
                    //}
                    //window.setTimeout(function () {
                    //    window.location = "/login.html";
                    //}, 1500);
                }
            });
            layer.close(index);
        })

    }
});
avalon.scan();
CMADMIN.init();
