/**
 * Created by simagle on 2016/4/13.
 */
//本页面脚本列表
var scripts = [null];
//加载完通用脚本后执行

ace.load_ajax_scripts(scripts, function () {
   avalon.ready(function () {
       var vm = avalon.define({
           $id: "listCategory",
       });
       avalon.scan($("#listCategory")[0], vm);
   });
});