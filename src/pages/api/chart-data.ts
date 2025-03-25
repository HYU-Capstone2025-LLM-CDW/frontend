import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { dataType, xAxis, yAxis, chartType } = req.body;
    // 여기서 실제 데이터 처리 로직을 구현할 수 있습니다.
    // 현재는 간단한 응답만 반환합니다.
    res.status(200).json({ message: `Data Type: ${dataType}, X Axis: ${xAxis}, Y Axis: ${yAxis}, Chart Type: ${chartType}` });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}