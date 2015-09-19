/// <reference path="../typings/jquery/jquery.d.ts"/>
/**
* Wikiplus
* Author:+Eridanus Sora/@妹空酱
* Github:https://github.com/Last-Order/Wikiplus
*/
/**
* 依赖组件:MoeNotification
* https://github.com/Last-Order/MoeNotification
*/
function MoeNotification(undefined) {
    var self = this;
    this.display = function (text, type, callback) {
        var _callback = callback || function () { };
        var _text = text || '喵~';
        var _type = type || 'success';
        $("#MoeNotification").append(
            $("<div>").addClass('MoeNotification-notice')
                .addClass('MoeNotification-notice-' + _type)
                .append('<span>' + _text + '</span>')
                .fadeIn(300)
            );
        self.bind();
        self.clear();
        _callback($("#MoeNotification").find('.MoeNotification-notice').last());
    }
    this.create = {
        success: function (text, callback) {
            var _callback = callback || function () { };
            self.display(text, 'success', _callback);
        },
        warning: function (text, callback) {
            var _callback = callback || function () { };
            self.display(text, 'warning', _callback);
        },
        error: function (text, callback) {
            var _callback = callback || function () { };
            self.display(text, 'error', _callback);
        }
    };
    this.clear = function () {
        if ($(".MoeNotification-notice").length >= 10) {
            $("#MoeNotification").children().first().fadeOut(150, function () {
                $(this).remove();
            });
            setTimeout(self.clear, 300);
        }
        else {
            return false;
        }
    }
    this.empty = function (f) {
        $(".MoeNotification-notice").each(function (i) {
            if ($.isFunction(f)) {
                var object = this;
                setTimeout(function () {
                    f($(object));
                }, 200 * i);
            }
            else {
                $(this).delay(i * 200).fadeOut('fast', function () {
                    $(this).remove();
                })
            }
        })
    }
    this.bind = function () {
        $(".MoeNotification-notice").mouseover(function () {
            self.slideLeft($(this));
        });
    }
    window.slideLeft = this.slideLeft = function (object, speed) {
        object.css('position', 'relative');
        object.animate({
            left: "-200%",
        },
            speed || 150, function () {
                $(this).fadeOut('fast', function () {
                    $(this).remove();
                });
            });
    }
    this.init = function () {
        $("body").append('<div id="MoeNotification"></div>');
    }
    if (!$("#MoeNotification").length > 0) {
        this.init();
    }
}

//Wikiplus 主程序
$(function () {
    //包裹于函数避免污染全局

    //功能性函数定义开始

    //抛出格式化异常
    //Params : (int) number, (string) message
    function throwError(number, message) {
        var e = new Error();
        e.number = number;
        e.message = message || '未知错误';
        console.log('%c致命错误[' + e.number + ':' + e.message + ']抛出', 'color:red');
        if ($('.Wikiplus-Banner').length > 0) {
            $('.Wikiplus-Banner').html(e.message);
            $('.Wikiplus-Banner').css('background', 'rgba(218, 142, 167, 0.65)');
        }
        else {
            (new MoeNotification()).create.error(e.message);
        }
        //throw e;
    }
    //抛出不致命异常
    //Params : (int) number, (string) message
    function throwWarning(number, message) {
        var e = new Error();
        e.number = number;
        e.message = message || '未知错误';
        console.log('%c非致命错误[' + e.number + ':' + e.message + ']抛出', 'color:#F3C421');
    }

    //检测值是否在数组中
    //Params : (string) value, (array) array
    //Returns : (boolean) True/False
    window.inArray = inArray = function (value, array) {
        if ($.inArray(value, array) === -1) {
            return false;
        }
        else {
            return true;
        }
    }
    //功能性函数定义结束

    //Wikipage类构造函数
    var Wikipage = function (page) {
        var self = this;
        console.log('正在构建页面类');
        //可用性检测与权限检测
        if (!mw.config.values.wgEnableAPI || !mw.config.values.wgEnableWriteAPI) {
            throwError(1002, '本Wiki未开启可用的API');
            return;
        }
        if (!inArray('autoconfirmed', mw.config.values.wgUserGroups)) {
            throwError(1001, '非自动确认用户');
            return;
        }
        //从MediaWiki定义的全局变量中获得信息
        this.pageName = page || mw.config.values.wgPageName;
        this.pageName = this.pageName.replace(/ /ig, '_');
        this.revision = mw.config.values.wgRevisionId;
        this.articleId = mw.config.values.wgArticleId;
        this.API = location.protocol + '//' + location.host + mw.config.values.wgScriptPath + '/api.php';
        console.log('正在获得页面基础信息');
        //从API获得编辑令牌和起始时间戳
        try {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: self.API,
                data: {
                    'action': 'query',
                    'prop': 'revisions|info',
                    'titles': self.pageName,
                    'rvprop': 'timestamp',
                    'intoken': 'edit',
                    'format': 'json'
                },
                beforeSend: function () {
                    console.time('获得页面基础信息耗时');
                },
                success: function (data) {
                    if (data && data.query && data.query.pages) {
                        var info = data.query.pages;
                        for (key in info) {
                            if (key != '-1') {
                                if (info[key].revisions && info[key].revisions.length > 0) {
                                    self.timeStamp = info[key].revisions[0].timestamp;
                                }
                                else {
                                    throwError(1004, '无法获得页面时间戳');
                                }
                                if (info[key].edittoken) {
                                    if (info[key].edittoken != '+\\') {
                                        self.editToken = info[key].edittoken;
                                    }
                                    else {
                                        console.log('无法通过API获得编辑令牌，可能是空页面，尝试通过前端API获取通用编辑令牌');
                                        self.editToken = mw.user.tokens.get('editToken');
                                        if (self.editToken && self.editToken != '+\\') {
                                            console.log('成功获得通用编辑令牌 来自API');
                                        }
                                        else {
                                            throwError(1005, '无法获得页面编辑令牌 请确认登录状态');
                                        }
                                    }
                                }
                            }
                            else {
                                throwWarning(1003, '无法获得页面基础信息，请检查页面是否存在');
                                console.log('无法通过API获得编辑令牌，可能是空页面，尝试通过前端API获取通用编辑令牌');
                                self.editToken = mw.user.tokens.get('editToken');
                                if (self.editToken && self.editToken != '+\\') {
                                    console.log('成功获得通用编辑令牌');
                                }
                                else {
                                    throwError(1005, '无法获得页面编辑令牌 请确认登录状态');
                                }
                            }
                        }
                    }
                    console.timeEnd('获得页面基础信息耗时');
                    self.inited = true;
                }
            });
        }
        catch (e) {
            console.log('获取基础信息失败:' + e.message);
        }
    }

    //通用编辑
    Wikipage.prototype.edit = function (content, config, callback) {
        var self = this;
        data = {};
        callback = callback || new Function();
        //准备提交数据
        data.action = 'edit';
        data.format = 'json';
        data.text = content;
        data.title = this.pageName;
        data.token = this.editToken;
        data.basetimestamp = this.timeStamp;
        $.ajax({
            type: "POST",
            url: self.API,
            data: $.extend(data, config), //将自定义设置覆盖到默认设置
            success: function (data) {
                if (data && data.edit) {
                    //分辨返回数据
                    if (data.edit.result && data.edit.result == 'Success') {
                        //编辑成功
                        callback('success');
                    }
                    else {
                        if (data.edit.code){
                            throwError(1101, '触发防滥用过滤器:' + data.edit.info.replace(/Hit AbuseFilter: /ig, '') + '<br><small>' + data.edit.warning + '</small>')
                        }
                        else{
                            throwError(1085, '未知的编辑错误');
                        }
                        callback('fail');
                    }
                }
                else if (data && data.error && data.error.code) {
                    switch (data.error.code) {
                        case 'notitle': throwError(1006, '无法编辑空标题页面'); break;
                        case 'notext': throwError(1007, '未设置页面目标内容'); break;
                        case 'notoken': throwError(1008, '空的编辑令牌'); break;
                        case 'invalidsection': throwError(1009, '段落编号非法'); break;
                        case 'protectedtitle': throwError(1010, '无法被创建的标题'); break;
                        case 'cantcreate': throwError(1011, '没有新建页面权限'); break;
                        case 'cantcreate-anon': throwError(1012, '匿名用户无法新建页面'); break;
                        case 'articleexists': throwError(1013, '无法创建已经存在的页面'); break;
                        case 'noimageredirect-anon': throwError(1014, '匿名用户无法创建文件重定向'); break;
                        case 'noimageredirect': throwError(1015, '没有创建文件重定向的权限'); break;
                        case 'spamdetected': throwError(1016, '目标文本被SPAM过滤器拦截'); break;
                        case 'filtered': throwError(1017, '过滤器拦截了本次编辑'); break;
                        case 'contenttoobig': throwError(1018, '文本超过了最大字节限制'); break;
                        case 'noedit-anon': throwError(1019, '匿名用户无法编辑页面'); break;
                        case 'noedit': throwError(1020, '没有编辑页面的权限'); break;
                        case 'pagedeleted': throwError(1021, '在编辑的时间里，页面被删除'); break;
                        case 'emptypage': throwError(1022, '新页面不能为空内容'); break;
                        case 'emptynewsection': throwError(1023, '新段落不能为空内容'); break;
                        case 'editconflict': throwError(1024, '编辑冲突！请不要紧张 请比对当前内容与页面后重新提交'); break;
                        case 'revwrongpage': throwError(1025, '目标修订版本与目标页面不匹配'); break;
                        case 'undofailure': throwError(1026, '因为存在冲突的中间版本，无法撤销'); break;
                        case 'missingtitle': throwError(1027, '我的天啊有生之年你能见到这个错误建议马上出门买彩票'); break;
                        case 'mustbeposted': throwError(1028, '必须使用POST方式提交编辑'); break;
                        case 'readapidenied': throwError(1029, '没有使用读取API的权限'); break;
                        case 'writeapidenied': throwError(1030, '您没有权限通过API编辑此页面'); break;
                        case 'noapiwrite': throwError(1031, '本Wiki未开启可用的写入API'); break;
                        case 'badtoken': throwError(1032, '非法的编辑令牌'); break;
                        case 'missingparam': throwError(1033, '页面名、页面ID必须有一项不为空值'); break;
                        case 'invalidparammix': throwError(1034, '页面名、页面ID不能同时使用'); break;
                        case 'invalidtitle': throwError(1035, '非法的标题'); break;
                        case 'nosuchpageid': throwError(1036, '不存在的页面ID'); break;
                        case 'pagecannotexist': throwError(1037, '该名称空间不允许创建一般页面'); break;
                        case 'nosuchrevid': throwError(1038, '不存在的修订编号'); break;
                        case 'badmd5': throwError(1039, '非法的MD5值'); break;
                        case 'hookaborted': throwError(1040, '编辑被扩展Hook拦截'); break;
                        case 'parseerror': throwError(1041, '无法解析所给的WikiText'); break;
                        case 'summaryrequired': throwError(1042, '编辑摘要不能为空'); break;
                        case 'blocked': throwError(1043, '您已经被封禁'); break;
                        case 'ratelimited': throwError(1044, '达到操作速率上限，请稍后再试'); break;
                        case 'unknownerror': throwError(1045, '未知错误'); break;
                        case 'nosuchsection': throwError(1046, '不存在的段落'); break;
                        case 'sectionsnotsupported': throwError(1047, '本页面不支持段落编辑'); break;
                        case 'editnotsupported': throwError(1048, '该页面无法通过API编辑'); break;
                        case 'appendnotsupported': throwError(1049, '该页面无法前后插入文本'); break;
                        case 'redirect-appendonly': throwError(1050, '在遵循重定向的情况下，只能进行前后插入或创建新段落'); break;
                        case 'badformat': throwError(1051, '错误的文本格式'); break;
                        case 'customcssprotected': throwError(1052, '无法编辑用户CSS页'); break;
                        case 'customjsprotected': throwError(1053, '无法编辑用户JS页'); break;
                        case 'cascadeprotected' : throwError(1100, '无法编辑被级联保护的页面');break;
                        default : throwError(1099,'未知的编辑错误' + '(' + data.error.code + ')')
                    }
                    callback('fail');
                }
                else if (data.code){
                    throwError(1100, '编辑错误:' + '(' + data.code + ')');
                    callback('fail');
                }
                else {
                    throwError(1086, '未知的编辑错误(unknownerror)');
                    callback('success')
                }
            },
            error: function (e) {
                throwError(1056, '由于网络原因或服务器故障导致编辑失败');
                callback('fail');
            }
        })
    }
    //Wikipage - editSection
    //编辑段落
    //Params : (string) content , (number) section , (function) callback
    Wikipage.prototype.editSection = function (content, section, callback) {
        var self = this;
        var section = section || 0;
        var callback = callback || new Function();
        this.edit(content, {
            'section': section
        }, callback);
    }
    //Wikipage - redirectTo
    //重定向至
    //Params : (string) target
    Wikipage.prototype.redirectTo = function (target, callback) {
        var self = this;
        var callback = callback || function () { };
        if (!target) {
            throwError(1055, '无法重定向至空页面');
        }
        else {
            this.edit('#REDIRECT [[' + target + ']]', {
                'summary': '重定向页面至[[' + this.pageName + ']] // Wikiplus'
            }, callback);
        }
    }
    //Wikipage - redirectFrom
    //从~重定向
    //Params : (string) origin
    Wikipage.prototype.redirectFrom = function (origin, callback) {
        var self = this;
        var callback = callback || function () { };
        if (!origin) {
            throwError(1057, '未指定重定向源');
        }
        else {
            this.edit('#REDIRECT [[' + this.pageName + ']]', {
                'title': origin,
                'summary': '重定向至[[' + this.pageName + ']] // Wikiplus'
            }, callback)
        }
    }
    //Wikipage - getWikiText
    //获取页面的wiki文本
    //Params : (function) callback
    Wikipage.prototype.getWikiText = function (callback, config) {
        var callback = callback || new Function();
        var url = location.protocol + '//' + location.host + mw.config.values.wgScriptPath + '/index.php';
        var data = {
            'title': this.pageName,
            'action': 'raw'
        };
        $.ajax({
            url: url,
            type: "GET",
            dataType: "text",
            cache: false,
            data: $.extend(data, config),
            beforeSend: function () {
                console.time('获得页面文本耗时');
            },
            success: function (data) {
                if (data) {
                    console.timeEnd('获得页面文本耗时');
                    callback(data);
                }
                else {
                    throwError(1054, '无法获得页面文本');
                }
            },
            error: function (e) {
                if (e.status == 404) {
                    throwWarning(1101, '无法获得页面文本，可能由于段落或页面不存在');
                }
                else {
                    throwError(1055, '无法获得页面文本(网络原因)' + '[' + e.status + ']');
                }
            }
        })
    }
    //Wikipage - parseWikiText
    //解析Wiki文本
    //Params : (string) text , (function) callback
    Wikipage.prototype.parseWikiText = function (text, callback) {
        var self = this;
        var data = {
            'format': 'json',
            'action': 'parse',
            'text': text,
            'title': this.pageName,
            'pst': 'true'
        }
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: data,
            url: self.API,
            success: function (data) {
                if (data && data.parse && data.parse.text) {
                    callback(data.parse.text['*']);
                }
                else {
                    throwError(1060, '无法解析页面文本');
                }
            }
        })
    }
    //Wikipage - compare
    Wikipage.prototype.compare = function(curid, oldid, callback){
        var self = this;
        var callback = callback || new Function();

    }
    //Wikipage - toString
    //显示类信息
    Wikipage.prototype.info = Wikipage.prototype.toString = function () {
        return '(╯‵□′)╯︵┻━┻\r\n[Wikiplus - Wikipage]\r\n[页面名:' + this.pageName + ']\r\n(╯‵□′)╯︵┻━┻';
    }



    //主界面显示及初始化
    var Wikiplus = function () {
        //再次包裹在函数内以优雅地安排变量作用域
        //这不是一个严格意义上的Class 但是有其一定特性
        var self = this;
        this.showNotice = new MoeNotification();
        this.version = '1.9.8';
        this.API = location.protocol + '//' + location.host + mw.config.values.wgScriptPath + '/api.php';
        this.lastestUpdateDesc = '调整快捷键设置';
        this.validNameSpaces = [0, 1, 2, 3, 4, 8, 10, 11, 12, 14, 274, 614, 8964];
        this.preloadData = {};
        this.defaultSettings = {
            '设置名': '设置值',
            '设置参考': 'http://zh.moegirl.org/User:%E5%A6%B9%E7%A9%BA%E9%85%B1/Wikiplus/%E8%AE%BE%E7%BD%AE%E8%AF%B4%E6%98%8E'
        };
        //初始化
        this.init = function () {
            console.log('Wikiplus' + self.version + '正在加载');
            $("head").append("<link>");
            var css = $("head").children(":last");
            css.attr({
                rel: "stylesheet",
                type: "text/css",
                href: location.protocol == 'http:' ? "http://miku.host.smartgslb.com/wikiplus/wikiplus_new.css" : "https://blog.kotori.moe/wikiplus/wikiplus_new.css"
            });
            if (mw.config.values.wgIsArticle && inArray(mw.config.values.wgNamespaceNumber, self.validNameSpaces) && mw.config.values.wgAction == 'view') {
                self.kotori = new Wikipage();
                //版本检查
                var nowVersion = localStorage.Wikiplus_Version;
                if (nowVersion != self.version){
                    localStorage.Wikiplus_Version = self.version;
                    self.showNotice.create.success('Wikiplus已经更新到版本:' + self.version);
                    self.showNotice.create.success('更新内容:' + self.lastestUpdateDesc);
                }
                self.initBasicFunctions();
                self.initAdvancedFunctions();
            }
            else {
                if (inArray(mw.config.values.wgPageName,['Special:最近更改','Special:RecentChanges','特殊:最近更改'])){
                    this.initRCFunctions();
                }
                else{
                    console.log('不符合加载条件，程序终止。');
                }
                
            }
        }
        //返回页面地址
        this.U = function(title, revision){
            return location.protocol + '//' + location.host + mw.config.values.wgArticlePath.replace(/\$1/ig, '')  + '?title=' + encodeURI(title) + '&oldid=' + revision;
        }
        /*
        * 基础功能区
        */
        //检查安装
        this.checkInstall = function () {
            if (!localStorage.Wikiplus_Installed || localStorage.Wikiplus_Installed == 'False') {
                //安装
                var install = function () {
                    localStorage.Wikiplus_Installed = 'True';//标记已安装
                    localStorage.Wikiplus_Version = self.version;
                    localStorage.Wikiplus_StartUseAt = new Date().valueOf();
                    localStorage.Wikiplus_SrartEditCount = mw.config.values.wgUserEditCount;
                    localStorage.Wikiplus_Settings = JSON.stringify(self.defaultSettings);
                    $('.Wikiplus-InterBox').fadeOut('fast', function () {
                        self.showNotice.create.success('成功安装Wikiplus' + self.version);
                        $(this).remove();
                    })
                }
                var notice = $('<div>').text('您是否允许Wikiplus采集非敏感数据用于改进Wikiplus及为当前Wiki:' + mw.config.values.wgSiteName + '提供改进建议?').attr('id', 'Wikiplus-InterBox-Content');
                var applyBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-Setting-Apply').text('好呀');
                var cancelBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-Setting-Cancel').text('窝拒绝');
                var content = $('<div>').append(notice).append($('<hr>')).append(applyBtn).append(cancelBtn);//拼接
                self.createInterBox('安装Wikiplus', content, function () {
                    $('#Wikiplus-InterBox-Content').css('text-align', 'left');
                    $('#Wikiplus-Setting-Apply').click(function () {
                        localStorage.Wikiplus_SendStatistics = 'True';
                        install();
                    });
                    $('#Wikiplus-Setting-Cancel').click(function () {
                        localStorage.Wikiplus_SendStatistics = 'False';
                        install();
                    });
                }, 600)
            }
        }
        ////核心功能：快速编辑 开始
        //构建快速编辑相关入口
        this.editPageBuild = function () {
            self.contentBackup = $('#mw-content-text').html();//备份数据
            var topBtn = $('<li>').attr('id', 'Wikiplus-Edit-TopBtn').html(
                $('<span>').html(
                    $('<a>').attr('href', 'javascript:void(0)').text('快速编辑')
                    )
                );
            var sectionBtn = '[<a href="javascript:void(0)" class="Wikiplus-Edit-SectionBtn">快速编辑</a>]';
            if (!$('#Wikiplus-Edit-TopBtn').length > 0) {
                $('#ca-edit').before(topBtn);//顶部按钮
            }
            if ($('.mw-editsection').length > 0) {
                //每个段落的按钮编辑
                self.sectionMap = {};
                $('.mw-editsection').each(function (i) {
                    try{
                        var sectionNumber = $(this).find(".mw-editsection-bracket:first").next().attr('href').match(/&section\=(\d+)/)[1];
                    }
                    catch(e){
                        //可能是模板说明页 这里实现有问题 需要修改整体逻辑
                        //
                        try{
                           var sectionNumber = $(this).find(".mw-editsection-bracket:first").next().attr('href').match(/&section\=(.+)/)[1];
                        }
                        catch(e){
                           console.log('Wikiplus致命错误');
                        }
                    }
                    var sectionName = $(this).prev().text();
                    self.sectionMap[sectionNumber] = sectionName;
                    $(this).append(sectionBtn);
                    $(this).find('.Wikiplus-Edit-SectionBtn').data('id', sectionNumber);
                    $(this).find('.Wikiplus-Edit-SectionBtn').data('name', sectionName);
                })
            }
            this.editPageBind();
        }
        //加载快速编辑相关界面 事件绑定
        this.editPageBind = function () {
            if ($('.noarticletext').length > 0) {
                self.preloadData['page'] = '<!-- 该页当前没有内容 请删去本行注释后进行创建 -->';//页面不存在的话变为创建模式
            }
            $('#Wikiplus-Edit-TopBtn').click(function () {
                self.initQuickEditStepOne('page', '//Edit via Wikiplus')
            });
            $('.Wikiplus-Edit-SectionBtn').each(function () {
                $(this).click(function () {
                    self.initQuickEditStepOne($(this).data('id'), '//Edit via Wikiplus');
                })
            });
            //预读取事件
            //鼠标扫过目录对应段落
            $("#toc").children("ul").find("a").each(function (i) {
                $(this).mouseover(function () {
                    $(this).unbind('mouseover');
                    self.preload(i + 1);
                });
            });
            //鼠标扫过快速编辑按钮
            $(".Wikiplus-Edit-SectionBtn").each(function (i) {
                $(this).mouseover(function () {
                    self.preload(i + 1);
                });
            });
            //默认读取整页
            self.preload(-1);
        }
        //快速编辑相关事件 第一步
        this.initQuickEditStepOne = function (section, summary) {
            if (section.match(/T.+/) && section.match(/T.+/).length > 0 ){
                if (!mw.config.values.wgPageName.match(/^.+\/doc$/)){
                    self.showNotice.create.error('暂不支持在模板页对模板说明页编辑，正在为您跳转到编辑页面');
                    location.href = mw.config.values.wgArticlePath.replace(/\$1/,mw.config.values.wgPageName) + '/doc';
                    return false;
                }
            }
            var backBtn = $('<span>').attr('id', 'Wikiplus-Quickedit-Back').addClass('Wikiplus-Btn').text('返回');//返回按钮
            var jumpBtn = $('<span>').attr('id', 'Wikiplus-Quickedit-Jump').addClass('Wikiplus-Btn').append(
                $('<a>').attr('href', '#Wikiplus-Quickedit').text('到编辑框')
                );//到编辑框
            var inputBox = $('<textarea>').attr('id', 'Wikiplus-Quickedit');//主编辑框
            var previewBox = $('<div>').attr('id', 'Wikiplus-Quickedit-Preview-Output');//预览输出
            var summaryBox = $('<input>').attr('id', 'Wikiplus-Quickedit-Summary-Input').attr('placeholder', '请输入编辑摘要');//编辑摘要输入
            var editSubmitBtn = $('<button>').attr('id', 'Wikiplus-Quickedit-Submit').text('提交编辑(Ctrl+S)');//提交按钮
            var previewSubmitBtn = $('<button>').attr('id', 'Wikiplus-Quickedit-Preview-Submit').text('预览');//预览按钮
            var isMinorEdit = $('<div>').append(
                                            $('<input>').attr({'type':'checkbox','id':'Wikiplus-Quickedit-MinorEdit'})
                                        )
                                        .append(
                                            $('<label>').attr('for','Wikiplus-Quickedit-MinorEdit').text('标记为小编辑(Ctrl+Shift+S)')
                                        )
                                        .css({'margin':'5px 5px 5px -3px','display':'inline'});    
            //插DOM
            var showUI = function (text, summary, contentBackup) {
                self.createInterBox('快速编辑', undefined, function () {
                    var summary = self.getSetting('defaultSummary', {
                        'sectionName': section == 'page' ? mw.config.values.wgPageName : self.sectionMap[section],
                        'sectionNumber': section == 'page' ? -1 : section
                    });
                    if (!summary) {
                        if (section == 'page') {
                            summary = '//Edit via Wikiplus';
                        }
                        else {
                            summary = '/* ' + self.sectionMap[section] + ' */' + ' //Edit via Wikiplus';
                        }
                    }
                    $('.Wikiplus-InterBox-Content').html(backBtn).append(jumpBtn).append(previewBox).append(inputBox).append(summaryBox).append('<br>').append(isMinorEdit).append(editSubmitBtn).append(previewSubmitBtn);
                    $('#Wikiplus-Quickedit-Summary-Input').val(summary);
                    $('#Wikiplus-Quickedit').val(text);
                    $('.Wikiplus-InterBox-Content').css('text-align', 'left');
                    $('.Wikiplus-InterBox').css('top',$(document).scrollTop());
                    self.heightBefore = $(document).scrollTop();//记住当前高度
                    self.initQuickEditStepTwo(section, contentBackup);
                    //魔法 勿移
                    //这里有个坑……这句话不能放在里面，否则元素还没插完就下一步导致无法绑定事件
                }, window.innerWidth * 0.8);
            }
            if (self.kotori.inited) {
                //判断页面类是否已经拿到token
                if (self.getPreloadData(section)) {
                    //如果已经预读取了内容
                    showUI(self.getPreloadData(section), summary);
                }
                else {
                    self.showNotice.create.success('载入编辑数据中...');
                    var timer = new Date().valueOf();
                    self.kotori.getWikiText(function (data) {
                        showUI(data, summary);
                        self.showNotice.create.success('载入完成，用时' + new String(new Date().valueOf() - timer) + 'ms', function () {
                            setTimeout(function () {
                                self.showNotice.empty(slideLeft);
                            }, 3000);
                        });
                    }, {
                            'section': section
                        });
                }
            }
            else {
                self.showNotice.create.error('页面模块未加载，请尝试刷新页面');
            }
        }
        //快速编辑界面加载第二步，主要是相关事件的绑定
        //Params : (string) section / page表示整页 , contentBackup 原内容备份
        this.initQuickEditStepTwo = function (section) {
            var section = (section == 'page') ? undefined : section;
            //返回
            $("#Wikiplus-Quickedit-Back").click(function () {
                $('.Wikiplus-InterBox').fadeOut('fast', function () {
                    window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                    $(this).remove();
                })
            });
            //预览
            var onPreload = $('<div>').addClass('Wikiplus-Banner').text('正在载入预览');
            $('#Wikiplus-Quickedit-Preview-Submit').click(function () {
                var wikiText = $('#Wikiplus-Quickedit').val();
                $(this).attr('disabled', 'disabled');
                $('#Wikiplus-Quickedit-Preview-Output').fadeOut(100, function () {
                    $('#Wikiplus-Quickedit-Preview-Output').html(onPreload);
                    $('#Wikiplus-Quickedit-Preview-Output').fadeIn(100);
                });
                $('body').animate({ scrollTop: self.heightBefore }, 200);//返回顶部
                self.kotori.parseWikiText(wikiText, function (data) {
                    $('#Wikiplus-Quickedit-Preview-Output').fadeOut('100', function () {
                        $('#Wikiplus-Quickedit-Preview-Output').html('<hr><div class="mw-body-content">' + data + '</div><hr>');
                        $('#Wikiplus-Quickedit-Preview-Output').fadeIn('100');
                        $('#Wikiplus-Quickedit-Preview-Submit').removeAttr('disabled');
                    });
                })
            });
            //提交
            $('#Wikiplus-Quickedit-Submit').click(function () {
                var wikiText        = $('#Wikiplus-Quickedit').val();
                var summary         = $('#Wikiplus-Quickedit-Summary-Input').val();
                var timer           = new Date().valueOf();
                var onEdit          = $('<div>').addClass('Wikiplus-Banner').text('正在提交编辑');
                var addtionalConfig = {
                    'summary': summary
                };
                if (section){
                    addtionalConfig['section'] = section;
                }
                if ($('#Wikiplus-Quickedit-MinorEdit').is(':checked')){
                    addtionalConfig['minor'] = 'true';
                }
                $('#Wikiplus-Quickedit-Submit,#Wikiplus-Quickedit,#Wikiplus-Quickedit-Preview-Submit').attr('disabled', 'disabled');
                $('body').animate({ scrollTop: self.heightBefore }, 200);
                $('#Wikiplus-Quickedit-Preview-Output').fadeOut(100, function () {
                    $('#Wikiplus-Quickedit-Preview-Output').html(onEdit);
                    $('#Wikiplus-Quickedit-Preview-Output').fadeIn(100);
                });
                self.kotori.edit(wikiText, addtionalConfig, function (status) {
                        if (status == 'success'){
                            //编辑成功
                            var useTime = new Date().valueOf() - timer;
                            $('#Wikiplus-Quickedit-Preview-Output').find('.Wikiplus-Banner').css('background', 'rgba(6, 239, 92, 0.44)');
                            $('#Wikiplus-Quickedit-Preview-Output').find('.Wikiplus-Banner').text('编辑成功~用时' + useTime + 'ms');
                            //发送统计数据
                            self.sendStatistic(useTime);
                            window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                            setTimeout(function () {
                                location.reload();
                            }, 500);
                        }
                        else{
                            //编辑失败
                            $('#Wikiplus-Quickedit-Submit,#Wikiplus-Quickedit,#Wikiplus-Quickedit-Preview-Submit').removeAttr('disabled');
                        }
                    })
            })
            //快捷键
            //Ctrl+S提交 Ctrl+Shift+S小编辑
            $('#Wikiplus-Quickedit,#Wikiplus-Quickedit-Summary-Input,#Wikiplus-Quickedit-MinorEdit').keydown(function (e) {
                if (e.ctrlKey && e.which == 83) {
                    if (e.shiftKey){
                        $('#Wikiplus-Quickedit-MinorEdit').click();
                    }
                    $('#Wikiplus-Quickedit-Submit').click();
                    e.preventDefault();
                    e.stopPropagation();
                }
            })
            //由于是异步提交 Wikiplus即使编辑失败 也不会丢失数据 唯一丢失数据的可能性是手滑关了页面
            //第一 关闭页面确认
            $('#Wikiplus-Quickedit').keydown(function(){
                window.onclose = window.onbeforeunload = function(){
                    return '[Wikiplus] 您确定要关闭/刷新编辑界面?';
                }
            });
        }

        this.sendStatistic = function(useTime){
            if (localStorage.Wikiplus_SendStatistics && localStorage.Wikiplus_SendStatistics == 'True'){
                $.ajax({
                    url : location.protocol == 'http:' ? 'http://miku.host.smartgslb.com/wikiplus/statistic.php' : 'https://blog.kotori.moe/wikiplus/statistic.php',
                    type : "GET",
                    dataType : "json",
                    data : {
                        'wikiname' : mw.config.values.wgSiteName,
                        'usetime' : useTime,
                        'username' : mw.config.values.wgUserName,
                        'pagename' : mw.config.values.wgPageName
                    },
                    success:function(data){
                        //提交成功
                    }
                })
            }
            else{
                //用户不同意发送数据
                return false;
            }
        }

        ////核心功能：快速编辑 结束

        //重定向相关
        this.simpleRedirector = function () {
            self.addFunctionButton('将页面重定向至此', 'Wikiplus-SR-Intro', function () {
                var input = $('<input>').addClass('Wikiplus-InterBox-Input');
                var applyBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-SR-Apply').text('提交');
                var cancelBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-SR-Cancel').text('取消');
                var content = $('<div>').append(input).append($('<hr>')).append(applyBtn).append(cancelBtn);//拼接
                self.createInterBox('请输入需要重定向到此页面的页面名', content, function () {
                    $('#Wikiplus-SR-Apply').click(function () {
                        if ($('.Wikiplus-InterBox-Input').val() != '') {
                            var title = $('.Wikiplus-InterBox-Input').val()
                            $('.Wikiplus-InterBox-Content').html('<div class="Wikiplus-Banner">提交中</div>');
                            self.kotori.redirectFrom(title, function () {
                                $('.Wikiplus-Banner').text('重定向完成!');
                                $('.Wikiplus-InterBox').fadeOut(300);
                                location.href = mw.config.values.wgArticlePath.replace(/\$1/ig, title);
                            });
                        }
                        else {
                            self.showNotice.create.warning('输入不能为空');
                        }
                    });
                    $('#Wikiplus-SR-Cancel').click(function () {
                        $('.Wikiplus-InterBox').fadeOut(300, function () {
                            $(this).remove();
                        });
                    })
                }, 600);
            })
        }
        //编辑设置
        this.editSettings = function () {
            self.addFunctionButton('Wikiplus设置', 'Wikiplus-Settings-Intro', function () {
                var input = $('<textarea>').attr('id', 'Wikiplus-Setting-Input').attr('rows', '10');
                var applyBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-Setting-Apply').text('提交');
                var cancelBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-Setting-Cancel').text('取消');
                var content = $('<div>').append(input).append($('<hr>')).append(applyBtn).append(cancelBtn);//拼接
                self.createInterBox('请在下方编辑框修改设置值', content, function () {
                    if (localStorage.Wikiplus_Settings) {
                        $('#Wikiplus-Setting-Input').val(localStorage.Wikiplus_Settings);
                    }
                    else {
                        $('Wikiplus-Setting-Input').attr('placeholder', '当前设置为空，请在下方根据规范编辑');
                    }
                    $('#Wikiplus-Setting-Apply').click(function () {
                        var settings = $('#Wikiplus-Setting-Input').val();
                        try {
                            settings = JSON.parse(settings);
                        }
                        catch (e) {
                            self.showNotice.create.error('设置存在语法错误!请检查!');
                            return;
                        }
                        localStorage.Wikiplus_Settings = JSON.stringify(settings);
                        $('.Wikiplus-InterBox-Content').html('<div class="Wikiplus-Banner">设置已保存</div>');
                        $('.Wikiplus-InterBox').fadeOut(300, function () {
                            $(this).remove();
                        });
                    })
                    $('#Wikiplus-Setting-Cancel').click(function () {
                        $('.Wikiplus-InterBox').fadeOut(300, function () {
                            $(this).remove();
                        });
                    })
                }, 600);
            });
        }
        //展开最近更改列表
        this.uncollapseRecentChanges = function(){
            $('#Wikiplus_RC_Functions').append(
                $('<span>').addClass('Wikiplus-Btn').text('展开所有最近更改').attr('id','Wikiplus_RC_UncollapseRecentChanges')
            )
            $('#Wikiplus_RC_UncollapseRecentChanges').click(function(){
                $('.mw-enhancedchanges-arrow').click();
                $(this).text($(this).text() == '展开所有最近更改' ? '折叠所有最近更改' : '展开所有最近更改');
            })
        }
        //隐藏上传日志
        this.hideUploadLogs = function(){
            $('#Wikiplus_RC_Functions').append(
                $('<span>').addClass('Wikiplus-Btn').text('隐藏上传日志').attr('id','Wikiplus_RC_HideUploadLogs')
            )
            $('#Wikiplus_RC_HideUploadLogs').click(function(){
                if ($(this).text() == '隐藏上传日志'){
                    $('.mw-changeslist-log-upload').hide();
                    $(this).text('显示上传日志');
                }
                else{
                    $('.mw-changeslist-log-upload').show();
                    $(this).text('隐藏上传日志');
                }
            })
        }
        //快速查看差异
        this.viewDifference = function(){
            var self = this;
            $('.mw-changeslist a').each(function(){
                //没有更优雅的选取方法了 只能一个个判断链接
                var href = $(this).attr('href');
                try{
                    if (href.match(/^.+\&diff=(\d+)\&oldid=(\d+)/) && inArray($(this).text(), ['之前','差异']) ){
                        var regexResult = href.match(/^.+\&diff=(\d+)\&oldid=(\d+)/);
                        var curid = regexResult[1];
                        var oldid = regexResult[2];
                        $(this).after(
                            $('<a>').text('查看差异').attr({'href' : 'javascript:void(0);'})
                                    .addClass('Wikiplus-RC-ViewDiff')
                                    .data({
                                        'curid' : curid,
                                        'oldid' : oldid
                                    })
                        );
                    }
                }
                catch(e){
                    //continue;
                }
            });
            $('.Wikiplus-RC-ViewDiff').click(function(){
                var curid = $(this).data('curid');
                var oldid = $(this).data('oldid');
                self.createInterBox('查看差异','<div class="Wikiplus-Banner">载入中</div>',function(){
                    var data = {
                        'action' : 'compare',
                        'fromrev' : oldid,
                        'torev' : curid,
                        'format' : 'json'
                    };
                    $.ajax({
                        type : "GET",
                        dataType : "json",
                        data : data,
                        url : self.API,
                        success : function(data){
                            if (data.compare['*']){
                                $('.Wikiplus-InterBox-Content').html(
                                    $('<div>').addClass('Wikiplus_Diff_Container').addClass('mw-body-content')
                                             .css({'text-align':'left'}).attr({'id':'mw-content-text'})
                                             .append(
                                                 $('<table>').append(
                                                    $('<tr>').append(
                                                        $('<td>').width('450px').append(
                                                            $('<a>').attr({'href' : self.U('反正怎么填都行那这里就卖个萌吧', oldid), 'target' : '_blank'})
                                                                    .text('版本' + oldid)
                                                        )
                                                    )
                                                    .append(
                                                        $('<td>').width('450px').append(
                                                            $('<a>').attr({'href' : self.U('反正怎么填都行那这里就卖个萌吧', curid), 'target' : '_blank'})
                                                                    .text('版本' + curid)
                                                        )
                                                    )
                                                    .css('text-align', 'center')
                                                 )
                                             )
                                             .append(
                                             $('<table>').addClass('diff').addClass('diff-contentalign-left')
                                                         .append(
                                                            $('<tbody>').append(
                                                                data.compare['*']
                                                            )
                                                         )
                                             )
                                )
                            }
                            else{
                                throwError(1111, '无法获得页面差异');
                            }
                        }
                    })
                }, 900);
            })
            $('.Wikiplus-RC-ViewDiff').before(' | ');
        }
        /*
        * 基础功能区 结束
        */

        /*
        * 通用函数起始点
        */
        //增加一个功能按钮
        //(string) text : 按钮文本 , (string) id : 按钮的id , (function) event : 点击按钮触发的事件
        this.addFunctionButton = function (text, id, event) {
            var button = $('<li></li>').attr('id', id).append($('<a></a>').attr('href', 'javascript:void(0);').text(text));
            if ($('#p-cactions .menu').length > 0) {
                $('#p-cactions .menu ul').append(button);
                $('#p-cactions .menu ul').find('li').last().click(event);
            }
            else {
                throwError(1080, '未知错误：无法增加功能按钮');
            }
        }
        //创建一个悬浮交互框
        //(string) title : 标题 , (element) content : 内容 , (function) callback : 回调函数
        this.createInterBox = function (title, content, callback, width) {
            var callback = callback || function () { };
            if ($('.Wikiplus-InterBox').length > 0) {
                $('.Wikiplus-InterBox').each(function () {
                    $(this).remove();
                });
            }
            var cwidth = document.body.clientWidth;
            var cheight = document.body.clientHeight;
            $('body').append(
                $('<div>').addClass('Wikiplus-InterBox')
                    .css({
                        'margin-left' : cwidth / 2 - (width / 2), 
                        'top' : $(document).scrollTop() + document.body.clientHeight * 0.2
                    })
                    .append(
                    $('<div>').addClass('Wikiplus-InterBox-Header')
                        .text(title)
                    )
                    .append(
                    $('<div>').addClass('Wikiplus-InterBox-Content')
                        .append(content)
                    )
                    .append(
                    $('<span>').text('×').addClass('Wikiplus-InterBox-Close')
                    )
                )
            $('.Wikiplus-InterBox').width(width);
            $('.Wikiplus-InterBox').fadeIn(500);
            $('.Wikiplus-InterBox-Close').click(function(){
                $(this).parent().fadeOut('fast',function(){
                    window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                    $(this).remove();
                })
            })
            callback();
        }
        //预加载页面Wiki文本
        //Params : (section) section
        //-1 代表整个页面
        this.preload = function (section) {
            try {
                if (section == -1) {
                    if (self.preloadData['page']) {
                        console.log('对于 整页 的预读取已经进行过，跳过。');
                    }
                    else {
                        self.kotori.getWikiText(function (text) {
                            self.preloadData['page'] = text;
                            console.log('成功预读取 整页 ');
                        });
                    }
                }
                else {
                    if (self.preloadData[section]) {
                        console.log('对于段落 ' + section + ' 的预读取已经进行过，跳过');
                    }
                    else {
                        console.time('预读取段落' + section + '用时');
                        self.kotori.getWikiText(function (text) {
                            self.preloadData[section] = text;
                            console.timeEnd('预读取段落' + section + '用时');
                        }, {
                                'section': section
                            });
                    }
                }
            }
            catch (e) {
                self.showNotice.create.error(e.number + ':' + e.message);
            }
        }
        //获得预读取数据
        //page - 整页 , [0-9]{1,infinity} 段落
        this.getPreloadData = function (key) {
            if (self.preloadData[key]) {
                return self.preloadData[key];
            }
            else {
                return false;
            }
        }
        //获取设置值
        //Params : key
        //存在 输出值 不存在 输出undefined
        this.getSetting = function (key, object) {
            var w = object;
            try {
                var settings = $.parseJSON(localStorage.Wikiplus_Settings);
            }
            catch (e) {
                return localStorage.Wikiplus_Settings || '';
            }
            try {
                var _setting = new Function('return ' + settings[key]);
                if (typeof _setting == 'function') {
                    try {
                        if (_setting()(w) === true) {
                            return undefined
                        }
                        else {
                            return _setting()(w) || settings[key];
                        }
                    }
                    catch (e) {
                        return settings[key];
                    }
                }
                else {
                    return settings[key];
                }
            }
            catch (e) {
                try {
                    return settings[key];
                }
                catch (e) {
                    return undefined;
                }
            }
        }
        /*
        * 通用函数终止点
        */
        this.initBasicFunctions = function () {
            //加载基础功能
            setTimeout(this.checkInstall, 1000);//检查安装
            this.editPageBuild();//快速编辑
            this.simpleRedirector();//快速重定向
            this.editSettings();//编辑设置
        }
        this.initRCFunctions = function(){
            //加载最近更改页功能
            var wikiplus_field = $('<fieldset>').append(
                $('<legend>').text('Wikiplus')
            ).addClass('rcoptions').attr('id','Wikiplus_RC_Functions')
            $('.rcoptions').after(wikiplus_field);
            this.uncollapseRecentChanges();//展开最近更改
            this.hideUploadLogs();//隐藏上传日志
            this.viewDifference();//快速查看差异
        }
        this.initAdvancedFunctions = function () {
            //加载高级功能
        }
        this.init();
    }
    $(function () {
        window.Wikiplus = new Wikiplus();
    })
})