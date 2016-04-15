/**
 * Created by simagle on 2016/4/15.
 */
$(function () {
    var vm = avalon.define({
        $id: "addCategory",
        currentDate: new Date(),
        back: function () {
            CMADMIN.cancelDialog();
        }
    });
    avalon.scan($("#addCategory")[0], vm);
});