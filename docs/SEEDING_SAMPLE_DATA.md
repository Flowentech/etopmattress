# Sample Data Seeding Guide

This guide will help you populate your InterioWale application with sample data for the Gallery, Interior Solutions, and Tips sections.

## 📦 What's Included

### Gallery (6 Items)
- Modern Living Room Transformation
- Luxury Kitchen Makeover
- Cozy Bedroom Retreat
- Productive Home Office
- Serene Outdoor Oasis
- Industrial Loft Design

### Interior Solutions

#### Landscaping Projects (3 Projects)
- Corporate Office Green Space ($15,000+)
- Rooftop Garden Retreat ($25,000+)
- Retail Store Interior Plants ($5,000+)

#### Rental Packages (4 Packages)
- Starter Office Package ($299/month) - Most Popular
- Premium Office Suite ($899/month)
- Executive Desk Collection ($199/month)
- Event Rental Package ($499/event)

### Tips/Blog Posts (4 Articles)
- 10 Low-Maintenance Plants Perfect for Busy Professionals
- The Science Behind Plants and Productivity
- Creating a Plant Care Schedule That Works
- Choosing the Right Plants for Your Office Lighting

### Supporting Data
- Authors (2 authors: Jane Doe, John Smith)
- Blog Categories (5 categories: Care Tips, Office Plants, Research, Workplace, Beginner)

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Sanity project configured
- Environment variables set up

### Run the Seeding

1. **Install dependencies** (already done if you followed the setup):
   ```bash
   npm install --save-dev ts-node uuid --legacy-peer-deps
   ```

2. **Run the seeding script**:
   ```bash
   npm run seed
   ```

   Or directly with TypeScript:
   ```bash
   npm run seed:sample
   ```

## 📝 What Happens During Seeding

The script will:
1. ✅ Create author profiles
2. ✅ Create blog categories
3. ✅ Create 6 gallery items with different categories
4. ✅ Create 3 landscaping projects with detailed descriptions
5. ✅ Create 4 rental packages with pricing
6. ✅ Create 4 blog posts with rich content
7. ✅ Log all created items to console

## 🖼️ Image Setup (Important!)

After running the seeding script, you'll need to:

1. **Upload Images to Sanity**
   - Go to your Sanity Studio
   - Upload images for each category (gallery, projects, packages, blogs)
   - Note the asset IDs

2. **Update Image References**
   - The seeded data uses placeholder references like `image-placeholder-1`
   - Replace these with actual Sanity image asset IDs
   - You can do this in Sanity Studio or by updating the script

3. **Publish Documents**
   - Go to Sanity Studio
   - Review all created documents
   - Click "Publish" for each item

## 📁 File Structure

```
scripts/
├── seed-sample-data.ts    # Main seeding script with all sample data
└── seed.js               # Simple JavaScript runner

docs/
└── SEEDING_SAMPLE_DATA.md # This documentation

sanity/helpers/index.ts   # Updated with gallery and blog queries
```

## 🛠️ Customizing the Sample Data

### Adding More Gallery Items
Edit `scripts/seed-sample-data.ts` and add to the `galleryItems` array:

```typescript
{
  _type: 'gallery',
  _id: uuidv4(),
  title: 'Your New Gallery Item',
  slug: { _type: 'slug', current: 'your-new-gallery-item' },
  description: 'Description of your gallery item',
  image: { _type: 'image', asset: { _type: 'reference', _ref: 'your-image-id' } },
  category: 'living-room', // or kitchen, bedroom, office, outdoor
  tags: ['tag1', 'tag2'],
  featured: true,
  createdAt: new Date().toISOString(),
}
```

### Adding New Blog Posts
Add to the `blogPosts` array:

```typescript
{
  _type: 'blog',
  _id: uuidv4(),
  title: 'Your Blog Post Title',
  slug: { _type: 'slug', current: 'your-blog-post-slug' },
  excerpt: 'Brief description of your blog post',
  content: '<h2>Your Content</h2><p>Your blog content in HTML format</p>',
  coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'your-cover-image' } },
  publishedAt: new Date().toISOString(),
  author: { _type: 'reference', _ref: 'author-jane-doe' },
  categories: [{ _type: 'reference', _ref: 'category-care-tips' }],
  isFeatured: false,
}
```

### Adding New Rental Packages
Add to the `rentalPackages` array:

```typescript
{
  _type: 'rentalPackage',
  _id: uuidv4(),
  title: 'Your Package Name',
  slug: { _type: 'slug', current: 'your-package-slug' },
  description: 'Package description',
  price: '$XXX/month',
  duration: 'X-month minimum',
  features: ['Feature 1', 'Feature 2'],
  packageType: 'basic', // or premium, executive, event
  isPopular: false,
  isActive: true,
  createdAt: new Date().toISOString(),
}
```

## 🔄 Running the Script Multiple Times

The script uses `createIfNotExists`, so running it multiple times won't create duplicates. If you want to:

- **Reset all data**: Delete documents in Sanity Studio and re-run
- **Update existing data**: Modify the script and run again
- **Add new items**: Add to the arrays and run again

## 🐛 Troubleshooting

### Common Issues

1. **"Sanity client not configured"**
   - Make sure your environment variables are set
   - Check that Sanity is properly configured

2. **"Image asset not found"**
   - Upload images to Sanity Studio first
   - Replace placeholder asset IDs

3. **"Permission denied"**
   - Check your Sanity write permissions
   - Ensure your API tokens have write access

4. **"TypeScript errors"**
   - Make sure all dependencies are installed
   - Run with `--legacy-peer-deps` if needed

### Debug Mode

For debugging, you can modify the script to add more logging:

```typescript
console.log('Creating item:', item.title);
const result = await client.createIfNotExists(item);
console.log('Created with ID:', result._id);
```

## 📊 Expected Results

After successful seeding, you should have:

| Section | Item Count | Pages Affected |
|---------|-----------|---------------|
| Gallery | 6 items | `/gallery`, category pages |
| Interior Solutions | 7 total | `/interior-solution`, subpages |
| Tips/Blog | 4 posts | `/tips`, individual post pages |
| Authors | 2 | Blog post bylines |
| Categories | 5 | Blog filtering |

## 🎯 Next Steps

1. **Upload real images** to replace placeholders
2. **Customize content** to match your brand
3. **Review and publish** all documents in Sanity Studio
4. **Test the pages** to ensure everything displays correctly
5. **Add more content** as needed

## 📞 Support

If you encounter issues:
1. Check your Sanity configuration
2. Verify environment variables
3. Review Sanity Studio permissions
4. Check browser console for errors

---

**Happy seeding! 🌱**