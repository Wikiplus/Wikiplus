import Log from "../utils/log";

class UI {
    /**
     * 在搜索框左侧「更多」菜单内添加按钮
     * Add a button in "More" menu (left of the search bar)
     * @param {string} text 按钮名 Button text
     * @param {string} id 按钮id Button id
     * @return {JQuery<HTMLElement>} button
     */
    static addFunctionButton(text, id) {
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
}

export default UI;
