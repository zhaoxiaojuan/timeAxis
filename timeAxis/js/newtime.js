function TimePlay(options){
    /*初始化结构*/
    TimeAxis.initDoms(options.startDate,options.endDate);
    /*初始化日期*/
    TimeAxis.initDate();
    BindingEvent.initEvent(options.callback);
}
var timePlayData = {
    timePlayTimer    : null,//动画定时器
    timePlayTranslate : 0,//时间轴位移
    timePlayWidth     : 0,//时间轴长度
    timePlayTimeUnit  : '时',//单位
    timePlayLeft      : $(".timeProgress-box").offset().left,
    timePlayRight     : $(window).width() - $(".timeProgress-box").offset().left - $(".timeProgress-box").width(),
    timePlayDis       :$('.u-time-box li').outerWidth(),
    timePlayDis_hour  : $('.u-time-box li').outerWidth()/24,//小时单位移动距离
    timePlayCurr_x    : 0,//临时记录X轴位移
    timePlayTemp_day  : {},//临时记录时间
    timePlayCurr_day  : {},//进度条时间
    timePlayIndex_hover : 0,//临时索引
    timePlayHover     : 0,//当前索引
    timePlayDelay     : false,//是否延迟
}
var TimeAxis = {
    initDoms:function(start,end){
        var timePlay = this;
        var startYear  = Math.floor(start/10000),
            startMonth = Math.floor((start%10000)/100),
            startDay   = Math.floor(start%100),
            endYear    = Math.floor(end/10000),
            endMonth   = Math.floor((end%10000)/100),
            endDay     = Math.floor(end%100),
            datelist   = '';
        var curr_date = new Date();
        var week=curr_date.getDay();//获取存储当前日期
        var weekday=["周日","周一","周二","周三","周四","周五","周六"];
        while((startDay!=endDay)||(startMonth!=endMonth)||(startYear!=endYear))
        {
            startDay++;
            if(startDay > TimeAxis.monthCount(startMonth)){
                startDay = 1;
                startMonth++;
            }
            if(startMonth>12){
                startMonth = 1;
                startYear++;
            }
            if(week>6){
           	 week = 0;
           }
            datelist+='<li class="every" data-year='+startYear+'><span class="mon">'+startMonth+'</span>/<span class="day">'+startDay+'</span>'+' '+'<span>('+ weekday[week] +'<span>'+'<span>)'+'</span>'+'</li>'
            week++;
        }
        $(".timeProgress-box").find('ul').append(datelist);
        var ulWidth = Math.floor($(".u-time-box").width());
        var liLength = $(".u-time-box").find("li").length;
        var liWidth = (100/liLength).toFixed(8);
        $(".u-time-box").find("li").css({"width":liWidth-0.1+"%"});
        timePlayData.timePlayDis = (ulWidth/liLength).toFixed(8);
        timePlayData.timePlayDis_hour  = parseFloat(timePlayData.timePlayDis /24);
    },
    monthCount: function(month) {
    var timePlay = this;
    var num = 0;
    if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
        num = 31;
    } else if(month == 4 || month == 5 || month == 9 || month == 11 ) {
        num = 30;
    } else if(month == 2) {
        if(TimeAxis.calcLeapYear()) {
            num = 29;
        } else {
            num = 28;
        }
    }
    return num;
},
    initDate:function () {
        var timePlay = this;
        var curr_date = new Date();
        curr_date = new Date(curr_date.getUTCFullYear(), curr_date.getUTCMonth(), curr_date.getUTCDate(), curr_date.getUTCHours(),
        		curr_date.getUTCMinutes(), 0, 0);
        var year  = curr_date.getFullYear();
        var month = curr_date.getMonth()+1;
        var day = curr_date.getDate();
        var hour = curr_date.getHours();
        if(hour % 3 == 1) hour -= 1;
        if(hour % 3 == 2) hour += 1;
        
        var timePlayIndex = null;
        var week=curr_date.getDay();//获取存储当前日期
        var weekday=["周日","周一","周二","周三","周四","周五","周六"];
        month = month.toString().length>1 ? month:'0'+month;
        $(".curr-popup").hide();
        $(".for-animate").show();
        
        
        timePlayData.timePlayCurr_day = {
            "year": year,
            "mon": month,
            "day": day,
            "hour": hour,
        };
        $(".curr-popup").text( /*weekday[week]+ ' '+*/ month + ' - '+' '+day + '  '+hour+":00");
        var initUl = setTimeout(function(){
        	var ulWidth = $(".u-time-box").width();
            var liLength = $(".u-time-box").find("li").length;
            timePlayData.timePlayDis = (ulWidth/liLength).toFixed(8);
            for (var i = 0, len = $('.every').length; i < len; i++) {
                var m = parseInt($('.every:eq('+i+') .mon').text());
                m = m.toString().length>1 ? m:'0'+m;
                var d = parseInt($('.every:eq('+i+') .day').text());
                if(month==m&&day==d){
                    TimeAxis.initDate.timePlayIndex = i
                    timePlayData.timePlayWidth  = timePlayData.timePlayDis * i + (timePlayData.timePlayDis / 24) * hour;
                    $(".u-initialize").css({"left":timePlayData.timePlayWidth});
                    $(".timeProgress-bar").css({"width":(timePlayData.timePlayWidth).toFixed(8)});
                    TimeAxis.progressAni();
                    break;
                }
            }
        },500)
        
        /*clearTimeout(initUl);*/
    },
    /*进度条动画*/
    progressAni:function () {
    	var ulWidth = Math.floor($(".u-time-box").width());
        var liLength = $(".u-time-box").find("li").length;
        timePlayData.timePlayDis = (ulWidth/liLength).toFixed(8);
        var timePlay = this,
            page_width = $('.timeProgress-box').width(),
            con_width = $('.timeProgress-inner').width(),
            page_num = Math.floor(timePlayData.timePlayWidth /page_width),
            left_dis = page_num * page_width;


        if(page_width - timePlayData.timePlayWidth + left_dis < timePlayData.timePlayDis){
            left_dis = left_dis + (page_width/2);
        }

        if(left_dis+page_width>con_width + 40){
            left_dis = $('.timeProgress-inner').width() - page_width + 40;
            $(".prev").addClass('disable');
        }
        if((timePlayData.timePlayWidth - left_dis)<timePlayData.timePlayDis){
            left_dis = left_dis - (page_width/2);
        }
        $('.timeProgress-bar').animate({
            width: timePlayData.timePlayWidth ,
        },100,'linear');
    },
    calcLeapYear:function(year){
    	var leap = false;
        if((year%4)==0&&(year%100)==0){
            if((year%400)==0){
                leap = true;
            }else{
                leap = false;
            }
        }else if((year%4)==0&&(year%100)!=0){
            leap = true;
        }else if((year%4)!=0&&(year%100)!=0){
            leap = false;
        }else{
            leap = false;
        }
        return leap;

    }
}
var BindingEvent = {
	callback: null,
    initEvent:function(callback){
    	BindingEvent.callback = callback; 
    	
        $('.u-time-box').on('mouseover',function(){
            BindingEvent.hoverPopup();
        });
        $('.timeControl').on('click',function(){//时间轴播放暂停
            BindingEvent.play();
        });
        $('.u-time-box').on('click',function(){
            BindingEvent.clickPopup();
        });
    },
    hoverPopup: function () {
       var timePlay = this;
       var ulWidth = Math.floor($(".u-time-box").width());
       var liLength = $(".u-time-box").find("li").length;
       var liWidth = 100/liLength;
       timePlayData.timePlayDis = ulWidth/liLength;
       timePlayData.timePlayDis_hour  = parseFloat(timePlayData.timePlayDis /24)
        $(window).on('mousemove',function(event){
            var e = event||window.event;
            var x = e.clientX;
            var day_index = Math.ceil((x-($(".timeProgress-box").offset().left))/timePlayData.timePlayDis -1);
            timePlayData.timePlayIndex_hover = day_index;

            timePlayData.timePlayTemp_day  = {"year": parseInt($('.every:eq('+day_index+')').attr('data-year')),
                "mon": parseInt($('.every:eq('+day_index+')').find('.mon').text()),
                "day": parseInt($('.every:eq('+day_index+')').find('.day').text()),
               /* "hour": Math.floor((x  - ($(".timeProgress-box").offset().left) ) % (timePlayData.timePlayDis -1) / timePlayData.timePlayDis_hour)*/
                "hour": Math.floor(((x-($(".timeProgress-box").offset().left))-(day_index)*timePlayData.timePlayDis)/ timePlayData.timePlayDis_hour )
            
            }
            timePlayData.timePlayCurr_x    = x + timePlayData.timePlayTranslate - ($(".timeProgress-box").offset().left);
            if(timePlayData.timePlayTimeUnit == '天'){
                var texts = timePlayData.timePlayTemp_day.mon + '月'+ timePlayData.timePlayTemp_day.day + '日';
            }else{
                var texts = timePlayData.timePlayTemp_day.hour+ ":00";
            }
            $(".hover-popup").show().css("left",x - ($(".timeProgress-box").offset().left)-30).text(texts);
        })

        $('.u-time-box').on('mouseleave',function(){
            $(window).off('mousemove');
            $(".hover-popup").hide();
        })
    },
    play: function () {
        var timePlay = this;
        if($('.timeControl').hasClass('play')){
            BindingEvent.startPlay();
        }else{
            BindingEvent.stopPlay();
        };
    },
    startPlay: function () {
        var timePlay = this;
        var ulWidth = Math.floor($(".u-time-box").width());
        var liLength = $(".u-time-box").find("li").length;
        timePlayData.timePlayDis = (ulWidth/liLength).toFixed(8);
        $('.timeControl').toggleClass('play').toggleClass('pause');
        $(".curr-popup").hide();
        $(".curr-popup.for-animate").show();
        TimeAxis.progressAni();
        timePlayData.timePlayTimer = setInterval(function(){
            /*if(timePlayData.timePlayDelay){
                return false;
            }*/
            var temp_date = timePlayData.timePlayCurr_day;
           /* if(BindingEvent.reachEnd()){
                timePlay.halfPageNext();
            }*/
            if(timePlayData.timePlayTimeUnit == "时"){
                var real_width  = $(".timeProgress-bar").width();
                timePlayData.timePlayDis_hour = (ulWidth/liLength)/24;
                timePlayData.timePlayWidth = real_width + timePlayData.timePlayDis_hour;
                
                timePlayData.timePlayCurr_day.hour = timePlayData.timePlayCurr_day.hour + 1;
                if((timePlayData.timePlayCurr_day.hour % 24) == 0){
                	TimeAxis.initDate.timePlayIndex++;
                    timePlayData.timePlayCurr_day = {"year": parseInt($('.every:eq('+TimeAxis.initDate.timePlayIndex+')').attr('data-year')),
                        "mon": parseInt($('.every:eq('+TimeAxis.initDate.timePlayIndex+')').find('.mon').text()),
                        "day": parseInt($('.every:eq('+TimeAxis.initDate.timePlayIndex+')').find('.day').text()),
                        "hour": 0}                    
                    }
	                if(timePlayData.timePlayCurr_day.day == NaN){
	                	BindingEvent.stopPlay();
	                	TimeAxis.initDate();
                }
                var curr_date = new Date();
                var month = curr_date.getMonth()+1;
                timePlayData.timePlayCurr_day.mon=timePlayData.timePlayCurr_day.mon?timePlayData.timePlayCurr_day.mon:month;
                $(".curr-popup").text(timePlayData.timePlayCurr_day.mon +' '+ "-" +timePlayData.timePlayCurr_day.day+' '+ timePlayData.timePlayCurr_day.hour+":00")
            }else{
            	TimeAxis.initDate.timePlayIndex++;
                var real_width  = Math.floor(timePlayData.timePlayWidth / timePlayData.timePlayDis) * timePlayData.timePlayDis;
                timePlayData.timePlayWidth = real_width + parseFloat(timePlayData.timePlayDis);
                timePlayData.timePlayCurr_day = {"year": parseInt($('.every:eq('+TimeAxis.initDate.timePlayIndex+')').attr('data-year')),
                    "mon": parseInt($('.every:eq('+TimeAxis.initDate.timePlayIndex+')').find('.mon').text()),
                    "day": parseInt($('.every:eq('+TimeAxis.initDate.timePlayIndex+')').find('.day').text()),
                    "hour": 0}
                if(timePlay.index < $(".every").length ){
                    $(".curr-popup").text(timePlayData.timePlayCurr_day.mon + '月'+ timePlayData.timePlayCurr_day.day + '日');
                }
            }
            if(parseInt((timePlayData.timePlayWidth).toFixed(8)) > parseInt(($('.timeProgress').width()).toFixed(8)) || parseInt((timePlayData.timePlayWidth).toFixed(8))  == parseInt(($('.timeProgress').width()).toFixed(8))){
                timePlayData.timePlayWidth = $('.timeProgress').width();
                timePlayData.timePlayCurr_day = temp_date;
                BindingEvent.stopPlay();
                TimeAxis.initDate();
            }
            $(".timeProgress-bar").css({'width':timePlayData.timePlayWidth})
            BindingEvent.onAnimateEnd();
        },1000)
    },
   /* reachEnd:function(){
        var timePlay = this;
        var dis_right = $('.timeProgress-box').width() - (timePlay.width - timePlay.translate);
        if(dis_right <= 108){
            return true;
        }else{
            return false;
        }
    },*/
    stopPlay:function () {
        var timePlay = this;
        if($('.timeControl').hasClass('pause')){
            $('.timeControl').toggleClass('play').toggleClass('pause');
        }
        clearInterval(timePlayData.timePlayTimer);
    },
    clickPopup: function () {
        var timePlay = this;
        BindingEvent.stopPlay();
        timePlayData.timePlayTemp_day.mon  = timePlayData.timePlayTemp_day.mon .toString().length>1 ? timePlayData.timePlayTemp_day.mon :'0'+timePlayData.timePlayTemp_day.mon ;
        if(timePlayData.timePlayTimeUnit == '天'){
            var texts = timePlayData.timePlayTemp_day.mon + ' - '+timePlayData.timePlayTemp_day.day+ ' ' +timePlayData.timePlayTemp_day.day + '日';
        }else{
            var texts = timePlayData.timePlayTemp_day.mon +' - '+timePlayData.timePlayTemp_day.day+' ' +timePlayData.timePlayTemp_day.hour + ":00";
        }
        $(".curr-popup").hide().text(texts);
      
        $(".timeProgress-bar").stop().css('width',timePlayData.timePlayCurr_x);
        timePlayData.timePlayWidth = timePlayData.timePlayCurr_x;
        timePlayData.timePlayCurr_day = timePlayData.timePlayTemp_day;
        timePlayData.timePlayIndex = timePlayData.timePlayIndex_hover;
        $(".curr-popup.for-click").show().css('left', timePlayData.timePlayCurr_x - timePlayData.timePlayTranslate - 50)
        $(".hover-popup").hide();
        BindingEvent.clickChangeEnd();
    },
    clickChangeEnd: function () {
        var hour = timePlayData.timePlayCurr_day.hour,//小时
            day  = timePlayData.timePlayCurr_day.day,//日
            mon  = timePlayData.timePlayCurr_day.mon,//月
            year = timePlayData.timePlayCurr_day.year;//年
        var data = year+'/'+mon+'/'+day+' '+ hour + ':00:00';
        var date = new Date(data);
        
        BindingEvent.callback(date);
    },
    onAnimateEnd: function () {
        var hour = timePlayData.timePlayCurr_day.hour,//小时
            day  = timePlayData.timePlayCurr_day.day,//日
            mon  = timePlayData.timePlayCurr_day.mon,//月
            year = timePlayData.timePlayCurr_day.year;//年
        var data = year+'/'+mon+'/'+day+' '+ hour + ':00:00';
        var date = new Date(data);
        
       BindingEvent.callback(date);
    }
}