import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Award, Users } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-16 pb-20">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Homeschool Transcript</span>
              <span className="block text-blue-600">Management System</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Easily manage, track, and generate professional transcripts for homeschool students.
              Keep all your academic records organized in one secure place.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/signin"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="py-12 bg-white">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex justify-center">
                <GraduationCap className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Academic Tracking</h3>
              <p className="mt-2 text-base text-gray-500">
                Record and monitor academic progress with ease
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Course Management</h3>
              <p className="mt-2 text-base text-gray-500">
                Organize courses, grades, and credit hours
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Test Scores</h3>
              <p className="mt-2 text-base text-gray-500">
                Track SAT, ACT, and other standardized test scores
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Multi-User Access</h3>
              <p className="mt-2 text-base text-gray-500">
                Separate guardian and student access levels
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}