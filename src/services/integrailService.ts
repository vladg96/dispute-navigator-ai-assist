
export interface IntegrailFlightData {
  'Booking Reference': string | null;
  'Flight Number': string | null;
  'Flight Date': string | null;
  Route: {
    Departure: string;
    Arrival: string;
  } | null;
}

export interface IntegrailExecutionResponse {
  status: string;
  executionId: string;
}

export interface IntegrailStatusResponse {
  status: string;
  execution: {
    _id: string;
    status: 'queued' | 'running' | 'finished' | 'failed';
    outputs?: {
      '2_json': IntegrailFlightData;
    };
  };
}

export class IntegrailService {
  private static readonly API_BASE_URL = 'https://cloud.integrail.ai/api/Q4gmrB8jCfx5MD7Ny';
  private static readonly AGENT_ID = '7qnxaDK5Z2v8GKTJc';
  private static readonly STORAGE_BASE_URL = 'https://storage-service.integrail.ai/api';
  private static readonly AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJRNGdtckI4akNmeDVNRDdOeSIsImlhdCI6MTc0NTk1NjUxNX0.w-d7F6ufcRto_5R7IDAba1WJxOUHFAVNR9z1rjLl23E';

  static async uploadFileToStorage(file: File, storageToken: string): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', 'Q4gmrB8jCfx5MD7Ny');

    const response = await fetch(`${this.STORAGE_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${storageToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      fileName: file.name
    };
  }

  static async executeAgent(fileUrl: string, fileName: string): Promise<string> {
    const response = await fetch(`${this.API_BASE_URL}/agent/${this.AGENT_ID}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          file: {
            url: fileUrl,
            fileName: fileName
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute agent: ${response.statusText}`);
    }

    const result: IntegrailExecutionResponse = await response.json();
    return result.executionId;
  }

  static async getExecutionStatus(executionId: string): Promise<IntegrailStatusResponse> {
    const response = await fetch(`${this.API_BASE_URL}/agent/${executionId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution status: ${response.statusText}`);
    }

    return await response.json();
  }

  static async extractFlightData(file: File, storageToken: string): Promise<IntegrailFlightData> {
    try {
      // Step 1: Upload file to storage
      console.log('Uploading file to Integrail storage...');
      const { url, fileName } = await this.uploadFileToStorage(file, storageToken);
      
      // Step 2: Execute the agent
      console.log('Executing Integrail agent...');
      const executionId = await this.executeAgent(url, fileName);
      
      // Step 3: Poll for completion
      console.log('Polling for execution completion...');
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const statusResponse = await this.getExecutionStatus(executionId);
        
        if (statusResponse.execution.status === 'finished') {
          if (statusResponse.execution.outputs?.['2_json']) {
            return statusResponse.execution.outputs['2_json'];
          } else {
            throw new Error('No flight data extracted from document');
          }
        } else if (statusResponse.execution.status === 'failed') {
          throw new Error('Document processing failed');
        }
        
        attempts++;
      }
      
      throw new Error('Document processing timeout');
    } catch (error) {
      console.error('Error extracting flight data:', error);
      throw error;
    }
  }

  static formatFlightDataForForm(data: IntegrailFlightData): {
    bookingReference: string;
    flightNumber: string;
    flightDate: string;
    origin: string;
    destination: string;
  } {
    const formatDate = (dateStr: string | null): string => {
      if (!dateStr) return '';
      
      try {
        const date = new Date(dateStr);
        // Convert to YYYY-MM-DD format for date input
        return date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    return {
      bookingReference: data['Booking Reference'] || '',
      flightNumber: data['Flight Number'] || '',
      flightDate: formatDate(data['Flight Date']),
      origin: data.Route?.Departure || '',
      destination: data.Route?.Arrival || ''
    };
  }
}
