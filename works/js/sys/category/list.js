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
           currentDate: new Date(),
           //添加
           add: function () {
               CMADMIN.openDialog("/sys/category/add.html", {}, "添加分类", "700px", "270px", function () {
                   //vm.clear();    //重置
               });
           },
           //修改
           edit: function () {
               CMADMIN.openDialog("/sys/category/edit.html", {}, "添加分类", "700px", "270px", function () {
                   //vm.clear();    //重置
               });
           },
       });
       avalon.scan($("#listCategory")[0], vm);
   });
});