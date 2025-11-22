import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";

interface Props {
  price: number | undefined;
  discount: number | undefined;
  className?: string;
  label?: string;
}
const PriceView = ({ price, discount, label, className }: Props) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col gap-1">
        {price && discount ? (
          <>
            <PriceFormatter
              amount={price + (discount * price) / 100}
              className={twMerge("line-through text-xs font-medium text-gray-500", className)}
            />
            <PriceFormatter amount={price} className={twMerge("text-sm font-semibold", className)} />
          </>
        ) : (
          <PriceFormatter amount={price} className={className} />
        )}
      </div>
      {label && (
        <p className="text-gray-50 text-[8px] bg-emerald-400 px-1 py-0.5 rounded-md truncate">{label}</p>
      )}
    </div>
  );
};

export default PriceView;
