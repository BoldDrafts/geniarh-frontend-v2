// utils/loadingKeys.ts
export const RECRUITMENT_LOADING_KEYS = {
  CREATE_RECRUITMENT: 'create_recruitment',
  UPDATE_RECRUITMENT: 'update_recruitment',
  DELETE_RECRUITMENT: 'delete_recruitment',
  UPDATE_STATUS: 'update_status',
  CREATE_PUBLICATION: 'create_publication',
  LOAD_RECRUITMENTS: 'load_recruitments',
  LOAD_RECRUITMENT_DETAIL: 'load_recruitment_detail',
  REFRESH_DATA: 'refresh_data'
} as const;

export const createLoadingKey = (baseKey: string, id?: string): string => {
  return id ? `${baseKey}_${id}` : baseKey;
};