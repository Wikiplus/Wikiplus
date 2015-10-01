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
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function MoeNotification(undefined) {
    var self = this;
    this.display = function (text, type, callback) {
        var _callback = callback || function () {};
        var _text = text || '喵~';
        var _type = type || 'success';
        $("#MoeNotification").append($("<div>").addClass('MoeNotification-notice').addClass('MoeNotification-notice-' + _type).append('<span>' + _text + '</span>').fadeIn(300));
        self.bind();
        self.clear();
        _callback($("#MoeNotification").find('.MoeNotification-notice').last());
    };
    this.create = {
        success: function success(text, callback) {
            var _callback = callback || function () {};
            self.display(text, 'success', _callback);
        },
        warning: function warning(text, callback) {
            var _callback = callback || function () {};
            self.display(text, 'warning', _callback);
        },
        error: function error(text, callback) {
            var _callback = callback || function () {};
            self.display(text, 'error', _callback);
        }
    };
    this.clear = function () {
        if ($(".MoeNotification-notice").length >= 10) {
            $("#MoeNotification").children().first().fadeOut(150, function () {
                $(this).remove();
            });
            setTimeout(self.clear, 300);
        } else {
            return false;
        }
    };
    this.empty = function (f) {
        $(".MoeNotification-notice").each(function (i) {
            if ($.isFunction(f)) {
                var object = this;
                setTimeout(function () {
                    f($(object));
                }, 200 * i);
            } else {
                $(this).delay(i * 200).fadeOut('fast', function () {
                    $(this).remove();
                });
            }
        });
    };
    this.bind = function () {
        $(".MoeNotification-notice").mouseover(function () {
            self.slideLeft($(this));
        });
    };
    window.slideLeft = this.slideLeft = function (object, speed) {
        object.css('position', 'relative');
        object.animate({
            left: "-200%"
        }, speed || 150, function () {
            $(this).fadeOut('fast', function () {
                $(this).remove();
            });
        });
    };
    this.init = function () {
        $("body").append('<div id="MoeNotification"></div>');
    };
    if (!($("#MoeNotification").length > 0)) {
        this.init();
    }
}
$(function () {
    var Wikipage = function Wikipage(mw) {
        _classCallCheck(this, Wikipage);

        var self = this;
    };
});
//# sourceMappingURL=Main.js.map
