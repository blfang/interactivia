import TargetVsProposalPlot from './TargetVsProposalPlot';
import { standardNormalPdf, uniformPdf } from '../simulation';
import { RARE_INTERVAL, RARE_DOMAIN } from '../rareEvent';

const [lo, hi] = RARE_INTERVAL;

export default function Preview() {
  return (
    <TargetVsProposalPlot
      targetPdf={standardNormalPdf}
      proposalPdf={(x) => uniformPdf(x, lo, hi)}
      domain={RARE_DOMAIN}
      interval={RARE_INTERVAL}
      width={160}
      height={100}
    />
  );
}
