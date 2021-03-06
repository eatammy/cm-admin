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
                year: [2015, 2016, 2017],
                curMonth: new Date().getMonth() + 1, //用于注册查询
                curMonth1: new Date().getMonth() + 1, //用于用户访问查询
                curYear: new Date().getFullYear(),
                grossRegister: 0,       //注册总量
                monthRegister: 0,        //月注册量
                weekRegister: 0,         //周注册量
                dayRegister: 0,          //日注册量
                curIndex: 0,      //标签切换
                isDefault: 0,       //用户访问主题，0：按性别，1：按年龄区间
                todayUserPv: {content:'',rate: '', upOrDown: 0},     //今日访问量
                activePV: {content:'',rate: '', upOrDown: 0},     //本月活跃量
                devicePV: '',       //设备统计
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
                                        //max: result.bizData.max,
                                        max: 500,
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
                                };
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
                                            data: result.bizData.data,
                                            smooth: true,
                                            itemStyle: {normal: {areaStyle: {type: 'default'}}},
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

                getStatisticalData: function () {
                    $.ajax({
                        url: '/cm/admin/userFlow/getStatisticalData',
                        type:'get',
                        dataType: 'json',
                        success: function (result) {
                            if(isSuccess(result)){
                                //本日访问量
                                vm.todayUserPv.content = result.bizData.userPV.content;
                                vm.todayUserPv.rate = result.bizData.userPV.rate;
                                vm.todayUserPv.upOrDown = result.bizData.userPV.upOrDown;

                                //本月活跃量
                                vm.activePV.content = result.bizData.activePV.content;
                                vm.activePV.rate = result.bizData.activePV.rate;
                                vm.activePV.upOrDown = result.bizData.activePV.upOrDown;

                                //设备统计
                                vm.devicePV = result.bizData.devicePV.content;
                            }else{
                                layer.alert("暂无数据", {icon: 2});
                            }
                        }
                    })
                },
                getUserCharts: function (type) {
                    var stCurYear = new Date().getFullYear();
                    var stCurMonth = new Date().getMonth() + 1;
                    if (vm.curYear > stCurYear) {
                        layer.alert("所选年限不能超过当前年限", {icon: 2});
                        return;
                    }
                    if (vm.curMonth1 > stCurMonth) {
                        layer.alert("所选月份不能超过当前月份", {icon: 2});
                        return;
                    }

                    $.ajax({
                        url: '/cm/admin/userFlow/' + type + "/getUserCharts",
                        type: 'get',
                        dataType: 'json',
                        data: {year: vm.curYear, month: vm.curMonth1, isDefault: vm.isDefault},
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
                                    if (vm.isDefault == 0) {
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
                                                    data: result.bizData.male,
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
                                                    data: result.bizData.females,
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
                                    } else if (vm.isDefault == 1) {
                                        activePVOption = {
                                            title: {
                                                text: result.bizData.text,
                                                subtext: result.bizData.subtext
                                            },
                                            tooltip: {
                                                trigger: 'axis',
                                                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                                }
                                            },
                                            legend: {
                                                data: ['10-19岁', '20-29岁', '30-39岁', '40-49岁', '50-59岁', '60以上']
                                            },
                                            toolbox: {
                                                show: true,
                                                orient: 'vertical',
                                                x: 'right',
                                                y: 'center',
                                                feature: {
                                                    //mark: {show: true},
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
                                                    data: result.bizData.xAxis
                                                }
                                            ],
                                            yAxis: [
                                                {
                                                    type: 'value'
                                                }
                                            ],
                                            series: [{
                                                name: '10-19岁',
                                                type: 'bar',
                                                data: result.bizData.data[0]
                                            }, {
                                                name: '20-29岁',
                                                type: 'bar',
                                                stack: '广告',
                                                data: result.bizData.data[1]
                                            }, {
                                                name: '30-39岁',
                                                type: 'bar',
                                                stack: '广告',
                                                data: result.bizData.data[2]
                                            }, {
                                                name: '40-49岁',
                                                type: 'bar',
                                                stack: '广告',
                                                data: result.bizData.data[3]
                                            }, {
                                                name: '50-59岁',
                                                type: 'bar',
                                                stack: '广告',
                                                data: result.bizData.data[4]
                                            }, {
                                                name: '60以上',
                                                type: 'bar',
                                                stack: '广告',
                                                data: result.bizData.data[5]
                                            }
                                            ]
                                        }
                                    }
                                    activePV.setOption(activePVOption);
                                } else if (type == 2) {
                                    var devicePV = echarts.init($('#device')[0]);
                                    var devicePVOption = {
                                        title: {
                                            text: result.bizData.text,
                                            subtext: result.bizData.subtext,
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
                                                //mark: {show: true},
                                                dataView: {show: true, readOnly: false},
                                                magicType: {
                                                    show: true,
                                                    type: ['pie', 'funnel'],
                                                    option: {
                                                        funnel: {
                                                            x: '25%',
                                                            width: '50%',
                                                            funnelAlign: 'left'
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
                                                name: '设备类型',
                                                type: 'pie',
                                                radius: '55%',
                                                center: ['50%', '60%'],
                                                data: result.bizData.data
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

                //查询访客信息
                queryUserPV: function () {
                    vm.getUserCharts(0);
                },

                //查询活跃用户信息
                queryActivePV: function () {
                    vm.getUserCharts(1);
                },

                // 查询登入设备信息
                queryDevicePV: function () {
                    vm.getUserCharts(2);
                },
                clear: function () {
                    vm.sex = -1;
                    vm.minAge = 0;
                    vm.maxAge = 0;
                    vm.curMonth1 = new Date().getMonth() + 1;
                    vm.curYear = new Date().getFullYear();
                    vm.isDefault = 0;
                }
                ,
                init: function () {
                    vm.getUserMap();
                    vm.getRegisterInfo();
                    vm.getRegisterCharts();
                    vm.getStatisticalData();
                    vm.getUserCharts(0);

                }
            })
            ;
        avalon.scan($("#listPlatform")[0], vm);
        vm.init();
    });
});

