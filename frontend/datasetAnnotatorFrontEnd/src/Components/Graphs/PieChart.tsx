import { Pie } from '@ant-design/plots';

export type PieChartData = { type: string; value: number }[];

interface PieChartProps {
  data: PieChartData;
}

export const PieChart = ({ data }: PieChartProps) => {
  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.6,
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
  };
  return <Pie {...config} />;
};