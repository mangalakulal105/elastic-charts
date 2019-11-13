import React from 'react';
import { Group as KonvaGroup, ContainerConfig } from 'konva';
import { Circle, Group, Path } from 'react-konva';
import {
  buildLineRenderProps,
  buildPointStyleProps,
  PointStyleProps,
  buildPointRenderProps,
} from './utils/rendering_props_utils';
import { getGeometryIdKey, getGeometryStateStyle } from '../../rendering/rendering';
import { mergePartial } from '../../../../utils/commons';
import { LineGeometry, PointGeometry } from '../../../../utils/geometry';
import { PointStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { LegendItem } from '../../../../chart_types/xy_chart/legend/legend';

interface LineGeometriesDataProps {
  animated?: boolean;
  lines: LineGeometry[];
  sharedStyle: SharedGeometryStateStyle;
  highlightedLegendItem: LegendItem | null;
  clippings: ContainerConfig;
}
interface LineGeometriesDataState {
  overPoint?: PointGeometry;
}
export class LineGeometries extends React.PureComponent<LineGeometriesDataProps, LineGeometriesDataState> {
  static defaultProps: Partial<LineGeometriesDataProps> = {
    animated: false,
  };
  private readonly barSeriesRef: React.RefObject<KonvaGroup> = React.createRef();
  constructor(props: LineGeometriesDataProps) {
    super(props);
    this.barSeriesRef = React.createRef();
    this.state = {
      overPoint: undefined,
    };
  }

  render() {
    return (
      <Group ref={this.barSeriesRef} key={'bar_series'}>
        {this.renderLineGeoms()}
      </Group>
    );
  }

  private mergePointPropsWithOverrides(props: PointStyleProps, overrides?: Partial<PointStyle>): PointStyleProps {
    if (!overrides) {
      return props;
    }

    return mergePartial(props, overrides);
  }

  private renderPoints = (
    linePoints: PointGeometry[],
    lineKey: string,
    pointStyleProps: PointStyleProps,
  ): JSX.Element[] => {
    const linePointElements: JSX.Element[] = [];
    linePoints.forEach((linePoint, pointIndex) => {
      const { x, y, transform, styleOverrides } = linePoint;
      const key = `line-point-${lineKey}-${pointIndex}`;
      const pointStyle = this.mergePointPropsWithOverrides(pointStyleProps, styleOverrides);
      const pointProps = buildPointRenderProps(transform.x + x, y, pointStyle);
      linePointElements.push(<Circle {...pointProps} key={key} />);
    });
    return linePointElements;
  };

  private renderLineGeoms = (): JSX.Element[] => {
    const { lines, sharedStyle } = this.props;

    return lines.reduce<JSX.Element[]>((acc, line) => {
      const { seriesLineStyle, seriesPointStyle, geometryId } = line;
      const key = getGeometryIdKey(geometryId, 'line-');
      if (seriesLineStyle.visible) {
        acc.push(this.getLineToRender(line, sharedStyle, key));
      }

      if (seriesPointStyle.visible) {
        acc.push(...this.getPointToRender(line, sharedStyle, key));
      }

      return acc;
    }, []);
  };

  getLineToRender(line: LineGeometry, sharedStyle: SharedGeometryStateStyle, key: string) {
    const { clippings } = this.props;
    const { line: linePath, color, transform, geometryId, seriesLineStyle } = line;
    const geometryStyle = getGeometryStateStyle(geometryId, this.props.highlightedLegendItem, sharedStyle);
    const lineProps = buildLineRenderProps(transform.x, linePath, color, seriesLineStyle, geometryStyle);
    return (
      <Group {...clippings} key={key}>
        <Path {...lineProps} />
      </Group>
    );
  }

  getPointToRender(line: LineGeometry, sharedStyle: SharedGeometryStateStyle, key: string) {
    const { points, color, geometryId, seriesPointStyle } = line;
    const geometryStyle = getGeometryStateStyle(geometryId, this.props.highlightedLegendItem, sharedStyle);
    const pointStyleProps = buildPointStyleProps(color, seriesPointStyle, geometryStyle);
    return this.renderPoints(points, key, pointStyleProps);
  }
}
