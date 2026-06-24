import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const Kkwieer = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased pb-16">
      
      {/* 1. Full-width KKWIEER Building Banner */}
      <div className="w-full h-48 sm:h-64 lg:h-80 bg-[url('/images/kkwieer-building.png')] bg-cover bg-center relative border-b border-slate-200">
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* 2. Logos and Institute Title Row */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        
        {/* NBA Logo (Left) */}
        <div className="flex-shrink-0 w-36 sm:w-48 flex justify-center items-center">
          <img 
            src="/images/nba-logo.png" 
            alt="National Board of Accreditation" 
            className="h-16 sm:h-20 md:h-24 w-auto object-contain"
          />
        </div>

        {/* Center Title */}
        <div className="text-center space-y-2 flex-1">
          <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-500 uppercase tracking-wider">
            K. K. Wagh Education Society's
          </p>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            K. K. Wagh Institute of Engineering Education and Research
          </h1>
        </div>

        {/* NAAC Logo (Right) */}
        <div className="flex-shrink-0 w-36 sm:w-48 flex justify-center items-center">
          <img 
            src="/images/naac-logo.jpg" 
            alt="NAAC Accredited Grade A" 
            className="h-16 sm:h-20 md:h-24 w-auto object-contain"
          />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8 space-y-12">
        
        {/* Thin Brand Accent Line */}
        <div className="w-full h-1 bg-primary rounded-full" />

        {/* Metadata Row (Single Row Layout) */}
        <section className="border-y border-slate-200/80 py-4 text-xs sm:text-sm text-slate-600">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:divide-x md:divide-slate-200 text-center md:text-left">
            <div className="px-2">
              <span className="font-bold text-slate-900 block md:inline">Founded:</span> 1984
            </div>
            <div className="md:pl-4 px-2">
              <span className="font-bold text-slate-900 block md:inline">Location:</span> Nashik, Maharashtra
            </div>
            <div className="md:pl-4 px-2">
              <span className="font-bold text-slate-900 block md:inline">Affiliation:</span> Savitribai Phule Pune University
            </div>
            <div className="md:pl-4 px-2">
              <span className="font-bold text-slate-900 block md:inline">Accreditation:</span> NAAC A Grade
            </div>
            <div className="md:pl-4 px-2 col-span-2 md:col-span-1">
              <span className="font-bold text-slate-900 block md:inline">Recognition:</span> NBA Accredited Programs
            </div>
          </div>
        </section>

        {/* Main Content (Restricted to 800px width for readability) */}
        <main className="max-w-[800px] mx-auto space-y-8">
          
          {/* Institute Description (Exact text preserved verbatim) */}
          <div className="text-[16px] leading-[1.9] text-slate-700 space-y-6 text-left">
            <p>
              The institute was established in the year 1984 at Bhausahebnagar (Tal. Niphad, Dist. Nashik) and shifted to Nashik City in September 1986. A land of 8.2 hectares was generously donated by Shri. Kakusheth Udesi of Hirabai Haridas Charitable Trust, Mumbai. The Society started building infrastructure at this campus (known as Hirabai Haridas Vidya Nagari) in the year 1987. As of date it is fully developed and provides accommodation for College building, offices, classrooms, drawing halls, laboratories, workshops, etc. Building with a built-up area of 32,199 Sq.m. is one of the largest buildings in the City. All laboratories, classrooms, etc. are designed as per the needs of the students.
            </p>
            <p>
              The institute is approved by the All India Council for Technical Education (AICTE), New Delhi, and the Government of Maharashtra, permanently affiliated to Savitribai Phule Pune University and recognized under section 2(F) and 12(B) of (UGC ACT 1956). The institute is adjudged as Grade 'A' by the Government of Maharashtra. The institute is Accredited by the National Assessment and Accreditation Council (NAAC) with an 'A' Grade, Accredited by HLACT International. It is the only institute in Nashik to be grouped thrice under the 'Platinum Category' by the AICTE CII Survey of Industry Linked Institutes and according to the NIRF ranking survey, 2016 ranked 85th amongst all engineering institutes in India.
            </p>
            <p>
              The Teaching and Non-Teaching Staff of the institute is a blend of senior experienced and young dynamic faculty members devoted to the noble cause of education. Many of our students were the toppers in the university examinations and are in great demand from Multinational Companies in India and Abroad. Our training and placement wing tries hard to seek good jobs for our students.
            </p>
            <p>
              In addition to academics, the students are engaged in sports and cultural activities to provide healthy relief from rigorous routines. The institute is having spacious ground and modern facilities for both indoor and outdoor games and an ultra-modern Gymnasium for body-building and fitness. Due to able and proper guidance and motivation, many of our students have topped at University, National, and International levels and different sports events.
            </p>
            <p>
              The institute at present provides four-year courses leading to Bachelor's Degree of Savitribai Phule Pune University in ten disciplines like Civil, Computer, Mechanical, Robotics and Automation, Electronics & Telecommunication, Electrical, Information Technology, Chemical, Artificial Intelligence and Data Science and Computer Science and Design and five post-graduate courses like ME in Civil Engineering, Electronics & Telecommunication, Electrical Engineering, Master of Computer Applications (MCA) and Master of Business Administration (MBA). The Institute has also established Research Centers for the Ph.D. program in Electrical, Civil and E&TC Engineering Departments.
            </p>
            <p>
              Apart from this, the Institute is also having Entrepreneurship Development Cell, Intellectual Property Rights Cell, Dr. A P J Abdul Kalam Career Development Center, Research and Development Cell to provide all the support required for entrepreneurship, research publications, and patents. Further, the institute has a Centre of Excellence in the Area of Insulation Diagnostics, Texas Instruments Centre of Excellence, Centre of Excellence in Collaboration with Emerson Engineering Centre for technical support in these areas. Institute has a library with all the online resources, campus-wide licenses of major software, well-equipped workshop with all the required facilities. These all can be integrated with the IDEA lab for further enrichment.
            </p>
          </div>

          {/* Quick Highlights Section */}
          <section className="border-t border-slate-200/80 pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
              Quick Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-slate-700">
              {[
                "NAAC A Grade Certification",
                "NBA Accredited Engineering Programs",
                "AICTE Approved Institution",
                "Platinum Category Institution (AICTE CII Survey)",
                "Recognized Ph.D. Research Centres",
                "Strong Placement & Industry Internships Record"
              ].map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Vision & Mission Cards (Simple clean design) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-200/80">
            {/* Vision Card */}
            <Card className="border border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h4 className="text-base font-bold text-slate-900">Institute Vision</h4>
                </div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  "Empowering Through Quality Technical Education"
                </p>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="border border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h4 className="text-base font-bold text-slate-900">Institute Mission</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  "Committed to serve the needs of the society at large by imparting state-of-the-art Engineering education and to provide Knowledge and develop Attitudes, Skills and Values leading to the establishment of quality conscious and sustainable research-oriented Educational Institute."
                </p>
              </CardContent>
            </Card>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Kkwieer;
