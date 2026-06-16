import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 500, label: "Active Projects", suffix: "+" },
  { value: 1500, label: "Students Trained", suffix: "+" },
  { value: 100, label: "Events Conducted", suffix: "+" },
  { value: 150, label: "Achievements Recorded", suffix: "+" }
];

const Counter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (hasAnimated) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Subtle ease-out
        const easeOutQuart = 1 - Math.pow(1 - percentage, 4);

        setCount(Math.floor(easeOutQuart * value));

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [hasAnimated, value, duration]);

  return <span ref={ref}>{count}</span>;
};

const HomeStats = () => {
  return (
    <section className="relative bg-slate-900 py-20 text-white overflow-hidden">
      {/* Decorative subtle glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-500/10 blur-[80px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {stats.map((stat, index) => (
            <div key={index} className="px-4 py-6 lg:py-0">
              <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tight text-white drop-shadow-md">
                <Counter value={stat.value} />
                <span className="text-blue-500">{stat.suffix}</span>
              </div>
              <div className="text-slate-400 font-semibold text-xs sm:text-sm uppercase tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStats;
