import { httpClient } from './httpClient';
import type { IAiService, IOcrService, IStorageService } from '@/types/contracts';

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
class StorageService implements IStorageService { async upload(file: File) { return httpClient.post<{file_url:string}>('/files', { name: file.name, type: file.type, data: await toBase64(file) }); } }
class OcrService implements IOcrService {
  extractInvoice(fileUrl: string) { return httpClient.post<Record<string, unknown>>('/ocr/invoices', { file_url: fileUrl }); }
  extractInvoiceFromImage(imageBase64: string, mimeType: string, fileName?: string) {
    return httpClient.post<Record<string, unknown>>('/ocr/invoices', { image_base64: imageBase64, mime_type: mimeType, file_name: fileName });
  }
}
class AiService implements IAiService { complete(prompt: string, context?: unknown) { return httpClient.post('/ai/complete', { prompt, context }); } }
export const storageService = new StorageService();
export const ocrService = new OcrService();
export const aiService = new AiService();
export const actionService = { invoke: <T>(name: string, payload: unknown) => httpClient.post<T>(`/actions/${name}`, payload) };