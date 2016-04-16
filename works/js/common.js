/**
 * Created by 郭旭辉 on 2016/4/13.
 */

/**通用方法**/
function isSuccess(result) {
    var rtnCode = result.rtnCode;
    if (rtnCode == '0000000')
        return true;
    if(rtnCode=='0100041'){
        if(layer){
            layer.alert(result.msg,{icon:5});
        }else{
            alert(result.msg);
        }
    }
    return false;
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
//关闭所有提示
function closeAllTip() {
    $('.qtip').each(function () {
        $(this).data('qtip').destroy();
    })
}