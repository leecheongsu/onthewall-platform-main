import { ModuleJsonApiConfig, ModuleTextApiConfig } from '@/api/config';
import moment from 'moment';

export const moduleApis = {
  async createExhibition(data: any) {
    return await ModuleJsonApiConfig({
      method: 'post',
      url: '/createExhibition',
      data: data,
    });
  },
  async getExhibitions() {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getExhibitions`,
    });
  },
  async getSpaces() {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getSpaces`,
    });
  },
  async getAllPrivateSpaces() {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getAllSpaces`,
    });
  },
  async getSpacesByProjectId(projectId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getSpaces/${projectId}`,
    });
  },
  async getExhibitionById(exhibitionId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getExhibitionById/${exhibitionId}`,
    });
  },
  async getExhibitionsByUserId(userId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getExhibitionsByUserId/${userId}`,
    });
  },
  async getExhibitionsByProjectId(
    projectId: string,
    sortBy: string = 'createdAt',
    pageSize: number = 10,
    page: number = 1,
    filter: 'manage' | 'main' = 'manage'
  ) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getExhibitionsByProjectId/${projectId}?sortBy=${sortBy}&pageSize=${pageSize}&page=${page}&filter=${filter}`,
    });
  },
  async getPendingExhibitionsByProjectId(projectId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getPendingExhibitionsByProjectId/${projectId}`,
    });
  },
  async getRejectedExhibitionsByProjectId(projectId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getRejectedExhibitionsByProjectId/${projectId}`,
    });
  },
  async getEditTokenByExhibitionId(exhibitionId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getEditToken/${exhibitionId}`,
    });
  },
  async getCommentsByProjectId(projectId: string, config: any = {}) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getCommentsByProjectId/${projectId}?${Object.keys(config)
        .map((key) => key + '=' + config[key])
        .join('&')}`,
    });
  },
  async getCommentsByExhibitionId(exhibitionId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getCommentsByExhibitionId/${exhibitionId}`,
    });
  },
  async getCountsByProjectId(exhibitionId: string) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getCountsByProjectId/${exhibitionId}`,
    });
  },
  async getViewLogsByProjectId(
    exhibitionId: string,
    config: { type: 'view' | 'pageView' | 'like' | 'comment'; from: string; to: string } = {
      type: 'view',
      from: '',
      to: '',
    }
  ) {
    return await ModuleJsonApiConfig({
      method: 'get',
      url: `/getLogsByProjectId/${exhibitionId}?type=${config.type}&from=${config.from}&to=${config.to}`,
      // url: `/getViewLogsByProjectId/${exhibitionId}?size=${config.size}`,
    });
  },
};

export const moduleActionApis = {
  async approvePublish(exhibitionId: string, data: any) {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/approvePublish/${exhibitionId}`,
      data: data,
    });
  },
  async denyPublish(exhibitionId: string, data: any) {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/denyPublish/${exhibitionId}`,
      data: data,
    });
  },
  async deleteExhibition(exhibitionId: string) {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/deleteExhibition/${exhibitionId}`,
      data: {},
    });
  },
  async updateExhibition(exhibitionId: string, data: any) {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/updateExhibition/${exhibitionId}`,
      data: data,
    });
  },
  async setProject(projectId: string, data: any) {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/setProject`,
      data: {
        id: projectId,
        data: data,
      },
    });
  },
  async updateProject(projectId: string, data: any) {
    return await ModuleTextApiConfig({
      method: 'post',
      url: '/updateProject',
      data: {
        id: projectId,
        data: data,
      },
    });
  },
  async requestPreview(exhibitionId: string): Promise<string> {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/requestPreview/${exhibitionId}`,
      data: {},
    });
  },
  async hideExhibition(exhibitionId: string): Promise<string> {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/hideExhibition/${exhibitionId}`,
      data: {},
    });
  },
  async showExhibition(exhibitionId: string): Promise<string> {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/showExhibition/${exhibitionId}`,
      data: {},
    });
  },
  async closeExhibition(exhibitionId: string): Promise<string> {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/closeExhibition/${exhibitionId}`,
      data: {},
    });
  },
  async openExhibition(exhibitionId: string): Promise<string> {
    return await ModuleTextApiConfig({
      method: 'post',
      url: `/openExhibition/${exhibitionId}`,
      data: {},
    });
  },
};
