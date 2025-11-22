#!/usr/bin/env node

/**
 * Verify Clerk Configuration
 * Run this script to check if your Clerk keys are properly configured
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const env = {};

  lines.forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

function verifyClerkKeys() {
  console.log('🔍 Verifying Clerk Configuration...\n');

  const env = loadEnv();

  const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = env.CLERK_SECRET_KEY;

  let hasErrors = false;

  // Check publishable key
  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
    hasErrors = true;
  } else if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY has invalid format');
    console.error(`   Expected: pk_test_* or pk_live_*`);
    console.error(`   Got: ${publishableKey.substring(0, 20)}...`);
    hasErrors = true;
  } else {
    console.log('✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is valid');
    console.log(`   Type: ${publishableKey.startsWith('pk_test_') ? 'Test' : 'Production'}`);
  }

  // Check secret key
  if (!secretKey) {
    console.error('❌ CLERK_SECRET_KEY is missing');
    hasErrors = true;
  } else if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    console.error('❌ CLERK_SECRET_KEY has invalid format');
    console.error(`   Expected: sk_test_* or sk_live_*`);
    console.error(`   Got: ${secretKey.substring(0, 20)}...`);
    hasErrors = true;
  } else {
    console.log('✅ CLERK_SECRET_KEY is valid');
    console.log(`   Type: ${secretKey.startsWith('sk_test_') ? 'Test' : 'Production'}`);
  }

  // Check if both are same environment
  const pubIsTest = publishableKey && publishableKey.startsWith('pk_test_');
  const secretIsTest = secretKey && secretKey.startsWith('sk_test_');

  if (publishableKey && secretKey && pubIsTest !== secretIsTest) {
    console.warn('\n⚠️  WARNING: Mismatched environment keys!');
    console.warn(`   Publishable key is ${pubIsTest ? 'test' : 'live'}`);
    console.warn(`   Secret key is ${secretIsTest ? 'test' : 'live'}`);
    hasErrors = true;
  }

  console.log('\n' + '='.repeat(50));

  if (hasErrors) {
    console.log('\n❌ Clerk configuration has errors!');
    console.log('\n📝 To fix:');
    console.log('1. Go to https://dashboard.clerk.com');
    console.log('2. Select your application');
    console.log('3. Go to "API Keys"');
    console.log('4. Copy the Publishable Key and Secret Key');
    console.log('5. Update your .env.local file');
    console.log('\nMake sure both keys are from the same environment (test or live)');
    process.exit(1);
  } else {
    console.log('\n✅ All Clerk configuration checks passed!');
    console.log('\nIf you\'re still experiencing issues:');
    console.log('1. Restart your development server');
    console.log('2. Clear your browser cache and cookies');
    console.log('3. Check Clerk dashboard for API status');
    console.log('4. Verify your domain is configured in Clerk settings');
  }
}

verifyClerkKeys();
