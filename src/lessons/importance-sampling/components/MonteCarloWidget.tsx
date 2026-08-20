import { useEffect, useRef, useState } from 'react';
import SampleHistogramPlot from './SampleHistogramPlot';
import TargetVsProposalPlot from './TargetVsProposalPlot';
import RunningEstimatePlot from './RunningEstimatePlot';
import { INITIAL_ESTIMATOR_STATE, updateEstimator, estimate, importanceWeight } from '../simulation';
import type { EstimatorState } from '../simulation';
import styles from './MonteCarloWidget.module.css';

const MAX_KEPT_SAMPLES = 5000;
const MAX_KEPT_HISTORY = 3000;

export default function MonteCarloWidget({
  sampler,
  weightFn,
  interval,
  intervalLabel,
  trueValue,
  targetPdf,
  domain,
  plotMode,
  proposalPdf,
  runningEstimateYMax,
  onCompleteChange,
  width = 420,
}: {
  sampler: () => number;
  weightFn?: (x: number) => number;
  interval: [number, number];
  intervalLabel: string;
  trueValue: number;
  targetPdf: (x: number) => number;
  domain: [number, number];
  plotMode: 'histogram' | 'targetVsProposal';
  proposalPdf?: (x: number) => number;
  runningEstimateYMax?: number;
  onCompleteChange?: (complete: boolean) => void;
  width?: number;
}) {
  const [estimatorState, setEstimatorState] = useState<EstimatorState>(INITIAL_ESTIMATOR_STATE);
  const [samples, setSamples] = useState<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [lastSample, setLastSample] = useState<number | null>(null);

  const onCompleteChangeRef = useRef(onCompleteChange);
  onCompleteChangeRef.current = onCompleteChange;

  useEffect(() => {
    onCompleteChangeRef.current?.(estimatorState.n > 0);
  }, [estimatorState.n]);

  const handleSimulate = (batchSize: number) => {
    let state = estimatorState;
    const newSamples: number[] = [];
    const newHistory: number[] = [];
    for (let i = 0; i < batchSize; i++) {
      const x = sampler();
      state = updateEstimator(state, x, interval, weightFn);
      newSamples.push(x);
      newHistory.push(estimate(state));
    }
    setEstimatorState(state);
    setSamples((prev) => [...prev, ...newSamples].slice(-MAX_KEPT_SAMPLES));
    setHistory((prev) => [...prev, ...newHistory].slice(-MAX_KEPT_HISTORY));
    setLastSample(newSamples[newSamples.length - 1]);
  };

  const currentWeight =
    plotMode === 'targetVsProposal' && lastSample !== null && proposalPdf
      ? importanceWeight(lastSample, targetPdf, proposalPdf)
      : null;

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
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
        <div className={styles.estimate}>
          Estimate of P(X ∈ {intervalLabel}):{' '}
          <span className={styles.highlight}>
            {estimatorState.n > 0 ? estimate(estimatorState).toFixed(5) : '—'}
          </span>{' '}
          {estimatorState.n > 0 && `(n = ${estimatorState.n})`}
        </div>
        <div className={styles.detail}>
          {lastSample !== null &&
            (currentWeight !== null
              ? `drew x = ${lastSample.toFixed(2)}, weight = f(x)/g(x) = ${currentWeight.toFixed(4)}`
              : `drew x = ${lastSample.toFixed(2)}`)}
        </div>
      </div>
      <div className={styles.plots} style={{ maxWidth: width }}>
        {plotMode === 'histogram' ? (
          <SampleHistogramPlot
            samples={samples}
            targetPdf={targetPdf}
            domain={domain}
            interval={interval}
            width={width}
          />
        ) : (
          proposalPdf && (
            <TargetVsProposalPlot
              targetPdf={targetPdf}
              proposalPdf={proposalPdf}
              domain={domain}
              interval={interval}
              lastSample={lastSample}
              width={width}
            />
          )
        )}
        <span className={styles.plotLabel}>running estimate over successive draws</span>
        <RunningEstimatePlot
          history={history}
          trueValue={trueValue}
          yMax={runningEstimateYMax}
          width={width}
        />
      </div>
    </div>
  );
}
