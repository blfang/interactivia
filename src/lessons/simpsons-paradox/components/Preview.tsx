import { PlotFrame, makeScale, type Point } from './plotShared';
import { COLOR_PRIMARY as BLUE, COLOR_SUCCESS as GREEN } from '../../../styles/colors';

const SIZE = 200;
const MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };
const PLOT_W = SIZE - MARGIN.left - MARGIN.right;
const PLOT_H = SIZE - MARGIN.top - MARGIN.bottom;

const PLOT1: Point = { x: 20, y: 15 };
const PLOT2: Point = { x: 60, y: 30 };
const COMBINED_BLUE: Point = { x: 80, y: 25 };
const COMBINED_GREEN: Point = { x: 80, y: 31 };

export default function Preview() {
  const scale = makeScale(100, 100, MARGIN, PLOT_W, PLOT_H);
  const { toSvgX, toSvgY } = scale;

  return (
    <PlotFrame
      width={SIZE}
      height={SIZE}
      margin={MARGIN}
      plotW={PLOT_W}
      plotH={PLOT_H}
      scale={scale}
      xTicks={[]}
      yTicks={[]}
      xLabel=""
      yLabel=""
      yLabelX={14}
      markers={[
        { id: 'preview-blue', color: BLUE },
        { id: 'preview-green', color: GREEN },
      ]}
      shadeYGreaterThanX={{ max: 100 }}
    >
      {/* Group 1 arrows */}
      <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(PLOT1.x)} y2={toSvgY(PLOT1.y)} stroke={BLUE} strokeWidth={2.5} markerEnd="url(#preview-blue)" />
      <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(PLOT2.x)} y2={toSvgY(PLOT2.y)} stroke={GREEN} strokeWidth={2.5} markerEnd="url(#preview-green)" />

      {/* Combined dashed arrows */}
      <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(COMBINED_BLUE.x)} y2={toSvgY(COMBINED_BLUE.y)} stroke={BLUE} strokeWidth={2.5} strokeDasharray="6 4" opacity={0.5} markerEnd="url(#preview-blue)" />
      <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(COMBINED_GREEN.x)} y2={toSvgY(COMBINED_GREEN.y)} stroke={GREEN} strokeWidth={2.5} strokeDasharray="6 4" opacity={0.5} markerEnd="url(#preview-green)" />

      {/* Segment arrows */}
      <line x1={toSvgX(PLOT1.x)} y1={toSvgY(PLOT1.y)} x2={toSvgX(COMBINED_BLUE.x)} y2={toSvgY(COMBINED_BLUE.y)} stroke={BLUE} strokeWidth={2.5} markerEnd="url(#preview-blue)" />
      <line x1={toSvgX(PLOT2.x)} y1={toSvgY(PLOT2.y)} x2={toSvgX(COMBINED_GREEN.x)} y2={toSvgY(COMBINED_GREEN.y)} stroke={GREEN} strokeWidth={2.5} markerEnd="url(#preview-green)" />

      {/* Tips */}
      <circle cx={toSvgX(PLOT1.x)} cy={toSvgY(PLOT1.y)} r={5} fill={BLUE} stroke="#fff" strokeWidth={1.5} />
      <circle cx={toSvgX(PLOT2.x)} cy={toSvgY(PLOT2.y)} r={5} fill={GREEN} stroke="#fff" strokeWidth={1.5} />
      <circle cx={toSvgX(COMBINED_BLUE.x)} cy={toSvgY(COMBINED_BLUE.y)} r={5} fill={BLUE} stroke="#fff" strokeWidth={1.5} />
      <circle cx={toSvgX(COMBINED_GREEN.x)} cy={toSvgY(COMBINED_GREEN.y)} r={5} fill={GREEN} stroke="#fff" strokeWidth={1.5} />
    </PlotFrame>
  );
}