import { SpecActions } from './specs';
import { ChartActions } from './chart';
import { ChartSettingsActions } from './chart_settings';
import { LegendActions } from './legend';
import { EventsActions } from './events';

export type StateActions = SpecActions | ChartActions | ChartSettingsActions | LegendActions | EventsActions;
