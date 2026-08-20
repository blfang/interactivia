import TargetVsProposalPlot from './TargetVsProposalPlot';
import { standardNormalPdf, uniformPdf } from '../simulation';

export default function Preview() {
  return (
    <TargetVsProposalPlot
      targetPdf={standardNormalPdf}
      proposalPdf={(x) => uniformPdf(x, 3, 5)}
      domain={[-4, 6]}
      interval={[3, 5]}
      width={160}
      height={100}
    />
  );
}
