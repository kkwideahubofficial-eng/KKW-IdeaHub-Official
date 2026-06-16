const partners = [
  { name: "Savitribai Phule Pune University", acronym: "SPPU" },
  { name: "All India Council for Technical Education", acronym: "AICTE" },
  { name: "Texas Instruments", acronym: "TI" },
  { name: "Emerson Electric Co.", acronym: "Emerson" },
  { name: "MoE's Innovation Cell", acronym: "Innovation Cell" }
];

const PartnerEcosystem = () => {
  return (
    <section className="py-16 bg-white border-b border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Subtitle */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Industry & Academic Partners
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto items-center justify-items-center">
          {partners.map((partner, idx) => (
            <div 
              key={idx}
              className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-3xs w-full text-center group hover:bg-slate-100 hover:border-primary/20 transition-all duration-300 select-none"
            >
              <span className="font-extrabold text-base text-slate-700 tracking-tight group-hover:text-primary transition-colors block">
                {partner.acronym}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1 line-clamp-1">
                {partner.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PartnerEcosystem;
