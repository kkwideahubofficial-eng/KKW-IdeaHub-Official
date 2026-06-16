const TrustBar = () => {
  const trusts = [
    { label: "AICTE IDEA Lab", desc: "Flagship Scheme" },
    { label: "NBA Accredited", desc: "Engineering Programs" },
    { label: "NAAC A Grade", desc: "High Quality" },
    { label: "SPPU Affiliated", desc: "Pune University" },
    { label: "NIRF Ranked", desc: "Top Institution" },
    { label: "Established 1984", desc: "40+ Years Legacy" }
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200/80 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Accreditations & Affiliations
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {trusts.map((t, idx) => (
            <div key={idx} className="text-center group select-none">
              <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm group-hover:border-primary/40 group-hover:shadow-md transition-all duration-300">
                <span className="font-extrabold text-sm text-slate-800 tracking-tight group-hover:text-primary transition-colors block">
                  {t.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  {t.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
