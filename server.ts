import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to format currency
function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

// Helper to format percentage
function formatPct(val: number): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

// Fallback generator if API key is absent or API fails
function generateDeterministicSummary(data: any): string {
  const { mostChangedRegion, rankingCriterion } = data;
  const reg = mostChangedRegion;
  const criterionText = rankingCriterion === 'percentage' ? 'in percentage terms' : 'in absolute dollar terms';
  const direction = reg.delta >= 0 ? 'grew' : 'declined';
  const directionNoun = reg.delta >= 0 ? 'increase' : 'decrease';

  const s1 = `${reg.region} changed the most from Q2 to Q3 ${criterionText}, as revenue ${direction} from ${formatCurrency(reg.q2Revenue)} in Q2 to ${formatCurrency(reg.q3Revenue)} in Q3, representing a ${formatCurrency(Math.abs(reg.delta))} (${formatPct(reg.pctDelta)}) shift.`;

  const topProd = reg.topProductDrivers && reg.topProductDrivers.length > 0 ? reg.topProductDrivers[0] : null;
  const s2 = topProd
    ? `This movement was primarily driven by ${topProd.product}, whose revenue changed by ${formatCurrency(topProd.delta)} (${formatPct(topProd.pctDelta)}) from ${formatCurrency(topProd.q2Rev)} in Q2 to ${formatCurrency(topProd.q3Rev)} in Q3.`
    : `This performance was influenced by quarterly shifts in order volume, moving from ${reg.unitsQ2.toLocaleString()} units in Q2 to ${reg.unitsQ3.toLocaleString()} units in Q3.`;

  const topChan = reg.topChannelDrivers && reg.topChannelDrivers.length > 0 ? reg.topChannelDrivers[0] : null;
  const s3 = topChan
    ? `Across distribution channels, ${topChan.channel} recorded the largest contribution with a ${formatCurrency(topChan.delta)} ${directionNoun} alongside an average regional discount of ${reg.avgDiscountQ3.toFixed(1)}% in Q3 compared to ${reg.avgDiscountQ2.toFixed(1)}% in Q2.`
    : `Average realized discounts shifted from ${reg.avgDiscountQ2.toFixed(1)}% in Q2 to ${reg.avgDiscountQ3.toFixed(1)}% in Q3, underscoring the regional trajectory.`;

  return `${s1} ${s2} ${s3}`;
}

// AI Summary Route
app.post('/api/summarize-q2-q3', async (req: Request, res: Response) => {
  try {
    const { mostChangedRegion, allRegionsSummary, totalCompany, rankingCriterion } = req.body;

    if (!mostChangedRegion) {
      res.status(400).json({ error: 'Missing calculation payload' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment, using deterministic generator');
      const fallbackSummary = generateDeterministicSummary(req.body);
      res.json({
        summary: fallbackSummary,
        source: 'deterministic_fallback',
        usedData: mostChangedRegion,
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const reg = mostChangedRegion;
    const rankingNote = rankingCriterion === 'percentage'
      ? 'ranked by highest percentage change'
      : 'ranked by highest absolute dollar change';

    const calculatedContext = `
[STRICT GROUND TRUTH DATA CALCULATED BY THE APP - USE ONLY THESE NUMBERS]
- Analysis Criterion: ${rankingNote}
- Most Changed Region: ${reg.region}
- ${reg.region} Q2 Revenue: ${formatCurrency(reg.q2Revenue)} ($${reg.q2Revenue.toFixed(2)})
- ${reg.region} Q3 Revenue: ${formatCurrency(reg.q3Revenue)} ($${reg.q3Revenue.toFixed(2)})
- ${reg.region} Q2-to-Q3 Dollar Delta: ${reg.delta >= 0 ? '+' : ''}${formatCurrency(reg.delta)} ($${reg.delta.toFixed(2)})
- ${reg.region} Q2-to-Q3 Percentage Change: ${formatPct(reg.pctDelta)}
- ${reg.region} Units: ${reg.unitsQ2.toLocaleString()} in Q2 to ${reg.unitsQ3.toLocaleString()} in Q3 (Delta: ${(reg.unitsQ3 - reg.unitsQ2).toLocaleString()})
- ${reg.region} Avg Discount: ${reg.avgDiscountQ2.toFixed(1)}% in Q2 vs ${reg.avgDiscountQ3.toFixed(1)}% in Q3
- Top Product Drivers in ${reg.region}:
${(reg.topProductDrivers || []).map((p: any) => `  * ${p.product}: Q2 ${formatCurrency(p.q2Rev)} -> Q3 ${formatCurrency(p.q3Rev)} (Delta: ${p.delta >= 0 ? '+' : ''}${formatCurrency(p.delta)}, ${formatPct(p.pctDelta)})`).join('\n')}
- Top Channel Drivers in ${reg.region}:
${(reg.topChannelDrivers || []).map((c: any) => `  * ${c.channel}: Q2 ${formatCurrency(c.q2Rev)} -> Q3 ${formatCurrency(c.q3Rev)} (Delta: ${c.delta >= 0 ? '+' : ''}${formatCurrency(c.delta)}, ${formatPct(c.pctDelta)})`).join('\n')}
- Other Regions Q2-to-Q3 comparison for context:
${(allRegionsSummary || []).map((r: any) => `  * ${r.region}: Q2 ${formatCurrency(r.q2Revenue)} -> Q3 ${formatCurrency(r.q3Revenue)} (Delta: ${r.delta >= 0 ? '+' : ''}${formatCurrency(r.delta)}, ${formatPct(r.pctDelta)})`).join('\n')}
- Total Company Sales: Q2 ${formatCurrency(totalCompany.q2Rev)} -> Q3 ${formatCurrency(totalCompany.q3Rev)} (Delta: ${totalCompany.delta >= 0 ? '+' : ''}${formatCurrency(totalCompany.delta)}, ${formatPct(totalCompany.pctDelta)})
`;

    const prompt = `You are an executive financial data analyst. You are provided with verified quarterly revenue calculations.
TASK: Write an executive summary of which region changed the most from Q2 to Q3, and why.

MANDATORY RULES:
1. Write EXACTLY THREE SENTENCES. Count them carefully: Sentence 1, Sentence 2, and Sentence 3. No fourth sentence. No two sentences. Exactly three.
2. USE ONLY THE NUMBERS CALCULATED AND PROVIDED ABOVE. Every single dollar figure, percentage, or unit count cited in your three sentences MUST come directly from the calculated ground truth data above. Do NOT recalculate, round differently, estimate, or invent any numbers.
3. Content Breakdown:
   - Sentence 1: State clearly which region changed most from Q2 to Q3, quoting its exact Q2 revenue, Q3 revenue, and dollar/percentage shift (${formatCurrency(reg.q2Revenue)}, ${formatCurrency(reg.q3Revenue)}, ${formatCurrency(Math.abs(reg.delta))}, and ${formatPct(reg.pctDelta)}).
   - Sentence 2: Explain the primary product driver(s) for this shift, quoting the exact revenue figures from the product breakdown above.
   - Sentence 3: Explain the channel or discount factor that contributed to this performance, referencing the specific channel figures or discount rates provided.
4. Output ONLY the raw three sentences without markdown titles, headers, bullet points, or prefacing text.

${calculatedContext}`;

    // Generate with timeout so user never waits more than 7 seconds
    let summaryText = '';
    let usedSource = 'gemini-3.8-flash';

    try {
      const generatePromise = (async () => {
        // Try gemini-3.8-flash first, fallback to gemini-3.1-flash-lite if 503/error
        try {
          const resp = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { temperature: 0.1 },
          });
          return { text: resp.text, model: 'gemini-3.8-flash' };
        } catch (mErr: any) {
          console.warn('gemini-3.8-flash unavailable, attempting gemini-3.1-flash-lite:', mErr?.message);
          const respLite = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: { temperature: 0.1 },
          });
          return { text: respLite.text, model: 'gemini-3.1-flash-lite' };
        }
      })();

      const timeoutPromise = new Promise<{ text: string | undefined; model: string }>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), 7000)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      summaryText = result.text ? result.text.trim() : '';
      usedSource = result.model;
    } catch (apiErr: any) {
      console.warn('Gemini API call failed or timed out, using verified calculated summary:', apiErr?.message);
      summaryText = generateDeterministicSummary(req.body);
      usedSource = 'calculated_engine';
    }

    if (!summaryText) {
      summaryText = generateDeterministicSummary(req.body);
      usedSource = 'calculated_engine';
    }

    res.json({
      summary: summaryText,
      source: usedSource,
      usedData: mostChangedRegion,
    });
  } catch (err: any) {
    console.error('Error in /api/summarize-q2-q3:', err);
    const fallbackSummary = generateDeterministicSummary(req.body);
    res.json({
      summary: fallbackSummary,
      source: 'calculated_engine_fallback',
      error: err?.message || 'Server error',
      usedData: req.body?.mostChangedRegion,
    });
  }
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quarterly Sales App server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
