import { Dimensions } from '../../../../utils/dimensions';
import { shapeViewModel } from '../../layout/viewmodel/viewmodel';
import { measureText } from '../../layout/utils/measure';
import { ShapeTreeNode, ShapeViewModel, RawTextGetter } from '../../layout/types/viewmodel_types';
import { Theme } from '../../../../utils/themes/theme';
import { depthKey } from '../../layout/utils/group_by_rollup';
import { PartitionSpec, Layer } from '../../specs/index';
import { identity } from '../../../../utils/commons';

function rawTextGetter(layers: Layer[]): RawTextGetter {
  return (node: ShapeTreeNode) => {
    const accessorFn = layers[node[depthKey] - 1].nodeLabel || identity;
    return `${accessorFn(node.dataName)}`;
  };
}

export function render(partitionSpec: PartitionSpec, parentDimensions: Dimensions, theme: Theme): ShapeViewModel {
  const { width, height } = parentDimensions;
  // eslint-disable-next-line no-console
  console.log(theme);
  const { layers, data: facts, config: specConfig } = partitionSpec;
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  const config = { ...specConfig, width, height };
  if (!textMeasurerCtx) {
    return {
      config,
      quadViewModel: [],
      rowSets: [],
      linkLabelViewModels: [],
      outsideLinksViewModel: [],
      diskCenter: { x: width / 2, y: height / 2 },
    };
  }
  return shapeViewModel(
    measureText(textMeasurerCtx),
    config,
    layers,
    facts,
    rawTextGetter(layers),
    partitionSpec.valueAccessor,
    partitionSpec.valueFormatter,
    [() => null, ...layers.map(({ groupByRollup }) => groupByRollup)],
  );
}
