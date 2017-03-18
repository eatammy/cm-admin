/**
 * Created by simagle on 2016/8/12.
 */
//本页面脚本列表
var scripts = [null];
//加载完毕后执行
ace.load_ajax_scripts(scripts, function () {
    //对需要权限控制的元素进行渲染控制
    $('a[ac-authCode],input[ac-authCode]').authController({moduleUrl: '/cm/admin/bi/business'});
    //DOM加载完
    avalon.ready(function () {
        var vm = avalon.define({
                $id: "listShopBusiness",
                month: {
                    "1月": 1,
                    "2月": 2,
                    "3月": 3,
                    "4月": 4,
                    "5月": 5,
                    "6月": 6,
                    "7月": 7,
                    "8月": 8,
                    "9月": 9,
                    "10月": 10,
                    "11月": 11,
                    "12月": 12
                },
                years: [],
                curMonth: new Date().getMonth() + 1, // 用于地区销量查询
                curYear: new Date().getFullYear(),// 用于地区销量查询
                allIndents: [],      //全部订单
                payedIndents: [],    //已支付订单
                goodsStorage: [],          //商品预警
                hotGoods: [],       // 热销商品
                sales: null,        //销售额
                pageNo: 1,       //页码
                pageSize: 5,
                total: 1,        //总页数
                records: 0,   //记录数
                shopCode: JSON.parse(sessionStorage.getItem("CURRENTSHOP")).code,
                //获取顶部信息
                queryIndents4Shop: function () {
                    $.ajax({
                        url: '/cm/admin/bi/shop/queryIndents4Shop',
                        type: 'GET',
                        dataType: 'JSON',
                        data: {shopCode: vm.shopCode},
                        beforeSend: function () {
                            CMADMIN.openLoading();
                        },
                        complete: function () {
                            CMADMIN.closeLoading();
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.allIndents = result.bizData.allIndents;
                                vm.payedIndents = result.bizData.payedIndents;
                                vm.years = result.bizData.years;
                                var indentChart = echarts.init($('#indentChart')[0], "macarons");
                                var indentOption = {
                                    tooltip: {
                                        trigger: 'axis'
                                    },
                                    calculable: true,
                                    legend: {
                                        data: ['订单数', '付款数']
                                    },
                                    xAxis: [
                                        {
                                            type: 'category',
                                            data: result.bizData.xAxis,
                                            splitLine: {show: false}
                                        }
                                    ],
                                    yAxis: [
                                        {
                                            type: 'value',
                                            name: '订单数',
                                            axisLabel: {
                                                formatter: '{value}'
                                            }
                                        },
                                        {
                                            type: 'value',
                                            name: '付款数',
                                            axisLabel: {
                                                formatter: '{value}'
                                            }
                                        }
                                    ],
                                    series: [

                                        {
                                            name: '订单数',
                                            type: 'bar',
                                            data: vm.allIndents
                                        },
                                        {
                                            name: '付款数',
                                            type: vm.allIndents.length <= 15 ? 'bar' : 'line',
                                            //yAxisIndex: 1,
                                            smooth: true,
                                            itemStyle: {normal: {areaStyle: {type: 'default'}}},
                                            data: vm.payedIndents
                                        }
                                    ]
                                };
                                indentChart.setOption(indentOption);
                                window.onresize = indentChart.resize;
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }
                        }
                    })
                },

                queryIndentChart: function () {
                    vm.queryBusinessChart();
                },

                //查询销售数据
                querySales4Shop: function () {
                    $.ajax({
                        url: '/cm/admin/bi/shop/querySales4Shop',
                        type: 'GET',
                        dataType: 'JSON',
                        data: {shopCode: vm.shopCode},
                        beforeSend: function () {
                            CMADMIN.openLoading();
                        },
                        complete: function () {
                            CMADMIN.closeLoading();
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                //设置右边信息栏
                                vm.sales = result.bizData;
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }

                        }
                    })
                },

                //查询预警商品数据
                queryStorageGoods: function () {
                    $.ajax({
                        url: "/cm/admin/goods/queryStorageByShopCode",
                        type: "GET",
                        dataType: "JSON",
                        data: {shopCode: vm.shopCode, pageNo: vm.pageNo, pageSize: vm.pageSize},
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.goodsStorage = result.bizData.rows;
                                vm.records = result.bizData.records;
                                vm.total = result.bizData.total;
                            }
                        }
                    })
                },

                //  更改仓储值
                updateStorageGoods: function(id, stock){
                    layer.prompt({
                        formType: 0,
                        value: stock,
                        title: '更新商品库存量'
                    }, function(value, index, elem){
                        $.ajax({
                            url:"/cm/admin/goods/updateStoragebyId",
                            dataType: "JSON",
                            type:"POST",
                            data:{id:id,stock:value},
                            beforeSend: function () {
                                layer.load(0)
                            },
                            complete: function () {
                                layer.closeAll('loading');
                                layer.close(index);
                            },
                            success: function (result) {
                                if(isSuccess(result)){
                                    vm.queryStorageGoods();
                                    layer.alert(result.bizData.msg, {icon:1});

                                }
                            }
                        });
                    });
                },

                //查询热销商品
                queryHotGoods: function () {
                    $.ajax({
                        url: "/cm/admin/goods/queryGoodsRankByShopCode",
                        type: "GET",
                        dataType: "JSON",
                        data: {shopCode: vm.shopCode},
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.hotGoods = result.bizData;
                            }
                        }
                    })
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
                    vm.queryStorageGoods();
                },

                init: function () {
                    vm.queryIndents4Shop();
                    vm.querySales4Shop();
                    vm.queryStorageGoods();
                    vm.queryHotGoods();
                }
            })
            ;
        avalon.scan($("#listShopBusiness")[0], vm);
        vm.init();
    });
});

