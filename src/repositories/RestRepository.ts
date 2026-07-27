import { httpClient } from '@/services/httpClient';
import type { BaseModel } from '@/types/models';
import type { IRepository, ListOptions } from '@/types/contracts';

export class RestRepository<T extends BaseModel> implements IRepository<T> {
  constructor(private readonly resource: string) {}
  list(options: ListOptions = {}) { const query = new URLSearchParams(); if (options.sort) query.set('sort', options.sort); if (options.limit) query.set('limit', String(options.limit)); if (options.filter) query.set('filter', JSON.stringify(options.filter)); const suffix = query.size ? `?${query}` : ''; return httpClient.get<T[]>(`/resources/${this.resource}${suffix}`); }
  get(id: string) { return httpClient.get<T>(`/resources/${this.resource}/${id}`); }
  create(data: Omit<Partial<T>, keyof BaseModel>) { return httpClient.post<T>(`/resources/${this.resource}`, data); }
  update(id: string, data: Partial<T>) { return httpClient.patch<T>(`/resources/${this.resource}/${id}`, data); }
  delete(id: string) { return httpClient.delete<void>(`/resources/${this.resource}/${id}`); }
  deleteMany(filter: Record<string, unknown>) { return httpClient.delete<void>(`/resources/${this.resource}`, { filter }); }
}