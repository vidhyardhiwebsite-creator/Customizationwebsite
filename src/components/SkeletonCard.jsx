export default function SkeletonCard() {
  return (
    <div className="card-lux overflow-hidden">
      <div className="skeleton rounded-t-[20px]" style={{ aspectRatio:"1" }}/>
      <div className="p-5 space-y-3">
        <div className="skeleton h-2.5 w-20 rounded"/>
        <div className="skeleton h-4 w-full rounded"/>
        <div className="skeleton h-3.5 w-3/4 rounded"/>
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-4.5 w-20 rounded"/>
          <div className="skeleton h-3 w-10 rounded"/>
        </div>
      </div>
      <div className="px-5 pb-5"><div className="skeleton h-10 w-full rounded-full"/></div>
    </div>
  )
}
