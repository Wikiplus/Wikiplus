/// <reference path="../typings/jquery/jquery.d.ts"/>
/* global mw,inArray */
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
    if (!($("#MoeNotification").length > 0)) {
        this.init();
    }
}
$(function () {
    class Wikipage {
        constructor(pageName = window.mw.config.values.wgPageName) {
            var self = this;
            console.log('Now Loading Wikiplus');
            //可用性和权限检测
            if (!window.mw) {
                console.log('页面Javascript载入不完全或这不是一个Mediawiki站点');
                return;
            }
            if (!window.mw.config.values.wgEnableAPI || !window.mw.config.values.wgEnableWriteAPI) {
                self.throwError(1000, '无可用的API');
                return;
            }
            if (!self.inArray('autoconfirmed', window.mw.config.values.wgUserGroups)) {
                self.throwError(1001, '非自动确认用户');
                return;
            }
            //从MediaWiki定义的全局变量中获得信息
            self.pageName = pageName.replace(/ /ig, '_'); // Mediawiki处理空格时可能会出错
            self.revisionId = window.mw.config.values.wgRevisionId;
            self.articleId = window.mw.config.values.wgArticleId;
            self.API = `${location.protocol}//${location.host}${window.mw.config.values.wgScriptPath}/api.php`;
            //从API获得编辑令牌和起始时间戳
            $.ajax({
                type: 'GET',
                dataType: 'json',
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
                    console.time('获得页面基础信息时间耗时');
                },
                success: function (data) {
                    if (data && data.query && data.query.pages) {
                        var info = data.query.pages;
                        for (var key in info) {
                            if (key !== '-1') {
                                if (info[key].revisions && info[key].revisions.length > 0) {
                                    self.timeStamp = info[key].revisions[0].timestamp;
                                }
                                else {
                                    self.throwError(1004, '无法获得页面时间戳');
                                }
                                if (info[key].edittoken) {
                                    if (info[key].edittoken != '+\\') {
                                        self.editToken = info[key].edittoken;
                                    }
                                    else {
                                        console.log('无法通过API获得编辑令牌，可能是空页面，尝试通过前端API获取通用编辑令牌');
                                        self.editToken = window.mw.user.tokens.get('editToken');
                                        if (self.editToken && self.editToken != '+\\') {
                                            console.log('成功获得通用编辑令牌 来自前端API');
                                        }
                                        else {
                                            self.throwError(1005, '无法获得页面编辑令牌 请确认登录状态');
                                        }
                                    }
                                }
                            }
                            else {
                                //原来版本这里依然会试着用前端API来获取Token，但是这样就没有了起始时间戳，有产生编辑覆盖的可能性
                                self.throwError(1007, '无法获得页面基础信息');
                                self.inited = true;
                            }
                        }
                    }
                }
            })
        }
        throwError(number = 0, message = '未知错误') {
            console.log(`%c致命错误[${number}]:${message}`, 'color:red');
        }
        throwWarning(number = 0, message = '未知异常') {
            console.log(`%c异常[${number}]:${message}`, 'color:#F3C421');
        }
        inArray(value, array) {
            if ($.inArray(value, array) === -1) {
                return false;
            }
            else {
                return true;
            }
        }
    }

    $(document).ready(function () {
        class Wikiplus {
            constructor() {
                var self = this;
                self.kotori = new Wikipage();
            }
        }

        new Wikiplus();
    })
})