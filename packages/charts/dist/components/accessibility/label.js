"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenReaderLabel = void 0;
const react_1 = __importDefault(require("react"));
function ScreenReaderLabel({ label, labelHeadingLevel, labelId, goalChartLabels, }) {
    const Heading = labelHeadingLevel;
    if (!label && !(goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.majorLabel) && !(goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.minorLabel))
        return null;
    let unifiedLabel = '';
    if (!label && (goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.majorLabel)) {
        unifiedLabel = goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.majorLabel;
    }
    else if (label && !(goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.majorLabel)) {
        unifiedLabel = label;
    }
    else if (label && (goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.majorLabel) && label !== (goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.majorLabel)) {
        unifiedLabel = `${label}; Chart visible label: ${goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.majorLabel}`;
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        unifiedLabel && react_1.default.createElement(Heading, { id: labelId }, unifiedLabel),
        (goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.minorLabel) && react_1.default.createElement("p", null, goalChartLabels === null || goalChartLabels === void 0 ? void 0 : goalChartLabels.minorLabel)));
}
exports.ScreenReaderLabel = ScreenReaderLabel;
//# sourceMappingURL=label.js.map