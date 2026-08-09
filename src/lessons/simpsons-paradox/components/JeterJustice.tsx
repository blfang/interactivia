import { ScenarioPlot, type ScenarioConfig } from './ScenarioPlot';

const BLUE = '#3b82f6';
const GREEN = '#10b981';

const SIZE_X = 360;
const SIZE_Y = 300;
const MARGIN = { top: 12, right: 26, bottom: 46, left: 46 };
const X_MAX = 700;
const Y_MAX = 200;

const X_TICKS = [0, 100, 200, 300, 400, 500, 600, 700];
const Y_TICKS = [0, 50, 100, 150, 200];

const CONFIG: ScenarioConfig = {
  sizeX: SIZE_X,
  sizeY: SIZE_Y,
  margin: MARGIN,
  xMax: X_MAX,
  yMax: Y_MAX,
  xTicks: X_TICKS,
  yTicks: Y_TICKS,
  xLabel: 'At-bats',
  yLabel: 'Hits',
  markerPrefix: 'jh',
  decimals: 3,
  series: [
    { key: 'justice', label: 'Justice', color: BLUE },
    { key: 'jeter', label: 'Jeter', tipLabel: 'Jeter', color: GREEN },
  ],
  plots: [
    {
      title: '1995',
      series: {
        jeter: {
          point: { x: 48, y: 12 },
          label: { dx: 8, dy: -6, anchor: 'start' },
        },
        justice: {
          point: { x: 411, y: 104 },
          label: { dx: 8, dy: -6, anchor: 'start' },
        },
      },
    },
    {
      title: '1996',
      series: {
        jeter: {
          point: { x: 582, y: 183 },
          label: { dx: -8, dy: 16, anchor: 'end' },
        },
        justice: {
          point: { x: 140, y: 45 },
          label: { dx: 8, dy: -6, anchor: 'start' },
        },
      },
    },
    {
      title: 'Combined',
      series: {
        jeter: {
          point: { x: 630, y: 195 },
          label: { dx: -8, dy: 16, anchor: 'end' },
        },
        justice: {
          point: { x: 551, y: 149 },
          label: { dx: -8, dy: 16, anchor: 'end' },
        },
      },
      segments: {
        jeter: [
          { x: 0, y: 0 },
          { x: 48, y: 12 },
          { x: 630, y: 195 },
        ],
        justice: [
          { x: 0, y: 0 },
          { x: 411, y: 104 },
          { x: 551, y: 149 },
        ],
      },
    },
  ],
};

export default function JeterJustice() {
  return <ScenarioPlot config={CONFIG} />;
}