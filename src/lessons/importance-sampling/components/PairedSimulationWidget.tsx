import { useEffect, useRef, useState } from 'react';
import TargetVsProposalPlot from './TargetVsProposalPlot';
import RunningEstimatePlot from './RunningEstimatePlot';
import { INITIAL_ESTIMATOR_STATE, updateEstimator, estimate, importanceWeight } from '../simulation';
import type { EstimatorState } from '../simulation';
import { COLOR_PRIMARY, COLOR_DANGER } from '../../../styles/colors';
import styles from './PairedSimulationWidget.module.css';

const MAX_KEPT_HISTORY = 3000;

// runs a naive Monte Carlo estimator and an importance-sampling estimator side by side,
// advancing both together on every "Simulate" click
export default function PairedSimulationWidget({
  targetSampler,
  targetPdf,
  proposalSampler,
  proposalPdf,
  interval,
  intervalLabel,
  trueValue,
  domain,
  runningEstimateYMax,
  onCompleteChange,
  width = 420,
}: {
  targetSampler: () => number;
  targetPdf: (x: number) => number;
  proposalSampler: () => number;
  proposalPdf: (x: number) => number;
  interval: [number, number];
  intervalLabel: string;
  trueValue: number;
  domain: [number, number];
  runningEstimateYMax?: number;
  onCompleteChange?: (complete: boolean) => void;
  width?: number;
}) {
  const [naiveState, setNaiveState] = useState<EstimatorState>(INITIAL_ESTIMATOR_STATE);
  const [isState, setIsState] = useState<EstimatorState>(INITIAL_ESTIMATOR_STATE);
  const [naiveHistory, setNaiveHistory] = useState<number[]>([]);
  const [isHistory, setIsHistory] = useState<number[]>([]);
  const [lastNaiveSample, setLastNaiveSample] = useState<number | null>(null);
  const [lastIsSample, setLastIsSample] = useState<number | null>(null);

  const onCompleteChangeRef = useRef(onCompleteChange);
  onCompleteChangeRef.current = onCompleteChange;

  useEffect(() => {
    onCompleteChangeRef.current?.(naiveState.n > 0);
  }, [naiveState.n]);

  const handleSimulate = (batchSize: number) => {
    let nState = naiveState;
    let iState = isState;
    const newNaiveHistory: number[] = [];
    const newIsHistory: number[] = [];
    let naiveX = lastNaiveSample;
    let isX = lastIsSample;
    for (let i = 0; i < batchSize; i++) {
      naiveX = targetSampler();
      nState = updateEstimator(nState, naiveX, interval);
      newNaiveHistory.push(estimate(nState));

      isX = proposalSampler();
      iState = updateEstimator(iState, isX, interval, (x) => importanceWeight(x, targetPdf, proposalPdf));
      newIsHistory.push(estimate(iState));
    }
    setNaiveState(nState);
    setIsState(iState);
    setNaiveHistory((prev) => [...prev, ...newNaiveHistory].slice(-MAX_KEPT_HISTORY));
    setIsHistory((prev) => [...prev, ...newIsHistory].slice(-MAX_KEPT_HISTORY));
    setLastNaiveSample(naiveX);
    setLastIsSample(isX);
  };

  const currentWeight =
    lastIsSample !== null ? importanceWeight(lastIsSample, targetPdf, proposalPdf) : null;

  // shared y-scale so the two pdf plots are visually comparable
  const pdfPlotYMax = (() => {
    const [xMin, xMax] = domain;
    let peak = 0;
    const N = 150;
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      peak = Math.max(peak, targetPdf(x), proposalPdf(x));
    }
    return peak * 1.15;
  })();

  return (
    <div className={styles.container}>
      <div className={styles.buttonRow}>
        <button
          className={`${styles.button} ${styles['button--primary']}`}
          onClick={() => handleSimulate(1)}
        >
          Simulate ×1
        </button>
        <button
          className={`${styles.button} ${styles['button--secondary']}`}
          onClick={() => handleSimulate(100)}
        >
          Simulate ×100
        </button>
      </div>
      <div className={styles.title}>
        Estimates of P(X ∈ {intervalLabel}){naiveState.n > 0 && ` (n = ${naiveState.n})`}
      </div>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel} style={{ color: COLOR_PRIMARY }}>
            Naive Monte Carlo
          </span>
          <span className={styles.statValue}>
            {naiveState.n > 0 ? estimate(naiveState).toFixed(5) : '—'}
          </span>
          <span className={styles.detail} />
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel} style={{ color: COLOR_DANGER }}>
            Importance sampling
          </span>
          <span className={styles.statValue}>
            {isState.n > 0 ? estimate(isState).toFixed(5) : '—'}
          </span>
          <span className={styles.detail}>
            {currentWeight !== null && `drew x = ${lastIsSample!.toFixed(2)}, weight = ${currentWeight.toFixed(4)}`}
          </span>
        </div>
      </div>
      <div className={styles.plots} style={{ maxWidth: width }}>
        <div className={styles.pdfPlotRow}>
          <div className={styles.pdfPlotColumn}>
            <span className={styles.plotLabel} style={{ color: COLOR_PRIMARY }}>
              without importance sampling
            </span>
            <TargetVsProposalPlot
              targetPdf={targetPdf}
              domain={domain}
              interval={interval}
              markers={lastNaiveSample !== null ? [{ x: lastNaiveSample, color: COLOR_PRIMARY }] : []}
              yMax={pdfPlotYMax}
              width={width / 2 - 8}
            />
          </div>
          <div className={styles.pdfPlotColumn}>
            <span className={styles.plotLabel} style={{ color: COLOR_DANGER }}>
              with importance sampling
            </span>
            <TargetVsProposalPlot
              targetPdf={targetPdf}
              proposalPdf={proposalPdf}
              domain={domain}
              interval={interval}
              markers={lastIsSample !== null ? [{ x: lastIsSample, color: COLOR_DANGER }] : []}
              yMax={pdfPlotYMax}
              width={width / 2 - 8}
            />
          </div>
        </div>
        <span className={styles.plotLabel}>running estimate over successive draws</span>
        <RunningEstimatePlot
          series={[
            { history: naiveHistory, totalDraws: naiveState.n, color: COLOR_PRIMARY, label: 'naive' },
            { history: isHistory, totalDraws: isState.n, color: COLOR_DANGER, label: 'importance sampling' },
          ]}
          trueValue={trueValue}
          yMax={runningEstimateYMax}
          width={width}
        />
      </div>
    </div>
  );
}
