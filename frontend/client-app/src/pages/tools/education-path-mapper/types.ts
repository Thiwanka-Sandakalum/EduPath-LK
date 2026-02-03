export type EducationLevelId = 'ol' | 'al';

export type OLPathId = 'certificate' | 'diploma' | 'degree';

export type OLFieldId =
  | 'it'
  | 'business'
  | 'design'
  | 'language'
  | 'engineering_tech'
  | 'hospitality'
  | 'health';

export type ALStreamId = 'physical' | 'bio' | 'commerce' | 'tech' | 'arts';

export type EducationLevel = {
  id: EducationLevelId;
  name: string;
};

export type OLPath = {
  id: OLPathId;
  name: string;
  description: string;
};

export type OLField = {
  id: OLFieldId;
  name: string;
};

export type ALStream = {
  id: ALStreamId;
  name: string;
  subjects?: string[];
};

export type MapperSuggestion = {
  programId: string;
  programName: string;
  programLevel?: string;
  institutionId: string;
  institutionName: string;
};
