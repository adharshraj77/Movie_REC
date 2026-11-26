export default function ShimmerGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="shimmer-card w-full aspect-[2/3] rounded-xl" />
      ))}
    </div>
  );
}
