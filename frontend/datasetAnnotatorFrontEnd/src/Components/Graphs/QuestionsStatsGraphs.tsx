import { useEffect, useState } from 'react';
import { Alert, Empty, Segmented, Select, Spin } from 'antd';
import type { Question, QuestionInfoResponse } from '../../api';
import { apiConfig } from '../../configuration';
import { ApiApi } from '../../api';
import { Histogram } from './Histogramm';
import { PieChart } from './PieChart';

interface QuestionsStatsGraphsProps {
	questions: Question[];
}

type ChartType = 'Pie chart' | 'Histogram';

export const QuestionsStatsGraphs = ({
	questions,
}: QuestionsStatsGraphsProps) => {
	const [questionStats, setQuestionStats] = useState<QuestionInfoResponse[]>([]);
	const [selectedQuestionId, setSelectedQuestionId] = useState<number>();
	const [chartType, setChartType] = useState<ChartType>('Pie chart');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<unknown>();

	useEffect(() => {
		let isCurrent = true;
		const api = new ApiApi(apiConfig);

		setLoading(true);
		setError(undefined);

		Promise.all(
			questions.map(({ id }) => api.apiQuestionsInfoRetrieve(id)),
		)
			.then((responses) => {
				if (isCurrent) {
					setQuestionStats(responses.map(({ data }) => data));
					setSelectedQuestionId((currentId) =>
						responses.some(({ data }) => data.id === currentId)
							? currentId
							: responses[0]?.data.id,
					);
				}
			})
			.catch((requestError: unknown) => {
				if (isCurrent) setError(requestError);
			})
			.finally(() => {
				if (isCurrent) setLoading(false);
			});

		return () => {
			isCurrent = false;
		};
	}, [questions]);

	const selectedQuestion = questionStats.find(
		({ id }) => id === selectedQuestionId,
	);

	if (loading) return <Spin />;
	if (error) {
		return <Alert type="error" message="Question statistics could not be loaded." />;
	}
	if (!questions.length) return <Empty description="No questions in this dataset" />;
	if (!selectedQuestion) return <Empty description="No question statistics available" />;

	const chartData = selectedQuestion.answer_counts.map(({ value, count }) => ({
		type: String(value ?? 'No answer'),
		value: count,
	}));

	return (
		<section aria-label="Question statistics">
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
				<Select
					aria-label="Select a question"
					value={selectedQuestion.id}
					onChange={setSelectedQuestionId}
					options={questionStats.map(({ id, text }) => ({
						value: id,
						label: text,
					}))}
					style={{ flex: '1 1 280px', maxWidth: 560 }}
				/>
				<Segmented
					aria-label="Select chart type"
					options={['Pie chart', 'Histogram']}
					value={chartType}
					onChange={(value) => setChartType(value as ChartType)}
				/>
			</div>

			<h3>{selectedQuestion.text}</h3>
			<p>
				{selectedQuestion.total_responses} responses
				{selectedQuestion.unclear_count > 0 &&
					` · ${selectedQuestion.unclear_count} unclear`}
			</p>

			{selectedQuestion.answer_counts.length === 0 ? (
				<Empty description="No answers yet" />
			) : chartType === 'Pie chart' ? (
				<PieChart data={chartData} />
			) : (
				<Histogram data={selectedQuestion.answer_counts} />
			)}
		</section>
	);
};
