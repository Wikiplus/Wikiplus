import Constants from "../utils/constants";
import Notification from "./notification";
import i18n from "../utils/i18n";
import Log from "../utils/log";

class UI {
    quickEditPanelVisible = false;
    scrollTop = 0;

    /**
     * 加载CSS
     * @param {string} url
     */
    loadCSS(url) {
        $("<link>")
            .attr({
                rel: "stylesheet",
                type: "text/css",
                href: `${url}`,
            })
            .appendTo($("head"));
    }

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
        const clientWidth = document.body.clientWidth;
        const clientHeight = document.body.clientHeight;
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
    }

    /**
     * 在搜索框左侧「更多」菜单内添加按钮
     * Add a button in "More" menu (left of the search bar)
     * @param {string} text 按钮名 Button text
     * @param {string} id 按钮id Button id
     * @return {JQuery<HTMLElement>} button
     */
    addFunctionButton(text, id) {
        const button = $("<li></li>")
            .attr("id", id)
            .append($("<a></a>").attr("href", "javascript:void(0);").text(text));
        if ($("#p-cactions").length > 0) {
            $("#p-cactions ul").append(button);
            return $("#p-cactions ul").find("li").last();
        } else {
            Log.error("cant_add_funcbtn");
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
            )
            .on("click", () => {
                onClick({
                    sectionNumber: -1,
                    targetPageName: Constants.currentPageName,
                });
            });
        if ($("#ca-edit").length > 0 && $("#Wikiplus-Edit-TopBtn").length == 0) {
            $("#ca-edit").before(topBtn);
        }
    }

    /**
     * 插入段落快速编辑按钮
     * Insert QuickEdit buttons for each section.
     */
    insertSectionQuickEditEntries(onClick) {
        const sectionBtn = $("<span>")
            .append($("<span>").addClass("mw-editsection-divider").text(" | "))
            .append(
                $("<a>")
                    .addClass("Wikiplus-Edit-SectionBtn")
                    .attr("href", "javascript:void(0)")
                    .text(i18n.translate("quickedit_sectionbtn"))
            );
        $(".mw-editsection").each(function (i) {
            try {
                const editURL = $(this).find("a").last().attr("href");
                const sectionNumber = editURL
                    .match(/&[ve]*section\=([^&]+)/)[1] // `ve` for visual editor
                    .replace(/T-/gi, ""); // embedded pages use T-series section number
                const sectionTargetName = decodeURIComponent(editURL.match(/title=(.+?)&/)[1]);
                const cloneNode = $(this).prev().clone();
                cloneNode.find(".mw-headline-number").remove();
                const sectionName = $.trim(cloneNode.text());
                const _sectionBtn = sectionBtn.clone();
                _sectionBtn.find(".Wikiplus-Edit-SectionBtn").on("click", () => {
                    onClick({
                        sectionNumber,
                        sectionName,
                        targetPageName: sectionTargetName,
                    });
                });
                $(this).find(".mw-editsection-bracket").last().before(_sectionBtn);
            } catch (e) {
                Log.error("fail_to_init_quickedit");
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
    }) {
        const self = this;
        this.scrollTop = $(document).scrollTop();
        if (this.quickEditPanelVisible) {
            this.hideQuickEditPanel();
        }
        this.quickEditPanelVisible = true;
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
            $("#Wikiplus-Quickedit").text(content);
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
            };
            // 是否为小编辑
            payload.isMinorEdit = $("#Wikiplus-Quickedit-MinorEdit").is(":checked");
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
                    .text(`${i18n.translate("edit_success")}`.replace(/\$1/gi, useTime.toString()));
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
    }

    hideQuickEditPanel() {
        this.quickEditPanelVisible = false;
        $(".Wikiplus-InterBox").fadeOut("fast", function () {
            window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
            $(this).remove();
        });
    }
}

export default new UI();
