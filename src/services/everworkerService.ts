
export interface EverworkerIdentityRequest {
  consumerName: string;
  nationalId: string;
  phone: string;
  email: string;
}

export interface EverworkerIdentityResponse {
  isValid: boolean;
  confidence: number;
  validatedFields: {
    name: boolean;
    nationalId: boolean;
    phone: boolean;
    email: boolean;
  };
  warnings: string[];
  errors: string[];
  riskScore: number;
  recommendations: string[];
}

export class EverworkerService {
  private static readonly API_ENDPOINT = 'https://api.everworker.ai/v1/agents/consumer-identity-validator';
  private static readonly API_KEY = import.meta.env.VITE_EVERWORKER_API_KEY || '';

  static async validateConsumerIdentity(data: EverworkerIdentityRequest): Promise<EverworkerIdentityResponse> {
    try {
      console.log('Sending identity validation request to Everworker:', data);
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'X-Agent-Version': '1.0'
        },
        body: JSON.stringify({
          input: {
            consumerName: data.consumerName,
            nationalId: data.nationalId,
            phone: data.phone,
            email: data.email
          },
          context: {
            domain: 'aviation_dispute',
            jurisdiction: 'saudi_arabia',
            requiresHighConfidence: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Everworker API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Everworker validation response:', result);

      // Transform API response to our interface
      return {
        isValid: result.output?.isValid || false,
        confidence: result.output?.confidence || 0,
        validatedFields: {
          name: result.output?.validatedFields?.name || false,
          nationalId: result.output?.validatedFields?.nationalId || false,
          phone: result.output?.validatedFields?.phone || false,
          email: result.output?.validatedFields?.email || false
        },
        warnings: result.output?.warnings || [],
        errors: result.output?.errors || [],
        riskScore: result.output?.riskScore || 0,
        recommendations: result.output?.recommendations || []
      };
    } catch (error) {
      console.error('Everworker validation error:', error);
      
      // Return fallback response for development/testing
      return {
        isValid: false,
        confidence: 0,
        validatedFields: {
          name: false,
          nationalId: false,
          phone: false,
          email: false
        },
        warnings: ['Identity validation service temporarily unavailable'],
        errors: ['Unable to connect to validation service'],
        riskScore: 1,
        recommendations: ['Please verify your information and try again']
      };
    }
  }

  // Mock validation for development (when API key is not available)
  static async mockValidateConsumerIdentity(data: EverworkerIdentityRequest): Promise<EverworkerIdentityResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation logic
    const hasValidName = data.consumerName.trim().length >= 2;
    const hasValidId = data.nationalId.length >= 8 && /^[A-Za-z0-9]+$/.test(data.nationalId);
    const hasValidPhone = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(data.phone);
    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

    const validFieldsCount = [hasValidName, hasValidId, hasValidPhone, hasValidEmail].filter(Boolean).length;
    const confidence = validFieldsCount / 4;
    const isValid = confidence >= 0.75;

    return {
      isValid,
      confidence,
      validatedFields: {
        name: hasValidName,
        nationalId: hasValidId,
        phone: hasValidPhone,
        email: hasValidEmail
      },
      warnings: confidence < 1 ? ['Some fields may require additional verification'] : [],
      errors: isValid ? [] : ['Identity validation failed - please check your information'],
      riskScore: 1 - confidence,
      recommendations: isValid ? ['Identity verified successfully'] : ['Please verify all required fields are correctly entered']
    };
  }
}
