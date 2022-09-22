"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIGHT_THEME = void 0;
var colors_1 = require("../../common/colors");
var constants_1 = require("../../common/constants");
var common_1 = require("../common");
var colors_2 = require("./colors");
var theme_common_1 = require("./theme_common");
exports.LIGHT_THEME = {
    chartPaddings: theme_common_1.DEFAULT_CHART_PADDING,
    chartMargins: theme_common_1.DEFAULT_CHART_MARGINS,
    lineSeriesStyle: {
        line: {
            visible: true,
            strokeWidth: 1,
            opacity: 1,
        },
        point: {
            visible: true,
            strokeWidth: 1,
            fill: colors_1.Colors.White.keyword,
            radius: 2,
            opacity: 1,
        },
        fit: {
            line: {
                opacity: 1,
                visible: true,
                dash: [5, 5],
                stroke: common_1.ColorVariant.Series,
            },
        },
    },
    bubbleSeriesStyle: {
        point: {
            visible: true,
            strokeWidth: 1,
            fill: colors_1.Colors.White.keyword,
            radius: 2,
            opacity: 1,
        },
    },
    areaSeriesStyle: {
        area: {
            visible: true,
            opacity: 0.3,
        },
        line: {
            visible: true,
            strokeWidth: 1,
            opacity: 1,
        },
        point: {
            visible: false,
            strokeWidth: 1,
            fill: colors_1.Colors.White.keyword,
            radius: 2,
            opacity: 1,
        },
        fit: {
            line: {
                visible: true,
                dash: [5, 5],
                stroke: common_1.ColorVariant.Series,
                opacity: 1,
            },
            area: {
                visible: true,
                opacity: 0.15,
                fill: common_1.ColorVariant.Series,
            },
        },
    },
    barSeriesStyle: {
        rect: {
            opacity: 1,
        },
        rectBorder: {
            visible: false,
            strokeWidth: 1,
        },
        displayValue: {
            fontSize: 8,
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            padding: 0,
            fill: '#777',
            offsetX: 0,
            offsetY: 0,
        },
    },
    arcSeriesStyle: {
        arc: {
            visible: true,
            stroke: colors_1.Colors.Black.keyword,
            strokeWidth: 1,
            opacity: 1,
        },
    },
    sharedStyle: theme_common_1.DEFAULT_GEOMETRY_STYLES,
    scales: {
        barsPadding: 0.25,
        histogramPadding: 0.05,
    },
    axes: {
        axisTitle: {
            visible: true,
            fontSize: 12,
            fontFamily: 'sans-serif',
            padding: {
                inner: 8,
                outer: 0,
            },
            fill: '#333',
        },
        axisPanelTitle: {
            visible: true,
            fontSize: 10,
            fontFamily: 'sans-serif',
            padding: {
                inner: 8,
                outer: 0,
            },
            fill: '#333',
        },
        axisLine: {
            visible: true,
            stroke: '#eaeaea',
            strokeWidth: 1,
        },
        tickLabel: {
            visible: true,
            fontSize: 10,
            fontFamily: 'sans-serif',
            fontStyle: 'normal',
            fill: '#777',
            padding: 0,
            rotation: 0,
            offset: {
                x: 0,
                y: 0,
                reference: 'local',
            },
            alignment: {
                vertical: 'near',
                horizontal: 'near',
            },
        },
        tickLine: {
            visible: true,
            stroke: '#eaeaea',
            strokeWidth: 1,
            size: 10,
            padding: 10,
        },
        gridLine: {
            horizontal: {
                visible: false,
                stroke: '#D3DAE6',
                strokeWidth: 1,
                opacity: 1,
                dash: [0, 0],
            },
            vertical: {
                visible: false,
                stroke: '#D3DAE6',
                strokeWidth: 1,
                opacity: 1,
                dash: [0, 0],
            },
            lumaSteps: [224, 184, 128, 96, 64, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0],
        },
    },
    colors: {
        vizColors: colors_2.palettes.echPaletteColorBlind.colors,
        defaultVizColor: theme_common_1.DEFAULT_MISSING_COLOR,
    },
    legend: {
        verticalWidth: 200,
        horizontalHeight: 64,
        spacingBuffer: 10,
        margin: 0,
        labelOptions: {
            maxLines: 1,
        },
    },
    crosshair: {
        band: {
            fill: '#F5F5F5',
            visible: true,
        },
        line: {
            stroke: '#98A2B3',
            strokeWidth: 1,
            visible: true,
        },
        crossLine: {
            stroke: '#98A2B3',
            strokeWidth: 1,
            dash: [5, 5],
            visible: true,
        },
    },
    background: {
        color: colors_1.Colors.Transparent.keyword,
        fallbackColor: colors_1.Colors.White.keyword,
    },
    goal: {
        minFontSize: 8,
        maxFontSize: 64,
        maxCircularSize: 360,
        maxBulletSize: 500,
        barThicknessMinSizeRatio: 1 / 10,
        baselineArcThickness: 32,
        baselineBarThickness: 32,
        marginRatio: 0.05,
        maxTickFontSize: 24,
        maxLabelFontSize: 32,
        maxCentralFontSize: 38,
        arcBoxSamplePitch: (5 / 360) * constants_1.TAU,
        capturePad: 16,
        tickLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: colors_1.Colors.Black.keyword,
        },
        majorLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: colors_1.Colors.Black.keyword,
        },
        minorLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: colors_1.Colors.Black.keyword,
        },
        majorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: colors_1.Colors.Black.keyword,
        },
        minorCenterLabel: {
            fontStyle: 'normal',
            fontFamily: 'sans-serif',
            fill: colors_1.Colors.Black.keyword,
        },
        targetLine: {
            stroke: colors_1.Colors.Black.keyword,
        },
        tickLine: {
            stroke: 'darkgrey',
        },
        progressLine: {
            stroke: colors_1.Colors.Black.keyword,
        },
    },
    partition: {
        outerSizeRatio: 1 / constants_1.GOLDEN_RATIO,
        emptySizeRatio: 0,
        fontFamily: 'Sans-Serif',
        minFontSize: 8,
        maxFontSize: 64,
        idealFontSizeJump: 1.05,
        maximizeFontSize: false,
        circlePadding: 2,
        radialPadding: constants_1.TAU / 360,
        horizontalTextAngleThreshold: constants_1.TAU / 12,
        horizontalTextEnforcer: 1,
        fillLabel: {
            textColor: common_1.ColorVariant.Adaptive,
            fontFamily: 'Sans-Serif',
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontWeight: 400,
            valueFont: {
                fontWeight: 400,
                fontStyle: 'normal',
                fontVariant: 'normal',
            },
            padding: 2,
            clipText: false,
        },
        linkLabel: {
            maximumSection: 10,
            fontFamily: 'Sans-Serif',
            fontSize: 12,
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontWeight: 400,
            gap: 10,
            spacing: 2,
            horizontalStemLength: 10,
            radiusPadding: 10,
            lineWidth: 1,
            maxCount: 36,
            maxTextLength: 100,
            textColor: common_1.ColorVariant.Adaptive,
            minimumStemLength: 0,
            stemAngle: constants_1.TAU / 8,
            padding: 0,
            valueFont: {
                fontWeight: 400,
                fontStyle: 'normal',
                fontVariant: 'normal',
            },
        },
        sectorLineWidth: 1,
        sectorLineStroke: 'white',
    },
    heatmap: {
        maxRowHeight: 30,
        maxColumnWidth: 30,
        brushArea: {
            visible: true,
            stroke: '#69707D',
            strokeWidth: 2,
        },
        brushMask: {
            visible: true,
            fill: '#73737380',
        },
        brushTool: {
            visible: false,
            fill: 'gray',
        },
        xAxisLabel: {
            visible: true,
            fontSize: 12,
            fontFamily: 'Sans-Serif',
            fontStyle: 'normal',
            textColor: colors_1.Colors.Black.keyword,
            fontVariant: 'normal',
            fontWeight: 'normal',
            padding: { top: 5, bottom: 5, left: 5, right: 5 },
            rotation: 0,
        },
        yAxisLabel: {
            visible: true,
            width: 'auto',
            fontSize: 12,
            fontFamily: 'Sans-Serif',
            fontStyle: 'normal',
            textColor: colors_1.Colors.Black.keyword,
            fontVariant: 'normal',
            fontWeight: 'normal',
            padding: { top: 5, bottom: 5, left: 5, right: 5 },
        },
        grid: {
            cellWidth: {
                min: 0,
                max: 30,
            },
            cellHeight: {
                min: 12,
                max: 30,
            },
            stroke: {
                width: 1,
                color: 'gray',
            },
        },
        cell: {
            maxWidth: 'fill',
            maxHeight: 'fill',
            align: 'center',
            label: {
                visible: true,
                maxWidth: 'fill',
                minFontSize: 8,
                maxFontSize: 12,
                fontFamily: 'Sans-Serif',
                fontStyle: 'normal',
                textColor: colors_1.Colors.Black.keyword,
                fontVariant: 'normal',
                fontWeight: 'normal',
                useGlobalMinFontSize: true,
            },
            border: {
                strokeWidth: 1,
                stroke: 'gray',
            },
        },
    },
    metric: {
        text: {
            lightColor: '#E0E5EE',
            darkColor: '#343741',
        },
        barBackground: '#EDF0F5',
        background: '#FFFFFF',
        nonFiniteText: 'N/A',
    },
    tooltip: {
        maxTableBodyHeight: 120,
    },
};
//# sourceMappingURL=light_theme.js.map