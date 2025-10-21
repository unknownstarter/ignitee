import type { ProjectRepo, LlmPort, AnalysisRepo } from '@ports/ports';
import type { Project, Analysis } from '@domain/domain';

export class SubmitPrdUseCase {
  constructor(
    private projectRepo: ProjectRepo,
    private analysisRepo: AnalysisRepo,
    private llmPort: LlmPort
  ) {}

  async execute(input: {
    ownerId: string;
    name: string;
    prd: string;
  }): Promise<{ projectId: string; analysisId: string }> {
    // 1. 프로젝트 생성
    const projectId = await this.projectRepo.create({
      ownerId: input.ownerId,
      name: input.name,
      prd: input.prd,
    });

    // 2. PRD 분석
    const analysis = await this.llmPort.analyzePRD(input.prd);

    // 3. 분석 결과 저장
    const analysisId = await this.analysisRepo.create({
      projectId,
      domain: analysis.domain,
      personas: analysis.personas,
      pains: analysis.pains,
      solutionMap: analysis.solutionMap,
    });

    return { projectId, analysisId };
  }
}
