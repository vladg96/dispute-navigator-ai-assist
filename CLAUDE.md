# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based dispute navigation application for airline passengers to file disputes with aviation authorities. The app guides users through a multi-step validation process and integrates with external services for document processing and eligibility assessment.

## Development Commands

- **Development server**: `npm run dev` (runs on port 8080)
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Development build**: `npm run build:dev` (build in development mode)
- **Linting**: `npm run lint` (ESLint with TypeScript support)
- **Preview**: `npm run preview` (preview production build)
- **Deploy**: `npm run deploy` (build + deploy to GitHub Pages)

## Architecture

### Core Flow
The application follows an 8-step process:
1. **Identity Validation** - Consumer details with Everworker AI validation
2. **Flight Data Validation** - Flight details with booking verification
3. **Complaint Details** - Dispute description (triggers background eligibility check)
4. **Document Upload** - Supporting documents processed via Integrail
5. **Eligibility Check** - GACA regulations compliance assessment
6. **Final Consent** - User authorization for processing
7. **Case Summary** - Generated case overview
8. **Document Analysis** - Final document processing results

### Key Integrations
- **Supabase**: Database storage with disputes/evidence tables
- **Integrail AI**: Document processing and eligibility assessment via cloud agents
- **Everworker AI**: Consumer identity validation service
- **EmailJS**: Email notifications for new submissions

### External Service Architecture
- **Integrail Service** (`/src/services/integrailService.ts`): 
  - Manages file uploads to staging storage
  - Executes AI agents for flight data extraction and eligibility checks
  - Handles parallel document processing with status polling
  - Two main agents: FLIGHT_DATA and ELIGIBILITY
- **Everworker Service** (`/src/services/everworkerService.ts`):
  - Consumer identity validation with confidence scoring
  - Mock validation available for development
- **Dispute Submission Service** (`/src/services/disputeSubmissionService.ts`):
  - Supabase integration with RLS fallback simulation
  - Auto-generates case IDs and calculates compensation amounts

### State Management
- Form data managed in `DisputeForm.tsx` with step-based validation
- Background eligibility checking with polling mechanism
- Validation results cached per step to prevent re-validation

### UI Components
- **shadcn/ui** component library with custom theming
- **Sidebar navigation** with step indicators
- **Multi-step validation components** in `/src/components/ValidationSteps.tsx`
- **Document analysis** and **case summary** specialized components

### Data Types
Key interfaces defined in `/src/types/dispute.ts`:
- `DisputeFormData`: Main form structure
- `EligibilityResult`: GACA compliance assessment
- `StepValidationResult`: Per-step validation outcomes
- `EverworkerValidationResult`: Identity verification results

### Environment Variables
Required for external services:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: Database connection
- `VITE_EVERWORKER_API_KEY`: Identity validation service
- `VITE_EMAILJS_*`: Email notification setup
- `VITE_NOTIFICATION_EMAIL`: Recipient for new dispute notifications

### Build Configuration
- **Vite + React + SWC**: Fast development and building
- **GitHub Pages deployment**: Automatic base URL handling
- **Path aliases**: `@/` maps to `./src/`
- **Development mode**: Includes Lovable component tagger

## Important Implementation Notes

- The eligibility check runs in background starting from step 3 to improve UX
- Document processing supports parallel uploads with individual error handling
- Supabase RLS policies may block inserts - service includes simulation fallback
- Case IDs follow format: `CS-{YEAR}-{TIMESTAMP}`
- Amount calculation based on dispute category with regex extraction from eligibility results
- Email notifications sent on final submission with comprehensive case details

## Testing

No test framework is currently configured. When adding tests, check if there are existing test scripts or configuration files first.