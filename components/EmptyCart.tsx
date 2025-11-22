import Image from "next/image";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-gray-400 mb-6">
        <FaShoppingCart size={64} />
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Your cart is empty
      </h2>

      <p className="text-gray-600 mb-8 text-center max-w-md">
        Looks like you haven't added any products to your cart yet.
        Start shopping to add some amazing products!
      </p>

      <Link
        href="/"
        className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
      >
        Continue Shopping
      </Link>

      <div className="mt-8 text-sm text-gray-500">
        <p>Need help? Contact our support team</p>
        <p className="mt-1">
          <a href="mailto:support@interiowale.com" className="text-primary hover:text-primary/80">
            support@interiowale.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default EmptyCart;