export interface HttpErrorResponse {
  error: {
    message: string;
    status?: number;
    code?: string;
  };
  message: string;
  status: number;
}
