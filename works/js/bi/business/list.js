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
                $id: "listBusiness",
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
                year: [],
                curMonth: new Date().getMonth() + 1, //用于注册查询
                curYear: new Date().getFullYear(),
                totalTrade: 0,      //交易总量
                indent: null,   //订单量
                shop: null,     //新商家
                goods: null,   //新商品
                indentDataInfo: [],     //右边信息栏列表
                hotShop: [],      //热门商店
                hotGoods: [],    //热门商品
                zooIndent: [],   //地区订单
                feedback:[],    //反馈或建议
                pageNo: 1,       //页码
                pageSize: 10,
                total: 1,        //总页数
                records: 0,   //记录数
                //获取顶部信息
                getBusinessInfo: function () {
                    $.ajax({
                        url: '/cm/admin/bibusiness/getBusinessInfo',
                        type: 'get',
                        dataType: 'json',
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.totalTrade = result.bizData.TOTALTRADE;
                                vm.indent = result.bizData.INDENT;
                                vm.shop = result.bizData.SHOP;
                                vm.goods = result.bizData.GOODS;
                                vm.years = result.bizData.years;
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }
                        }
                    })
                },

                queryIndentChart: function () {
                    vm.queryBusinessChart();
                },

                //查询订单数据
                queryBusinessChart: function () {
                    var curMonth = new Date().getMonth() + 1;
                    if (vm.curMonth > curMonth) {
                        layer.alert("所选月份不能大于当前月份", {icon: 2});
                        return;
                    }
                    $.ajax({
                        url: '/cm/admin/bibusiness/queryBusinessChart',
                        type: 'get',
                        dataType: 'json',
                        data: {year: vm.curYear, month: vm.curMonth},
                        success: function (result) {
                            if (isSuccess(result)) {
                                var indentChart = echarts.init($('#indentChart')[0],"macarons");
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
                                            splitLine:{show: false}
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
                                            data: result.bizData.chartData.allIndentsCount
                                        },
                                        {
                                            name: '付款数',
                                                type: result.bizData.chartData.allIndentsCount.length <= 15 ? 'bar': 'line',
                                            //yAxisIndex: 1,
                                            smooth: true,
                                            itemStyle: {normal: {areaStyle: {type: 'default'}}},
                                            data: result.bizData.chartData.payedIndentsCount
                                        }
                                    ]
                                };
                                indentChart.setOption(indentOption);
                                window.onresize = indentChart.resize;

                                //设置右边信息栏
                                vm.indentDataInfo = result.bizData.dataList;
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }

                        }
                    })
                },

                //获取反馈信息
                queryFeedback: function () {
                    $.ajax({
                        url: '/cm/admin/feedback/queryPage',
                        type: 'get',
                        dataType: 'json',
                        data: {pageNo: vm.pageNo, pageSize: vm.pageSize},
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.feedback = result.bizData.rows;
                                vm.total = result.bizData.total;
                                vm.records = result.bizData.records;
                            } else {
                                layer.alert(result.msg, {icon: 2});
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
                    vm.queryFeedback();
                },
                //获取排行榜信息
                queryRanking: function () {
                    $.ajax({
                        url: '/cm/admin/bibusiness/queryRanking',
                        type: 'get',
                        dataType: 'json',
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.hotShop = result.bizData.SHOPS;
                                vm.hotGoods = result.bizData.GOODS;
                            } else {
                                layer.alert(result.msg, {icon: 2})
                            }
                        }
                    })
                },

                //获取交易地区信息
                queryTradesZoo: function () {
                    $.ajax({
                        url: '/cm/admin/bibusiness/queryTradesZoo',
                        type: 'get',
                        dataType: 'json',
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.zooIndent = result.bizData.data;
                                var max = 0;
                                vm.zooIndent.forEach(function (el) {
                                    if (el.value > max) {
                                        max = el.value;
                                    }
                                });
                                var zooChart = echarts.init($('#zooChart')[0]);
                                var zooOption = {
                                    dataRange: {
                                        min: 0,
                                        max: max,
                                        x: 'left',
                                        y: 'bottom',
                                        text: ['高', '低'],           // 文本，默认为数值文本
                                        calculable: true
                                    },
                                    tooltip: {
                                        trigger: 'item',
                                        islandFormatter: '{a} < br/>{b} : {c}',
                                        showDelay: 20
                                    },
                                    roamController: {
                                        show: true,
                                        x: 'right',
                                        mapTypeControl: {
                                            'china': true
                                        }
                                    },
                                    series: [
                                        {
                                            name: '用户分布',
                                            type: 'map',
                                            mapType: 'china',
                                            roam: false,
                                            itemStyle: {
                                                normal: {label: {show: true}}
                                            },
                                            data: result.bizData.data
                                        }
                                    ]
                                };
                                zooChart.setOption(zooOption);
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }
                        }
                    })
                },
                changeZooTrade: function (type) {
                    var zooIndent = [];
                    var indent = {name: null, value: null};
                    var max = 0;
                    if (type == 0) {
                        vm.zooIndent.forEach(function (el) {
                            indent.name = el.name;
                            indent.value = el.value;
                            zooIndent.push(indent);
                            if (el.value > max) {
                                max = el.value;
                            }
                            indent = {name: null, value: null};
                        });
                    } else {
                        vm.zooIndent.forEach(function (el) {
                            indent.name = el.name;
                            indent.value = el.total;
                            zooIndent.push(indent);
                            if (el.total > max) {
                                max = el.total;
                            }
                            indent = {name: null, value: null};
                        });
                        avalon.log(zooIndent);
                    }
                    var zooChart = echarts.init($('#zooChart')[0]);
                    var zooOption = {
                        dataRange: {
                            min: 0,
                            max: max,
                            x: 'left',
                            y: 'bottom',
                            text: ['高', '低'],           // 文本，默认为数值文本
                            calculable: true
                        },
                        tooltip: {
                            trigger: 'item',
                            islandFormatter: '{a} < br/>{b} : {c}',
                            showDelay: 20
                        },
                        roamController: {
                            show: true,
                            x: 'right',
                            mapTypeControl: {
                                'china': true
                            }
                        },
                        series: [
                            {
                                name: '用户分布',
                                type: 'map',
                                mapType: 'china',
                                roam: false,
                                itemStyle: {
                                    normal: {label: {show: true}}
                                },
                                data: zooIndent
                            }
                        ]
                    };
                    zooChart.setOption(zooOption);

                },
                init: function () {
                    vm.getBusinessInfo();
                    vm.queryBusinessChart();
                    vm.queryFeedback();
                    vm.queryRanking();
                    vm.queryTradesZoo();
                }
            })
            ;
        avalon.scan($("#listBusiness")[0], vm);
        vm.init();
    });
});

