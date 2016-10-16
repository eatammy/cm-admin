//本页面脚本列表
var scripts = [null];
//加载完毕后执行
ace.load_ajax_scripts(scripts, function () {
    //对需要权限控制的元素进行渲染控制
    $('a[ac-authCode],input[ac-authCode]').authController({moduleUrl: '/cm/admin/auth/authRoleUser'});
    //DOM加载完
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "listAuthRoleUser",
            allChecked: false, //全选
            condition: [],       //查询条件
            agency: [],      //记录选择的机构
            province: getProvince(),    //省
            city: getCity(),        //市
            town: getTown(),        //区县
            selectedCity: [],
            selectedTown: [],
            data: [],              //数据
            pageNo: 1,         //页码
            pageSize: 10,    //每页条数
            records: 0,         //总记录
            total: 1,           //总页数
            //省市联动
            changeCity: function (id) {
                vm.selectedCity = [];
                vm.selectedTown = [];
                vm.city.forEach(function (el) {
                    if (el.ProID == id) {
                        vm.selectedCity.push(el);
                    }
                });
                //layer.alert(vm.selectedCity.length);
            },

            //市区县联动
            changeTown: function (id) {
                vm.selectedTown = [];
                vm.town.forEach(function (el) {
                    if (el.CityID == id) {
                        vm.selectedTown.push(el);
                    }
                })
            },
            //回车查询
            enter: function (event) {
                if (event.keyCode == 13) {
                    vm.query(1);
                }
            },
            //初始化
            init: function () {

            },
            //查询
            query: function (pageNum) {
                if (vm.appCode == '') {
                    layer.alert("请选择所属应用！");
                    return;
                }
                if ($('#userName').val() == "" && $('#phone').val() == "" && vm.agencyCode === '') {
                    layer.alert("请选择机构,学校！或者填写姓名,手机号！");
                    return;
                }
                vm.condition = $("#searchCondition").serializeArray();
                vm.pageNo = pageNum;
                vm.queryPage(vm.condition);
            },
            //重置
            clear: function () {
                vm.agency = [];
                vm.schoolCode = "";
                vm.data = [];
                vm.province = [];
                vm.city = [];
                vm.town = [];
                vm.schools = [];
                $("#searchCondition")[0].reset();
                vm.pageNo = 1;
                vm.total = 1;
                $('#selectPageNo').val(1);
                vm.records = 0;
                vm.pageSize = 10;
                vm.appCode = "";
            },
            //分页查询
            queryPage: function (data) {
                var param = "pageNo=" + vm.pageNo + "&pageSize=" + vm.pageSize;
                $.ajax({
                    url: "/cm/admin/authRoleUser/queryPage?" + param,
                    type: "POST",
                    data: data,
                    dataType: "json",
                    beforeSend: function () {
                        CMADMIN.openLoading();
                    },
                    complete: function () {
                        CMADMIN.closeLoading();
                    },
                    success: function (result) {
                        if (isSuccess(result)) {
                            result.bizData.rows.forEach(function (el) {
                                el.checked = false;
                            });
                            vm.data = result.bizData.rows;
                            vm.records = result.bizData.records;
                            vm.total = result.bizData.total;
                        }
                    }
                });
            },
            //设置角色
            edit: function (pageNum, uid) {
                CMADMIN.openDialog("/auth/authRoleUser/edit.html", {
                    uid: uid
                }, "设置角色", "690px", "390px", function () {
                    vm.query(pageNum);    //查询
                });
            },
            //刷新权限
            refreshAuth: function () {
                layer.confirm('确定要刷新该用户的权限缓存吗？', function (index) {
                    $.ajax({
                        url: "/cm/admin/authRoleUser/refreshCache",
                        type: "GET",
                        dataType: "json",
                        complete: function () {
                            layer.close(index);
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                layer.alert(result.bizData);
                            } else {
                                layer.alert(result.msg);
                            }
                        }
                    });
                });
            },
            //首页，上下页，尾页
            selectPage: function (value) {
                vm.pageNo += parseInt(value);
                if (vm.pageNo < 1) {
                    vm.pageNo = 1;
                }
                if (vm.pageNo > vm.total) {
                    vm.pageNo = vm.total;
                }
                vm.queryPage(vm.condition);
            },
            //每页大小
            selectSize: function () {
                vm.pageSize = parseInt($("#pageSize").val());
                vm.pageNo = 1;
                vm.queryPage(vm.condition);
                $("#pageSize").val(vm.pageSize);
            },
            //跳转到某页
            toPage: function () {
                var val = $(this).val();
                if (isNaN(val) || val < 1 || val > vm.total) {
                    layer.alert("请输入正确的页号！");
                    return;
                }
                vm.pageNo = parseInt(val);
                vm.queryPage(vm.condition);
            },

        });
        avalon.scan($("#listAuthRoleUser")[0], vm);
        //初始化
        vm.init();
    });
});