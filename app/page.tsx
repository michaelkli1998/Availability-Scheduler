'use client';

import Link from 'next/link';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">meet2when</span>
            </div>
            <Link
              href="/events"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Events
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find the perfect time
              <br />
              <span className="text-indigo-600">everyone can meet</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Say goodbye to endless email chains. Create a scheduling poll, share it with your group, and instantly see when everyone is available.
            </p>
            <Link href="/create">
              <Button size="lg" className="text-lg px-8 py-4">
                Create Event
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <FadeIn delay={0.2}>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create an event</h3>
              <p className="text-gray-600">
                Set up your event with a date range and time slots that work for you
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Share the link</h3>
              <p className="text-gray-600">
                Send the shareable link to all participants via email, chat, or any platform
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Find the best time</h3>
              <p className="text-gray-600">
                View the heatmap to instantly see which times work best for everyone
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <FadeIn delay={0.4}>
          <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Everything you need
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Real-time updates</h4>
                  <p className="text-gray-600 text-sm">
                    See responses as they come in with live synchronization
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Visual heatmap</h4>
                  <p className="text-gray-600 text-sm">
                    Color-coded grid shows the best times at a glance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Mobile friendly</h4>
                  <p className="text-gray-600 text-sm">
                    Works perfectly on any device, desktop or mobile
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">No sign-up required</h4>
                  <p className="text-gray-600 text-sm">
                    Create events and respond instantly without creating an account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <FadeIn delay={0.6}>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-8">
              Create your first scheduling poll in seconds
            </p>
            <Link href="/create">
              <Button size="lg" className="px-8 py-4">
                Create Event
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
