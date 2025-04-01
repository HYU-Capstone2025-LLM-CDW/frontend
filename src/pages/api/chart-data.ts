import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export type ChartRow = {
  [key: string]: string | number | null;
};

type Data = { message: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { sql } = req.body;

    if (!sql) return res.status(400).json({ message: 'No SQL provided' });

    const result = await pool.query(sql);
    const rows: unknown[] = result.rows;

    const converted = rows.map((row: unknown) => {
      if (typeof row === 'object' && row !== null && !Array.isArray(row)) {
        const r = row as { [key: string]: string | number | null };
        const keys = Object.keys(r);
        if (keys.length >= 3) {
          return {
            x: r[keys[0]] ?? 0,
            y: r[keys[1]] ?? 0,
            z: typeof r[keys[2]] === 'number' ? r[keys[2]] : Number(r[keys[2]]) || 0,
          };
        }
        return r;
      } else {
        return {};
      }
    });

    return res.status(200).json({ message: JSON.stringify(converted) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('❌ SQL 실행 오류:', message);
    return res.status(500).json({ message: '서버 오류: ' + message });
  }
}