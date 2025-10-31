import React from 'react';
import { Link } from 'react-router-dom';
import { Code, GraduationCap, Music, Palette, Users, Calendar, Trophy, Shield, Star } from 'lucide-react';
import LandingNavbar from '../../navbar/landingNavbar';

export default function CollabLearnLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-purple-100 rounded-full text-sky-600 text-sm font-medium">
            <span className="text-purple-600">⚡</span>
            Join 10,000+ active learners
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Learn Skills,{' '}
             <span className="bg-gradient-to-r from-sky-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Teach Others
            </span>
            ,<br />
            Grow Together
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The peer-to-peer learning platform where everyone is both a student
            and a teacher. Share your expertise, learn new skills, and build
            meaningful connections.
          </p>

          {/* Email Signup */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto mb-8">
              <input
              type="email"
              placeholder="Enter your email to get started"
              className="w-full px-6 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition whitespace-nowrap">
              Join Free
            </Link>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-red-500">❤️</span>
              Free to join
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-500">🛡️</span>
              Verified profiles
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              4.9/5 rating
            </div>
          </div>

          {/* Decorative Icons */}
            <div className="absolute left-8 top-32 bg-purple-100 p-4 rounded-2xl hidden lg:block">
              <Code className="w-8 h-8 text-sky-600" />
          </div>
          <div className="absolute right-8 top-48 bg-cyan-100 p-4 rounded-2xl hidden lg:block">
            <Music className="w-8 h-8 text-cyan-600" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Explore Popular Categories
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Discover skills in every area you're passionate about
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Programming */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition border border-gray-100">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Code className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Programming</h3>
              <p className="text-gray-600">2.5k+ skills</p>
            </div>

            {/* Academics */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition border border-gray-100">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Academics</h3>
              <p className="text-gray-600">1.8k+ skills</p>
            </div>

            {/* Music */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition border border-gray-100">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Music className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Music</h3>
              <p className="text-gray-600">950+ skills</p>
            </div>

            {/* Arts & Design */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition border border-gray-100">
              <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Palette className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Arts & Design</h3>
              <p className="text-gray-600">1.2k+ skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Why Choose CollabLearn?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            We've built the perfect platform for peer-to-peer learning with features that
            make teaching and learning enjoyable and effective.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Learn from Peers */}
            <div className="text-center">
                <div className="bg-sky-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Learn from Peers</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with passionate learners and expert teachers in your area of interest.
              </p>
            </div>

            {/* Flexible Scheduling */}
            <div className="text-center">
                <div className="bg-sky-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Flexible Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Book sessions that fit your schedule with our intelligent calendar system.
              </p>
            </div>

            {/* Earn Rewards */}
            <div className="text-center">
                <div className="bg-sky-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Earn Rewards</h3>
              <p className="text-gray-600 leading-relaxed">
                Gain badges and build your reputation as you teach and learn new skills.
              </p>
            </div>

            {/* Safe & Secure */}
            <div className="text-center">
                <div className="bg-sky-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Safe & Secure</h3>
              <p className="text-gray-600 leading-relaxed">
                All sessions are verified with ratings and reviews from our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Loved by Our Community
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Real stories from real people who've transformed their skills
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "I learned React from an amazing mentor here. Now I'm teaching JavaScript to others!"
              </p>
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg">Sarah Chen</h4>
                <p className="text-gray-600 mb-3">Web Developer</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full">JavaScript</span>
                  <span className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full">React</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "Found the perfect piano teacher who fit my schedule. The booking system is so smooth!"
              </p>
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg">Marcus Johnson</h4>
                <p className="text-gray-600 mb-3">Music Producer</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full">Piano</span>
                  <span className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full">Music Theory</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "Teaching Python here has been incredibly rewarding. The community is so supportive!"
              </p>
              <div className="border-t pt-6">
                <h4 className="font-bold text-lg">Elena Rodriguez</h4>
                <p className="text-gray-600 mb-3">Data Scientist</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full">Python</span>
                  <span className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-full">Data Science</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="px-6 py-24 bg-gradient-to-r from-purple-600 via-sky-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-white mb-10">
            Join thousands of learners and teachers who are already growing their
            skills together.
          </p>
          <Link to="/signup" className="px-10 py-4 bg-white text-sky-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition shadow-lg">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              {/* 🔽 Replace src with your custom logo image */}
              <img 
                src="/your-logo.png" 
                alt="CollabLearn Logo" 
                className="w-10 h-10 rounded-lg object-cover" 
              />
              <span className="text-2xl font-bold text-sky-600">CollabLearn</span>
            </div>
            <div className="flex gap-8 text-gray-600">
              <a href="#" className="hover:text-sky-600 transition">Privacy</a>
              <a href="#" className="hover:text-sky-600 transition">Terms</a>
              <a href="#" className="hover:text-sky-600 transition">Support</a>
            </div>
          </div>
          <div className="text-center text-gray-600">
            © 2024 CollabLearn. All rights reserved. Made with{' '}
            <span className="text-red-500">❤️</span> for the learning community.
          </div>
        </div>
      </footer>
    </div>
  );
}
