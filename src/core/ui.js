import i18n from "../utils/i18n";
import Log from "../utils/log";

class UI {
    quickEditPanelVisible = false;

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
    insertTopQuickEditEntry(clickHandler) {
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
                clickHandler({
                    sectionNumber: -1,
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
    insertSectionQuickEditEntries(clickHandler) {
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
                    clickHandler({
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

    showQuickEditPanel() {
        if (this.quickEditPanelVisible) {
            //
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
    }
}

export default new UI();
