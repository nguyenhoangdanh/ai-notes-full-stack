/**
 * Environment Configuration Validator
 * Validates required environment variables for AI Notes application
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

interface RequiredEnvVar {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
}

// Frontend environment requirements
const frontendRequiredEnv: RequiredEnvVar[] = [
  {
    name: 'NEXT_PUBLIC_API_BASE_URL',
    description: 'Backend API URL',
    required: true,
    validator: (value) => value.startsWith('http://') || value.startsWith('https://')
  },
  {
    name: 'NEXT_PUBLIC_APP_URL', 
    description: 'Frontend application URL',
    required: true,
    validator: (value) => value.startsWith('http://') || value.startsWith('https://')
  },
  {
    name: 'NODE_ENV',
    description: 'Application environment',
    required: true,
    validator: (value) => ['development', 'production', 'test'].includes(value)
  },
  {
    name: 'NEXT_PUBLIC_COOKIE_SECURE',
    description: 'Cookie security setting',
    required: false,
    defaultValue: 'false',
    validator: (value) => ['true', 'false'].includes(value)
  }
];

// Backend environment requirements  
const backendRequiredEnv: RequiredEnvVar[] = [
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL database connection string',
    required: true,
    validator: (value) => value.includes('postgresql://') || value.includes('postgres://')
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT signing secret',
    required: true,
    validator: (value) => value.length >= 32
  },
  {
    name: 'FRONTEND_URL',
    description: 'Frontend application URL for CORS',
    required: true,
    validator: (value) => value.startsWith('http://') || value.startsWith('https://')
  },
  {
    name: 'PORT',
    description: 'Server port',
    required: false,
    defaultValue: '3001',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'NODE_ENV',
    description: 'Application environment',
    required: true,
    validator: (value) => ['development', 'production', 'test'].includes(value)
  }
];

function validateEnvironment(requiredVars: RequiredEnvVar[], envVars: Record<string, string | undefined>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of requiredVars) {
    const value = envVars[envVar.name];

    // Check if required variable is missing
    if (envVar.required && (!value || value.trim() === '')) {
      errors.push(`Missing required environment variable: ${envVar.name} (${envVar.description})`);
      continue;
    }

    // Use default value if not provided
    const actualValue = value || envVar.defaultValue;

    // Validate the value if validator is provided
    if (actualValue && envVar.validator && !envVar.validator(actualValue)) {
      errors.push(`Invalid value for ${envVar.name}: ${actualValue} (${envVar.description})`);
    }

    // Warn about missing optional variables
    if (!envVar.required && !value && !envVar.defaultValue) {
      warnings.push(`Optional environment variable not set: ${envVar.name} (${envVar.description})`);
    }
  }

  // Additional validation checks
  const nodeEnv = envVars.NODE_ENV;
  if (nodeEnv === 'production') {
    // Production-specific validations
    if (envVars.NEXT_PUBLIC_COOKIE_SECURE !== 'true') {
      warnings.push('COOKIE_SECURE should be true in production for security');
    }
    
    if (envVars.JWT_SECRET && envVars.JWT_SECRET.length < 64) {
      warnings.push('JWT_SECRET should be at least 64 characters in production');
    }
    
    if (envVars.NEXT_PUBLIC_API_BASE_URL && !envVars.NEXT_PUBLIC_API_BASE_URL.startsWith('https://')) {
      warnings.push('API_BASE_URL should use HTTPS in production');
    }
  }

  const isValid = errors.length === 0;
  const summary = `Validation ${isValid ? 'passed' : 'failed'}: ${errors.length} errors, ${warnings.length} warnings`;

  return {
    isValid,
    errors,
    warnings,
    summary
  };
}

function printValidationResult(result: ValidationResult, title: string): void {
  console.log(`\n=== ${title} ===`);
  console.log(result.summary);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('\n✅ All environment variables are properly configured!');
  }
}

// Main validation function
export function validateAllEnvironments(): void {
  console.log('AI Notes Environment Configuration Validator');
  console.log('===============================================');

  // Validate frontend environment
  const frontendResult = validateEnvironment(frontendRequiredEnv, process.env);
  printValidationResult(frontendResult, 'Frontend Environment');

  // Validate backend environment (simulate backend env vars)
  const backendResult = validateEnvironment(backendRequiredEnv, process.env);
  printValidationResult(backendResult, 'Backend Environment');

  // Overall result
  const overallValid = frontendResult.isValid && backendResult.isValid;
  console.log(`\n${'='.repeat(47)}`);
  console.log(`Overall Status: ${overallValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (!overallValid) {
    console.log('\nPlease fix the errors above before proceeding with deployment.');
    process.exit(1);
  } else {
    console.log('\nEnvironment configuration is ready for deployment! 🚀');
  }
}

// Export for use in other files
export { validateEnvironment, frontendRequiredEnv, backendRequiredEnv };

// Run validation if this script is executed directly
import { fileURLToPath } from 'url';
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAllEnvironments();
}