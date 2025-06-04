MWALIMU Clement - Online Driving Test Platform
Ikizamini cya Provisoire online - Wige wihangane! 🚗
An advanced online driving test platform designed to help students prepare for their provisional driving license exams in Rwanda. Built with modern web technologies and optimized for mobile-first usage.
🌟 Features
🎯 Core Functionality
Multi-language Support: Tests available in Kinyarwanda, English, and French
Interactive Practice Tests: Comprehensive provisional driving license preparation
Real-time Feedback: Immediate scoring and detailed explanations
Progress Tracking: Monitor your improvement over time
Mobile Optimized: Perfect for smartphones and tablets
💳 Flexible Payment Options
Single Test: 100 RWF per test
Daily Access: 1,000 RWF (unlimited tests for 24 hours)
Weekly Access: 4,000 RWF (unlimited tests for 7 days)
Monthly Access: 10,000 RWF (unlimited tests for 30 days)
🔐 Access Methods
Mobile Money: MTN Mobile Money, Airtel Money integration
Bank Payments: Traditional bank payment options
Access Codes: Alternative entry method for institutional users
🚀 Technology Stack
Frontend
Framework: Next.js 15.3.2 with TypeScript
Styling: Tailwind CSS + shadcn/ui components
State Management: React hooks with Context API
Build Tool: Bun package manager
Deployment: Netlify with CI/CD
Backend & Database
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
Real-time: Supabase real-time subscriptions
Storage: Supabase Storage for assets
Edge Functions: Supabase Edge Functions for serverless logic
Payment Integration
Payment Gateway: Flutterwave API
Supported Methods: Mobile Money (MTN, Airtel), Bank transfers
Currency: Rwandan Franc (RWF)
Security: PCI DSS compliant processing
🛠️ Installation & Setup
Prerequisites
Node.js 18+ or Bun
Supabase account
Flutterwave account for payments
Local Development Setup
Clone the repository
git clone https://github.com/your-org/mwalimu-clement-platform.git
cd mwalimu-clement-platform

Install dependencies
# Using Bun (recommended)
bun install

# Or using npm
npm install

Environment Setup Create a .env.local file in the root directory:
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Flutterwave Configuration
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_PHONE=+250787179869

Database Setup
# Install Supabase CLI
npm install -g @supabase/cli

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed the database
supabase db seed

Start Development Server
bun dev
# or
npm run dev

Visit http://localhost:3000 to see the application.
📁 Project Structure
mwalimu-clement-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API routes & webhooks
│   │   ├── test/              # Test-taking interface
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── forms/             # Form components
│   │   ├── modals/            # Modal components
│   │   ├── payment/           # Payment-related components
│   │   ├── test/              # Test-taking components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── supabase/          # Supabase client & utilities
│   │   ├── flutterwave/       # Payment integration
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod validation schemas
│   ├── types/                 # TypeScript definitions
│   │   ├── database.ts        # Supabase generated types
│   │   ├── payment.ts         # Payment-related types
│   │   └── test.ts            # Test-related types
│   └── hooks/                 # Custom React hooks
├── supabase/
│   ├── migrations/            # Database migrations
│   ├── functions/             # Edge functions
│   ├── seed.sql              # Database seed data
│   └── config.toml           # Supabase configuration
├── public/
│   ├── images/               # Optimized images
│   └── icons/                # App icons
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── next.config.js            # Next.js configuration
└── README.md                 # This file

🗄️ Database Schema
Core Tables
users: User profiles and authentication data
test_sessions: Individual test session records
questions: Test questions with multi-language support
user_access: Access permissions and subscription tracking
payments: Payment transaction records
access_codes: Alternative access method codes
Key Relationships
users (1) -> (*) test_sessions
users (1) -> (*) user_access
users (1) -> (*) payments
questions (*) -> (*) test_sessions (through answers)

🔐 Authentication & Security
Authentication Flow
User Registration: Email/phone + password
Email Verification: Supabase email confirmation
Session Management: JWT tokens with refresh
Password Reset: Secure password recovery flow
Security Features
Row Level Security (RLS): All database tables protected
Input Validation: Zod schemas for all user inputs
Payment Security: PCI DSS compliant processing
Rate Limiting: API endpoint protection
CORS Configuration: Secure cross-origin requests
💰 Payment Integration
Flutterwave Integration
// Payment initiation
const initiatePayment = async (paymentData: PaymentData) => {
  const response = await FlutterwaveCheckout({
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: generateTransactionRef(),
    amount: paymentData.amount,
    currency: 'RWF',
    payment_options: 'mobilemoney,card,banktransfer',
    customer: {
      email: user.email,
      phone_number: paymentData.phone,
      name: user.full_name,
    },
    callback: handlePaymentCallback,
  });
};

Payment Webhook
Webhook endpoint at /api/webhooks/flutterwave handles:
Payment confirmations
Access provisioning
Failed payment handling
Subscription management
🧪 Testing Strategy
Test Types
Unit Tests: Component and utility function testing
Integration Tests: API endpoint and database operation testing
E2E Tests: Critical user flow testing
Mobile Testing: Cross-device compatibility testing
Running Tests
# Unit tests
bun test

# E2E tests
bun test:e2e

# Test coverage
bun test:coverage

🌐 Deployment
Production Deployment (Netlify)
Build Configuration
# Build command
bun run build

# Output directory
.next

Environment Variables Set all required environment variables in Netlify dashboard


Domain Configuration


Custom domain setup
SSL certificate provisioning
CDN configuration
Alternative Deployment Options
Vercel: Next.js optimized platform
Digital Ocean: App Platform deployment
AWS: EC2 or Lambda deployment
📊 Analytics & Monitoring
Key Metrics Tracked
User Engagement: Test completion rates, session duration
Payment Analytics: Conversion rates, payment method preferences
Performance: Page load times, error rates
Business: Revenue, subscription patterns
Monitoring Tools
Error Tracking: Sentry integration
Performance: Core Web Vitals monitoring
Analytics: Custom dashboard for business metrics
Uptime: Service availability monitoring
🌍 Internationalization
Supported Languages
Kinyarwanda (Primary): Native Rwanda language
English: International accessibility
French: Regional language support
Translation Management
// Example usage
import { useTranslation } from 'next-intl';

const { t } = useTranslation('common');
const welcomeMessage = t('welcome'); // "Murakaza neza"

🤝 Contributing
Development Workflow
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open a Pull Request
Code Standards
TypeScript: Strict mode enabled
ESLint: Airbnb configuration
Prettier: Automatic code formatting
Husky: Pre-commit hooks for quality checks
Testing Requirements
Unit tests for new components
Integration tests for API changes
E2E tests for new user flows
Mobile testing on actual devices
📞 Support & Contact
Customer Support
Phone: +250787179869
Email: support@mwalimucement.rw
Hours: Monday - Friday, 8:00 AM - 6:00 PM (CAT)
Technical Support
Issues: GitHub Issues for bug reports
Documentation: Visit our docs site
Community: Join our developer community
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments
Rwanda National Police: For traffic law guidance
Action College: Original platform inspiration
Flutterwave: Payment processing partnership
Supabase: Database and authentication services
#TeamGet: Development and maintenance team

Built with ❤️ for Rwanda's driving education 🇷🇼
Koresha MWALIMU Clement ubone amahirwe yo gutsinda ikizamini cya provisoire!

📈 Roadmap
Phase 1 (Current)
[x] Basic test functionality
[x] Payment integration
[x] Mobile optimization
[x] Multi-language support
Phase 2 (Next Quarter)
[ ] Advanced analytics dashboard
[ ] Certificate generation
[ ] Offline mode support
[ ] Mobile app development
Phase 3 (Future)
[ ] AI-powered personalized learning
[ ] Virtual reality driving scenarios
[ ] Integration with driving schools
[ ] Advanced reporting features

For the latest updates and announcements, follow our development blog and social media channels.