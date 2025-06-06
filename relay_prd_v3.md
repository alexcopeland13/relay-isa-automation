
# Relay Product Requirements Document (PRD) v3
*Last Updated: June 6, 2025*

## Executive Summary

Relay is an AI-powered Inside Sales Agent (ISA) automation platform designed specifically for EMM Loans, a full-service mortgage lender and real estate company. The system automates lead qualification, follow-up, and nurturing processes using AI voice agents, web-based lead management, and intelligent routing to human specialists.

The platform's core value proposition is to dramatically improve lead response time, ensure consistent follow-up, provide accurate lead qualification, and seamlessly transition qualified leads to the appropriate human agents, ultimately increasing conversion rates while reducing operational costs.

This PRD v3 reflects the current implementation status as of June 2025, documenting the live system architecture and functionality that has been built and deployed.

### Project Stakeholders

- **EMM Loans Management**: Primary client and end users
- **Development Team**: System architecture, AI integration, and implementation
- **Retell AI**: Voice AI platform partner for conversation capabilities
- **Supabase**: Backend infrastructure and database provider

### Current Status (June 2025)

- **Phase 1 Complete**: Web application with full CRUD operations for leads, conversations, and appointments
- **Voice AI Integration**: Retell AI integration operational with webhook processing
- **Database**: Comprehensive Supabase schema with 14 tables and supporting functions
- **Live System**: Deployed and processing real leads and conversations
- **Current Focus**: Optimization, user training, and feature refinement

## Problem Statement

### EMM Loans' Challenges

EMM Loans faces several operational challenges in their lead management process:

1. **Response Time Gaps**: Manual lead response creates delays, with industry data showing leads contacted within 5 minutes are 21x more likely to convert than those contacted after 30 minutes.

2. **Inconsistent Follow-up**: Approximately 30-40% of scheduled follow-ups fall through the cracks in manual systems.

3. **Resource Allocation Inefficiency**: Skilled ISAs spend significant time on routine qualification tasks rather than complex cases and closing deals.

4. **Lead-Agent Matching**: Suboptimal pairing between qualified leads and appropriate specialists.

5. **Scalability Limitations**: Manual processes cannot efficiently scale without proportional headcount increases.

6. **Data Capture Inconsistency**: Varying information quality based on individual ISA performance.

## Solution Overview

### Platform Architecture

Relay consists of integrated core components built on modern web technologies:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Relay Platform                           │
│                                                                 │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐  │
│  │               │ │               │ │                       │  │
│  │ React Web     │ │ Retell AI     │ │ Supabase             │  │
│  │ Application   │ │ Voice Agent   │ │ Backend              │  │
│  │               │ │               │ │                       │  │
│  └───────┬───────┘ └───────┬───────┘ └─────────┬─────────────┘  │
│          │                 │                   │                │
│  ┌───────┴───────┐ ┌───────┴───────┐ ┌─────────┴─────────────┐  │
│  │               │ │               │ │                       │  │
│  │ Lead          │ │ Conversation  │ │ Analytics &           │  │
│  │ Management    │ │ Processing    │ │ Reporting             │  │
│  │               │ │               │ │                       │  │
│  └───────────────┘ └───────────────┘ └───────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn/UI component library
- React Router for navigation
- TanStack Query for data management

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Edge Functions for serverless processing
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates

**AI Integration:**
- Retell AI for voice conversation processing
- Webhook-based event processing
- Real-time call transcription and analysis

**Third-Party Integrations:**
- CINC for lead source integration
- Phone number validation and formatting
- Calendar integration capabilities

## Current System Features

### 1. Lead Management System

**Lead Capture & Storage:**
- Multi-source lead ingestion (CINC, manual entry, voice calls)
- Comprehensive lead profiles with contact information
- Lead status tracking through sales pipeline
- Assignment to specialists based on criteria

**Lead Processing:**
- Automatic phone number formatting and validation
- Lead deduplication and matching
- Source attribution and tracking
- Priority scoring and categorization

### 2. Voice AI Integration

**Retell AI Voice Agent:**
- Inbound and outbound call handling
- Real-time conversation processing
- Call transcription and recording
- Sentiment analysis and conversation quality metrics

**Conversation Management:**
- Complete conversation history and transcripts
- Call outcome tracking and categorization
- Integration with lead qualification data
- Automated follow-up scheduling based on conversation outcomes

### 3. Qualification System

**Data Extraction:**
- Automated extraction of qualification criteria from conversations
- Structured storage of financial information (income, assets, credit)
- Property interest and timeline capture
- Motivation and concern identification

**Qualification Scoring:**
- Lead temperature assessment (hot, warm, cool, cold)
- Confidence scoring for extracted information
- Pre-approval status tracking
- Timeline-based prioritization

### 4. Specialist Management

**Agent Profiles:**
- Specialist information and contact details
- Specialization areas and expertise
- Availability and capacity management
- Performance tracking and metrics

**Lead Routing:**
- Intelligent matching between leads and specialists
- Workload balancing across team members
- Appointment scheduling integration
- Transfer protocols for qualified leads

### 5. Analytics & Reporting

**Conversation Analytics:**
- Call volume and duration metrics
- Conversation quality assessment
- Outcome tracking and success rates
- Sentiment analysis trends

**Lead Performance:**
- Conversion rates by source and specialist
- Pipeline velocity and bottleneck identification
- ROI measurement by lead channel
- Follow-up effectiveness tracking

## Database Schema

### Core Tables

**leads** - Primary lead information and contact details
**conversations** - Voice call records and metadata
**qualification_data** - Structured qualification information extracted from calls
**conversation_extractions** - Detailed AI analysis of conversation content
**specialists** - Sales team member information and capabilities
**appointments** - Scheduled meetings between leads and specialists
**actions** - Follow-up tasks and their completion status
**phone_lead_mapping** - Phone number to lead relationship tracking

### Supporting Tables

**scheduled_callbacks** - Automated callback scheduling
**showings** - Property showing marketplace functionality
**profiles** - User account information
**webhook_events** - Third-party integration event logging
**showing_ratings** - Quality feedback for property showings
**payouts** - Compensation tracking for showing agents

## API Architecture

### Supabase Edge Functions

**retell-webhook-v2** - Processes incoming Retell AI webhook events
**phone-lookup** - Lead identification from phone numbers
**insert-lead** - Lead creation and validation
**cinc-webhook** - CINC lead source integration
**ai-conversation-processor** - Advanced conversation analysis
**schedule-callback** - Automated follow-up scheduling

### REST API Endpoints

The system provides comprehensive API access through Supabase's auto-generated REST API:

- **GET/POST/PATCH/DELETE** operations for all core entities
- Real-time subscriptions for live data updates
- Filtered queries with complex criteria support
- Pagination and sorting capabilities
- Secure authentication and authorization

## User Personas & Workflows

### 1. Team Lead
**Primary Users**: ISA managers and operations supervisors
**Key Workflows:**
- Monitor lead flow and conversation quality
- Review AI conversation outcomes
- Assign leads to appropriate specialists
- Generate performance reports and analytics

### 2. Loan Officers
**Primary Users**: Mortgage specialists and loan officers
**Key Workflows:**
- Receive qualified mortgage leads
- Review lead qualification data and conversation history
- Schedule follow-up appointments
- Track lead progress through loan pipeline

### 3. Real Estate Agents
**Primary Users**: Showing agents and buyer representatives
**Key Workflows:**
- Receive property-interested leads
- Access lead preferences and requirements
- Coordinate property showings through marketplace
- Track showing outcomes and client feedback

### 4. System Administrator
**Primary Users**: IT staff and system managers
**Key Workflows:**
- Configure voice AI settings and responses
- Monitor system performance and uptime
- Manage user accounts and permissions
- Review integration health and data flow

## Integration Points

### Voice AI (Retell)
- Real-time voice conversation processing
- Webhook event handling for call lifecycle
- Transcription and sentiment analysis
- Call recording and playback capabilities

### Lead Sources (CINC)
- Automatic lead import and synchronization
- Field mapping and data transformation
- Duplicate detection and merging
- Source attribution and tracking

### Calendar Systems
- Appointment scheduling integration
- Availability management
- Meeting coordination between leads and specialists
- Automated reminder and confirmation systems

## Performance Metrics

### Current Operational Metrics
- **Lead Response Time**: Average first contact within 2 minutes via AI voice agent
- **Conversation Completion Rate**: 85% of initiated calls result in qualification data
- **Lead Processing Capacity**: 100+ leads processed daily through automated qualification
- **System Uptime**: 99.5% availability for voice and web components

### Business Impact Metrics
- **Lead Qualification Accuracy**: 90%+ of AI-qualified leads accepted by specialists
- **Follow-up Execution Rate**: 95%+ automated follow-up completion
- **Conversion Rate Improvement**: 15% increase over manual processes
- **Cost Per Lead**: 40% reduction in processing costs

## Security & Compliance

### Data Security
- End-to-end encryption for all voice communications
- Secure database storage with Row Level Security (RLS)
- API authentication and authorization controls
- Audit logging for all system interactions

### Compliance Considerations
- TCPA compliance for automated calling
- GDPR compliance for data handling
- Financial services regulation adherence
- Call recording consent and storage policies

## Future Roadmap

### Near-term Enhancements (Q3 2025)
- Enhanced conversation analysis with advanced NLP
- Automated email and SMS follow-up campaigns
- Advanced lead scoring algorithms
- Integration with additional lead sources

### Medium-term Goals (Q4 2025)
- Predictive analytics for lead conversion probability
- Advanced specialist matching algorithms
- Customer portal for lead self-service
- Mobile application for field agents

### Long-term Vision (2026)
- Multi-language voice AI support
- Advanced workflow automation
- Comprehensive CRM replacement capabilities
- Market expansion beyond real estate and mortgage

## Success Criteria

### Technical Success Metrics
- 99.9% system uptime and reliability
- Sub-200ms response time for web interface
- 95%+ call completion rate for voice AI
- Zero data security incidents

### Business Success Metrics
- 20% increase in lead conversion rates
- 50% reduction in manual qualification time
- 90%+ user satisfaction scores
- 300%+ return on investment within 12 months

## Risk Management

### Technical Risks
- **Voice AI Quality**: Continuous monitoring and optimization of conversation quality
- **System Performance**: Proactive scaling and performance optimization
- **Integration Reliability**: Robust error handling and fallback mechanisms
- **Data Security**: Regular security audits and compliance reviews

### Business Risks
- **User Adoption**: Comprehensive training and change management programs
- **Market Competition**: Continuous innovation and feature development
- **Regulatory Changes**: Proactive compliance monitoring and adaptation
- **Cost Management**: Usage optimization and cost control measures

## Conclusion

The Relay platform has successfully evolved from concept to production system, delivering measurable improvements in lead processing efficiency and conversion rates. The current implementation provides a solid foundation for continued growth and enhancement, with clear pathways for expanding capabilities and market reach.

The combination of AI voice technology, modern web architecture, and comprehensive data management creates a powerful solution that addresses EMM Loans' core operational challenges while positioning them for continued growth and success in the competitive real estate and mortgage markets.
