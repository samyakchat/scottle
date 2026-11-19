const cats = ['😹', '😸']

export function CatWaterfall() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden 
     backdrop-blur-[3px] 
    animate-curtain motion-reduce:flex 
    motion-reduce:flex-wrap motion-reduce:content-center 
    motion-reduce:justify-center motion-reduce:gap-3 motion-reduce:animate-none" 
    aria-hidden="true">
      {Array.from({ length: 48 }, (_, index) => (
        <span key={index} className="absolute -top-[60px] text-[clamp(30px,7vw,64px)] drop-shadow-[0_2px_5px_#1778a755] animate-cat-fall motion-reduce:static motion-reduce:top-auto motion-reduce:animate-none" style={{ left: `${(index * 47) % 100}%`, animationDelay: `${(index % 12) * -0.19}s` }}>
          {cats[index % cats.length]}
        </span>
      ))}
    </div>
  )
}
