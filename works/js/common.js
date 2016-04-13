/**
 * Created by Administrator on 2016/4/13.
 */
//关闭所有提示
function closeAllTip() {
    $('.qtip').each(function () {
        $(this).data('qtip').destroy();
    })
}