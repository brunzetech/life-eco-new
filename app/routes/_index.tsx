import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getAuthSession } from "~/lib/auth.server";
import { TrendingUp, Shield, Users, BarChart3, Zap, Target, Settings as Savings, LineChart, Award, Lock, HeadphonesIcon, CheckCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { ClientOnly } from "~/components/ClientOnly";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getAuthSession(request);
  
  if (session?.user) {
    return redirect("/dashboard");
  }

  return json({});
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ClientOnly>
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50">
            <nav className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#why-us" className="block text-gray-600 hover:text-gray-900 font-medium">Why Us</a>
              <a href="#approach" className="block text-gray-600 hover:text-gray-900 font-medium">Approach</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <a href="#contact" className="block text-gray-600 hover:text-gray-900 font-medium">Contact</a>
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Link
                  to="/login"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="block bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative z-50 bg-white border-b border-gray-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Life Economy</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#why-us" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Why Us</a>
              <a href="#approach" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Approach</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>

            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-100 rounded-full opacity-60 blur-xl animate-bounce-gentle"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-primary-200 rounded-full opacity-40 blur-lg animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-primary-300 rounded-full opacity-30 blur-md animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/4 left-8 w-16 h-16 bg-primary-400 rounded-2xl opacity-20 rotate-12 hidden lg:block"></div>
          <div className="absolute bottom-1/4 right-12 w-12 h-12 bg-primary-300 rounded-xl opacity-30 -rotate-12 hidden lg:block"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32 relative z-10">
          <div className="text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-8 hover:bg-primary-100 transition-colors">
              <Zap className="w-4 h-4 mr-2" />
              Welcome to Life Economy
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up">
              Put More Cash Back in Your{" "}
              <span className="text-primary-600 relative">
                Business Pocket.
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-primary-200 opacity-30 rounded-full"></div>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Streamline your virtual economy with our comprehensive platform. 
              Manage users, track transactions, and boost engagement with gamified rewards.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <a
                href="#features"
                className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                More Info
              </a>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                Get Started
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-gray-500 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center hover:text-primary-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-primary-500 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center hover:text-primary-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-primary-500 mr-2" />
                Cancel anytime
              </div>
              <div className="flex items-center hover:text-primary-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-primary-500 mr-2" />
                24/7 support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="features" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get the best value for your business with our comprehensive suite of tools designed to streamline operations and boost productivity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                AI-Optimized Savings — No Effort Required
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent algorithms automatically optimize your virtual economy, 
                identifying cost-saving opportunities and maximizing user engagement without any manual intervention.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Real-Time Insights — Smarter Spending
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant visibility into your virtual economy with comprehensive analytics, 
                real-time transaction monitoring, and predictive insights that help you make informed decisions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Precision Pricing — Tailored for You
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Dynamic pricing models that adapt to your specific needs and usage patterns, 
                ensuring you only pay for what you use while maximizing value for your investment.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">Automated Rewards</div>
              <div className="text-gray-600">Smart distribution</div>
            </div>
            <div className="group">
              <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">Automatic Adjustments</div>
              <div className="text-gray-600">Dynamic balancing</div>
            </div>
            <div className="group">
              <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">Real-Time Reports</div>
              <div className="text-gray-600">Instant insights</div>
            </div>
            <div className="group">
              <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">Secure Transactions</div>
              <div className="text-gray-600">Bank-level security</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Shine Section */}
      <section id="why-us" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why We Shine?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get the best value for your business with our comprehensive suite of tools designed to streamline operations and boost productivity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <Savings className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Smart Savings</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically optimize your virtual economy spending with AI-powered recommendations that identify cost-saving opportunities in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <LineChart className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Real-Time Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your virtual economy performance with comprehensive analytics, transaction tracking, and predictive insights for better decision-making.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Flexible Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Adaptive pricing models that scale with your needs, ensuring cost-effectiveness while providing maximum value for your virtual economy platform.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <Lock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Secure Transactions</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level security protocols protect all transactions and user data, with end-to-end encryption and comprehensive audit trails for compliance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Advanced Features</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive user management, group organization, marketplace functionality, and behavioral tracking tools for complete virtual economy control.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-300">
                <HeadphonesIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Dedicated Support</h3>
              <p className="text-gray-600 leading-relaxed">
                24/7 expert support team ready to help you maximize your virtual economy potential with personalized guidance and technical assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section id="approach" className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Approach
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            We believe in empowering businesses with intelligent virtual economy solutions. 
            Our platform combines cutting-edge technology with intuitive design to create 
            seamless experiences that drive engagement and maximize value. From automated 
            reward systems to comprehensive analytics, we provide the tools you need to 
            build thriving digital communities.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Life Economy</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 Life Economy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}