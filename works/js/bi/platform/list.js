/**
 * Created by simagle on 2016/8/12.
 */
//本页面脚本列表
var scripts = [null];
//加载完毕后执行
ace.load_ajax_scripts(scripts, function () {
    //对需要权限控制的元素进行渲染控制
    $('a[ac-authCode],input[ac-authCode]').authController({moduleUrl: '/cm/admin/bi/platform'});
    //DOM加载完
    avalon.ready(function () {
        var vm = avalon.define({
                $id: "listPlatform",
                sex: -1,
                minAge: 0,
                maxAge: 0,
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
                curMonth: new Date().getMonth() + 1,
                grossRegister: 0,       //注册总量
                monthRegister: 0,        //月注册量
                weekRegister: 0,         //周注册量
                dayRegister: 0,          //日注册量
                curIndex: 0,      //标签切换
                topic: 0,       //用户访问主题，0：按性别，1：按年龄区间
                changeIndex: function (value) {
                    vm.curIndex = value;
                    vm.getUserCharts(value);
                },
                getUserMap: function () {
                    if (vm.minAge < 0 || vm.maxAge < 0) {
                        layer.alert("年龄不能为负数");
                        return;
                    } else if (vm.minAge > vm.maxAge) {
                        layer.alert("最小年龄不能大于最大年龄");
                        return;
                    }
                    $.ajax({
                        url: '/cm/admin/userFlow/getUserMap',
                        type: 'get',
                        data: {
                            sex: vm.sex,
                            minAge: vm.minAge,
                            maxAge: vm.maxAge
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            CMADMIN.openLoading();
                        },
                        complete: function () {
                            CMADMIN.closeLoading();
                        },
                        success: function (result) {
                            if (isSuccess(result)) {
                                var userMap = echarts.init($('#userMap')[0]);
                                option = {
                                    title: {
                                        text: result.bizData.text,
                                        subtext: result.bizData.subtext,
                                        x: 'center'
                                    },
                                    tooltip: {
                                        trigger: 'item',
                                        islandFormatter: '{a} < br/>{b} : {c}',
                                        showDelay: 20
                                    },
                                    dataRange: {
                                        min: 0,
                                        max: result.bizData.max,
                                        x: 'left',
                                        y: 'bottom',
                                        text: ['高', '低'],           // 文本，默认为数值文本
                                        calculable: true
                                    },
                                    toolbox: {
                                        show: true,
                                        orient: 'vertical',
                                        x: 'right',
                                        y: 'center',
                                        feature: {
                                            dataView: {show: true, readOnly: false},
                                            restore: {show: true},
                                            saveAsImage: {show: true}
                                        }
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
                                }
                                userMap.setOption(option);
                            } else {
                                layer.alert(result.msg);
                            }
                        }
                    })
                }
                ,
                queryUserMap: function () {
                    vm.getUserMap();
                }
                ,

                getRegisterInfo: function () {
                    $.ajax({
                        url: "/cm/admin/userFlow/getRegisterInfo",
                        type: 'get',
                        dataType: 'json',
                        success: function (result) {
                            if (isSuccess(result)) {
                                vm.grossRegister = result.bizData.grossRegister;
                                vm.monthRegister = result.bizData.monthRegister;
                                vm.weekRegister = result.bizData.weekRegister;
                                vm.dayRegister = result.bizData.dayRegister;
                            } else {
                                layer.alert(result.msg);
                            }
                        }
                    })
                },
                getRegisterCharts: function () {
                    var stCurMonth = new Date().getMonth() + 1;
                    if (vm.curMonth > stCurMonth) {
                        layer.alert("所选月份不能大于当前月份！");
                        return;
                    }
                    $.ajax({
                        url: '/cm/admin/userFlow/getRegisterCharts?month=' + vm.curMonth,
                        type: 'get',
                        dataType: 'json',
                        success: function (result) {
                            if (isSuccess(result)) {
                                var registerCharts = echarts.init($('#registerCharts')[0]);
                                var option = {
                                    title: {
                                        text: result.bizData.text,
                                        subtext: result.bizData.subtext,
                                        x: 'center'
                                    },
                                    tooltip: {
                                        trigger: 'axis'
                                    },
                                    toolbox: {
                                        show: true,
                                        feature: {
                                            dataView: {show: true, readOnly: false},
                                            magicType: {show: true, type: ['line', 'bar']},
                                            restore: {show: true},
                                            saveAsImage: {show: true}
                                        }
                                    },
                                    calculable: true,
                                    xAxis: [
                                        {
                                            type: 'category',
                                            boundaryGap: false,
                                            data: result.bizData.xAxis
                                        }
                                    ],
                                    yAxis: [
                                        {
                                            type: 'value'
                                        }
                                    ],
                                    series: [
                                        {
                                            name: '每天数据',
                                            type: 'line',
                                            stack: '总量',
                                            data: result.bizData.data
                                        }
                                    ]
                                };
                                registerCharts.setOption(option);
                            } else {
                                //todo,页面应该显示暂无注册统计数据，整个div应该更换为无数据呈现状态
                            }
                        }

                    })
                },
                queryRegisterCharts: function () {
                    vm.getRegisterCharts();
                },
                getUserCharts: function (type) {
                    var stCurYear = new Date().getFullYear();
                    var stCurMonth = new Date().getMonth() + 1;

                    $.ajax({
                        url: '/cm/admin/userFlow/' + type + "/getUserCharts",
                        type: 'get',
                        dataType: 'json',
                        data: {year: stCurYear, month: stCurMonth},
                        success: function (result) {
                            if (isSuccess(result)) {
                                if (type == 0) {
                                    var userPV = echarts.init($('#visitor')[0]);
                                    var userPVOption = {
                                        title: {
                                            text: result.bizData.text,
                                            subtext: result.bizData.subtext
                                        },
                                        tooltip: {
                                            trigger: 'axis'
                                        },

                                        toolbox: {
                                            show: true,
                                            feature: {
                                                dataView: {show: true, readOnly: false},
                                                magicType: {show: true, type: ['line', 'bar']},
                                                restore: {show: true},
                                                saveAsImage: {show: true}
                                            }
                                        },
                                        calculable: true,
                                        xAxis: [
                                            {
                                                type: 'category',
                                                data: result.bizData.xAxis
                                            }
                                        ],
                                        yAxis: [
                                            {
                                                type: 'value'
                                            }
                                        ],
                                        series: [
                                            {
                                                name: '访问量',
                                                type: 'bar',
                                                data: result.bizData.data,
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
                                    userPV.setOption(userPVOption);
                                } else if (type == 1) {
                                    var activePV = echarts.init($('#activeUser')[0]);
                                    var activePVOption = {};
                                    if (vm.topic == 0) {
                                        activePVOption = {
                                            title: {
                                                text: result.bizData.text,
                                                subtext: result.bizData.subtext
                                            },
                                            tooltip: {
                                                trigger: 'axis'
                                            },
                                            legend: {
                                                data: ['男', '女']
                                            },
                                            toolbox: {
                                                show: true,
                                                feature: {
                                                    dataView: {show: true, readOnly: false},
                                                    magicType: {show: true, type: ['line', 'bar']},
                                                    restore: {show: true},
                                                    saveAsImage: {show: true}
                                                }
                                            },
                                            calculable: true,
                                            xAxis: [
                                                {
                                                    type: 'category',
                                                    data: result.bizData.xAxis
                                                }
                                            ],
                                            yAxis: [
                                                {
                                                    type: 'value'
                                                }
                                            ],
                                            series: [
                                                {
                                                    name: '男',
                                                    type: 'line',
                                                    data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
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
                                                },
                                                {
                                                    name: '女',
                                                    type: 'line',
                                                    data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
                                                    markLine: {
                                                        data: [
                                                            {type: 'average', name: '平均值'}
                                                        ]
                                                    }
                                                }
                                            ]
                                        };
                                    } else if (vm.topic == 1) {
                                        activePVOption = {
                                            tooltip: {
                                                trigger: 'axis',
                                                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                                }
                                            },
                                            legend: {
                                                data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
                                            },
                                            toolbox: {
                                                show: true,
                                                orient: 'vertical',
                                                x: 'right',
                                                y: 'center',
                                                feature: {
                                                    mark: {show: true},
                                                    dataView: {show: true, readOnly: false},
                                                    magicType: {show: true, type: ['stack', 'tiled']},
                                                    restore: {show: true},
                                                    saveAsImage: {show: true}
                                                }
                                            },
                                            calculable: true,
                                            xAxis: [
                                                {
                                                    type: 'category',
                                                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                                                }
                                            ],
                                            yAxis: [
                                                {
                                                    type: 'value'
                                                }
                                            ],
                                            series: [
                                                {
                                                    name: '直接访问',
                                                    type: 'bar',
                                                    data: [320, 332, 301, 334, 390, 330, 320]
                                                },
                                                {
                                                    name: '邮件营销',
                                                    type: 'bar',
                                                    stack: '广告',
                                                    data: [120, 132, 101, 134, 90, 230, 210]
                                                },
                                                {
                                                    name: '联盟广告',
                                                    type: 'bar',
                                                    stack: '广告',
                                                    data: [220, 182, 191, 234, 290, 330, 310]
                                                },
                                                {
                                                    name: '视频广告',
                                                    type: 'bar',
                                                    stack: '广告',
                                                    data: [150, 232, 201, 154, 190, 330, 410]
                                                }
                                            ]
                                        }
                                    }
                                    activePV.setOption(activePVOption);
                                } else if (type == 2) {
                                    var devicePV = echarts.init($('#device')[0]);
                                    var devicePVOption = {
                                        title: {
                                            text: '某站点用户访问来源',
                                            subtext: '纯属虚构',
                                            x: 'center'
                                        },
                                        tooltip: {
                                            trigger: 'item',
                                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                                        },
                                        legend: {
                                            orient: 'vertical',
                                            x: 'left',
                                            data: ['电脑', '手机', '平板']
                                        },
                                        toolbox: {
                                            show: true,
                                            feature: {
                                                mark: {show: true},
                                                dataView: {show: true, readOnly: false},
                                                magicType: {
                                                    show: true,
                                                    type: ['pie', 'funnel'],
                                                    option: {
                                                        funnel: {
                                                            x: '25%',
                                                            width: '50%',
                                                            funnelAlign: 'left',
                                                            max: 1548
                                                        }
                                                    }
                                                },
                                                restore: {show: true},
                                                saveAsImage: {show: true}
                                            }
                                        },
                                        calculable: true,
                                        series: [
                                            {
                                                name: '访问来源',
                                                type: 'pie',
                                                radius: '55%',
                                                center: ['50%', '60%'],
                                                data: [
                                                    {value: 335, name: '直接访问'},
                                                    {value: 310, name: '邮件营销'},
                                                    {value: 234, name: '联盟广告'},
                                                    {value: 135, name: '视频广告'},
                                                    {value: 1548, name: '搜索引擎'}
                                                ]
                                            }
                                        ]
                                    };
                                    devicePV.setOption(devicePVOption);
                                }
                            } else {
                                layer.alert(result.msg, {icon: 2});
                            }
                        }
                    })
                },

                clear: function () {
                    vm.sex = -1;
                    vm.minAge = 0;
                    vm.maxAge = 0;
                }
                ,
                init: function () {
                    vm.getUserMap();
                    vm.getRegisterInfo();
                    vm.getRegisterCharts();
                    vm.getUserCharts(0);
                }
            })
            ;
        avalon.scan($("#listPlatform")[0], vm);
        vm.init();
    });
});

