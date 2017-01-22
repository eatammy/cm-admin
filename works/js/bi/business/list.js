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
                years: [],
                curMonth1: new Date().getMonth() + 1, //用于订单查询
                curMonth: new Date().getMonth() + 1, // 用于地区销量查询
                curYear1: new Date().getFullYear(),//用于订单查询
                curYear: new Date().getFullYear(),// 用于地区销量查询
                totalTrade: 0,      //交易总量
                indent: null,   //订单量
                shop: null,     //新商家
                goods: null,   //新商品
                indentDataInfo: [],     //右边信息栏列表
                hotShop: [],      //热门商店
                hotGoods: [],    //热门商品
                zooIndent: [],   //地区订单
                feedback: [],    //反馈或建议
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
                    var curYear = new Date().getFullYear();
                    if (vm.curYear1 == curYear && vm.curMonth1 > curMonth) {
                        layer.alert("所选月份不能大于当前月份", {icon: 2});
                        return;
                    }
                    $.ajax({
                        url: '/cm/admin/bibusiness/queryBusinessChart',
                        type: 'get',
                        dataType: 'json',
                        data: {year: vm.curYear1, month: vm.curMonth1},
                        success: function (result) {
                            if (isSuccess(result)) {
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
                                            data: result.bizData.chartData.allIndentsCount
                                        },
                                        {
                                            name: '付款数',
                                            type: result.bizData.chartData.allIndentsCount.length <= 15 ? 'bar' : 'line',
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
                    var curMonth = new Date().getMonth() + 1;
                    var curYear = new Date().getFullYear();
                    if (vm.curYear == curYear && vm.curMonth > curMonth) {
                        layer.alert("所选月份不能大于当前月份", {icon: 2});
                        return;
                    }
                    $.ajax({
                        url: '/cm/admin/bibusiness/queryTradesZoo',
                        type: 'get',
                        dataType: 'json',
                        data: {year: vm.curYear, month: vm.curMonth},
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.zooIndent = result.bizData.data;
                                var zooIndent = [];
                                var indent = {name: null, value: null};
                                result.bizData.data.forEach(function (el) {
                                    indent.name = el.name;
                                    indent.value = el.total;
                                    zooIndent.push(indent);
                                    indent = {name: null, value: null};
                                });

                                var zooChart = echarts.init($('#zooMapChart')[0], "macarons");
                                var zooOption = {
                                    tooltip: {
                                        trigger: 'item',
                                        islandFormatter: '{a} < br/>{b} : {c}',
                                        showDelay: 20
                                    },
                                    title: {
                                        text: "销售额分布",
                                        x: "center"
                                    },
                                    dataRange: {
                                        min: 0,
                                        //max: result.bizData.max,
                                        max: 500,
                                        x: 'left',
                                        y: 'bottom',
                                        text: ['高', '低'],           // 文本，默认为数值文本
                                        calculable: true,
                                        show: false
                                    },
                                    series: [
                                        {
                                            name: '销售总量',
                                            type: 'map',
                                            mapType: 'china',
                                            roam: false,
                                            itemStyle: {
                                                normal: {
                                                    // color: ['#1ab394'],
                                                    borderColor: '#fff',
                                                    borderWidth: 1,
                                                    areaStyle: {
                                                        color: '#ccc'//rgba(135,206,250,0.8)
                                                    },
                                                    label: {
                                                        show: false,
                                                        textStyle: {
                                                            color: 'rgba(139,69,19,1)'
                                                        }
                                                    }
                                                },
                                                emphasis: {                 // 也是选中样式
                                                    // color: 各异,
                                                    borderColor: 'rgba(0,0,0,0)',
                                                    borderWidth: 1,
                                                    areaStyle: {
                                                        color: '#DF7783'
                                                    },
                                                    label: {
                                                        show: false,
                                                        textStyle: {
                                                            color: 'rgba(139,69,19,1)'
                                                        }
                                                    }
                                                }
                                            },
                                            data: zooIndent
                                        }
                                    ]
                                };
                                zooChart.setOption(zooOption);

                                //订单
                                var allRegisterPv = echarts.init($('#zooChart')[0], 'macarons');
                                var xAxis = [];
                                var data = [];
                                vm.zooIndent.forEach(function (el) {
                                    xAxis.push(el.name);
                                    data.push(el.value);
                                });
                                var option = {
                                    title: {
                                        text: '省份订单统计',
                                        subtext: vm.curYear + "年-" + vm.curMonth + '月订单数',
                                        x: "center"
                                    },
                                    tooltip: {
                                        trigger: 'axis'
                                    },
                                    toolbox: {
                                        show: true,
                                        feature: {
                                            mark: {show: true},
                                            dataView: {show: true, readOnly: false},
                                            saveAsImage: {show: true}
                                        },
                                        orient: "vertical",
                                        x: "right"

                                    },
                                    calculable: true,
                                    xAxis: [
                                        {
                                            type: 'category',
                                            data: xAxis,
                                            splitLine: {show: false}
                                        }
                                    ],
                                    yAxis: [
                                        {
                                            type: 'value'
                                        }
                                    ],
                                    series: [
                                        {
                                            name: '省份订单数',
                                            type: 'bar',
                                            data: data,
                                            markPoint: {
                                                data: [
                                                    {type: 'max', name: '最大值'},
                                                    {type: 'min', name: '最小值'}
                                                ]
                                            },
                                            markLine: {
                                                data: [
                                                    {type: 'average', name: '平均值'}
                                                ]
                                            }
                                        }
                                    ]
                                };
                                allRegisterPv.setOption(option);
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }
                        }
                    })
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

