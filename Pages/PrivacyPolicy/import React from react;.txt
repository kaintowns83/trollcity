import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Users, AlertTriangle, Mail, Calendar } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 text-lg">TrollCity Live Streaming Platform</p>
          <Badge className="bg-red-500 text-white mt-4 px-4 py-2 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            18+ ONLY - Adults Only Application
          </Badge>
          <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Age Restriction Notice */}
        <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500 p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">🔞 Age Restriction</h2>
              <p className="text-gray-300 mb-2">
                TrollCity is an <strong>18+ ONLY</strong> platform. You must be at least 18 years old to use this application. By accessing or using TrollCity, you confirm that you are 18 years of age or older.
              </p>
              <p className="text-red-300 text-sm">
                ⚠️ This application may contain mature content, live streaming, and social interactions. Parental discretion is strongly advised.
              </p>
            </div>
          </div>
        </Card>

        {/* Introduction */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-400" />
            Introduction
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              Welcome to TrollCity ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our live streaming mobile application and services.
            </p>
            <p>
              Please read this Privacy Policy carefully. By using TrollCity, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </div>
        </Card>

        {/* Information We Collect */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Information We Collect
          </h2>
          <div className="text-gray-300 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Personal Information</h3>
              <p className="mb-2">When you register and use TrollCity, we may collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Full name and username</li>
                <li>Email address</li>
                <li>Profile picture/avatar</li>
                <li>Age verification information (to confirm 18+ status)</li>
                <li>Government-issued ID (for broadcaster verification only)</li>
                <li>Payment information (for purchases and payouts)</li>
                <li>Biographical information (bio, location)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Content Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Live stream videos and broadcasts</li>
                <li>Chat messages and interactions</li>
                <li>Comments, likes, and reactions</li>
                <li>Gifts, tips, and virtual currency transactions</li>
                <li>Profile customizations and settings</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Device information (model, operating system, unique identifiers)</li>
                <li>IP address and location data</li>
                <li>App usage statistics and analytics</li>
                <li>Stream viewing history and preferences</li>
                <li>Login and session information</li>
                <li>Camera and microphone access (for streaming)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. Camera and Microphone Access</h3>
              <p>
                TrollCity requires camera and microphone permissions to enable live streaming functionality. This access is only used when you actively start a live stream and is not accessed at any other time. We do not record or store your camera/microphone data without your explicit action to start streaming.
              </p>
            </div>
          </div>
        </Card>

        {/* How We Use Your Information */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-green-400" />
            How We Use Your Information
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Management:</strong> Create and manage your user account</li>
              <li><strong>Service Delivery:</strong> Provide live streaming, chat, and social features</li>
              <li><strong>Age Verification:</strong> Ensure all users are 18 years or older</li>
              <li><strong>Payment Processing:</strong> Handle purchases, tips, gifts, and broadcaster payouts</li>
              <li><strong>Broadcaster Verification:</strong> Verify identity for users requesting payouts (AI-powered ID verification)</li>
              <li><strong>Security:</strong> Detect fraud, abuse, and ensure platform safety</li>
              <li><strong>Moderation:</strong> Monitor content to enforce community guidelines</li>
              <li><strong>Communication:</strong> Send notifications, updates, and support messages</li>
              <li><strong>Analytics:</strong> Improve app performance and user experience</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
            </ul>
          </div>
        </Card>

        {/* Third-Party Services */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
          <div className="text-gray-300 space-y-4">
            <p>TrollCity integrates with the following third-party services:</p>
            
            <div className="space-y-3">
              <div className="bg-[#0a0a0f] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🎥 Amazon IVS (Interactive Video Service)</h3>
                <p className="text-sm">Used for live video streaming infrastructure</p>
              </div>

              <div className="bg-[#0a0a0f] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">💳 Square & Stripe</h3>
                <p className="text-sm">Payment processing for purchases and payouts</p>
              </div>

              <div className="bg-[#0a0a0f] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🤖 AI Verification Services</h3>
                <p className="text-sm">ID verification for broadcaster applications (Base44 AI)</p>
              </div>

              <div className="bg-[#0a0a0f] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">☁️ Cloud Storage</h3>
                <p className="text-sm">Secure storage for profile pictures and uploaded content</p>
              </div>

              <div className="bg-[#0a0a0f] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">📧 Email Services</h3>
                <p className="text-sm">Transactional emails and notifications</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-4">
              These third-party services have their own privacy policies. We encourage you to review their policies before using our services.
            </p>
          </div>
        </Card>

        {/* Data Security */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Data Security
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure password storage with encryption</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure payment processing (PCI compliance)</li>
              <li>AI-powered ID verification with secure deletion after processing</li>
            </ul>
            <p className="text-yellow-300 text-sm mt-4">
              ⚠️ However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </div>
        </Card>

        {/* Data Retention */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
          <div className="text-gray-300 space-y-4">
            <p>We retain your personal information for as long as necessary to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Prevent fraud and abuse</li>
            </ul>
            <p className="mt-4">
              You may request deletion of your account and personal data at any time by contacting us. Some information may be retained for legal and security purposes.
            </p>
          </div>
        </Card>

        {/* Your Rights */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Privacy Rights</h2>
          <div className="text-gray-300 space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Withdraw Consent:</strong> Revoke permissions at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at the email address provided below.
            </p>
          </div>
        </Card>

        {/* Children's Privacy */}
        <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500 p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Children's Privacy (COPPA Compliance)
          </h2>
          <div className="text-gray-300 space-y-4">
            <p className="text-red-300 font-semibold">
              TrollCity is NOT intended for users under 18 years of age.
            </p>
            <p>
              We do not knowingly collect personal information from anyone under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will delete such information from our servers.
            </p>
            <p>
              All users must verify they are 18+ before accessing the platform. We employ age verification mechanisms and may request proof of age.
            </p>
          </div>
        </Card>

        {/* International Users */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">International Users</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              TrollCity is operated from the United States. If you are accessing our services from outside the U.S., please be aware that your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate.
            </p>
            <p>
              By using TrollCity, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection laws.
            </p>
          </div>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>In-app notification</li>
            </ul>
            <p className="mt-4">
              You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted.
            </p>
          </div>
        </Card>

        {/* Contact Us */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6 text-purple-400" />
            Contact Us
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              If you have any questions about this Privacy Policy, or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="bg-[#0a0a0f] rounded-lg p-6 space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email:</p>
                <p className="text-white font-semibold">privacy@trollcity.app</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Mail:</p>
                <p className="text-white">TrollCity Privacy Team</p>
                <p className="text-white">[Your Company Address]</p>
                <p className="text-white">[City, State, ZIP]</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Response Time:</p>
                <p className="text-white">We will respond to your inquiry within 30 days</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Google Play Compliance */}
        <Card className="bg-[#1a1a24] border-[#2a2a3a] p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-3">Google Play Store Compliance</h3>
          <p className="text-gray-400 text-sm">
            This Privacy Policy complies with Google Play Store requirements for apps rated 18+ (Mature). TrollCity contains mature content and is not suitable for minors. Age verification is enforced upon app launch.
          </p>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-6 border-t border-[#2a2a3a]">
          <p>© {new Date().getFullYear()} TrollCity. All Rights Reserved.</p>
          <p className="mt-2">By using TrollCity, you agree to this Privacy Policy and our Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}