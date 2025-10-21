import type { StrategyRepo, ContentRepo, LlmPort } from '@ports/ports';
import type { Content } from '@domain/domain';

export class GenerateContentUseCase {
  constructor(
    private strategyRepo: StrategyRepo,
    private contentRepo: ContentRepo,
    private llmPort: LlmPort
  ) {}

  async execute(input: {
    projectId: string;
    platform: string;
    count?: number;
  }): Promise<string[]> {
    // 1. 전략 조회
    const strategy = await this.strategyRepo.findByProject(input.projectId);
    if (!strategy) {
      throw new Error('Strategy not found for project');
    }

    // 2. 콘텐츠 생성
    const contents = await this.llmPort.generateContent(
      strategy,
      input.platform
    );

    // 3. 콘텐츠 저장
    const contentIds: string[] = [];
    for (const content of contents.slice(0, input.count || 5)) {
      const contentId = await this.contentRepo.create({
        projectId: input.projectId,
        platform: content.platform,
        title: content.title,
        description: content.description,
        type: content.type,
        status: 'draft',
      });
      contentIds.push(contentId);
    }

    return contentIds;
  }
}
