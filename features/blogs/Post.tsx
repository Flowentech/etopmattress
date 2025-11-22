// "use client";


// import { useQuery } from "@tanstack/react-query";
// import Image from "next/image";
// import { notFound } from "next/navigation";

// type Props = {
//   slug: string;
// };

// export default function Post({ slug }: Props) {
//   const { data } = useQuery({
//     queryKey: ["post", slug],
//     queryFn: () => getPostBySlug(slug),
//   });

//   if (!data) return notFound();

//   return (
//     <div className="px-5 pb-5">
//        <div>
//        <h1 className="text-3xl lg:text-5xl text-center leading-relaxed font-bold mt-5">
//         {data?.title}
//       </h1>
//       <p className="my-5 text-center text-xl text-gray-400">{data?.subtitle}</p>
//        </div>
//       <div className="w-full items-center  flex justify-center pt-5 bg-yellow-100">
//         {" "}
//         <Image
//           src={data?.coverImage.url}
//           alt="coverimage"
//           className="w-full lg:h-[65vh] pb-5 rounded-lg object-center"
//           width={800}
//           height={500}
//         />
//       </div>
//       <div className="my-5 flex items-center justify-center text-lg ">
        
//           <Image
//             src={logo2}
//             alt={"flowentech"}
//             className="rounded-full h-10 w-10 mr-5"
//             width={200}
//             height={200}
//           />
        
//         {"flowentech"}
//       </div>
//       <div
//         className="blog-content text-xl leading-loose flex flex-col gap-5 mt-5 lg:px-16 "
//         dangerouslySetInnerHTML={{ __html: data!.content.html }}
//       ></div>
//     </div>
//   );
// }
