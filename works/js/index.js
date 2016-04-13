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
        }
        ace.enable_ajax_content($, options)
    }
})
var CMADMIN = avalon.define({
    $id: "CMADMIN",
    htmlRoot: '/html',
    current6Date: new Date(),

    //
});

avalon.scan();
