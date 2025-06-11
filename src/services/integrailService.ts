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

export interface DocumentProcessingResult {
  fileName: string;
  status: 'success' | 'failed' | 'processing';
  data?: IntegrailFlightData;
  error?: string;
  executionId?: string;
}

export interface MultiDocumentResult {
  results: DocumentProcessingResult[];
  mergedData: IntegrailFlightData;
  processingTime: number;
}

export class IntegrailService {
  private static readonly API_BASE_URL = 'https://cloud.integrail.ai/api/Q4gmrB8jCfx5MD7Ny';
  private static readonly AGENT_ID = '7qnxaDK5Z2v8GKTJc';
  private static readonly STORAGE_BASE_URL = 'https://staging-storage-service.integrail.ai/api';
  private static readonly AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJRNGdtckI4akNmeDVNRDdOeSIsImlhdCI6MTc0NTk1NjUxNX0.w-d7F6ufcRto_5R7IDAba1WJxOUHFAVNR9z1rjLl23E';
  private static readonly UPLOAD_TOKEN = 'storage-service-super-staging-api-key';

  static async uploadFileToStorage(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', 'Q4gmrB8jCfx5MD7Ny');

    console.log('Uploading file to Integrail storage...');

    try {
      const response = await fetch(`${this.STORAGE_BASE_URL}/upload?ttl_minutes=3000`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${this.UPLOAD_TOKEN}`,
          'Accept': 'application/json'
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

  static async processMultipleDocuments(files: File[]): Promise<MultiDocumentResult> {
    const startTime = Date.now();
    console.log(`Starting parallel processing of ${files.length} documents`);
    
    try {
      // Step 1: Upload all files in parallel
      console.log('Uploading files in parallel...');
      const uploadPromises = files.map(file => 
        this.uploadFileToStorage(file).catch(error => ({
          error: error.message,
          fileName: file.name
        }))
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      
      // Step 2: Start agent execution for successfully uploaded files
      console.log('Starting agent executions...');
      const executionPromises: Promise<DocumentProcessingResult>[] = [];
      
      uploadResults.forEach((result, index) => {
        if ('error' in result) {
          executionPromises.push(Promise.resolve({
            fileName: result.fileName,
            status: 'failed',
            error: `Upload failed: ${result.error}`          }));
        } else {
          executionPromises.push(
            this.processDocument(result.url, result.fileName)
          );
        }
      });
      
      // Step 3: Wait for all processing to complete
      const processingResults = await Promise.all(executionPromises);
      
      // Step 4: Merge successful results
      const mergedData = this.mergeFlightData(
        processingResults
          .filter(result => result.status === 'success' && result.data)
          .map(result => result.data!)
      );
      
      const processingTime = Date.now() - startTime;
      console.log(`Multi-document processing completed in ${processingTime}ms`);
      
      return {
        results: processingResults,
        mergedData,
        processingTime
      };
      
    } catch (error) {
      console.error('Multi-document processing failed:', error);
      throw error;
    }
  }

  private static async processDocument(fileUrl: string, fileName: string): Promise<DocumentProcessingResult> {
    try {
      // Execute the agent
      const executionId = await this.executeAgent(fileUrl, fileName);
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await this.getExecutionStatus(executionId);
        
        if (statusResponse.execution.status === 'finished') {
          if (statusResponse.execution.outputs?.['2_json']) {
            return {
              fileName,
              status: 'success',
              data: statusResponse.execution.outputs['2_json'],
              executionId
            };
          } else {
            return {
              fileName,
              status: 'failed',
              error: 'No flight data extracted from document',
              executionId
            };
          }
        } else if (statusResponse.execution.status === 'failed') {
          return {
            fileName,
            status: 'failed',
            error: 'Document processing failed',
            executionId
          };
        }
        
        attempts++;
      }
      
      return {
        fileName,
        status: 'failed',
        error: 'Processing timeout',
        executionId
      };
      
    } catch (error) {
      console.error(`Error processing document ${fileName}:`, error);
      return {
        fileName,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static mergeFlightData(dataArray: IntegrailFlightData[]): IntegrailFlightData {
    if (dataArray.length === 0) {
      return {
        'Booking Reference': null,
        'Flight Number': null,
        'Flight Date': null,
        Route: null
      };
    }

    if (dataArray.length === 1) {
      return dataArray[0];
    }

    // Merge logic: prefer non-null values, use most recent data for conflicts
    const merged: IntegrailFlightData = {
      'Booking Reference': null,
      'Flight Number': null,
      'Flight Date': null,
      Route: null
    };

    dataArray.forEach(data => {
      if (data['Booking Reference'] && !merged['Booking Reference']) {
        merged['Booking Reference'] = data['Booking Reference'];
      }
      if (data['Flight Number'] && !merged['Flight Number']) {
        merged['Flight Number'] = data['Flight Number'];
      }
      if (data['Flight Date'] && !merged['Flight Date']) {
        merged['Flight Date'] = data['Flight Date'];
      }
      if (data.Route && !merged.Route) {
        merged.Route = data.Route;
      }
    });

    return merged;
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

