/**
 * Created by simagle on 2016/4/15.
 */
$(function () {
    var vm = avalon.define({
        $id: 'editCategory',
        back: function(){
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#editCategory")[0], vm);
});