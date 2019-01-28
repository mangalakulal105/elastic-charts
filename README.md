# Elastic Charts

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

🚨 **WARNING** While open source, the intended consumers of this repository are Elastic products. Read the [FAQ][faq] for details.

This library is a complete rewrite of the current vislib in Kibana and EUISeriesChart in EUI.
The rationale behind this refactoring is the need of a testable and decoupled architecture for displaying data as charts. The current EUI implementation is based on ReactVis that directly manipulate data series inside components, without a clear rendering pipeline and without a clean way to extend it. Some of the down side of using react vis are:

- the main chart component, before rendering children, looks at their props and recompute them injecting new props. Some configuration are accessed through references to children components
- the components are themself svg components that render bars, lines, axis. The problem with this is that not all components can be rendered at the same time, but there is the need of a rendering pipeline to allow a correct placement for all the geometries, specially when we face the need of having auto-scaled axis dimensions.
- the only way to test the chart is testing the resulting svg component. If rendered through canvas the test can be only a visual regression test.
- no possibility of manage x-indexing of elements

This new implementation revisit the concept of charting library and tries to apply an unidirectional rendering flow to the concept of charting. The rendering flow is the following:

![rendering-pipeline](https://user-images.githubusercontent.com/1421091/49724064-bba8cb80-fc68-11e8-8378-9d59b941f15d.png)

This controlled flows allows us to achieve the following points:

- the computation of series dimensions (x and y domains of the datasets for examples) are required to precompute the space required for the axis labelling. Axis rendering is dependant on the axis displayed values thus on the dataseries provided. To accommodate automatically spaced axis this is a required passage. Other libraries just live the developer with the needs to specify static margin space for render the axis labels that can incur into truncated labels.
- put a testing probes just before rendering the chart, the computed geometries are the exact values that needs to be used to render on svg, canvas or webgl on that exact portion of the screen. No further calculation are needed on the rendered. x, y, width, height, color, transforms are computed before the rendering phase that action.
- reduce the rendering operation to the minimum required. Resizing for example will only require the last 3 phases to complete.
- decouple the charts from its rendering medium: can be svg, canvas or webgl, using react or any other DOM library.
- part of this computation can also be processed server side or on a webworker.

The rendering pipeline is achieved revisiting the way on how a chart library is built. Instead of create a chart library around a set of rendering components: bar series, axis etc, this new implementation decouple the specification of the chart from the rendering components. The rendering components are part of the internals of the library. We are exposing `empty` react components to the developer, using the JSX format just as a declarative language to describe the specification of your chart and not as a set of real react component that will render something.
That is achieved using the following render function on the main `Chart` component:

```jsx
<Provider chartStore={this.chartSpecStore}>
  <Fragment>
    <SpecsParser>{this.props.children}</SpecsParser>
    <ChartResizer />
    {renderer === 'svg' && <SVGChart />}
    {renderer === 'canvas' && <CanvasChart />}
    {renderer === 'canvas_native' && <NativeChart />}
    <Tooltips />
  </Fragment>
</Provider>
```

Where all the children passed are rendered inside the `SpecsParser`, that signal a state manager that we are updating the specification of the chart, but doesn't render anything.
The actual rendering is done by one of the rendered like the `ReactChart` that is rendered after the rendering pipeline produced and saved the geometries on the state manager.

A spec can be something like the following:

```jsx
<Chart renderer={renderer}>
  <Settings rotation={rotation} animateData={true} />
  <Axis id={getAxisId('bottom')} position={AxisPosition.Bottom} title={`Rendering test`} />
  <Axis id={getAxisId('left')} position={AxisPosition.Left} />
  <LineSeries
    id={getSpecId('1')}
    yScaleType={ScaleType.Linear}
    xScaleType={ScaleType.Linear}
    xAccessor="x"
    yAccessors={['y']}
    data={BARCHART_1Y0G}
  />
  <BarSeries
    id={getSpecId('2')}
    yScaleType={ScaleType.Linear}
    xScaleType={ScaleType.Linear}
    xAccessor="x"
    yAccessors={['y1', 'y2']}
    splitSeriesAccessors={['g']}
    stackAccessors={['x', 'g']}
    data={BARCHART_2Y1G}
  />
</Chart>
```

## Setting Up Your Development Environment

Fork, then clone the `elastic-chart` repo and change directory into it

```bash
git clone git@github.com:<YOUR_GITHUB_NAME>/elastic-charts.git elastic-charts
cd kibana
```

Install the latest version of [yarn](https://yarnpkg.com)

We depend upon the version of node defined in [.nvmrc](.nvmrc).

You will probably want to install a node version manager. [nvm](https://github.com/creationix/nvm) is recommended.

To install and use the correct node version with `nvm`:

```bash
nvm install
```

Install all the dependencies

```bash
yarn install
```

### Storybook

We develop using [storybook](https://storybook.js.org) to document API, edge-cases, and usage of the library.
An hosted version will be available soon at [Elastic Charts](https://elastic.github.io/elastic-charts/).
You can run locally at [http://localhost:9001/](http://localhost:9001/) by running:

```
yarn storybook
```

## Installation

To install the Elastic UI Framework into an existing project, use the `yarn` CLI (`npm` is not supported).

```
yarn add @elastic/charts
```

## Contributing

We are trying to enforce some good practice on this library:

- All commits must follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
- [semantic-release](https://semantic-release.gitbook.io) is used as an automated release manager suite.
  This will automatically publish on NPM on every push on master, will automatically create the changelog and bump the correct semversion depending on the commits. To avoid too many new releases, specially in this initial phase of the project, we are going to work against a `dev` branch and then merge on master periodically.
- Every commit count in the version bump: this means that we can merge a PR with two methods:
  - merge all the PR commit history (please follow the commit convention or squash partial commits)
  - squash and merge all commits using a single commit that follow the conventions.

The following tools are used to ensure this convention:

- `commitlint` hook ensure that you are following correctly the convention
- `yarn cz` can be used to start `commitizen` as a cli tool that prompt you with selections and questions
  to help you on writing a conventional commit
- `commitlint-bot` is a github app that checks PR commits to help you on writing the correct commit message

## Concepts

### Axes

The concept of axes in this library follow the following constraints:

- there is no distinction between x axis or y axis.
- the distinction is between the position of the axis on the chart, top, bottom, left, right in relation with the rotation of the chart: A standard horizontal bar chart, with the Y, dependant variable, that raise to the top, can be supported by left and right axis that will shows the Y values, and bottom and top axis that will shows the X, independant variable. On the contrary, a 90 degree clockwise rotated bar chart, with the Y value that spread from left to right, will have a horizontal (bottom/top) axis that shows the Y independant variable and the left/right vertical axis that shows the X variable.

As a constraint we allow only one X axis, but we provide the ability to add multiple Y axis (also if it's a discouraged practice (see https://blog.datawrapper.de/dualaxis/ or http://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis)

### Dataset Domains:

Related to a dataset, is the extent of a variable. It usually used to draw the position of the specific value/datum along one axis (vertical or horizontal).
On a series chart, we always needs to have at least two domain, representing the 2 dimensions of the data we are drawing.

### Data

It's an array of values, that will be used to compute the chart. Usually each element must have at least 2 values to be charted. Multiple values can be used to specify how we want to split the chart by series and by y values.

Examples of datasets:

```ts
// 1 metric (y) and no groups/split series ===> 1 single series
const BARCHART_1Y0G = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 10 }, { x: 3, y: 6 }];

// 2 metrics (2y) and 1 group/split series ===> 4 different data series
const BARCHART_2Y1G = [
  { x: 0, g: 'a', y1: 1, y2: 4 },
  { x: 0, g: 'b', y1: 3, y2: 6 },
  { x: 1, g: 'a', y1: 2, y2: 1 },
  { x: 1, g: 'b', y1: 2, y2: 5 },
  { x: 2, g: 'a', y1: 10, y2: 5 },
  { x: 2, g: 'b', y1: 3, y2: 1 },
  { x: 3, g: 'a', y1: 7, y2: 3 },
  { x: 3, g: 'b', y1: 6, y2: 4 },
];
```

These datasets can be used as input for any type of chart specification. These are the interfaces that makes up a `BasicSpec` (some sort of abstract specification)

```ts
export interface SeriesSpec {
  /* The ID of the spec, generated via getSpecId method */
  id: SpecId;
  /* The ID of the spec, generated via getGroupId method, default to __global__ */
  groupId: GroupId;
  /* An array of data */
  data: Datum[];
  /* If specified, it constrant the x domain to these values */
  xDomain?: Domain;
  /* If specified, it constrant the y Domain to these values */
  yDomain?: Domain;
  /* The type of series you are looking to render */
  seriesType: 'bar' | 'line' | 'area' | 'basic';
}

export interface SeriesAccessors {
  /* The field name of the x value on Datum object */
  xAccessor: Accessor;
  /* An array of field names one per y metric value */
  yAccessors: Accessor[];
  /* An array of fields thats indicates the datum series membership */
  splitSeriesAccessors?: Accessor[];
  /* An array of fields thats indicates the stack membership */
  stackAccessors?: Accessor[];
  /* An optional array of field name thats indicates the stack membership */
  colorAccessors?: Accessor[];
}

export interface SeriesScales {
  /* The x axis scale type */
  xScaleType: ScaleType;
  /* The y axis scale type */
  yScaleType: ScaleContinuousType;
  /** if true, the min y value is set to the minimum domain value, 0 otherwise */
  yScaleToDataExtent: boolean;
}
```

A `BarSeriesSpec` for example is the following union type:

```ts
export type BarSeriesSpec = SeriesSpec &
  SeriesAccessors &
  SeriesScales & {
    seriesType: 'bar';
  };
```

A chart can be feed with data in the following ways:

- one series type specification with one `data` props configured.
- a set of series types with `data` props configured. In these case the data arrays are merged together as the following rules:
  - x values are merged together. If chart have multiple different `xScaleType`s, the main x scale type is coerced to `ScaleType.Linear` if all the scales are continuous or to `ScaleType.Ordinal` if one scale type is ordinal. Also temporal scale is, in specific case coerched to linear, so be carefull to configure correctly the scales.
  - if there is a specified x domain on the spec, this is used as x domain for that series, and it's merged together with the existing x domains.
  - specifications with `splitAccessors` are splitted into diffenent series. Each specification is treathed in a separated manner: if you have one chart with 3 series merged to one chart with 1 series, this results in the a chart like that has each x value splitted in two (the number of specification used, two charts) than on split is used to accomodate 3 series and the other to accomodate the remaining series. If you want to threat each series on the same way, split your chart before and create 4 different BarSeries specs, so that these are rendered evenly on the x axis.
  - bar, area, line series with a `stackAccessor` are stacked together each stacked above their respective group (areas with areas, bars with bars, lines with lines. You cannot mix stacking bars above lines above areas).
  - bar series without `stackAccessors` are clustered together for the same x value
  - area and line series, without `stackAccessors` are just drawn each one on their own layer (not stacked nor clustered).
  - the y value is influenced by the following aspects:
    - if there is a specified y domain on the spec, this is used as y domain for that series
    - if no or only one y axis is specified, each y value is threathed as part of the same domain.
    - if there is more than one y axis (visible or not), the y domains are merged in respect of the same `groupId`. For e.g. two bar charts, and two y axis, each for a spec, one per bar value. The rendered bar height are independent each other, because of the two axis.
    - if the data are stacked or not. Stacked produce a rendering where the lower bottom of the chart is the previous series y value.

On the current `Visualize Editor`, you can stack or cluster in the following cases:

- when adding multiple Y values: each Y value can be stacked (every type) or clustered (only bars)
- when splitting a series, each series can be stacked (every type) or clustered (only bars)

### Multiple charts/Split charts/Small Multiples (phase 2)

Small multiples are created using the `<SmallMultiples>` component, that takes multiple `<SplittedSeries>` component with the usual element inside. `<SplittedSeries>` can contains only `BarSeries` `AreaSeries` and `LineSeries` Axis and other configuration needs to be configured outside the `SplittedSeries` element.

In case of small multiples, each `SplittedSeries` compute its own x and y domains. Than the x domains are merged and expanded. The same happens with the main Y domains, they are merged together.

### Colors

Each data series can have its own color.
The color is assigned through the `colorAccessors` prop that specify which data attributes are used to define the color,
for example:

- a dataset without any split accessor or fields that can be used to identify a color will have a single color.
- a dataset that has 1 variable to split the dataset into 3 different series, will have 3 different colors if that variable is specified throught the `colorAccessors`.
- a dataset with 2 split variables, each with 3 different values (a dataset with 3 \* 2 series) will have 6 different colors if the two variables are defined in `colorAccessors`
- a dataset with 2 split variables, each with 3 different values, but only one specified in the `colorAccessors` will have only 3 colors.
- if no `colorAccessors` is specified, it will be used `splitAccessors` to identifiy how to coloring the series
