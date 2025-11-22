/**
 * Check stores that might have been created from applications
 * Run with: node -r dotenv/config scripts/check-stores-from-applications.js
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

async function checkStores() {
  try {
    console.log('🔍 Checking stores that might have been from applications...\n');

    // Get all stores
    const stores = await client.fetch(`
      *[_type == "store"] | order(_createdAt desc) {
        _id,
        name,
        slug,
        owner,
        settings,
        _createdAt,
        _updatedAt
      }
    `);

    console.log(`📊 Total stores: ${stores.length}\n`);

    if (stores.length === 0) {
      console.log('❌ No stores found in the database.');
      console.log('💡 This means no applications have been approved yet.\n');
      return;
    }

    console.log('📋 Stores found:\n');
    stores.forEach((store, idx) => {
      const status = store.settings?.isActive && store.settings?.isApproved
        ? '🟢 Active'
        : store.settings?.isApproved && !store.settings?.isActive
        ? '🟡 Pending Activation'
        : '⚪ Inactive';

      console.log(`${idx + 1}. ${store.name}`);
      console.log(`   Status: ${status}`);
      console.log(`   Owner: ${store.owner?.name || 'Unknown'} (${store.owner?.email || 'No email'})`);
      console.log(`   Created: ${new Date(store._createdAt).toLocaleDateString()}`);
      console.log(`   Slug: ${store.slug?.current || 'N/A'}\n`);
    });

    // Status breakdown
    const statusBreakdown = stores.reduce((acc, store) => {
      if (store.settings?.isActive && store.settings?.isApproved) {
        acc.active++;
      } else if (store.settings?.isApproved && !store.settings?.isActive) {
        acc.pendingActivation++;
      } else {
        acc.inactive++;
      }
      return acc;
    }, { active: 0, pendingActivation: 0, inactive: 0 });

    console.log('📊 Status Breakdown:');
    console.log(`   🟢 Active: ${statusBreakdown.active}`);
    console.log(`   🟡 Pending Activation: ${statusBreakdown.pendingActivation}`);
    console.log(`   ⚪ Inactive: ${statusBreakdown.inactive}\n`);

    if (statusBreakdown.pendingActivation > 0) {
      console.log('💡 You have stores waiting for activation!');
      console.log('   Visit: http://localhost:3000/admin/stores');
      console.log('   Click "Activate" to make them live.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStores();
