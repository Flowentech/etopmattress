"use client";

import useCartStore from "@/store";

interface QuantityButtonsProps {
  productId: string;
  className?: string;
}

const QuantityButtons = ({ productId, className = "" }: QuantityButtonsProps) => {
  const { removeItem, addItem, getItemCount } = useCartStore();
  const quantity = getItemCount(productId);

  const handleDecrease = () => {
    if (quantity > 1) {
      removeItem(productId);
    }
  };

  const handleIncrease = () => {
    addItem({ _id: productId } as any);
  };

  return (
    <div className={`flex items-center border border-gray-300 rounded-md ${className}`}>
      <button
        onClick={handleDecrease}
        disabled={quantity <= 1}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        -
      </button>
      <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        className="px-3 py-2 hover:bg-gray-100 transition-colors"
      >
        +
      </button>
    </div>
  );
};

export default QuantityButtons;