
import React, { useMemo } from 'react';
import type { TrainingMetric } from '../types';

interface MetricsChartProps {
    data: TrainingMetric[];
}

const SVG_WIDTH = 500;
const SVG_HEIGHT = 400;
const PADDING = 40;

const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
    const { points, xTicks, yTicks } = useMemo(() => {
        if (data.length < 2) {
            return { points: '', xTicks: [], yTicks: [] };
        }

        const xMax = Math.max(...data.map(d => d.epoch));
        const yMax = Math.max(...data.map(d => d.loss));
        const yMin = Math.min(...data.map(d => d.loss));
        
        const scaleX = (val: number) => PADDING + (val / xMax) * (SVG_WIDTH - 2 * PADDING);
        const scaleY = (val: number) => PADDING + ((yMax - val) / (yMax - yMin)) * (SVG_HEIGHT - 2 * PADDING);

        const points = data.map(d => `${scaleX(d.epoch)},${scaleY(d.loss)}`).join(' ');

        const xTickValues = Array.from({ length: Math.min(xMax + 1, 6) }, (_, i) => Math.round(i * xMax / Math.min(xMax, 5)));
        const xTicks = xTickValues.map(val => ({ val, x: scaleX(val) }));

        const yTickValues = Array.from({ length: 5 }, (_, i) => yMin + i * ((yMax - yMin) / 4));
        const yTicks = yTickValues.map(val => ({ val: val.toFixed(2), y: scaleY(val) }));

        return { points, xTicks, yTicks };

    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-brand-text-secondary">
                <p>Waiting for training data...</p>
            </div>
        )
    }

    return (
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full text-brand-text-secondary">
            {/* Y Axis */}
            <line x1={PADDING} y1={PADDING} x2={PADDING} y2={SVG_HEIGHT - PADDING} stroke="currentColor" strokeWidth="1" />
            {yTicks.map(({ val, y }) => (
                <g key={y}>
                    <line x1={PADDING - 5} y1={y} x2={PADDING} y2={y} stroke="currentColor" strokeWidth="1" />
                    <text x={PADDING - 10} y={y + 4} textAnchor="end" fontSize="10">{val}</text>
                </g>
            ))}
            <text transform={`translate(${PADDING/4}, ${SVG_HEIGHT/2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="currentColor">
               Loss
            </text>

            {/* X Axis */}
            <line x1={PADDING} y1={SVG_HEIGHT - PADDING} x2={SVG_WIDTH - PADDING} y2={SVG_HEIGHT - PADDING} stroke="currentColor" strokeWidth="1" />
            {xTicks.map(({ val, x }) => (
                <g key={x}>
                    <line x1={x} y1={SVG_HEIGHT - PADDING} x2={x} y2={SVG_HEIGHT - PADDING + 5} stroke="currentColor" strokeWidth="1" />
                    <text x={x} y={SVG_HEIGHT - PADDING + 20} textAnchor="middle" fontSize="10">{val}</text>
                </g>
            ))}
             <text x={SVG_WIDTH/2} y={SVG_HEIGHT - PADDING/4} textAnchor="middle" fontSize="12" fill="currentColor">
               Epoch
            </text>


            {/* Data line */}
            {data.length > 1 && (
                 <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={points} />
            )}
           
            {/* Data points */}
            {data.map(d => (
                 <circle key={d.epoch} cx={PADDING + (d.epoch / Math.max(...data.map(d => d.epoch))) * (SVG_WIDTH - 2 * PADDING)} cy={PADDING + ((Math.max(...data.map(d => d.loss)) - d.loss) / (Math.max(...data.map(d => d.loss)) - Math.min(...data.map(d => d.loss)))) * (SVG_HEIGHT - 2 * PADDING)} r="3" fill="#60a5fa" />
            ))}
        </svg>
    );
};

export default MetricsChart;
