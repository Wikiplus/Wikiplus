/**
* Wikiplus
* Author:+Eridanus Sora/@妹空酱
* https://github.com/Last-Order/Moesound/tree/master/WikiPlus
*/


/**
* 依赖组件 jQuery.ajaxq
*/
// AjaxQ jQuery Plugin
// Copyright (c) 2012 Foliotek Inc.
// MIT License
// https://github.com/Foliotek/ajaxq

(function($) {

    var queues = {};

    // Register an $.ajaxq function, which follows the $.ajax interface, but allows a queue name which will force only one request per queue to fire.
    $.ajaxq = function(qname, opts) {

        if (typeof opts === "undefined") {
            throw ("AjaxQ: queue name is not provided");
        }

        // Will return a Deferred promise object extended with success/error/callback, so that this function matches the interface of $.ajax
        var deferred = $.Deferred(),
            promise = deferred.promise();

        promise.success = promise.done;
        promise.error = promise.fail;
        promise.complete = promise.always;

        // Create a deep copy of the arguments, and enqueue this request.
        var clonedOptions = $.extend(true, {}, opts);
        enqueue(function() {

            // Send off the ajax request now that the item has been removed from the queue
            var jqXHR = $.ajax.apply(window, [clonedOptions]).always(dequeue);

            // Notify the returned deferred object with the correct context when the jqXHR is done or fails
            // Note that 'always' will automatically be fired once one of these are called: http://api.jquery.com/category/deferred-object/.
            jqXHR.done(function() {
                deferred.resolve.apply(this, arguments);
            });
            jqXHR.fail(function() {
                deferred.reject.apply(this, arguments);
            });
        });

        return promise;

        // If there is no queue, create an empty one and instantly process this item.
        // Otherwise, just add this item onto it for later processing.
        function enqueue(cb) {
            if (!queues[qname]) {
                queues[qname] = [];
                cb();
            }
            else {
                queues[qname].push(cb);
            }
        }

        // Remove the next callback from the queue and fire it off.
        // If the queue was empty (this was the last item), delete it from memory so the next one can be instantly processed.
        function dequeue() {
            if (!queues[qname]) {
                return;
            }
            var nextCallback = queues[qname].shift();
            if (nextCallback) {
                nextCallback();
            }
            else {
                delete queues[qname];
            }
        }
    };

    // Register a $.postq and $.getq method to provide shortcuts for $.get and $.post
    // Copied from jQuery source to make sure the functions share the same defaults as $.get and $.post.
    $.each( [ "getq", "postq" ], function( i, method ) {
        $[ method ] = function( qname, url, data, callback, type ) {

            if ( $.isFunction( data ) ) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return $.ajaxq(qname, {
                type: method === "postq" ? "post" : "get",
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        };
    });

    var isQueueRunning = function(qname) {
        return queues.hasOwnProperty(qname);
    };

    var isAnyQueueRunning = function() {
        for (var i in queues) {
            if (isQueueRunning(i)) return true;
        }
        return false;
    };

    $.ajaxq.isRunning = function(qname) {
        if (qname) return isQueueRunning(qname);
        else return isAnyQueueRunning();
    };
    
    $.ajaxq.clear = function(qname) {
        if (!qname) {
            for (var i in queues) {
                if (queues.hasOwnProperty(i)) {
                    delete queues[i];
                }
            }
        }
        else {
            if (queues[qname]) {
                delete queues[qname];
            }
        }
    };
    
})(jQuery);


/** 
* 依赖组件
* jQuery.cookie
*/
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch(e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write

        if (arguments.length > 1 && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };

}));

/** 
* 主程序开始
*/

function Wikiplus(WikiplusData){
    var self = this;
    //此处定义局部变量self
    //self可以在class Wikiplus中的任何一个function中调用
    //self实际指向class
    this.Version = '1.5.4';
    this.LastestUpdateDescription = '增加跳到编辑框的快捷按钮';
    this.isBeta = true;
    this.ValidNamespaces = [0,1,2,3,10,12];
    this.APILocation = 'http://' + location.host + wgScriptPath + '/api.php';
    this.PreloadData = {};
    this.DefaultSettings = {
        '设置名' : '设置值',
        '设置参考' : 'http://zh.moegirl.org/User:%E5%A6%B9%E7%A9%BA%E9%85%B1/Wikiplus/%E8%AE%BE%E7%BD%AE%E8%AF%B4%E6%98%8E'
    };
    /**
    * 模块:打印输出
    * 输入:目标对象、输出文本、输出类型、回调函数
    * 输出:无
    */
    this.OutputPrinter = function(object,text,type,callback){
        var callback = arguments[3]?arguments[3]:function(){};
        switch (type){
            case 'fine':
                object.append('<div class="output-fine">' + text + '</div>');
                callback(object.find("div:last"));
                break;
            case 'warning':
                object.append('<div class="output-warning">' + text + '</div>');
                callback(object.find("div:last"));
                break;
            case 'error':
                object.append('<div class="output-error">致命错误:' + text + '</div>');
                callback(object.find("div:last"));
                break;
            default:
                return false;
        }
    };
    /**
    * 模块:首次使用生成Cookie
    * 输入:无
    * 输出:无
    */
    this.Install = function(callback){
        var callback = arguments[0]?arguments[0]:function(){};
        var worldend = new Date(253402271999000);//Cookie有效期到一个近乎世界末日的时间
        $.cookie('Wikiplus_StartUseAt',(new Date()).valueOf(),{expires : worldend , path: '/'});
        $.cookie('Wikiplus_SrartEditCount',wgUserEditCount,{expires: worldend , path: '/'});
        callback();
    }
    /**
    * 模块:获取页面基础信息
    * 输入:回调函数
    * 输出到回调函数:Object->[EditToken,TimeStamp]
    */
    this.getBasicInfomation = function(callback){
        if (!(wgEnableAPI&&wgEnableWriteAPI)){
            throw '本wiki未开启API或API不允许写入';
        }
        console.time('获取基础信息用时');
        $.ajaxq("MainQueue",{
            type:"GET",
            dataType:"json",
            url:this.APILocation + '?action=query&prop=revisions|info&titles=' + wgPageName + '&rvprop=timestamp&intoken=edit&format=json',
            success:function(data){
                if (typeof data.query.pages != "undefined"){
                    for (key in data.query.pages){
                        if (typeof data.query.pages[key].edittoken != "undefined"){
                            var BasicInfomation = {};
                            try{
                                BasicInfomation.EditToken = data.query.pages[key].edittoken;
                                BasicInfomation.TimeStamp = data.query.pages[key].revisions[0].timestamp;
                            }
                            catch (e){
                                console.log('获取基础信息失败!');
                                return false;
                            }
                            console.timeEnd('获取基础信息用时');
                            callback(BasicInfomation);
                        };
                    }
                }
                else{
                    self.OutputPrinter(self.OutputBox,"页面基础信息获取失败",'error');
                    return false;
                }
            },
            error:function(e){
                self.OutputPrinter(self.OutputBox,"页面基础信息获取失败",'error');
                return false;
            }
        });
    };
    /**
    * 模块:编辑页面
    * 输入:页面名、内容、编辑摘要、段落编号(0为编辑整页)、回调函数
    * 输出:输出到self.OutputBox
    * 注:调用前需要先self.init();
    */
    this.editPage = function(pagename,content,summary,section,callback){
        var callback = arguments[4]?arguments[4]:function(){};
        var EditToken = this.EditToken;
        var TimeStamp = this.TimeStamp;
        var data = {'action':'edit','format':'json','title':pagename.replace(/ /ig,"_"),'text':content,'summary':summary,'token':EditToken,'basetimestamp':TimeStamp};
        if (section !== 0){
            data.section = section;
        }
        $.ajaxq("MainQueue",{
            type:"POST",
            dataType:"json",
            data:data,
            url:this.APILocation,
            success:function(data){
                if (typeof data.edit.code != "undefined"){
                    self.OutputPrinter(self.OutputBox,"编辑页面失败 " +  data.edit.code + ':' + data.edit.info,'error');
                    if (data.edit.info.match(/AbuseFilter/)!==null){
                        self.OutputPrinter(self.OutputBox,"触发防滥用过滤器 请按上一行所提示信息进行处理 并再次提交编辑",'error');
                        $("button#wikiplus-quickedit-submit,textarea#quickedit").removeAttr('disabled');
                        return false;
                    }
                }
                if (typeof data.error == "undefined"){
                    if (data.edit.result == "Success"){
                        self.OutputPrinter(self.OutputBox,"编辑页面成功",'fine');
                        callback();
                    }
                    else{
                        self.OutputPrinter(self.OutputBox,"编辑页面失败:未知原因",'error');
                        return false;
                    }
                }
                else{
                    if (data.error.code = 'editconflict'){
                        self.OutputPrinter(self.OutputBox,'发生编辑冲突！请不要慌张，请复制下方编辑框中的内容，然后刷新页面重新进行编辑！','error');
                        $('textarea').removeAttr('disabled');
                    }
                    self.OutputPrinter(self.OutputBox,'编辑页面失败:' + data.error.code + ':' + data.error.info,'error');
                    return false;
                }
            },
            error:function(e){
                self.OutputPrinter(self.OutputBox,'编辑页面失败:网络原因','error');
            }
        })
    };
    /**
    * 模块:编辑页面分类
    * 输入:新的分类(Array)、可选的回调函数
    * 输出:
    */
    this.editCategories = function(categories,callback){
        var callback = arguments[1]?arguments[1]:function(){};
        if (typeof this.PreloadData.section0 != "undefined"){
            var content = this.PreloadData.section0;
            content = content.replace(new RegExp('\\[\\[分类\\:.+?\\]\\]','ig'),"");
            content = content.replace(new RegExp('\\[\\[category\\:.+?\\]\\]','ig'),"");
            var newcategories = "";
            for (i=0;i<categories.length;i++){
                newcategories += "[[分类:" + categories[i] + ']]';
            }
            content += newcategories;
            self.OutputPrinter(self.OutputBox,'原有分类:' + self.wgCategoriesBackup,'fine');
            self.OutputPrinter(self.OutputBox,'修改后分类:' + categories,'fine');
            self.OutputPrinter(self.OutputBox,'提交中..','fine');
            self.editPage(wgPageName,content,'//修改分类 via Wikiplus',0,callback);
        }
        else{
            self.OutputPrinter(self.OutputBox,'初始化未正确完成 请尝试页面','error');
            return false;
        }
    }
    /**
    * 模块:获取Wiki代码的解析结果
    * 输入:Wikitext,回调函数
    * 输出:输出到回调函数:String
    */
    this.getPagePreview = function(wikitext,callback){
        var callback = arguments[1]?arguments[1]:function(){};
        $.ajaxq("MainQueue",{
            type:"POST",
            dataType:"json",
            data:{'format':'json','action':'parse','text':wikitext,'title':wgPageName.replace(/ /ig,"_"),'pst':true},
            url:this.APILocation,
            success:function(data){
                if (typeof data.parse.text != "undefined"){
                    $.each(data.parse.text,function(index,item){
                        if (index=="*"){
                            callback(item);
                        }
                    })
                }
                else{
                    self.OutputPrinter(self.OutputBox,"预览页面失败",'error');
                }
            },
            error:function(){
                self.OutputPrinter(self.OutputBox,"预览页面失败:网络原因",'error');
            }
        })
    },
    /**
    * 模块:获取页面的Wikitext
    * 输入:页面名、段落编号(0为整页)、修订版本号、回调函数
    * 输出:输出到回调函数:String
    */
    this.getPageWikitext = function(pagename,section,revision,callback){
        var callback = arguments[3]?arguments[3]:function(){};
        var url = location.origin + wgScriptPath + '/index.php?title=' + encodeURI(pagename) + '&oldid=' + revision + '&action=raw';
        if (section !== 0){
            url += '&section=' + section;
        }
        $.ajaxq("MainQueue",{
            type:"GET",
            dataType:"text",
            url:url,
            success:function(data){
                callback(data);
            }
        })
    },
    /**
    * 模块:预读取页面
    * 输入:段落编号(0为整页)、回调函数
    * 输出:无
    */
    this.preloadPage = function(section,callback){
        var isPreloadExist = eval('this.PreloadData.section' + section);
        if (typeof isPreloadExist != "undefined"){
            console.log('段落' + section + '已预读取，跳过');
            return false;
        }
        else{
            this.getPageWikitext(wgPageName,section,wgRevisionId,function(data){
                try{
                    eval('self.PreloadData.section' + section + '=data');
                    console.log('完成段落' + section + '的预读取');
                    callback();
                } catch(e) {};
            });
        }
    };
    /**
    * 模块:绑定快速编辑相关事件 第一部分 
    * 主要负责载入编辑界面 显示页面的Wikitext
    * 输入:段落编号(0为整页)、默认编辑摘要、回调函数
    * 输出:无
    */
    this.initQuickEditStepOne = function(section,summary,callback){
        var callback = arguments[2]?arguments[2]:function(){};
        var sectionNumber = section!=0?section.data('section'):0;
        var sectionName = section!=0?section.data('sectionName'):"";
        var section = {
            'sectionName' : sectionName || wgPageName,
            'sectionNumber' : sectionNumber || "0"
        }
        //var section = section?section:{};
        $('body').animate({scrollTop:0},200);
        var isPreloadExist = eval('this.PreloadData.section' + sectionNumber);
        if (typeof isPreloadExist != "undefined"){
            this.OutputPrinter(this.OutputBox,"本次编辑触发预读取，读取用时0ms",'fine',function(object){
                setTimeout(function(){
                    object.fadeOut('fast');
                },3000);
            });
            $("#mw-content-text").html('<div id="wikiplus-quickedit-back" class="wikiplus-btn">返回</div><div id="wikiplus-quickedit-jump" class="wikiplus-btn"><a href="#quickedit">到编辑框</a></div><div class="clear" /><hr><div id="wikiplus-quickedit-preview-ouput"></div><textarea id="quickedit"></textarea><input id="wikiplus-quickedit-summary-input" placeholder="编辑摘要"></input><button id="wikiplus-quickedit-submit">提交(Ctrl+Enter)</button><button id="wikiplus-quickedit-preview-submit">预览</button>');
            $("textarea#quickedit").val(eval('this.PreloadData.section' + sectionNumber));
            $("input#wikiplus-quickedit-summary-input").val(self.getSetting('defaultSummary',section) || summary);
            this.initQuickEditStepTwo(sectionNumber);
        }
        else{
            console.time('加载用时')
            this.OutputPrinter(this.OutputBox,"加载中..",'fine',function(object){
                setTimeout(function(){
                    object.fadeOut('fast');
                },3000);
            });
            this.getPageWikitext(wgPageName,sectionNumber,wgRevisionId,function(data){
                console.timeEnd('加载用时');
                $("#mw-content-text").html('<div id="wikiplus-quickedit-back">返回</div><div id="wikiplus-quickedit-preview-ouput"></div><textarea id="quickedit"></textarea><input id="wikiplus-quickedit-summary-input" placeholder="编辑摘要"></input><button id="wikiplus-quickedit-submit">提交(Ctrl+Enter)</button><button id="wikiplus-quickedit-preview-submit">预览</button>');
                $("textarea#quickedit").val(data);
                $("input#wikiplus-quickedit-summary-input").val(self.getSetting('defaultSummary',section) || summary);
                self.initQuickEditStepTwo(sectionNumber);
            })
        }

    };
    /**
    * 模块:绑定快速编辑相关事件 第二部分
    * 主要负责绑定
    * 输入:段落编号、可选的回调函数
    * 输出:无
    */
    this.initQuickEditStepTwo = function(section,callback){
        var callback = arguments[1]?arguments[1]:function(){};
        $("button#wikiplus-quickedit-submit").click(function(){
            $('body').animate({scrollTop:0},200);
            var content = $("textarea#quickedit").val();
            var summary = $("input#wikiplus-quickedit-summary-input").val();
            self.OutputPrinter(self.OutputBox,'正在提交...','fine');
            $("textarea#quickedit,button#wikiplus-quickedit-submit,button#wikiplus-quickedit-preview-submit,input#wikiplus-quickedit-summary-input").attr('disabled','disabled');
            self.editPage(wgPageName,content,summary,section,function(){
                location.reload();
            })
        });
        $("input#wikiplus-quickedit-summary-input,textarea#quickedit").keypress(function(e){
            if (e.ctrlKey && e.which == 13 || e.which ==10){
                $("button#wikiplus-quickedit-submit").trigger('click');
            }
        });
        $("button#wikiplus-quickedit-preview-submit").click(function(){
            $('body').animate({scrollTop:0},200);
            $(this).attr('disabled','disabled');
            self.OutputPrinter(self.OutputBox,'加载中...','fine',function(object){
                setTimeout(function(){
                    object.fadeOut('fast');
                },3000);
            })
            var content = $("textarea#quickedit").val();
            self.getPagePreview(content,function(content){
                $("div#wikiplus-quickedit-preview-ouput").html(content);
                $("button#wikiplus-quickedit-preview-submit").removeAttr('disabled');
                self.OutputPrinter(self.OutputBox,'请收下您的预览~','fine',function(object){
                    setTimeout(function(){
                        object.fadeOut('fast');
                    },3000);
                })
            })
        });
        $("#wikiplus-quickedit-back").click(function(){

            $("#mw-content-text").html(self.WikiContentBackup);
            self.displayQuickEditInterface();
        })
    }
    /**
    * 模块:加载快速编辑界面
    * 输入:回调函数
    * 输出:无
    */
    this.displayQuickEditInterface = function(callback){
        var callback = arguments[0]?arguments[0]:function(){};
        $(".mw-editsection").each(function(){
            $(this).append('<span>[</span><a href="javascript:void(0)" class="quickedit-section">快速编辑</a><span>]</span>');
        });
        $(".quickedit-section").each(function(i){
            $(this).unbind();
            var section = $(this).parent().find(".mw-editsection-bracket:first").next().attr('href').match(/&section\=(\d+)/)[1];
            $(this).data('section',section);//将每个快速编辑按钮对应的段落编号用data的方式存储在自身
            $(this).data('sectionName',$(this).parent().prev().text());
            $(this).click(function(i){
                self.initQuickEditStepOne($(this),"/*" + $(this).data('sectionName') + '*/ //快速编辑 via Wikiplus');
            })
        });
        if ($("#wikiplus-quickedit-button-top").length>0){
            //已有顶部按钮
        }
        else{
            $("#ca-edit").before('<li id="ca-edit" class="wikiplus-quickedit-button-top"><span id="wikiplus-quickedit-button-top"><a href="javascript:void(0)" title="快速编辑~" id="wikiplus-quickedit-page">快速编辑</a></span></li>');
        }
        $("#wikiplus-quickedit-page").unbind();
        $("#wikiplus-quickedit-page").click(function(){
            self.initQuickEditStepOne(0,"//快速编辑 via Wikiplus");
        })
    }
    /**
    * 模块:加载分类编辑 第一部分
    * 输出当前分类
    * 输入:无
    * 输出:无
    */
    this.initCategoriesManage = function(){
        if (typeof this.wgCategories != "undefined" && this.wgCategories.length != 0){
            var manager = '<span class="wikiplus-categories">当前页面含有的非自动分类:';
            for (i=0;i<this.wgCategories.length;i++){
                manager += '<span class="wikiplus-category">' + this.wgCategories[i] + '</span><a href="javascript:void(0)" class="wikiplus-category-remove">(-)</a> ';
            }
            manager += '</span> <a href="javascript:void(0)" class="wikiplus-category-add">(+)</a>';
            this.OutputPrinter(this.OutputBox,manager,'fine');
            $(".wikiplus-category").each(function(i){
                $(this).data('status','existed');//将原有分类为原有的。
            });
            self.OutputPrinter(self.OutputBox,'<button id="wikiplus-submitcategorychanges">提交分类修改</input>','fine',function(object){
                object.css('display','none');
            });
            self.bindCategoriesManageEvent();
        }
    }
    /**
    * 模块:绑定分类编辑相关事件
    * 输入:无
    * 输出:无
    */
    this.bindCategoriesManageEvent = function(){
        $(".wikiplus-categories").children().each(function(i){
            $(this).unbind();
        })
        var ChangesSubmitter = $("button#wikiplus-submitcategorychanges");
        ChangesSubmitter.unbind();
        //移除分类
        $(".wikiplus-category-remove").each(function(i){
            $(this).click(function(){
                var category = $(this).prev();
                category.data('status','removed');
                category.css({'color':'grey','text-decoration':'line-through'});
                self.renewCategories();
                category.unbind('click');
                $(this).remove();
                ChangesSubmitter.parent().fadeIn('fast');
            })
        });
        //添加新分类
        $(".wikiplus-category-add").click(function(){
            $(this).unbind('click');
            $(this).after('<input id="wikiplus-category-add-input" placeholder="请输入添加的分类名 多个以空格分隔" style="width:300px;"></input><button id="wikiplus-category-add-apply">应用</button>');
            $(this).remove();
            $("#wikiplus-category-add-apply").click(function(){
                var categoreis = $("#wikiplus-category-add-input").val().split(" ");
                var list = "";
                if (categoreis.length>0){
                    for (i=0;i<categoreis.length;i++){
                        if (!($.inArray(categoreis[i],self.wgCategories)!=-1)){
                            var category = categoreis[i];
                            list += '<span class="wikiplus-category" data-status="added">' + category + '</span><a href="javascript:void(0)" class="wikiplus-category-remove">(-)</a> ';
                            self.wgCategories.push(category);
                        }
                        else{
                            continue;
                        }
                    }
                    ChangesSubmitter.parent().fadeIn('fast');
                }
                else{
                    self.OutputPrinter(self.OutputBox,'空输入..干什么呀..','warning',function(object){
                        setTimeout(function(){
                            object.fadeOut('fast');
                        },3000);
                    })
                }
                list += '<a href="javascript:void(0)" class="wikiplus-category-add">(+)</a>';
                $(".wikiplus-categories").append(list);
                $("#wikiplus-category-add-input,#wikiplus-category-add-apply").remove();
                self.renewCategories();
                self.bindCategoriesManageEvent();
            })
        })
        //修改现有分类
        $(".wikiplus-category").each(function(i){
            $(this).click(function(){
                var oldcategory = $(this).text();
                var oldcategoryobj = $(this);
                $(this).data('status','removed');
                $(this).after('<input id="wikiplus-category-edit-input" placeholder="修改为什么呢"></input><button id="wikiplus-category-edit-apply">应用更改</button>');
                $(this).hide();
                $("#wikiplus-category-edit-apply").click(function(){
                    var newcategory = $(this).prev().val();
                    if (newcategory == oldcategory){
                        oldcategoryobj.data('status','existed');
                        oldcategoryobj.fadeIn('fast');
                        $(this).prev().remove();
                        $(this).remove();
                    }
                    else{
                        if ($.inArray(newcategory,self.wgCategories)!=-1){
                            oldcategoryobj.remove();
                            $(this).prev().remove();
                            $(this).remove();
                            self.renewCategories();
                        }
                        else{
                            oldcategoryobj.text(newcategory);
                            oldcategoryobj.data('status','edited')
                            oldcategoryobj.fadeIn('fast');
                            $(this).prev().remove();
                            $(this).remove();
                            ChangesSubmitter.parent().fadeIn('fast');
                            self.renewCategories();
                        }
                    }
                })
            })
        });
        //提交分类编辑
        ChangesSubmitter.click(function(){
            self.renewCategories();
            $(this).fadeOut('fast');
            self.editCategories(self.wgCategories,function(){
                self.OutputPrinter(self.OutputBox,'修改完毕!','fine');
                location.reload();
            })
        })
    }
    /**
    * 模块:更新分类列表
    * 输入:无
    * 输出:无
    */
    this.renewCategories = function(){
        self.wgCategories = [];
        $(".wikiplus-categories").find(".wikiplus-category").each(function(i){
            var status = $(this).data('status');
            if (status != "removed"){
                self.wgCategories.push($(this).text());
            }
        })
        console.log('现在的分类列表:'+self.wgCategories);
    }
    //各个基础功能模块 开始
    /**
    * 模块:快速创建重定向页
    */
    this.createRedirectPage = function(){
        if ($("#wikiplus-function").length>0){
            $("#wikiplus-function").append('<li id="wikiplus-function-CRP">创建重定向页</li>');
            $("#wikiplus-function-CRP").click(function(){
                $("#wikiplus-function").children().fadeOut('fast',function(){
                    $("#wikiplus-function").children().remove();
                    $("#wikiplus-function").append('<input id="wikiplus-function-CRP-input" placeholder="将哪个页面重定向至' + wgPageName + '?"></input><button id="wikiplus-function-CRP-submit">提交(Ctrl+Enter)</button>');
                    $("#wikiplus-function-CRP-submit").click(function(){
                        if ($("#wikiplus-function-CRP-input").val() != ""){
                            var RedirectPageName = $("#wikiplus-function-CRP-input").val();
                            self.OutputPrinter(self.OutputBox,'将' + RedirectPageName + '重定向至' + wgPageName + '...','fine');
                            self.editPage(RedirectPageName,'#重定向 [[' + wgPageName + ']]','//将' + RedirectPageName + '重定向至' + wgPageName + ' via Wikiplus',0,function(){
                                self.OutputPrinter(self.OutputBox,'创建重定向完毕','fine');
                                location.href = 'http://' + location.host + '/' + wgScriptPath + 'index.php?title=' + RedirectPageName;
                            })
                        }
                    });
                    $("#wikiplus-function-CRP-input").keypress(function(e){
                        if (e.ctrlKey && e.which == 13 || e.which ==10){
                            $("#wikiplus-function-CRP-submit").trigger('click');
                        }
                    })
                })
            })
        }
        else{
            self.OutputPrinter(self.OutputBox,'不能为空哦','warning',function(object){
                setTimeout(function(){
                    object.fadeOut('fast');
                },3000);
            });
        }
    };
    /**
    * 编辑设置
    */
    this.editSettings = function(){
        if ($("#wikiplus-function").length>0){
            $("#wikiplus-function").append('<li id="wikiplus-function-settings">设置</li>');
            $("#wikiplus-function-settings").click(function(){
                $("#wikiplus-function").children().fadeOut('fast',function(){
                    $("#wikiplus-function").children().remove();
                    $("#wikiplus-function").append('<li id="wikiplus-function-RS" style="display:none;">重置统计数据</li>');
                    $("#wikiplus-function").append('<li id="wikiplus-function-ESF" style="display:none;">配置设置文件</li>');
                    //
                    $("#wikiplus-function-RS").fadeIn('fast',function(){
                        $(this).click(function(){
                            $(this).unbind();
                            $("#wikiplus-function").children().fadeOut('fast',function(){
                                $("#wikiplus-function").children().remove();
                                $("#wikiplus-function").append('<button id="wikiplus-function-RS-comfirm">确认</button>');
                                $("#wikiplus-function-RS-comfirm").click(function(){
                                    $(this).attr('disabled','disabled');
                                    $.removeCookie("Wikiplus_StartUseAt");
                                    $.removeCookie("Wikiplus_SrartEditCount");
                                    self.Install(function(){
                                        location.reload();
                                    })
                                })
                            })
                        })
                    });
                    $("#wikiplus-function-ESF").fadeIn('fast',function(){
                        $(this).click(function(){
                            $(this).unbind();
                            $("#wikiplus-function").append(
                                $("<textarea></textarea>").css({'position':'relative','width':'80%','height':'400px','margin-top':'20px'})
                                                          .val($.cookie('Wikiplus_Settings'))
                                                          .attr('id','wikiplus-function-ESF-input')
                            )
                            $("#wikiplus-function-ESF-input").after('<br><button id="wikiplus-function-ESF-apply">提交(Ctrl+Enter)</button>');
                            $("#wikiplus-function-ESF-apply").click(function(){
                                $(this).unbind();
                                var settings = $("#wikiplus-function-ESF-input").val();
                                $.cookie('Wikiplus_Settings',settings,{'raw' : true , 'expires' : new Date(253402271999000) , 'path' : '/'});
                                self.OutputPrinter(self.OutputBox,'修改设置完毕','fine');
                                $("#wikiplus-function").children().fadeOut('fast',function(){
                                    location.reload();
                                })
                            });
                            $("#wikiplus-function-ESF-input").keypress(function(e){
                                if (e.ctrlKey && e.which == 13 || e.which ==10){
                                    $('#wikiplus-function-ESF-apply').trigger('click');
                                }
                            })
                        })
                    })
                })
            })
        }
    }
    /**
    * 获取设置值
    * 输入:键名
    * 存在 输出值 不存在 输出undefined
    */
    this.getSetting = function(key,object){
        var w = object;
        var settings = $.parseJSON($.cookie('Wikiplus_Settings'));
        try{
            var _setting = new Function('return ' + settings[key]);
            if (typeof _setting == 'function'){
                try{
                    if (_setting()(w) === true){
                        return undefined
                    }
                    else{
                        return _setting()(w) || settings[key];
                    }
                }
                catch (e){
                    return settings[key];
                }
            }
            else{
                return settings[key];
            }
        }
        catch (e){
            try{
                return settings[key];
            }
            catch (e){
                return undefined;
            }
        }
    }
    /**
    * 模块:预读取
    */
    this.bindPreloadEvents = function(){
        $("#toc").children("ul").find("a").each(function(i){
            $(this).mouseover(function(){
                $(this).unbind('mouseover');
                self.preloadPage(i+1,function(){});
            });
        }); 
    }
    //各个基础功能模块 结束
    /**
    * 模块:初始化
    * 输入:无
    * 输出:无
    */
    this.init = function(){
        console.log('Wikiplus正努力加载');
        //获取页面基本信息并存储
        this.getBasicInfomation(function(BasicInfomation){
            try{
                self.EditToken = BasicInfomation.EditToken;
                self.TimeStamp = BasicInfomation.TimeStamp;
                self.WikiContentBackup = $("#mw-content-text").html();
            } catch(e) {
                //如果获取不到Token或Timestamp就终止
                console.log('Wikiplus初始化失败');
                return false;
            };
            $("head").append("<link>");
            var css = $("head").children(":last");
            css.attr({
                rel: "stylesheet",
                type: "text/css",
                href: "http://www.moesound.org/css/wikiplus.new.css"
            });
            if (wgPageName!=wgMainPageTitle&&($.inArray(wgNamespaceNumber, this.namespaces)!='-1'||wgIsArticle)){
                if (wgAction == 'view'){
                    $("body").find(".firstHeading").after('<div class="wikiplus-output"></div><div id="wikiplus"><div id="wikiplus-main-button">W+</div><div id="wikiplus-function"></div><div style="clear:both;"></div></div>');
                    self.OutputBox = $(".wikiplus-output");
                }
            }
            else{
                console.log('当前页面不输出，但您可以使用Wikiplus的开放接口');
                return false;
            }
            if ($.cookie('Wikiplus_StartUseAt') === undefined){
                self.Install();
            }
            if ($.cookie('Wikiplus_Settings') === undefined){
                $.cookie('Wikiplus_Settings',JSON.stringify(self.DefaultSettings),{'expires': new Date(253402271999000) , 'path' : '/'});
            }
            var usetime = ((new Date()).valueOf() - $.cookie('Wikiplus_StartUseAt'))/1000;
            if (usetime<86400){
                var timehint = usetime + '秒';
            }
            else if (usetime>86400&&usetime<31556900){
                var timehint = Math.floor(usetime/86400) + '天有余';
            }
            else{
                var timehint = Math.floor(usetime/31556900) + '年' + Math.floor((usetime-Math.floor(usetime/31556900)*31556900)/86400) + '天有余';
            }
            self.OutputPrinter(self.OutputBox,'Wikiplus已经陪伴您' + (wgUserEditCount - $.cookie('Wikiplus_SrartEditCount')) + '次编辑、' + timehint,'fine');
            self.OutputPrinter(self.OutputBox,'当前版本:' + self.Version + '  最后一次更新内容:' + self.LastestUpdateDescription,'warning');
            if (self.isBeta){
                self.OutputPrinter(self.OutputBox,'您当前使用的是测试版本 可能存在功能异常、效率低下、逻辑错误、无法加载、抽风犯病等不可预知事件','warning');
            }
            self.displayQuickEditInterface();
            self.initFunctions();
            self.preloadPage(0,function(){
                self.preloadPage(1);
                if (typeof self.PreloadData.section0 != "undefined"){
                    self.wgCategoriesBackup = wgCategories;
                    self.wgCategories = [];
                    var content = self.PreloadData.section0;
                    var regexp = new RegExp("\\[\\[(?:category|分类)\\:(.+?)\\]\\]","ig");
                    while ((result = regexp.exec(content))!=null){
                        if ($.inArray(result[1], self.wgCategoriesBackup)==-1){
                            continue;
                        }
                        else{
                            self.wgCategories.push(result[1]);//正则分析页面Wikitext并找出所含分类
                        }
                    }
                    if (wgIsArticle&&(($.inArray('autoconfirmed', wgUserGroups)!=-1)||wgUserName=="妹空酱")){
                    console.log('已启用Wikiplus的高级功能，请谨慎并正确的使用，遵守当前Wiki: ' + wgSiteName + ' 的相关方针。');
                    console.log('%cWikiplus概不对您可能造成的非技术性原因的意外后果负责。','color:red');
                    self.initAdvancedFunctions();
                    }
                }
            });
            $("#wikiplus-main-button").click(function(){
                $(this).remove();
                $("#wikiplus-function").fadeIn();
            })
            console.log('Wikiplus初始化完成');
        })
    }
    /**
    * 模块:初始化高级功能(提供给自动确认以上用户使用)
    * 输入:无
    * 输出:无
    */
    this.initAdvancedFunctions = function(){
        this.initCategoriesManage();
    };
    /**
    * 模块:初始化各功能
    * 输入:无
    * 输出:无
    */
    this.initFunctions = function(){
        this.createRedirectPage();
        this.bindPreloadEvents();
        this.editSettings();
    }
}
$(document).ready(function(){
    nya = new Wikiplus();
    nya.init();
})