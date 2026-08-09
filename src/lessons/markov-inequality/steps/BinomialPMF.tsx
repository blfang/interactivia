import { useEffect } from 'react';
import BinomialWidget from '../components/BinomialWidget';
import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

const N = 10;
const P = 0.4;
const THRESHOLD = 5;

export default function BinomialPMF({ onCompleteChange }: StepProps) {
    useEffect(() => {
        onCompleteChange?.(true);
    }, [onCompleteChange]);

    return (
        <>
            <Markdown>{`
This "collapsing" to 0 and threshold is actually how we prove Markov's inequality in general.
The example below is for a binomial distribution.
As we collapse all the mass to 0 and 6 by shifting to the left, the mean drops to "threshold * (fraction at or above threshold)."
      `}</Markdown>
            <BinomialWidget n={N} p={P} threshold={THRESHOLD} />
            <Markdown>{`
Markov's inequality holds for any distribution, not just discrete ones like the ones we explored!
            `}</Markdown>
        </>
    );
}