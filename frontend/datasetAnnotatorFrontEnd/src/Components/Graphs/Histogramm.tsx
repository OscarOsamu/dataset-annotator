import { Column } from '@ant-design/plots';
import type { QuestionAnswerCount } from '../../api';

interface HistogramProps {
	data: QuestionAnswerCount[];
}

export const Histogram = ({ data }: HistogramProps) => (
	<Column
		data={data.map(({ value, count }) => ({
			value: String(value),
			count,
		}))}
		xField="value"
		yField="count"
		axis={{
			x: { title: 'Answer' },
			y: { title: 'Responses', min: 0 },
		}}
		tooltip={{ channel: 'y' }}
	/>
);
