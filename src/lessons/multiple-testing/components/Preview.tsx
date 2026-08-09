import NormalPlot from './NormalPlot';

export default function Preview() {
  // 3x3 grid of normal distributions; two have significant z-scores (red box)
  const zScores = [
    -0.5, 1.2, -0.8,
    0.3, 2.5, -1.1,
    0.9, -2.2, 0.4,
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 4 }}>
      {zScores.map((z, i) => (
        <NormalPlot key={i} zScore={z} width={56} height={40} />
      ))}
    </div>
  );
}