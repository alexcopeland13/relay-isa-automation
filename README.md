
# Relay - AI-Powered Inside Sales Agent Platform

Relay is an AI-powered Inside Sales Agent (ISA) automation platform designed specifically for real estate and mortgage professionals. The system automates lead qualification, follow-up, and nurturing processes using AI voice agents, web-based lead management, and intelligent routing to human specialists.

## 🚀 Features

- **AI Voice Agents**: Automated lead qualification and follow-up calls via Retell AI
- **Lead Management**: Complete CRM with lead tracking, qualification, and assignment
- **Conversation Analytics**: Real-time transcription, sentiment analysis, and call insights
- **Specialist Matching**: Intelligent routing of qualified leads to appropriate agents
- **Marketplace**: Property showing coordination with integrated payments
- **Follow-up Automation**: Scheduled callbacks and nurturing sequences
- **Analytics Dashboard**: Performance metrics and conversion tracking

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **UI Components**: Shadcn/UI component library
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Voice AI**: Retell AI for conversation processing
- **Payments**: Stripe for marketplace transactions
- **Calendar**: Cal.com integration for appointment scheduling
- **AI/ML**: OpenAI for conversation analysis and insights
- **State Management**: TanStack Query
- **Routing**: React Router

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Retell AI account
- Stripe account (for marketplace features)
- Cal.com account (for calendar integration)
- OpenAI API key (for AI features)

## ⚙️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <YOUR_GIT_URL>
cd relay
npm install
```

### 2. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Connect your Lovable project to Supabase using the green Supabase button
3. Run the database migrations (available in the Supabase dashboard)
4. Set up the following Edge Functions secrets in your Supabase dashboard:

**Required Secrets:**
- `RETELL_API_KEY` - Your Retell AI API key
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `CAL_API_KEY` - Your Cal.com API key (if using advanced calendar features)

### 3. Retell AI Configuration

1. Sign up at [Retell AI](https://retell.ai)
2. Create your voice agents and note the agent IDs
3. Configure webhook URLs to point to your Supabase edge functions:
   - Webhook URL: `https://your-project.supabase.co/functions/v1/retell-webhook-v2`

### 4. Integration Setup

#### Stripe (Marketplace Payments)
1. Create a Stripe account
2. Add your Stripe secret key to Supabase secrets
3. Configure webhook endpoints if needed

#### Cal.com (Calendar Integration)
1. Set up Cal.com account
2. Configure calendar availability
3. Integration works through Retell AI webhooks

#### OpenAI (AI Features)
1. Get your API key from OpenAI
2. Add to Supabase secrets as `OPENAI_API_KEY`

## 🏃‍♂️ Development

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Database Migrations

SQL migrations are managed through the Supabase dashboard. Key tables include:
- `leads` - Lead contact information and status
- `conversations` - Voice call records and transcripts
- `qualification_data` - Extracted lead qualification information
- `specialists` - Sales team member profiles
- `appointments` - Scheduled meetings
- `showings` - Property showing marketplace

### Edge Functions

The project includes several Supabase Edge Functions:
- `retell-webhook-v2` - Processes Retell AI voice events
- `phone-lookup` - Lead identification from phone numbers
- `ai-conversation-processor` - Advanced conversation analysis
- `create-checkout` - Stripe payment processing
- `customer-portal` - Stripe customer management

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ai-integration/   # AI chat and voice components
│   ├── conversations/    # Call management and transcripts
│   ├── leads/           # Lead management interface
│   ├── marketplace/     # Property showing marketplace
│   └── layout/          # App layout and navigation
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and integrations
├── types/               # TypeScript type definitions
└── integrations/        # Third-party service integrations
```

## 🚀 Deployment

### Via Lovable
1. Click the "Publish" button in your Lovable project
2. Your app will be deployed automatically

### Custom Domain
1. Go to Project > Settings > Domains in Lovable
2. Connect your custom domain
3. Follow the DNS configuration instructions

## 🔒 Environment Variables

All sensitive configuration is managed through Supabase Edge Function secrets:

- `RETELL_API_KEY` - Retell AI integration
- `OPENAI_API_KEY` - OpenAI API access
- `STRIPE_SECRET_KEY` - Stripe payments
- `CAL_API_KEY` - Cal.com integration

## 📊 Key Features by Page

- **Dashboard** (`/dashboard`) - Overview metrics and recent activity
- **Leads** (`/leads`) - Lead management and qualification data
- **Conversations** (`/conversations`) - Call history and live call monitoring
- **AI Chat** (`/ai-chat`) - AI assistant interface for prospects and agents
- **Showings** (`/showings`) - Property showing marketplace
- **Analytics** (`/analytics`) - Performance reporting and insights
- **Settings** (`/settings`) - System configuration and integrations

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly with voice integration
4. Push to your repository
5. The changes will automatically sync with Lovable

## 📞 Voice AI Testing

To test voice integration:
1. Navigate to `/diagnostics` for system health checks
2. Use the phone lookup test to verify lead identification
3. Test outbound calling through the leads interface
4. Monitor conversation processing in real-time

## 🆘 Troubleshooting

### Common Issues

**Voice calls not working:**
- Verify RETELL_API_KEY is set correctly
- Check webhook URL configuration in Retell dashboard
- Review edge function logs in Supabase

**Database connection issues:**
- Ensure Supabase project is properly connected
- Check RLS policies are configured correctly
- Verify user authentication is working

**Payment processing errors:**
- Confirm STRIPE_SECRET_KEY is valid
- Check Stripe webhook configuration
- Review payment flow in test mode first

## 📚 Additional Resources

- [Supabase Documentation](https://docs.supabase.com)
- [Retell AI Documentation](https://docs.retell.ai)
- [Stripe Integration Guide](https://stripe.com/docs)
- [Lovable Documentation](https://docs.lovable.dev)

## 📄 License

All rights reserved. This is proprietary software for EMM Loans.

---

For support or questions, contact the development team or refer to the Product Requirements Document (PRD v3) for detailed technical specifications.
