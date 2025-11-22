// "use client";

// import { getPosts } from "@/lib/requests";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import BlogCard from "../common/BlogCard";
// import { Button } from "../ui/button";



// export default function Blog() {
  
  
//   const { data, hasNextPage, fetchNextPage, isFetching } = useInfiniteQuery({
//     queryKey: ["posts"],
//     queryFn: getPosts,
//     getNextPageParam: (lastPage) => {
//       if (!lastPage || lastPage.length === 0) {
//         return undefined;
//       }
//       return lastPage.length < 9 ? undefined : lastPage[lastPage.length - 1].cursor;
//     },
//     initialPageParam: "", // Ensure this is empty for the first request
//   });
      

//   return (
//     <>
//       {data?.pages.map((group) =>
//         group?.map((post) => <BlogCard key={post.cursor} post={post.node} />)
//       )}
//       <div className="col-span-1 lg:col-span-3 w-full flex justify-center my-5">
//         <Button
//           className="w-full"
//           variant="outline"
//           disabled={!hasNextPage || isFetching}
//           onClick={() => fetchNextPage()}
//         >
//           {isFetching
//             ? "Loading..."
//             : hasNextPage
//             ? "Load more"
//             : "That's all for today!"}
//         </Button>
//       </div>
//     </>
//   );
// }