/**
 * Created by 郭旭辉 on 2016/4/15.
 */
$(function () {

    var vm = avalon.define({
        $id: 'editUser',
        shop: {
            code: CMADMIN.getParam("code"),
            owner: "",
            createDate: "",
            province: '',
            city: '',
            town: '',
            authImg1: '',
            authImg2: '',
            address: '',
            ownerPaper: '',
            shopName: '',
            categoryName: '',
            nickName: '',
            username: '',
            linetTelephone: '',
            phone: ''
        },
        province: getProvince(),
        city: getCity(),
        town: getTown(),
        //回显示查询
        queryOne: function () {
            $.ajax({
                url: '/cm/admin/shop/queryOne?code=' + vm.shop.code,
                dataType: 'json',
                type: 'get',
                beforeSend: function () {
                    CMADMIN.openLoading();
                },
                complete: function () {
                    CMADMIN.closeLoading();
                },
                success: function (result) {
                    if (isSuccess(result)) {
                        vm.shop.code = result.bizData.code;
                        vm.shop.owner = result.bizData.owner;
                        vm.shop.address = result.bizData.address;
                        vm.shop.ownerPaper = result.bizData.ownerPaper;
                        vm.shop.shopName = result.bizData.shopName;
                        vm.shop.categoryName = result.bizData.categoryName;
                        vm.shop.nickName = result.bizData.nickName;
                        vm.shop.username = result.bizData.username;
                        vm.shop.linetTelephone = result.bizData.linetTelephone;
                        vm.shop.phone = result.bizData.phone;
                        vm.shop.createDate = result.bizData.createDate;
                        vm.queryProvince(result.bizData.province);
                        vm.queryCity(result.bizData.city);
                        vm.queryTown(result.bizData.town);
                        var authImg = result.bizData.ownerPaperPic.split(",");
                        vm.shop.authImg1 = authImg[0];
                        vm.shop.authImg2 = authImg[1];
                    }
                }
            })

        },

        queryProvince: function (id) {
            vm.province.forEach(function (el) {
                if (el.ProID == id) {
                    vm.shop.province = el.name;
                }
            })
        },
        queryCity: function (id) {
            vm.city.forEach(function (el) {
                if (el.CityID == id) {
                    vm.shop.city = el.name;
                }
            })
        },
        queryTown: function (id) {
            vm.town.forEach(function (el) {
                if (el.Id == id) {
                    vm.shop.town = el.DisName;
                }
            })
        },

        back: function () {
            CMADMIN.cancelDialog();
        }


    });
    avalon.scan($("#editUser")[0], vm);
    vm.queryOne();
});