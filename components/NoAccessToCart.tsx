import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FaLock, FaShoppingCart } from "react-icons/fa";
import Link from "next/link";

const NoAccessToCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-orange-500 mb-6">
        <FaLock size={64} />
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Sign In Required
      </h2>

      <p className="text-gray-600 mb-8 text-center max-w-md">
        Please sign in to access your shopping cart and checkout.
        It only takes a moment to create an account or log in.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SignInButton mode="modal">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-medium">
            Sign In
          </Button>
        </SignInButton>

        <Link
          href="/sign-up"
          className="text-emerald-600 hover:text-emerald-700 font-medium px-6 py-3"
        >
          Create Account
        </Link>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-md text-center">
        <div className="flex items-center justify-center mb-2">
          <FaShoppingCart className="text-gray-600 mr-2" />
          <span className="font-medium text-gray-800">Why sign in?</span>
        </div>
        <ul className="text-sm text-gray-600 text-left space-y-1">
          <li>• Save your cart for later</li>
          <li>• Track your orders</li>
          <li>• Faster checkout process</li>
          <li>• Exclusive member deals</li>
        </ul>
      </div>

      <Link
        href="/"
        className="mt-6 text-gray-500 hover:text-gray-700 text-sm underline"
      >
        Continue browsing without signing in
      </Link>
    </div>
  );
};

export default NoAccessToCart;