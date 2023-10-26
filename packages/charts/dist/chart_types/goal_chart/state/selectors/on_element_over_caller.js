"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOverCaller = void 0;
const get_goal_spec_1 = require("./get_goal_spec");
const picked_shapes_1 = require("./picked_shapes");
const __1 = require("../../..");
const event_handler_selectors_1 = require("../../../../common/event_handler_selectors");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
function createOnElementOverCaller() {
    const prev = { pickedShapes: [] };
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Goal) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_goal_spec_1.getGoalSpecSelector, picked_shapes_1.getPickedShapesLayerValues, get_settings_spec_1.getSettingsSpecSelector], (0, event_handler_selectors_1.getOnElementOverSelector)(prev));
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementOverCaller = createOnElementOverCaller;
//# sourceMappingURL=on_element_over_caller.js.map