import Constants from "../utils/constants";
import Notification from "./notification";
import i18n from "../utils/i18n";
import Log from "../utils/log";
import sleep from "../utils/sleep";
import { parseQuery } from "../utils/helpers";

class UI {
    quickEditPanelVisible = false;
    scrollTop = 0;

    /**
     * 创建居中对话框
     * @param {string} title 窗口标题
     * @param {string | JQuery<HTMLElement>} content 内容
     * @param {*} width 宽度
     * @param {*} callback 回调函数
     */
    createDialogBox(title = "Wikiplus", content = "", width = 600, callback = () => {}) {
        if ($(".Wikiplus-InterBox").length > 0) {
            $(".Wikiplus-InterBox").each(function () {
                $(this).remove();
            });
        }
        const clientWidth = window.innerWidth;
        const clientHeight = window.innerHeight;
        const dialogWidth = Math.min(clientWidth, width);
        const dialogBox = $("<div>")
            .addClass("Wikiplus-InterBox")
            .css({
                "margin-left": clientWidth / 2 - dialogWidth / 2,
                top: $(document).scrollTop() + clientHeight * 0.2,
                display: "none",
            })
            .append($("<div>").addClass("Wikiplus-InterBox-Header").html(title))
            .append($("<div>").addClass("Wikiplus-InterBox-Content").append(content))
            .append($("<span>").text("×").addClass("Wikiplus-InterBox-Close"));
        $("body").append(dialogBox);
        $(".Wikiplus-InterBox").width(dialogWidth);
        $(".Wikiplus-InterBox-Close").on("click", function () {
            $(this)
                .parent()
                .fadeOut("fast", function () {
                    window.onclose = window.onbeforeunload = undefined; // 取消页面关闭确认
                    $(this).remove();
                });
        });
        //拖曳
        const bindDragging = function (element) {
            element.mousedown(function (e) {
                var baseX = e.clientX;
                var baseY = e.clientY;
                var baseOffsetX = element.parent().offset().left;
                var baseOffsetY = element.parent().offset().top;
                $(document).on("mousemove", function (e) {
                    element.parent().css({
                        "margin-left": baseOffsetX + e.clientX - baseX,
                        top: baseOffsetY + e.clientY - baseY,
                    });
                });
                $(document).on("mouseup", function () {
                    element.unbind("mousedown");
                    $(document).off("mousemove");
                    $(document).off("mouseup");
                    bindDragging(element);
                });
            });
        };
        bindDragging($(".Wikiplus-InterBox-Header"));
        $(".Wikiplus-InterBox").fadeIn(500);
        callback();
        return dialogBox;
    }

    /**
     * 在搜索框左侧「更多」菜单内添加按钮
     * Add a button in "More" menu (left of the search bar)
     * @param {string} text 按钮名 Button text
     * @param {string} id 按钮id Button id
     * @return {JQuery<HTMLElement>} button
     */
    addFunctionButton(text, id) {
        let button;
        switch (Constants.skin) {
            case "minerva": {
                button = $("<li>")
                    .attr("id", id)
                    .addClass("toggle-list-item")
                    .append(
                        $("<a>")
                            .addClass("mw-ui-icon mw-ui-icon-before toggle-list-item__anchor")
                            .append(
                                $("<span>")
                                    .attr("href", "javascript:void(0);")
                                    .addClass("toggle-list-item__label")
                                    .text(text)
                            )
                    );
                break;
            }
            case "moeskin": {
            }
            default: {
                button = $("<li>")
                    .addClass("Wikiplus-More-Function-Button")
                    .attr("id", id)
                    .append($("<a>").attr("href", "javascript:void(0);").text(text));
            }
        }
        if (Constants.skin === "minerva" && $("#p-tb").length > 0) {
            $("#p-tb").append(button);
            return $(`#${id}`);
        } else if (Constants.skin === "moeskin") {
            $(".more-actions-list").first().append(button);
            return $(`#${id}`);
        } else if ($("#p-cactions").length > 0) {
            $("#p-cactions ul").append(button);
            return $(`#${id}`);
        } else {
            Log.info(i18n.translate("cant_add_funcbtn"));
        }
    }

    /**
     * 插入快速重定向按钮
     * @param {*} onClick
     */
    insertSimpleRedirectButton(onClick = () => {}) {
        const button = this.addFunctionButton(i18n.translate("redirect_from"), "Wikiplus-SR-Intro");
        if (button) {
            button.on("click", onClick);
        }
    }

    /**
     * 插入设置面板按钮
     * @param {*} onClick
     */
    insertSettingsPanelButton(onClick = () => {}) {
        const button = this.addFunctionButton(
            i18n.translate("wikiplus_settings"),
            "Wikiplus-Settings-Intro"
        );
        if (button) {
            button.on("click", onClick);
        }
    }

    /**
     * 插入顶部快速编辑按钮
     * Insert QuickEdit button besides page edit button.
     */
    insertTopQuickEditEntry(onClick) {
        const topBtn = $("<li>")
            .attr("id", "Wikiplus-Edit-TopBtn")
            .append(
                $("<span>").append(
                    $("<a>")
                        .attr("href", "javascript:void(0)")
                        .text(`${i18n.translate("quickedit_topbtn")}`)
                )
            );
        if (Constants.skin === "minerva") {
            $(topBtn).css({ "align-items": "center", display: "flex" });
            $(topBtn).find("span").addClass("page-actions-menu__list-item");
            $(topBtn)
                .find("a")
                .addClass(
                    "mw-ui-icon mw-ui-icon-element mw-ui-icon-wikimedia-edit-base20 mw-ui-icon-with-label-desktop"
                )
                .css("vertical-align", "middle");
        }
        $(topBtn).on("click", () => {
            onClick({
                sectionNumber: -1,
                targetPageName: Constants.currentPageName,
            });
        });
        if ($("#ca-edit").length > 0 && $("#Wikiplus-Edit-TopBtn").length === 0) {
            Constants.skin === "minerva"
                ? $("#ca-edit").parent().after(topBtn)
                : $("#ca-edit").after(topBtn);
        }
    }

    /**
     * 插入段落快速编辑按钮
     * Insert QuickEdit buttons for each section.
     */
    insertSectionQuickEditEntries(onClick = () => {}) {
        const sectionBtn =
            Constants.skin === "minerva"
                ? $("<span>").append(
                      $("<a>")
                          .addClass(
                              "Wikiplus-Edit-SectionBtn mw-ui-icon mw-ui-icon-element mw-ui-icon-wikimedia-edit-base20 edit-page mw-ui-icon-flush-right"
                          )
                          .css("margin-left", "0.75em")
                          .attr("href", "javascript:void(0)")
                          .attr("title", i18n.translate("quickedit_sectionbtn"))
                  )
                : $("<span>")
                      .append($("<span>").addClass("mw-editsection-divider").text(" | "))
                      .append(
                          $("<a>")
                              .addClass("Wikiplus-Edit-SectionBtn")
                              .attr("href", "javascript:void(0)")
                              .text(i18n.translate("quickedit_sectionbtn"))
                      );
        $(".mw-editsection").each(function (i) {
            try {
                const editURL = $(this).find("a[href*='action=edit']").first().attr("href");
                const sectionNumber = editURL
                    .match(/&[ve]*section\=([^&]+)/)[1] // `ve` for visual editor
                    .replace(/T-/gi, ""); // embedded pages use T-series section number
                const sectionTargetName = decodeURIComponent(editURL.match(/title=(.+?)&/)[1]);
                const cloneNode = $(this).prev().clone();
                cloneNode.find(".mw-headline-number").remove();
                const sectionName = cloneNode.text().trim();
                const _sectionBtn = sectionBtn.clone();
                _sectionBtn.find(".Wikiplus-Edit-SectionBtn").on("click", () => {
                    onClick({
                        sectionNumber,
                        sectionName,
                        targetPageName: sectionTargetName,
                    });
                });
                Constants.skin === "minerva"
                    ? $(this).append(_sectionBtn)
                    : $(this).find(".mw-editsection-bracket").last().before(_sectionBtn);
            } catch (e) {
                Log.error("fail_to_init_quickedit");
            }
        });
    }

    /**
     * 插入任意链接编辑入口
     * @param {*} onClick
     */
    insertLinkEditEntries(onClick = () => {}) {
        $("#mw-content-text a.external").each(function (i) {
            const url = $(this).attr("href");
            const params = parseQuery(url);
            if (
                params.action === "edit" &&
                params.title !== undefined &&
                params.section !== "new"
            ) {
                $(this).after(
                    $("<a>")
                        .attr({
                            href: "javascript:void(0)",
                            class: "Wikiplus-Edit-EveryWhereBtn",
                        })
                        .text(`(${i18n.translate("quickedit_sectionbtn")})`)
                        .on("click", () => {
                            onClick({
                                targetPageName: params.title,
                                sectionNumber: params.section ?? -1,
                            });
                        })
                );
            }
        });
    }

    showQuickEditPanel({
        title = "",
        content = "",
        summary = "",
        onBack = () => {},
        onParse = () => {},
        onEdit = () => {},
        escExit = false,
    }) {
        const self = this;
        this.scrollTop = $(document).scrollTop();
        if (this.quickEditPanelVisible) {
            this.hideQuickEditPanel();
        }
        this.quickEditPanelVisible = true;
        // 防止手滑关闭页面
        window.onclose = window.onbeforeunload = function () {
            return `${i18n.translate("onclose_confirm")}`;
        };
        const isNewPage = $(".noarticletext").length > 0;
        // DOM 定义开始
        const backBtn = $("<span>")
            .attr("id", "Wikiplus-Quickedit-Back")
            .addClass("Wikiplus-Btn")
            .text(`${i18n.translate("back")}`); // 返回按钮
        const jumpBtn = $("<span>")
            .attr("id", "Wikiplus-Quickedit-Jump")
            .addClass("Wikiplus-Btn")
            .append(
                $("<a>")
                    .attr("href", "#Wikiplus-Quickedit")
                    .text(`${i18n.translate("goto_editbox")}`)
            ); // 到编辑框
        const inputBox = $("<textarea>").attr("id", "Wikiplus-Quickedit"); // 主编辑框
        const previewBox = $("<div>").attr("id", "Wikiplus-Quickedit-Preview-Output"); // 预览输出
        const summaryBox = $("<input>")
            .attr("id", "Wikiplus-Quickedit-Summary-Input")
            .attr("placeholder", `${i18n.translate("summary_placehold")}`); // 编辑摘要输入
        const editSubmitBtn = $("<button>")
            .attr("id", "Wikiplus-Quickedit-Submit")
            .text(`${i18n.translate(isNewPage ? "publish_page" : "publish_change")}(Ctrl+S)`); // 提交按钮
        const previewSubmitBtn = $("<button>")
            .attr("id", "Wikiplus-Quickedit-Preview-Submit")
            .text(`${i18n.translate("preview")}`); // 预览按钮
        const isMinorEdit = $("<div>")
            .append($("<input>").attr({ type: "checkbox", id: "Wikiplus-Quickedit-MinorEdit" }))
            .append(
                $("<label>")
                    .attr("for", "Wikiplus-Quickedit-MinorEdit")
                    .text(`${i18n.translate("mark_minoredit")}(Ctrl+Shift+S)`)
            )
            .css({ margin: "5px 5px 5px -3px", display: "inline" });
        // DOM定义结束
        const editBody = $("<div>").append(
            backBtn,
            jumpBtn,
            previewBox,
            inputBox,
            summaryBox,
            $("<br>"),
            isMinorEdit,
            editSubmitBtn,
            previewSubmitBtn
        );
        this.createDialogBox(title, editBody, 1000, () => {
            $("#Wikiplus-Quickedit").val(content);
            $("#Wikiplus-Quickedit-Summary-Input").val(summary);
        });
        // Back
        $("#Wikiplus-Quickedit-Back").on("click", onBack);
        // Preview
        $("#Wikiplus-Quickedit-Preview-Submit").on("click", async function () {
            const preloadBanner = $("<div>")
                .addClass("Wikiplus-Banner")
                .text(`${i18n.translate("loading_preview")}`);
            const wikiText = $("#Wikiplus-Quickedit").val();
            $(this).attr("disabled", "disabled");
            $("#Wikiplus-Quickedit-Preview-Output").fadeOut(100, function () {
                $("#Wikiplus-Quickedit-Preview-Output").html("").append(preloadBanner);
                $("#Wikiplus-Quickedit-Preview-Output").fadeIn(100);
            });
            $("html, body").animate({ scrollTop: self.scrollTop }, 200); //返回顶部
            const result = await onParse(wikiText);
            $("#Wikiplus-Quickedit-Preview-Output").fadeOut("100", function () {
                $("#Wikiplus-Quickedit-Preview-Output").html(
                    '<hr><div class="mw-body-content">' + result + "</div><hr>"
                );
                $("#Wikiplus-Quickedit-Preview-Output").fadeIn("100");
                $("#Wikiplus-Quickedit-Preview-Submit").prop("disabled", false);
            });
        });
        // Edit
        $("#Wikiplus-Quickedit-Submit").on("click", async function () {
            const timer = new Date().valueOf();
            const editBanner = $("<div>")
                .addClass("Wikiplus-Banner")
                .text(`${i18n.translate("submitting_edit")}`);
            const payload = {
                summary: $("#Wikiplus-Quickedit-Summary-Input").val(),
                content: $("#Wikiplus-Quickedit").val(),
                isMinorEdit: $("#Wikiplus-Quickedit-MinorEdit").is(":checked"),
            };
            // 准备编辑 禁用按钮 执行动画
            $(
                "#Wikiplus-Quickedit-Submit,#Wikiplus-Quickedit,#Wikiplus-Quickedit-Preview-Submit"
            ).attr("disabled", "disabled");
            $("html, body").animate({ scrollTop: self.scrollTop }, 200);
            $("#Wikiplus-Quickedit-Preview-Output").fadeOut(100, function () {
                $("#Wikiplus-Quickedit-Preview-Output").html("").append(editBanner);
                $("#Wikiplus-Quickedit-Preview-Output").fadeIn(100);
            });
            try {
                await onEdit(payload);
                const useTime = new Date().valueOf() - timer;
                $("#Wikiplus-Quickedit-Preview-Output")
                    .find(".Wikiplus-Banner")
                    .css("background", "rgba(6, 239, 92, 0.44)");
                $("#Wikiplus-Quickedit-Preview-Output")
                    .find(".Wikiplus-Banner")
                    .text(`${i18n.translate("edit_success", [useTime.toString()])}`);
                window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                setTimeout(function () {
                    location.reload();
                }, 500);
            } catch (e) {
                console.log(e);
                $(".Wikiplus-Banner").css("background", "rgba(218, 142, 167, 0.65)");
                $(".Wikiplus-Banner").html(e.message);
            } finally {
                $(
                    "#Wikiplus-Quickedit-Submit,#Wikiplus-Quickedit,#Wikiplus-Quickedit-Preview-Submit"
                ).prop("disabled", false);
            }
        });
        //Ctrl+S提交 Ctrl+Shift+S小编辑
        $("#Wikiplus-Quickedit,#Wikiplus-Quickedit-Summary-Input,#Wikiplus-Quickedit-MinorEdit").on(
            "keydown",
            function (e) {
                if (e.ctrlKey && e.which === 83) {
                    if (e.shiftKey) {
                        $("#Wikiplus-Quickedit-MinorEdit").trigger("click");
                    }
                    $("#Wikiplus-Quickedit-Submit").trigger("click");
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        );
        //Esc退出
        if (escExit) {
            $(document).on("keydown", function (e) {
                if (e.which === 27) {
                    $("#Wikiplus-Quickedit-Back").click();
                }
            });
        }
    }

    hideQuickEditPanel() {
        this.quickEditPanelVisible = false;
        $(".Wikiplus-InterBox").fadeOut("fast", function () {
            window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
            $(this).remove();
        });
    }

    /**
     * 显示快速重定向弹窗
     * @param {*}
     */
    showSimpleRedirectPanel({ onEdit = () => {}, onSuccess = () => {} } = {}) {
        const input = $("<input>").addClass("Wikiplus-InterBox-Input");
        const applyBtn = $("<div>")
            .addClass("Wikiplus-InterBox-Btn")
            .attr("id", "Wikiplus-SR-Apply")
            .text(i18n.translate("submit"));
        const cancelBtn = $("<div>")
            .addClass("Wikiplus-InterBox-Btn")
            .attr("id", "Wikiplus-SR-Cancel")
            .text(i18n.translate("cancel"));
        const continueBtn = $("<div>")
            .addClass("Wikiplus-InterBox-Btn")
            .attr("id", "Wikiplus-SR-Continue")
            .text(i18n.translate("continue"));
        const content = $("<div>")
            .append(input)
            .append($("<hr>"))
            .append(applyBtn)
            .append(cancelBtn); //拼接
        const dialog = this.createDialogBox(i18n.translate("redirect_desc"), content, 600);
        applyBtn.on("click", async () => {
            const title = $(".Wikiplus-InterBox-Input").val();
            $(".Wikiplus-InterBox-Content").html(
                `<div class="Wikiplus-Banner">${i18n.translate("submitting_edit")}</div>`
            );
            try {
                await onEdit({
                    title,
                    forceOverwrite: false,
                });
                $(".Wikiplus-Banner").text(i18n.translate("redirect_saved"));
                this.hideSimpleRedirectPanel(dialog);
                onSuccess({ title });
            } catch (e) {
                $(".Wikiplus-Banner").css("background", "rgba(218, 142, 167, 0.65)");
                $(".Wikiplus-Banner").text(e.message);
                if (e.code === "articleexists") {
                    $(".Wikiplus-InterBox-Content")
                        .append($("<hr>"))
                        .append(continueBtn)
                        .append(cancelBtn);
                    cancelBtn.on("click", () => {
                        this.hideSimpleRedirectPanel(dialog);
                    });
                    continueBtn.on("click", async () => {
                        $(".Wikiplus-InterBox-Content").html(
                            `<div class="Wikiplus-Banner">${i18n.translate(
                                "submitting_edit"
                            )}</div>`
                        );
                        try {
                            await onEdit({
                                title,
                                forceOverwrite: true,
                            });
                            $(".Wikiplus-Banner").text(i18n.translate("redirect_saved"));
                            this.hideSimpleRedirectPanel(dialog);
                            onSuccess({ title });
                        } catch (e) {
                            $(".Wikiplus-Banner").css("background", "rgba(218, 142, 167, 0.65)");
                            $(".Wikiplus-Banner").text(e.message);
                        }
                    });
                }
            }
        });
        cancelBtn.on("click", () => {
            this.hideSimpleRedirectPanel(dialog);
        });
    }

    /**
     * 隐藏快速重定向弹窗
     * @param {*} dialog
     */
    hideSimpleRedirectPanel(dialog = $("body")) {
        dialog.find(".Wikiplus-InterBox-Close").trigger("click");
    }

    showSettingsPanel({ onSubmit = () => {} } = {}) {
        const input = $("<textarea>").attr("id", "Wikiplus-Setting-Input").attr("rows", "10");
        const applyBtn = $("<div>")
            .addClass("Wikiplus-InterBox-Btn")
            .attr("id", "Wikiplus-Setting-Apply")
            .text(i18n.translate("submit"));
        const cancelBtn = $("<div>")
            .addClass("Wikiplus-InterBox-Btn")
            .attr("id", "Wikiplus-Setting-Cancel")
            .text(i18n.translate("cancel"));
        const content = $("<div>")
            .append(input)
            .append($("<hr>"))
            .append(applyBtn)
            .append(cancelBtn); //拼接

        const dialog = this.createDialogBox(
            i18n.translate("wikiplus_settings_desc"),
            content,
            600,
            function () {
                if (localStorage.Wikiplus_Settings) {
                    $("#Wikiplus-Setting-Input").val(localStorage.Wikiplus_Settings);
                    try {
                        const settings = JSON.parse(localStorage.Wikiplus_Settings);
                        $("#Wikiplus-Setting-Input").val(JSON.stringify(settings, null, 2));
                    } catch (e) {
                        // ignore
                    }
                } else {
                    $("#Wikiplus-Setting-Input").attr(
                        "placeholder",
                        i18n.translate("wikiplus_settings_placeholder")
                    );
                }
            }
        );
        applyBtn.on("click", async () => {
            const savedBanner = $("<div>")
                .addClass("Wikiplus-Banner")
                .text(i18n.translate("wikiplus_settings_saved"));
            const settings = $("#Wikiplus-Setting-Input").val();
            try {
                onSubmit({ settings });
                $(".Wikiplus-InterBox-Content").html("").append(savedBanner);
                await sleep(1500);
                this.hideSettingsPanel(dialog);
            } catch (e) {
                Notification.error(i18n.translate("wikiplus_settings_grammar_error"));
            }
        });
        cancelBtn.on("click", () => {
            this.hideSettingsPanel(dialog);
        });
    }

    hideSettingsPanel(dialog = $("body")) {
        dialog.find(".Wikiplus-InterBox-Close").trigger("click");
    }

    bindPreloadEvents(onPreload) {
        $("#toc")
            .children("ul")
            .find("a")
            .each(function (i) {
                $(this).on("mouseover", function () {
                    $(this).off("mouseover");
                    onPreload({
                        sectionNumber: i + 1,
                    });
                });
            });
    }
}

export default new UI();
