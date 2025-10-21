import type { AnalysisRepo, StrategyRepo, LlmPort } from '@ports/ports';
import type { Strategy } from '@domain/domain';

export class GenerateStrategyUseCase {
  constructor(
    private analysisRepo: AnalysisRepo,
    private strategyRepo: StrategyRepo,
    private llmPort: LlmPort
  ) {}

  async execute(projectId: string): Promise<string> {
    // 1. 분석 결과 조회
    const analysis = await this.analysisRepo.findByProject(projectId);
    if (!analysis) {
      throw new Error('Analysis not found for project');
    }

    // 2. 전략 생성
    const strategy = await this.llmPort.craftStrategy(analysis);

    // 3. 전략 저장
    const strategyId = await this.strategyRepo.create({
      projectId,
      positioning: strategy.positioning,
      keyMessages: strategy.keyMessages,
      channelMix: strategy.channelMix,
    });

    return strategyId;
  }
}
