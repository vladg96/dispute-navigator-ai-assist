
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
  private static readonly UPLOAD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJRNGdtckI4akNmeDVNRDdOeSIsInVzZXJJZCI6IlE0Z21yQjhqQ2Z4NU1EN055IiwiaWF0IjoxNzQ1OTc1NTk0LCJleHAiOjE3NDYwNjE5OTR9.lMQR-BqWm0S2cUpGhNcI0X3E8OqgD5dqd-wXaIzQZHQ';

  static async uploadFileToStorage(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', 'Q4gmrB8jCfx5MD7Ny');

    console.log('Uploading file to Integrail storage...');

    try {
      const response = await fetch(`${this.STORAGE_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.UPLOAD_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, response.statusText, errorText);
        throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('File uploaded successfully:', result);
      return {
        url: result.url,
        fileName: file.name
      };
    } catch (error) {
      console.error('Error during file upload:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the file upload service. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  static async executeAgent(fileUrl: string, fileName: string): Promise<string> {
    try {
      console.log('Executing agent with file:', fileName);
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
        const errorText = await response.text();
        console.error('Agent execution failed:', response.status, response.statusText, errorText);
        throw new Error(`Failed to execute agent: ${response.status} ${response.statusText}`);
      }

      const result: IntegrailExecutionResponse = await response.json();
      console.log('Agent execution started:', result.executionId);
      return result.executionId;
    } catch (error) {
      console.error('Error executing agent:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the document processing service. Please try again.');
      }
      throw error;
    }
  }

  static async getExecutionStatus(executionId: string): Promise<IntegrailStatusResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/agent/${executionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.AUTH_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status check failed:', response.status, response.statusText, errorText);
        throw new Error(`Failed to get execution status: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting execution status:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to check processing status. Please try again.');
      }
      throw error;
    }
  }

  static async extractFlightData(file: File): Promise<IntegrailFlightData> {
    try {
      // Step 1: Upload file to storage
      console.log('Uploading file to Integrail storage...');
      const { url, fileName } = await this.uploadFileToStorage(file);
      
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
        console.log(`Attempt ${attempts + 1}: Status = ${statusResponse.execution.status}`);
        
        if (statusResponse.execution.status === 'finished') {
          if (statusResponse.execution.outputs?.['2_json']) {
            console.log('Document processing completed successfully');
            return statusResponse.execution.outputs['2_json'];
          } else {
            throw new Error('No flight data extracted from document');
          }
        } else if (statusResponse.execution.status === 'failed') {
          throw new Error('Document processing failed');
        }
        
        attempts++;
      }
      
      throw new Error('Document processing timeout - please try again');
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
