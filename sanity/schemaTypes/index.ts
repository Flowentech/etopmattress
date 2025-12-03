import { type SchemaTypeDefinition } from 'sanity'
import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { productType } from './productType'
import { salesType } from './saleType'
import { orderType } from './orderType'
import { blogType } from './blogType'
import { authorType } from './authorType'
import { contactType } from './contactType'
import { galleryType } from './galleryType'
import { navigationCategory } from './navigationCategoryType'
import { reviewType } from './reviewType'
import { wishlistType } from './wishlistType'
import { emailSubscriberType } from './emailSubscriberType'
import blogCategoryType from './blogCategoryType'
import userProfile from './userProfile'
import { sizeType } from './sizeType'
import { heightType } from './heightType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    navigationCategory,
    productType,
    sizeType,
    heightType,
    salesType,
    orderType,
    reviewType,
    wishlistType,
    emailSubscriberType,
    blogType,
    authorType,
    contactType,
    galleryType,
    blogCategoryType,
    userProfile,
  ],
}
