import type { BaseModel, User, AuthTokens } from './models';
export interface ListOptions { sort?: string; limit?: number; filter?: Record<string, unknown> }
export interface IRepository<T extends BaseModel> { list(options?: ListOptions): Promise<T[]>; get(id: string): Promise<T>; create(data: Omit<Partial<T>, keyof BaseModel>): Promise<T>; update(id: string, data: Partial<T>): Promise<T>; delete(id: string): Promise<void>; deleteMany(filter: Record<string, unknown>): Promise<void> }
export interface IAuthService { login(email: string, password: string): Promise<AuthTokens>; register(email: string, password: string): Promise<AuthTokens & { user: User }>; me(): Promise<User>; updateMe(data: Partial<User>): Promise<User>; logout(): void; requestPasswordReset(email: string): Promise<void>; resetPassword(token: string, password: string): Promise<void> }
export interface IStorageService { upload(file: File): Promise<{ file_url: string }> }
export interface IOcrService { extractInvoice(fileUrl: string): Promise<Record<string, unknown>> }
export interface IAiService { complete(prompt: string, context?: unknown): Promise<unknown> }