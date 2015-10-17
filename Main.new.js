/// <reference path="../typings/jquery/jquery.d.ts"/>
/**
* Wikiplus
* Author:+Eridanus Sora/@妹空酱
* Github:https://github.com/Last-Order/Wikiplus
*/
$(function () {
    var i18nData = {};
    i18nData['zh-cn'] = {
        __language: 'zh-cn',
        __author: 'Eridanus Sora',
        unknown_error_name: '未知的错误名',
        api_unaccessiable: '无可用的API',
        api_unwriteable: '无可用的写入API',
        fail_to_get_timestamp: '无法获得页面编辑起始时间戳',
        fail_to_get_edittoken: '无法获得页面编辑权标',
        fail_to_get_pageinfo: '无法获得页面信息',
        not_autoconfirmed_user: '非自动确认用户',
        hit_abusefilter: '被防滥用过滤器拦截',
        unknown_edit_error: '未知编辑错误',
        unknown_edit_error_message: '未知编辑错误($1)',
        notitle: '无法编辑空标题页面',
        notext: '缺少页面内容',
        notoken: '空编辑权标',
        invalidsection: '段落编号非法',
        protectedtitle: '该标题被保护，无法创建',
        cantcreate: '无新建页面权限',
        cantcreate_anon: '匿名用户无新建页面权限',
        articleexists: '无法创建已经存在的页面',
        noimageredirect_anon: '匿名用户无新建文件重定向权限',
        noimageredirect: '无新建文件重定向权限',
        spamdetected: '文本含有敏感内容，被SPAM过滤器拦截',
        filtered: '编辑被过滤器拦截',
        contenttoobig: '文本超过最大长度限制',
        noedit_anon: '匿名用户无编辑页面权限',
        noedit: '无编辑页面权限',
        pagedeleted: '编辑时，此页面被删除',
        emptypage: '无法新建空内容页面',
        emptynewsection: '无法新建空内容段落',
        editconflict: '编辑冲突，请手工检查页面当前内容与提交内容差异并修正后，刷新页面提交',
        revwrongpage: '编辑的修订版本与编辑的页面不匹配',
        undofailure: '由于存在冲突的中间版本，无法撤销编辑',
        missingtitle: '无法创建或编辑空标题页面',
        mustbeposted: '必须使用POST方式提交编辑',
        readapidenied: '无读取API使用权限',
        writeapidenied: '无通过API编辑页面权限',
        noapiwrite: '本Wiki未开启可用的写入API',
        badtoken: '非法的编辑权标',
        missingparam: '缺少必要参数，页面名和页面ID不能均为空',
        invalidparammix: '参数重复，页面名和页面ID不能同时给定',
        invalidtitle: '非法的标题',
        nosuchpageid: '不存在的页面ID',
        pagecannotexist: '该名称空间不允许新建一般页面',
        nosuchrevid: '不存在的修订版本',
        badmd5: '非法的MD5值',
        hookaborted: '编辑被扩展Hook拦截',
        parseerror: '无法解析页面文本',
        summaryrequired: '编辑摘要不能为空',
        blocked: '已被封禁',
        ratelimited: '达到操作速率上限，请稍后重试',
        unknownerror: '未知错误',
        nosuchsection: '无法编辑不存在的段落',
        sectionsnotsupported: '该页面不支持段落编辑',
        editnotsupported: '该页面不支持通过API编辑',
        appendnotsupported: '该页面无法在前后插入文本',
        redirect_appendonly: '在遵循重定向的情况下，只能进行前后插入或创建新段落',
        badformat: '文本格式错误',
        customcssprotected: '无法编辑用户CSS页',
        customjsprotected: '无法编辑用户JS页',
        cascadeprotected: '该页面被级联保护',
        network_edit_error: '由于网络原因编辑失败',
        redirect_to_summary: '重定向页面至 [[$1]] // Wikiplus',
        redirect_from_summary: '将[[$1]]重定向至[[$2]] // Wikiplus',
        need_init : '页面类未加载完成'

    }
    /**
     * 多语言转换
     * @param {stirng} key 字段标识名
     * @return {string} 经过转换的内容 如未找到对应的多语言字段 则返回简体中文
     */
    function i18n(key) {
        var language = window.navigator.language.toLowerCase();
        if (i18nData[language][key]) {
            return i18nData[language][key];
        }
        else if (i18nData['zh-cn'][key]) {
            return i18nData['zh-cn'][key];
        }
        else {
            return 'undefined';
        }
    }
    /**
     * 获得错误信息
     * @param {stirng} name
     * @return {object} {number,message}
     */
    function getErrorInfo(name) {
        var errorList = {
            unknown_error_name: {
                number: 1001,
                message: i18n('unknown_error_name')
            },
            api_unaccessiable: {
                number: 1002
            },
            api_unwriteable: {
                number: 1003
            },
            fail_to_get_timestamp: {
                number: 1004
            },
            fail_to_get_edittoken: {
                number: 1005
            },
            fail_to_get_pageinfo: {
                number: 1006
            },
            not_autoconfirmed_user: {
                number: 1007
            },
            hit_abusefilter: {
                number: 1008
            },
            unknown_edit_error: {
                number: 1009
            },
            unknown_edit_error_message: {
                number: 1010
            },
            notitle: {
                number: 1011
            },
            notext: {
                number: 1012
            },
            notoken: {
                number: 1013
            },
            invalidsection: {
                number: 1014
            },
            protectedtitle: {
                number: 1015
            },
            cantcreate: {
                number: 1016
            },
            cantcreate_anon: {
                number: 1017
            },
            articleexists: {
                number: 1018
            },
            noimageredirect_anon: {
                number: 1019
            },
            noimageredirect: {
                number: 1020
            },
            spamdetected: {
                number: 1021
            },
            filtered: {
                number: 1022
            },
            contenttoobig: {
                number: 1023
            },
            noedit_anon: {
                number: 1025
            },
            noedit: {
                number: 1026
            },
            pagedeleted: {
                number: 1027
            },
            emptypage: {
                number: 1028
            },
            emptynewsection: {
                number: 1029
            },
            editconflict: {
                number: 1030
            },
            revwrongpage: {
                number: 1031
            },
            undofailure: {
                number: 1032
            },
            missingtitle: {
                number: 1033
            },
            mustbeposted: {
                number: 1034
            },
            readapidenied: {
                number: 1035
            },
            writeapidenied: {
                number: 1036
            },
            noapiwrite: {
                number: 1037
            },
            badtoken: {
                number: 1038
            },
            missingparam: {
                number: 1039
            },
            invalidparammix: {
                number: 1040
            },
            invalidtitle: {
                number: 1041
            },
            nosuchpageid: {
                number: 1042
            },
            pagecannotexist: {
                number: 1043
            },
            nosuchrevid: {
                number: 1044
            },
            badmd5: {
                number: 1045
            },
            hookaborted: {
                number: 1046
            },
            parseerror: {
                number: 1047
            },
            summaryrequired: {
                number: 1048
            },
            blocked: {
                number: 1049
            },
            ratelimited: {
                number: 1050
            },
            unknownerror: {
                number: 1051
            },
            nosuchsection: {
                number: 1052
            },
            sectionsnotsupported: {
                number: 1053
            },
            editnotsupported: {
                number: 1054
            },
            appendnotsupported: {
                number: 1055
            },
            redirect_appendonly: {
                number: 1056
            },
            badformat: {
                number: 1057
            },
            customcssprotected: {
                number: 1058
            },
            customjsprotected: {
                number: 1059
            },
            cascadeprotected: {
                number: 1060
            },
            network_edit_error: {
                number: 1061
            },
            need_init : {
                number : 1062
            }
        };
        if (errorList[name]) {
            if (errorList[name].message) {
                return {
                    number: errorList[name].number,
                    message: errorList[name].message
                };
            }
            else if (i18n(name) !== 'undefined') {
                return {
                    number: errorList[name].number,
                    message: i18n(name)
                }
            }
            else {
                return {
                    number: errorList[name].number,
                    message: '未知错误'
                }
            }
        }
        else {
            return {
                number: errorList.unknown_error_name.number,
                message: errorList.unknown_error_name.message
            }
        }
    }

    function loadLanguage(language) {
        $.ajax({
            url: 'path',
            dataType: 'json',
            success: function (data) {
                if (data.__language) {                 // Example:
                    i18nData[data.__language] = data;  // { 
                }                                      //   '__language' : 'zh-cn'
                else {                                  //   'key' : 'value'
                }                                      // }
            }
        })
    }
    class Wikipage {
        /**
         * 判断值是否存在于数组
         * @param {string} value
         * @param {array} array
         * @return {boolean} whether array is in the array
         */
        inArray(value, array = []) {
            return $.inArray(value, array) === -1 ? false : true;
        }
        /** 
         * 抛出错误
         * @param {string} name
         * @return boolean
        */
        throwError(name, message) {
            var errInfo = getErrorInfo(name);
            var e = new Error();
            e.number = errInfo.number;
            e.message = message || errInfo.message;
            console.log(`%c致命错误[${e.number}]:${e.message}`, 'color:red');
            return e;
        }
        constructor(pageName = window.mw.config.values.wgPageName) {
            var self = this;
            console.log('页面类构建中');
            //可用性和权限检测
            if (!window.mw) {
                console.log('页面Javascript载入不完全或这不是一个Mediawiki站点');
                return;
            }
            if (!window.mw.config.values.wgEnableAPI || !window.mw.config.values.wgEnableWriteAPI) {
                self.throwError('api_unaccessiable');
                return;
            }
            if (!self.inArray('autoconfirmed', window.mw.config.values.wgUserGroups)) {
                self.throwError('not_autoconfirmed_user');
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
                                    self.throwError('fail_to_get_timestamp');
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
                                            self.throwError('fail_to_get_edittoken');
                                        }
                                    }
                                }
                            }
                            else {
                                //原来版本这里依然会试着用前端API来获取Token，但是这样就没有了起始时间戳，有产生编辑覆盖的可能性
                                self.throwError('fail_to_get_pageinfo');
                                self.inited = true;
                            }
                        }
                    }
                }
            }).done(function () {
                console.timeEnd('获得页面基础信息时间耗时');
                self.inited = true;
            })
        }
        /**
         * 页面编辑
         * @param {string} content 页面内容
         * @param {string} title  页面标题 默认为当前页面标题
         * @param {object} config 设置 覆盖到默认的设置
         * @param {object} callback 
         */
        edit(content = '', title = this.pageName, config = {}, callback = {
            'success': new Function(),
            'fail': new Function()
        }) {
            var self = this;
            if (self.inited) {
                $.ajax({
                    type: 'POST',
                    url: self.API,
                    data: $.extend({
                        'action': 'edit',
                        'format': 'json',
                        'text': content,
                        'title': title,
                        'token': self.editToken,
                        'basetimestamp': self.timeStamp
                    }, config),
                    success: function (data) {
                        if (data && data.edit) {
                            if (data.edit.result && data.edit.result == 'Success') {
                                callback.success();
                            }
                            else {
                                if (data.edit.code) {
                                    //防滥用过滤器
                                    callback.fail(self.throwError('hit_abusefilter', `触发防滥用过滤器:${data.edit.info.replace('/Hit AbuseFilter: /ig', '') }<br><small>${data.edit.warning}</small>`));
                                }
                                else {
                                    callback.fail(self.throwError('unknown_edit_error'));
                                }
                            }
                        }
                        else if (data && data.error && data.error.code) {
                            callback.fail(self.throwError(data.error.code.replace(/-/ig, '_')), i18n('unknown_edit_error_message').replace(/\$1/ig, data.error.code));
                        }
                        else if (data.code) {
                            callback.fail(self.throwError('unknown_edit_error'), i18n('unknown_edit_error_message').replace(/\$1/ig, data.code));
                        }
                        else {
                            callback.fail(self.throwError('unknown_edit_error'));
                        }
                    },
                    error: function (e) {
                        callback.fail(self.throwError('network_edit_error'));
                    }
                })
            }
            else {
                callback.fail(self.throwError(1017, '页面类未加载完成'));
            }
        }
        /**
         * 编辑段落
         * @param {number} section 段落编号
         * @param {string} content 内容
         * @param {string} title 页面标题
         * @param {object} config 设置 
         * @param {object} callback 回调函数 
         */
        editSection(section, content, title = this.pageName, config = {}, callback = {
            success: new Function(),
            fail: new Function()
        }) {
            this.edit(content, title, $.extend({
                'section': section
            }, config), callback);
        }
        /**
         * 重定向页面至
         * @param {string} target 目标页面标题
         * @param {string} title 页面名 默认为当前页面
         * @param {object} callback 回调函数
         */
        redirectTo(target, title = this.pageName, callback = {
            success: new Function(),
            fail: new Function()
        }) {
            this.edit(`#REDIRECT [[${target}]]`, title, {
                'summary': i18n('redirect_to_summary').replace(/\$1/ig, target)
            }, callback);
        }
        /**
         * 重定向自
         * @param {string} origin 重定向页标题
         * @param {string} title 重定向目标页标题 默认为当前页
         * @param {object} callback
         */
        redirectFrom(origin, title = this.pageName, callback = {
            success: new Function(),
            fail: new Function()
        }) {
            this.edit(`#REDIRECT [[${title}]]`, origin, {
                summary: i18n('redirect_from_summary').replace(/\$1/ig, origin).replace(/\$2/ig, title)
            }, callback);
        }
    }
    $(document).ready(function () {
        class Wikiplus {
            constructor() {
                var self = this;
                this.version = '2.0';
                this.releaseNote = '重构';
                console.log('正在加载Wikiplus');
                self.kotori = new Wikipage();
            }
        }
        window.Wikiplus = new Wikiplus();
    })
})