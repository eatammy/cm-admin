/*
 * authController 0.1
 * Copyright (c) 2016 tengen http://my.oschina.net/tengen
 * Date: 2016-02-14
 * 权限控制器，根据当前用户的权限数据对那些需要权限控制的可操作元素进行额外的渲染控制，如控制其可见性或可用性
 */
;(function($, window, document,undefined) {

    $.fn.authController = function(method) {
        var $this = this;
        var options; //选项配置
        var methods = {
            init: function(opts) {
                options = $.extend({},$.fn.authController.defaults,opts);
                //判断是否需要执行清理缓存
                if(options.clearCacheOnInit){
                    methods.clearPermissions();
                }
                $this.each(function () {
                    //优先采用元素单独配置选项
                    var ac_options = $(this).attr("ac-options");
                    if(typeof(ac_options)=="undefined"){
                        ac_options = options;
                    }else{
                        ac_options = $.extend({},options,ac_options);
                    }
                    //$(this).data("ac-options",ac_options);
                    var checkResult = methods.check($(this));
                    //如果检查结果为忽略控制，则继续检查下一个元素
                    if(checkResult==-1) return true;
                    var hasPermission = checkResult==1;
                    //渲染前处理
                    if(ac_options.beforeRender && $.isFunction(ac_options.beforeRender)){
                        ac_options.beforeRender($(this),hasPermission);
                    }
                    //渲染控制受控元素
                    methods.render($(this),hasPermission);
                    //渲染后处理
                    if(ac_options.afterRender && $.isFunction(ac_options.afterRender)){
                        ac_options.afterRender($(this),hasPermission);
                    }
                });

                return $this;
            },
            getCache:function(key){
                return store.get(key);
            },
            setCache:function(key,value){
                store.set(key,value);
            },
            removeCache:function(key){
                store.remove(key);
            },
            //从服务器加载权限数据
            loadPermissions:function(serviceUrl){
                if(options.loadPermissions && $.isFunction(options.loadPermissions)){
                    return options.loadPermissions(serviceUrl);
                }
                var permissions = [];
                var jsonStr = $.ajax({
                    url: serviceUrl,
                    async: false
                }).responseText;
                permissions = eval("("+jsonStr+")");
                return permissions.bizData || permissions;
            },
            //获取权限数据
            getPermissions:function(){
                var result=[];
                //如果使用了缓存，则从缓存中取权限数据
                if(options.useCache){
                    var permissions = methods.getCache('authController.permissions');
                    if(typeof(permissions)!="undefined" && permissions.length>0){
                        $.merge(result,permissions);
                    }else{
                        result = methods.loadPermissions(options.serviceUrl);
                        this.setCache('authController.permissions',result);
                    }
                }else{
                    result = methods.loadPermissions(options.serviceUrl);
                }
                return result;
            },
            //清理权限数据
            clearPermissions:function(){
                methods.removeCache('authController.permissions');
            },
            //检查是否可操作目标元素 -1-忽略控制，0-没有权限，1-有权限
            check: function($obj) {
                var moduleUrl = $obj.attr('ac-moduleUrl');
                if(typeof(moduleUrl)=="undefined"){
                    moduleUrl = options.moduleUrl;
                }
                //确保moduleUrl以‘/’结尾
                if(moduleUrl.lastIndexOf('/')!=moduleUrl.length-1){
                    moduleUrl += '/';
                }
                var authCode = $obj.attr('ac-authCode');
                //不存在authCode属性的，则忽略控制
                if(typeof(authCode)=="undefined"){
                    return -1;
                }
                var permissions = methods.getPermissions();
                return ($.inArray(moduleUrl+authCode,permissions)>-1)?1:0;
            },
            //根据是否有权限对可操作元素进行渲染
            render:function($obj,hasPermission){
                //优先采用options.render自定义的渲染实现
                if(options.render && $.isFunction(options.render)){
                    options.render($obj,hasPermission);
                }else{
                    if(options.ctrlMode=='visible'){
                        $obj.toggle(hasPermission);
                    }else if(options.ctrlMode=='available'){
                        $obj.attr('disabled',!hasPermission);
                    }else{
                        $.error('"'+options.ctrlMode + '" is invalid ctrlMode!');
                    }
                }
            }
        };


        // 方法调用
        if (methods[method]) {
            //options = $this.data("ac-options");
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method' + method + 'does not exist on jQuery.authController');
        }
    };

    $.fn.authController.defaults = {
        ctrlMode: 'visible', //控制模式（可见性visible或可用性available）。
        useCache: true, //是否使用缓存，默认为true。
        clearCacheOnInit:false, //初始化前是否清理缓存，默认为false。
        context: '', //上下文路径，默认为空字符串，该设置主要针对采用相对路径部署服务的情况
        serviceUrl:'',//服务路径，用于请求返回指定页面的权限集合
        moduleUrl: window.location.pathname, //需要验证的模块地址，默认为当前页面地址，该属性受控元素可以独立指定覆盖
        loadPermissions:null, //从服务器加载权限数据函数
        beforeRender:null, //渲染之前的处理函数
        render:null, //自定义的渲染函数，如果未定义，系统则根据ctrlMode采用选择默认的控制实现
        afterRender:null //渲染之后的处理函数
    };
})(jQuery, window, document);

