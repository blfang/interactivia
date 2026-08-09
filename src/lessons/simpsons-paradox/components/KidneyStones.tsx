import { ScenarioPlot, type ScenarioConfig } from './ScenarioPlot';

const BLUE = '#3b82f6';
const GREEN = '#10b981';

const SIZE_X = 300;
const SIZE_Y = 300;
const MARGIN = { top: 12, right: 22, bottom: 46, left: 46 };
const X_MAX = 350;
const Y_MAX = 300;

const X_TICKS = [0, 50, 100, 150, 200, 250, 300, 350];
const Y_TICKS = [0, 50, 100, 150, 200, 250, 300];

const CONFIG: ScenarioConfig = {
  sizeX: SIZE_X,
  sizeY: SIZE_Y,
  margin: MARGIN,
  xMax: X_MAX,
  yMax: Y_MAX,
  xTicks: X_TICKS,
  yTicks: Y_TICKS,
  xLabel: 'Cases',
  yLabel: 'Successes',
  markerPrefix: 'ks',
  series: [
    { key: 'A', label: 'Treatment A', tipLabel: 'A', color: BLUE },
    { key: 'B', label: 'Treatment B', tipLabel: 'B', color: GREEN },
  ],
  plots: [
    {
      title: 'Small stones',
      series: {
        A: {
          point: { x: 87, y: 81 },
          label: { dx: 8, dy: -6, anchor: 'start' },
        },
        B: {
          point: { x: 270, y: 234 },
          label: { dx: -8, dy: 16, anchor: 'end' },
        },
      },
    },
    {
      title: 'Large stones',
      series: {
        A: {
          point: { x: 263, y: 192 },
          label: { dx: -8, dy: 16, anchor: 'end' },
        },
        B: {
          point: { x: 80, y: 55 },
          label: { dx: 8, dy: -6, anchor: 'start' },
        },
      },
    },
    {
      title: 'Combined',
      series: {
        A: {
          point: { x: 350, y: 273 },
          label: { dx: -8, dy: 16, anchor: 'end' },
        },
        B: {
          point: { x: 350, y: 289 },
          label: { dx: -8, dy: -6, anchor: 'end' },
        },
      },
      segments: {
        A: [
          { x: 0, y: 0 },
          { x: 87, y: 81 },
          { x: 350, y: 273 },
        ],
        B: [
          { x: 0, y: 0 },
          { x: 270, y: 234 },
          { x: 350, y: 289 },
        ],
      },
    },
  ],
};

export default function KidneyStones() {
  return <ScenarioPlot config={CONFIG} />;
}