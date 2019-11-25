
/**
 *
 */
export interface CountryCompaniesCountResSummary {
  companiesCounts: any;
  totalCompanies: number;
}

/**
 *
 */
export interface RatingTemplateSummary {
  id: number;
  quiz: RatingTemplateQuestionSummary[];
  ranges: number[];
  _embedded?: any;
}

/**
 *
 */
export interface RatingTemplateQuestionSummary {
  answers: RatingTemplateAnswerSummary[];
  questionRu: string;
  questionEn: string;
  questionCn: string;
}

/**
 *
 */
export interface RatingTemplateAnswerSummary {
  scope: string;
  answerRu: string;
  answerEn: string;
  answerCn: string;
}

/**
 *
 */
export interface SocketCompanySummary {
  id: number;
  country_id: number;
  name: string;
  yearoffound: string;
}
