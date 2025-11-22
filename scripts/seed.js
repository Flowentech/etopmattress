// Simple JavaScript runner for seeding sample data
const { execSync } = require('child_process');

console.log('🚀 Starting sample data seeding...');

try {
  // Run the TypeScript seeding script
  console.log('📝 Running seeding script...');
  execSync('npx ts-node scripts/seed-sample-data.ts', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Upload your images to Sanity CMS');
  console.log('2. Replace the placeholder image references in the seeded data');
  console.log('3. Review and publish the created documents in Sanity Studio');

} catch (error) {
  console.error('❌ Error during seeding:', error.message);
  process.exit(1);
}