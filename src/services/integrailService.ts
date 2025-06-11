export interface IntegrailFlightData {
  'Booking Reference': string | null;
  'Flight Number': string | null;
  'Flight Date': string | null;
  Route: {
    Departure: string;
    Arrival: string;
  } | null;
}

export interface IntegrailEligibilityData {
  applicableRegulations: string;
  claimValuation: string;
  eligibilityAssesment: string;
  consumerFriendlyVersion: string;
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
  private static readonly STORAGE_BASE_URL = 'https://staging-storage-service.integrail.ai/api';
  private static readonly AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJRNGdtckI4akNmeDVNRDdOeSIsImlhdCI6MTc0NTk1NjUxNX0.w-d7F6ufcRto_5R7IDAba1WJxOUHFAVNR9z1rjLl23E';
  private static readonly UPLOAD_TOKEN = 'storage-service-super-staging-api-key';

  private static readonly AGENT_CONFIGS = {
    FLIGHT_DATA: {
      id: '7qnxaDK5Z2v8GKTJc',
      description: 'Flight data extraction agent'
    },
    ELIGIBILITY: {
      id: 'Ph7ainsJ7T4L2XZt4',
      description: 'Eligibility and regulations assessment agent'
    }
    // Add more agent configurations as needed
  } as const;

  private static eligibilityData: IntegrailEligibilityData | null = null;
  private static eligibilityCheckPromise: Promise<IntegrailEligibilityData> | null = null;
  private static eligibilityCheckError: Error | null = null;

  static getEligibilityData(): IntegrailEligibilityData | null {
    return this.eligibilityData;
  }

  static getEligibilityCheckError(): Error | null {
    return this.eligibilityCheckError;
  }

  static async startEligibilityCheck(description: string, flightNumber: string): Promise<void> {
    if (this.eligibilityCheckPromise) {
      return; // Already running
    }

    this.eligibilityCheckError = null;
    this.eligibilityCheckPromise = this.checkEligibilityAndRegulations(description, flightNumber);
    
    try {
      this.eligibilityData = await this.eligibilityCheckPromise;
      console.log('Eligibility data:', this.eligibilityData);
    } catch (error) {
      console.error('Background eligibility check failed:', error);
      this.eligibilityCheckError = error instanceof Error ? error : new Error('Unknown error during eligibility check');
      throw this.eligibilityCheckError;
    } finally {
      this.eligibilityCheckPromise = null;
    }
  }

  static isEligibilityCheckComplete(): boolean {
    return this.eligibilityData !== null;
  }

  static isEligibilityCheckInProgress(): boolean {
    return this.eligibilityCheckPromise !== null;
  }

  static hasEligibilityCheckError(): boolean {
    return this.eligibilityCheckError !== null;
  }

  static resetEligibilityCheck(): void {
    this.eligibilityData = null;
    this.eligibilityCheckPromise = null;
    this.eligibilityCheckError = null;
  }

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
        url: result.link,
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

  static async executeAgent(agentType: keyof typeof IntegrailService.AGENT_CONFIGS, inputs: Record<string, any>): Promise<string> {
    try {
      const agentId = this.AGENT_CONFIGS[agentType].id;
      console.log(`Executing ${this.AGENT_CONFIGS[agentType].description} with inputs:`, inputs);
      
      const response = await fetch(`${this.API_BASE_URL}/agent/${agentId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs
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

  private static async pollExecutionStatus(executionId: string, maxAttempts: number = 300): Promise<IntegrailStatusResponse> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 1 second
      
      const statusResponse = await this.getExecutionStatus(executionId);
      console.log(`Attempt ${attempts + 1}: Status = ${statusResponse.execution.status}`);
      
      if (statusResponse.execution.status === 'finished' || statusResponse.execution.status === 'failed') {
        return statusResponse;
      }
      
      attempts++;
    }
    
    throw new Error('Document processing timeout - please try again');
  }

  static async checkEligibilityAndRegulations(detailedDescription: string, flightNumber: string): Promise<IntegrailEligibilityData> {
    console.log('Executing Integrail agent...');
    const executionId = await this.executeAgent('ELIGIBILITY', {
      Complaint: detailedDescription,
      flightNumber: flightNumber
    });
    
    const statusResponse = await this.pollExecutionStatus(executionId);
    
    if (statusResponse.execution.status === 'finished') {
      if (statusResponse.execution.outputs?.['applicableRegulations'] && 
          statusResponse.execution.outputs?.['claimValuation'] && 
          statusResponse.execution.outputs?.['eligibilityAssesment'] &&
          statusResponse.execution.outputs?.['consumerFriendlyVersion']) {
        return {
          applicableRegulations: statusResponse.execution.outputs['applicableRegulations'],
          claimValuation: statusResponse.execution.outputs['claimValuation'],
          eligibilityAssesment: statusResponse.execution.outputs['eligibilityAssesment'],
          consumerFriendlyVersion: statusResponse.execution.outputs['consumerFriendlyVersion']
        };
      } else {
        throw new Error('No eligibility data extracted from document');
      }
    } else {
      throw new Error('Dispute details processing failed');
    }
  }

  private static async processDocument(fileUrl: string, fileName: string): Promise<DocumentProcessingResult> {
    try {
      // Execute the agent
      const executionId = await this.executeAgent('FLIGHT_DATA', { file: { url: fileUrl, fileName: fileName } });
      
      // Poll for completion
      const statusResponse = await this.pollExecutionStatus(executionId);
      
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
      } else {
        return {
          fileName,
          status: 'failed',
          error: 'Document processing failed',
          executionId
        };
      }
    } catch (error) {
      console.error(`Error processing document ${fileName}:`, error);
      return {
        fileName,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async extractFlightData(file: File): Promise<IntegrailFlightData> {
    try {
      // Step 1: Upload file to storage
      console.log('Uploading file to Integrail storage...');
      const { url, fileName } = await this.uploadFileToStorage(file);
      
      // Step 2: Process the document
      console.log('Processing document...');
      const result = await this.processDocument(url, fileName);
      
      if (result.status === 'success' && result.data) {
        console.log('Document processing completed successfully');
        return result.data;
      } else {
        throw new Error(result.error || 'Document processing failed');
      }
    } catch (error) {
      console.error('Error extracting flight data:', error);
      throw error;
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

